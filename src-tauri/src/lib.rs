mod audio;
mod commands;
mod db;
mod sources;
mod types;

use audio::AudioPlayer;
use db::Database;
use std::sync::Mutex;
use tauri::Manager;

pub struct AppState {
    pub player: Mutex<AudioPlayer>,
    pub db: Mutex<Database>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let player = AudioPlayer::new().expect("Failed to initialize audio player");
            
            let app_data_dir = app.path().app_data_dir().expect("Failed to get app data dir");
            let db = Database::new(app_data_dir).expect("Failed to initialize database");
            
            app.manage(AppState {
                player: Mutex::new(player),
                db: Mutex::new(db),
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::play,
            commands::pause,
            commands::resume,
            commands::stop,
            commands::seek,
            commands::set_volume,
            commands::get_player_status,
            commands::search_jamendo_cmd,
            commands::search_archive_cmd,
            commands::search_musopen_cmd,
            commands::search_all,
            commands::get_stations,
            commands::get_curated_playlists,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
