use serde::Deserialize;
use crate::types::Track;

const MUSOPEN_API_BASE: &str = "https://api.musopen.org";

#[derive(Debug, Deserialize)]
struct MusopenSearchResponse {
    #[serde(rename = "results")]
    results: Vec<MusopenTrack>,
}

#[derive(Debug, Deserialize)]
struct MusopenTrack {
    #[serde(rename = "id")]
    id: u32,
    #[serde(rename = "title")]
    title: String,
    #[serde(rename = "composers")]
    composers: Option<Vec<MusopenComposer>>,
    #[serde(rename = "performers")]
    performers: Option<Vec<MusopenPerformer>>,
    #[serde(rename = "duration")]
    duration: u32,
    #[serde(rename = "genre")]
    genre: Option<String>,
    #[serde(rename = "year")]
    year: Option<i32>,
}

#[derive(Debug, Deserialize)]
struct MusopenComposer {
    #[serde(rename = "id")]
    id: u32,
    #[serde(rename = "name")]
    name: String,
}

#[derive(Debug, Deserialize)]
struct MusopenPerformer {
    #[serde(rename = "id")]
    id: u32,
    #[serde(rename = "name")]
    name: String,
}

#[derive(Debug, Deserialize)]
struct MusopenTrackUrl {
    #[serde(rename = "format")]
    format: String,
    #[serde(rename = "url")]
    url: String,
}

pub async fn search_musopen(query: &str, limit: usize) -> Result<Vec<Track>, String> {
    let search_url = format!(
        "{}/v1/resources?format=json&query={}&limit={}",
        MUSOPEN_API_BASE,
        urlencoding::encode(query),
        limit
    );

    eprintln!("DEBUG: Musopen search URL: {}", search_url);

    let client = reqwest::Client::new();
    
    let response = client.get(&search_url)
        .header("User-Agent", "FreeTune/1.0")
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    let text = response.text().await.map_err(|e| e.to_string())?;
    eprintln!("DEBUG: Musopen response (first 500 chars): {}", &text[..text.len().min(500)]);

    let parsed: MusopenSearchResponse = serde_json::from_str(&text)
        .map_err(|e| e.to_string())?;

    let mut tracks = Vec::new();

    for track in parsed.results.iter().take(limit) {
        let composer = track.composers.as_ref()
            .and_then(|c| c.first())
            .map(|c| c.name.clone())
            .unwrap_or_else(|| "Unknown Composer".to_string());

        let performer = track.performers.as_ref()
            .and_then(|p| p.first())
            .map(|p| p.name.clone())
            .unwrap_or_else(|| "Unknown Performer".to_string());

        let stream_url = format!(
            "{}/v1/resources/{}/track",
            MUSOPEN_API_BASE,
            track.id
        );

        tracks.push(Track {
            id: track.id.to_string(),
            title: track.title.clone(),
            artist: performer,
            artist_id: track.performers.as_ref()
                .and_then(|p| p.first())
                .map(|p| p.id.to_string())
                .unwrap_or_default(),
            album: composer.clone(),
            album_id: track.composers.as_ref()
                .and_then(|c| c.first())
                .map(|c| c.id.to_string())
                .unwrap_or_default(),
            duration: track.duration,
            stream_url,
            cover_url: String::new(),
            license: "Public Domain".to_string(),
            source: "musopen".to_string(),
        });
    }

    Ok(tracks)
}
