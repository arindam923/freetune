pub fn get_focus_stations() -> Vec<Station> {
    vec![
        Station {
            id: "lofi-hip-hop".to_string(),
            name: "Lofi Hip Hop".to_string(),
            description: "Chill beats to study/work to".to_string(),
            category: "focus".to_string(),
            image_url: "https://i.imgur.com/YjKB7T.png".to_string(),
            streams: vec![
                Stream {
                    name: "Lofi Girl".to_string(),
                    url: "https://play.streamafrica.net/lofiradio".to_string(),
                },
                Stream {
                    name: "ChillHop".to_string(),
                    url: "https://streams.ilovemusic.de/iloveradio17.mp3".to_string(),
                },
            ],
        },
        Station {
            id: "classical-focus".to_string(),
            name: "Classical Focus".to_string(),
            description: "Classical music for deep concentration".to_string(),
            category: "focus".to_string(),
            image_url: "".to_string(),
            streams: vec![
                Stream {
                    name: "Classical KUSC".to_string(),
                    url: "https://playerservices.streamtheworld.com/api/livestream-redirect/KUSCMP128.mp3".to_string(),
                },
            ],
        },
        Station {
            id: "jazz-lounge".to_string(),
            name: "Jazz Lounge".to_string(),
            description: "Smooth jazz for relaxation".to_string(),
            category: "relax".to_string(),
            image_url: "".to_string(),
            streams: vec![
                Stream {
                    name: "Smooth Jazz".to_string(),
                    url: "https://streaming.radio.co/s774887f7b/listen".to_string(),
                },
            ],
        },
        Station {
            id: "electronic-energize".to_string(),
            name: "Electronic Energize".to_string(),
            description: "High-energy electronic for workouts".to_string(),
            category: "workout".to_string(),
            image_url: "".to_string(),
            streams: vec![
                Stream {
                    name: "EDM Workout".to_string(),
                    url: "https://streams.ilovemusic.de/iloveradio2.mp3".to_string(),
                },
            ],
        },
        Station {
            id: "ambient-space".to_string(),
            name: "Ambient Space".to_string(),
            description: "Atmospheric ambient soundscapes".to_string(),
            category: "focus".to_string(),
            image_url: "".to_string(),
            streams: vec![
                Stream {
                    name: "SomaFM Drone Zone".to_string(),
                    url: "https://ice2.somafm.com/dronezone-128-mp3".to_string(),
                },
            ],
        },
        Station {
            id: "synthwave-retro".to_string(),
            name: "Synthwave Retro".to_string(),
            description: "80s inspired electronic beats".to_string(),
            category: "workout".to_string(),
            image_url: "".to_string(),
            streams: vec![
                Stream {
                    name: "Synthwave FM".to_string(),
                    url: "https://ice4.somafm.com/synthwave-128-mp3".to_string(),
                },
            ],
        },
        Station {
            id: "video-game-music".to_string(),
            name: "Video Game Music".to_string(),
            description: "Epic game soundtracks".to_string(),
            category: "focus".to_string(),
            image_url: "".to_string(),
            streams: vec![
                Stream {
                    name: "OCR Synth".to_string(),
                    url: "https://ice4.somafm.com/ocremix-128-mp3".to_string(),
                },
            ],
        },
        Station {
            id: "piano-solo".to_string(),
            name: "Piano Solos".to_string(),
            description: "Beautiful piano compositions".to_string(),
            category: "focus".to_string(),
            image_url: "".to_string(),
            streams: vec![
                Stream {
                    name: "SomaFM Piano".to_string(),
                    url: "https://ice2.somafm.com/groovesalad-128-mp3".to_string(),
                },
            ],
        },
    ]
}

pub fn get_curated_playlists() -> Vec<CuratedPlaylist> {
    vec![
        CuratedPlaylist {
            id: "coding-focus".to_string(),
            name: "Coding Focus".to_string(),
            description: "Perfect for long coding sessions".to_string(),
            category: "focus".to_string(),
            query: "lofi beats study".to_string(),
            source: "jamendo".to_string(),
        },
        CuratedPlaylist {
            id: "gym-energy".to_string(),
            name: "Gym Energy".to_string(),
            description: "High BPM workout music".to_string(),
            category: "workout".to_string(),
            query: "electronic workout energy".to_string(),
            source: "jamendo".to_string(),
        },
        CuratedPlaylist {
            id: "deep-work".to_string(),
            name: "Deep Work".to_string(),
            description: "Ambient sounds for concentration".to_string(),
            category: "focus".to_string(),
            query: "ambient classical focus".to_string(),
            source: "musopen".to_string(),
        },
        CuratedPlaylist {
            id: "chill-vibes".to_string(),
            name: "Chill Vibes".to_string(),
            description: "Relaxed acoustic tracks".to_string(),
            category: "relax".to_string(),
            query: "acoustic chill".to_string(),
            source: "jamendo".to_string(),
        },
    ]
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Station {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub image_url: String,
    pub streams: Vec<Stream>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Stream {
    pub name: String,
    pub url: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct CuratedPlaylist {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub query: String,
    pub source: String,
}
