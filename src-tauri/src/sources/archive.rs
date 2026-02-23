use serde::Deserialize;
use crate::types::Track;

const ARCHIVE_API_BASE: &str = "https://archive.org";

#[derive(Debug, Deserialize)]
struct ArchiveSearchResponse {
    response: ArchiveResponse,
}

#[derive(Debug, Deserialize)]
struct ArchiveResponse {
    docs: Vec<ArchiveDoc>,
    #[serde(rename = "numFound")]
    num_found: usize,
}

#[derive(Debug, Deserialize)]
struct ArchiveDoc {
    identifier: String,
    title: Option<String>,
    creator: Option<String>,
    date: Option<String>,
    #[serde(rename = "downloads")]
    download_num: Option<usize>,
    #[serde(rename = "format")]
    formats: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
struct ArchiveMetadata {
    metadata: ArchiveItemMetadata,
    files: Vec<ArchiveFile>,
}

#[derive(Debug, Deserialize)]
struct ArchiveItemMetadata {
    title: Option<String>,
    creator: Option<String>,
    licenseurl: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ArchiveFile {
    name: String,
    format: Option<String>,
    length: Option<String>,
    title: Option<String>,
    track: Option<String>,
}

pub async fn search_archive(query: &str, limit: usize) -> Result<Vec<Track>, String> {
    let search_url = format!(
        "{}/advancedsearch.php?q={}+format:mp3+OR+format:vorbis&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=downloads&sort[]=downloads desc&rows={}&page=1&output=json",
        ARCHIVE_API_BASE,
        urlencoding::encode(query),
        limit.min(50)
    );

    eprintln!("DEBUG: Archive search URL: {}", search_url);

    let response = reqwest::get(&search_url)
        .await
        .map_err(|e| e.to_string())?;
    
    let text = response.text().await.map_err(|e| e.to_string())?;
    eprintln!("DEBUG: Archive response (first 500 chars): {}", &text[..text.len().min(500)]);

    let parsed: ArchiveSearchResponse = serde_json::from_str(&text)
        .map_err(|e| e.to_string())?;

    eprintln!("DEBUG: Found {} items", parsed.response.num_found);

    let mut tracks = Vec::new();

    for doc in parsed.response.docs.iter().take(limit) {
        if let Ok(metadata) = get_archive_metadata(&doc.identifier).await {
            if let Some(track) = metadata_to_track(&doc.identifier, &doc, &metadata) {
                tracks.push(track);
            }
        }
    }

    Ok(tracks)
}

async fn get_archive_metadata(identifier: &str) -> Result<ArchiveMetadata, String> {
    let url = format!("{}/metadata/{}", ARCHIVE_API_BASE, identifier);
    
    reqwest::get(&url)
        .await
        .map_err(|e| e.to_string())?
        .json::<ArchiveMetadata>()
        .await
        .map_err(|e| e.to_string())
}

fn metadata_to_track(identifier: &str, doc: &ArchiveDoc, metadata: &ArchiveMetadata) -> Option<Track> {
    let audio_file = metadata.files.iter().find(|f| {
        let format = f.format.as_deref().unwrap_or("");
        let name = f.name.to_lowercase();
        format.contains("MP3") || format.contains("VBR MP3") || format.contains("Flac") || 
        format.contains("OGG") || format.contains("Vorbis") || name.ends_with(".mp3") || 
        name.ends_with(".flac") || name.ends_with(".ogg")
    })?;
    
    let title = doc.title.clone().or_else(|| audio_file.title.clone())?;
    let artist = doc.creator.clone().unwrap_or_else(|| "Unknown".to_string());
    let duration = audio_file.length
        .as_ref()
        .and_then(|l| l.parse::<f64>().ok())
        .map(|d| d as u32)
        .unwrap_or(0);
    
    let stream_url = format!("https://archive.org/download/{}/{}", identifier, audio_file.name);
    let cover_url = format!("https://archive.org/services/img/{}", identifier);
    
    log::info!("Track: {} by {} - URL: {}", title, artist, stream_url);
    
    Some(Track {
        id: identifier.to_string(),
        title,
        artist,
        artist_id: String::new(),
        album: doc.identifier.clone(),
        album_id: doc.identifier.clone(),
        duration,
        stream_url,
        cover_url,
        license: metadata.metadata.licenseurl.clone().unwrap_or_default(),
        source: "archive".to_string(),
    })
}
