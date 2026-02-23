use serde::Deserialize;
use crate::types::Track;

const JAMENDO_API_BASE: &str = "https://api.jamendo.com/v3.0";

fn get_client_id() -> String {
    std::env::var("JAMENDO_CLIENT_ID")
        .unwrap_or_else(|_| "b6211533".to_string())
}

#[derive(Debug, Deserialize)]
struct JamendoSearchResponse {
    results: Vec<JamendoTrack>,
}

#[derive(Debug, Deserialize)]
struct JamendoTrack {
    id: String,
    name: String,
    #[serde(rename = "artist_name")]
    artist_name: String,
    #[serde(rename = "artist_id")]
    artist_id: String,
    #[serde(rename = "album_name")]
    album_name: String,
    #[serde(rename = "album_id")]
    album_id: String,
    duration: u32,
    audio: String,
    image: String,
    #[serde(rename = "license_ccurl")]
    license_ccurl: String,
}

impl From<JamendoTrack> for Track {
    fn from(track: JamendoTrack) -> Self {
        Track {
            id: track.id,
            title: track.name,
            artist: track.artist_name,
            artist_id: track.artist_id,
            album: track.album_name,
            album_id: track.album_id,
            duration: track.duration,
            stream_url: track.audio,
            cover_url: track.image,
            license: track.license_ccurl,
            source: "jamendo".to_string(),
        }
    }
}

pub async fn search_jamendo(query: &str, limit: usize) -> Result<Vec<Track>, String> {
    let client_id = get_client_id();
    let url = format!(
        "{}/tracks/?client_id={}&format=json&search={}&limit={}&include=musicinfo",
        JAMENDO_API_BASE, client_id, query, limit
    );
    
    eprintln!("DEBUG: Jamendo search URL: {}", url);
    eprintln!("DEBUG: Query: {}, limit: {}", query, limit);
    
    let response = reqwest::get(&url)
        .await
        .map_err(|e| e.to_string())?;
    
    let text = response.text().await.map_err(|e| e.to_string())?;
    eprintln!("DEBUG response: {}", &text[..text.len().min(500)]);
    
    let parsed: JamendoSearchResponse = serde_json::from_str(&text)
        .map_err(|e| e.to_string())?;
    
    eprintln!("DEBUG: Found {} tracks", parsed.results.len());
    
    Ok(parsed.results.into_iter().map(Track::from).collect())
}

pub async fn get_track(track_id: &str) -> Result<Track, String> {
    let client_id = get_client_id();
    let url = format!(
        "{}/tracks/?client_id={}&format=json&id={}&include=musicinfo",
        JAMENDO_API_BASE, client_id, track_id
    );
    
    let response = reqwest::get(&url)
        .await
        .map_err(|e| e.to_string())?
        .json::<JamendoSearchResponse>()
        .await
        .map_err(|e| e.to_string())?;
    
    response.results
        .into_iter()
        .next()
        .map(Track::from)
        .ok_or_else(|| "Track not found".to_string())
}
