use crate::sources;
use crate::types::Track;
use tauri::State;

pub type AppState = crate::AppState;

#[tauri::command]
pub fn play(url: String, state: State<'_, AppState>) -> Result<(), String> {
    eprintln!("DEBUG play command called with URL: {}", url);
    if url.is_empty() {
        eprintln!("DEBUG ERROR: URL is empty!");
        return Err("URL cannot be empty".to_string());
    }
    let player = state.player.lock().map_err(|e| e.to_string())?;
    player.play_url(&url).map_err(|e| {
        eprintln!("DEBUG playback error: {}", e);
        e.to_string()
    })
}

#[tauri::command]
pub fn pause(state: State<'_, AppState>) -> Result<(), String> {
    let player = state.player.lock().map_err(|e| e.to_string())?;
    player.pause();
    Ok(())
}

#[tauri::command]
pub fn resume(state: State<'_, AppState>) -> Result<(), String> {
    let player = state.player.lock().map_err(|e| e.to_string())?;
    player.resume();
    Ok(())
}

#[tauri::command]
pub fn stop(state: State<'_, AppState>) -> Result<(), String> {
    let player = state.player.lock().map_err(|e| e.to_string())?;
    player.stop();
    Ok(())
}

#[tauri::command]
pub fn seek(position: f64, state: State<'_, AppState>) -> Result<(), String> {
    let player = state.player.lock().map_err(|e| e.to_string())?;
    player.seek(position).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_volume(volume: f64, state: State<'_, AppState>) -> Result<(), String> {
    let player = state.player.lock().map_err(|e| e.to_string())?;
    player.set_volume(volume as f32);
    Ok(())
}

#[tauri::command]
pub fn get_player_status(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let player = state.player.lock().map_err(|e| e.to_string())?;
    Ok(serde_json::json!({
        "isPlaying": player.is_playing(),
        "position": player.get_position(),
        "duration": player.get_duration(),
    }))
}

#[tauri::command]
pub async fn search_jamendo_cmd(query: String, limit: Option<usize>) -> Result<Vec<crate::types::Track>, String> {
    sources::search_jamendo(&query, limit.unwrap_or(20)).await
}

#[tauri::command]
pub async fn search_archive_cmd(query: String, limit: Option<usize>) -> Result<Vec<crate::types::Track>, String> {
    sources::search_archive(&query, limit.unwrap_or(20)).await
}

#[tauri::command]
pub async fn search_musopen_cmd(query: String, limit: Option<usize>) -> Result<Vec<crate::types::Track>, String> {
    sources::search_musopen(&query, limit.unwrap_or(20)).await
}

#[tauri::command]
pub fn get_stations() -> Result<Vec<sources::Station>, String> {
    Ok(sources::get_focus_stations())
}

#[tauri::command]
pub fn get_curated_playlists() -> Result<Vec<sources::CuratedPlaylist>, String> {
    Ok(sources::get_curated_playlists())
}

#[tauri::command]
pub async fn search_all(query: String, limit: Option<usize>) -> Result<Vec<serde_json::Value>, String> {
    let limit = limit.unwrap_or(20);
    
    let jamendo = sources::search_jamendo(&query, limit).await;
    
    let mut results = Vec::new();
    
    if let Ok(tracks) = jamendo {
        results.push(serde_json::json!({
            "source": "jamendo",
            "tracks": tracks,
        }));
    }
    
    Ok(results)
}

#[tauri::command]
pub fn get_playlists(state: State<'_, AppState>) -> Result<Vec<serde_json::Value>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let playlists = db.get_playlists().map_err(|e| e.to_string())?;
    
    let result: Vec<serde_json::Value> = playlists
        .into_iter()
        .map(|(id, name, created_at, updated_at)| {
            serde_json::json!({
                "id": id,
                "name": name,
                "tracks": [],
                "createdAt": created_at,
                "updatedAt": updated_at,
            })
        })
        .collect();
    
    Ok(result)
}

#[tauri::command]
pub fn create_playlist(name: String, state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    db.create_playlist(&id, &name).map_err(|e| e.to_string())?;
    
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();
    
    Ok(serde_json::json!({
        "id": id,
        "name": name,
        "tracks": [],
        "createdAt": now,
        "updatedAt": now,
    }))
}

#[tauri::command]
pub fn delete_playlist(id: String, state: State<'_, AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_playlist(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_favorites(state: State<'_, AppState>) -> Result<Vec<serde_json::Value>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let favorites = db.get_favorites().map_err(|e| e.to_string())?;
    
    let result: Vec<serde_json::Value> = favorites
        .into_iter()
        .filter_map(|data| serde_json::from_str(&data).ok())
        .collect();
    
    Ok(result)
}

#[tauri::command]
pub fn add_favorite(track: serde_json::Value, state: State<'_, AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let track_id = track["id"].as_str().ok_or("Invalid track")?;
    let track_data = serde_json::to_string(&track).map_err(|e| e.to_string())?;
    
    db.add_to_favorites(track_id, &track_data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn remove_favorite(track_id: String, state: State<'_, AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.remove_from_favorites(&track_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_play_history(state: State<'_, AppState>) -> Result<Vec<serde_json::Value>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let history = db.get_history(50).map_err(|e| e.to_string())?;
    
    let result: Vec<serde_json::Value> = history
        .into_iter()
        .filter_map(|data| serde_json::from_str(&data).ok())
        .collect();
    
    Ok(result)
}
