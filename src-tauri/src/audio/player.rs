use anyhow::Result;
use rodio::{Decoder, OutputStream, Sink, Source};
use std::fs::File;
use std::io::{BufReader, Read};
use std::sync::mpsc::{self, Sender};
use std::thread;

enum PlayerCommand {
    PlayUrl(String, Sender<Result<()>>),
    PlayFile(String, Sender<Result<()>>),
    Pause,
    Resume,
    Stop,
    Seek(f64, Sender<Result<()>>),
    SetVolume(f32),
    IsPlaying(Sender<bool>),
    GetDuration(Sender<f64>),
    GetPosition(Sender<f64>),
}

pub struct AudioPlayer {
    command_tx: Sender<PlayerCommand>,
}

impl AudioPlayer {
    pub fn new() -> Result<Self> {
        let (command_tx, command_rx) = mpsc::channel::<PlayerCommand>();

        thread::spawn(move || {
            let (_stream, stream_handle) =
                OutputStream::try_default().expect("Failed to create OutputStream");
            let sink = Sink::try_new(&stream_handle).expect("Failed to create Sink");

            let current_url = std::sync::Mutex::new(None);
            let current_duration = std::sync::Mutex::new(0.0f64);
            let play_start_time = std::sync::Mutex::new(std::time::Instant::now());
            let pause_offset = std::sync::Mutex::new(0.0f64);

            let mut sink = sink;

            loop {
                match command_rx.recv() {
                    Ok(PlayerCommand::PlayUrl(url, reply)) => {
                        eprintln!("DEBUG: PlayUrl received: {}", url);

                        // Send OK immediately so UI doesn't freeze
                        let _ = reply.send(Ok(()));

                        // Now do the actual work in background
                        let result = (|| {
                            eprintln!("DEBUG: Streaming from URL: {}", url);

                            let response = reqwest::blocking::get(&url)?;
                            eprintln!("DEBUG: Response status: {}", response.status());

                            if !response.status().is_success() {
                                return Err(anyhow::anyhow!("HTTP error: {}", response.status()));
                            }

                            let content_type = response
                                .headers()
                                .get("content-type")
                                .and_then(|v| v.to_str().ok())
                                .unwrap_or("");
                            eprintln!("DEBUG: Content-Type: {}", content_type);

                            let temp_path = std::env::temp_dir()
                                .join(format!("freetune_audio_{}.tmp", std::process::id()));

                            {
                                let mut file = File::create(&temp_path)?;
                                let mut reader = response;
                                std::io::copy(&mut reader, &mut file)?;
                            }
                            eprintln!("DEBUG: Downloaded to temp file: {:?}", temp_path);

                            let file = File::open(&temp_path)?;
                            let source = Decoder::new(BufReader::new(file))
                                .map_err(|e| anyhow::anyhow!("Failed to decode audio: {}", e))?;

                            let duration =
                                source.total_duration().unwrap_or_default().as_secs_f64();
                            eprintln!("DEBUG: Duration: {} seconds", duration);
                            *current_duration.lock().unwrap() = duration;
                            *current_url.lock().unwrap() = Some(url.clone());

                            sink.stop();
                            sink.append(source);
                            sink.play();
                            *play_start_time.lock().unwrap() = std::time::Instant::now();
                            *pause_offset.lock().unwrap() = 0.0;
                            eprintln!("DEBUG: Playback started");

                            Ok(())
                        })();

                        if let Err(ref e) = result {
                            eprintln!("DEBUG: Playback error: {:?}", e);
                        }
                    }
                    Ok(PlayerCommand::PlayFile(path, reply)) => {
                        let result = (|| {
                            let file = std::fs::File::open(&path)?;
                            let source = Decoder::new(BufReader::new(file))?;

                            let duration =
                                source.total_duration().unwrap_or_default().as_secs_f64();
                            *current_duration.lock().unwrap() = duration;

                            sink.stop();
                            sink.append(source);
                            sink.play();

                            Ok(())
                        })();
                        let _ = reply.send(result);
                    }
                    Ok(PlayerCommand::Pause) => {
                        if !sink.is_paused() {
                            let elapsed = play_start_time.lock().unwrap().elapsed().as_secs_f64();
                            *pause_offset.lock().unwrap() += elapsed;
                        }
                        sink.pause();
                    }
                    Ok(PlayerCommand::Resume) => {
                        if sink.is_paused() {
                            *play_start_time.lock().unwrap() = std::time::Instant::now();
                        }
                        sink.play();
                    }
                    Ok(PlayerCommand::Stop) => {
                        sink.stop();
                    }
                    Ok(PlayerCommand::Seek(_position, reply)) => {
                        let result = (|| {
                            let url = current_url.lock().unwrap().clone();
                            if let Some(url) = url {
                                sink.stop();

                                let response = reqwest::blocking::get(&url)?;
                                let temp_path = std::env::temp_dir().join("freetune_temp_audio");

                                let mut file = File::create(&temp_path)?;
                                let mut reader = response;
                                std::io::copy(&mut reader, &mut file)?;

                                let file = File::open(&temp_path)?;
                                let source = Decoder::new(BufReader::new(file))?;

                                let duration =
                                    source.total_duration().unwrap_or_default().as_secs_f64();
                                *current_duration.lock().unwrap() = duration;

                                sink.append(source);
                                sink.play();
                            }
                            Ok(())
                        })();
                        let _ = reply.send(result);
                    }
                    Ok(PlayerCommand::SetVolume(volume)) => {
                        sink.set_volume(volume.clamp(0.0, 1.0));
                    }
                    Ok(PlayerCommand::IsPlaying(reply)) => {
                        let playing = !sink.is_paused() && !sink.empty();
                        let _ = reply.send(playing);
                    }
                    Ok(PlayerCommand::GetDuration(reply)) => {
                        let duration = *current_duration.lock().unwrap();
                        let _ = reply.send(duration);
                    }
                    Ok(PlayerCommand::GetPosition(reply)) => {
                        let position = if sink.is_paused() {
                            *pause_offset.lock().unwrap()
                        } else {
                            let elapsed = play_start_time.lock().unwrap().elapsed().as_secs_f64();
                            *pause_offset.lock().unwrap() + elapsed
                        };
                        let _ = reply.send(position);
                    }
                    Err(_) => {
                        break;
                    }
                }
            }
        });

        Ok(Self { command_tx })
    }

    pub fn play_url(&self, url: &str) -> Result<()> {
        let (reply_tx, reply_rx) = mpsc::channel();
        self.command_tx
            .send(PlayerCommand::PlayUrl(url.to_string(), reply_tx))
            .map_err(|e| anyhow::anyhow!(e))?;
        reply_rx.recv().map_err(|e| anyhow::anyhow!(e))?
    }

    pub fn play_file(&self, path: &str) -> Result<()> {
        let (reply_tx, reply_rx) = mpsc::channel();
        self.command_tx
            .send(PlayerCommand::PlayFile(path.to_string(), reply_tx))
            .map_err(|e| anyhow::anyhow!(e))?;
        reply_rx.recv().map_err(|e| anyhow::anyhow!(e))?
    }

    pub fn pause(&self) {
        let _ = self.command_tx.send(PlayerCommand::Pause);
    }

    pub fn resume(&self) {
        let _ = self.command_tx.send(PlayerCommand::Resume);
    }

    pub fn stop(&self) {
        let _ = self.command_tx.send(PlayerCommand::Stop);
    }

    pub fn seek(&self, position: f64) -> Result<()> {
        let (reply_tx, reply_rx) = mpsc::channel();
        self.command_tx
            .send(PlayerCommand::Seek(position, reply_tx))
            .map_err(|e| anyhow::anyhow!(e))?;
        reply_rx.recv().map_err(|e| anyhow::anyhow!(e))?
    }

    pub fn set_volume(&self, volume: f32) {
        let _ = self.command_tx.send(PlayerCommand::SetVolume(volume));
    }

    pub fn is_playing(&self) -> bool {
        let (reply_tx, reply_rx) = mpsc::channel();
        let _ = self.command_tx.send(PlayerCommand::IsPlaying(reply_tx));
        reply_rx.recv().unwrap_or(false)
    }

    pub fn get_duration(&self) -> f64 {
        let (reply_tx, reply_rx) = mpsc::channel();
        let _ = self.command_tx.send(PlayerCommand::GetDuration(reply_tx));
        reply_rx.recv().unwrap_or(0.0)
    }

    pub fn get_position(&self) -> f64 {
        let (reply_tx, reply_rx) = mpsc::channel();
        let _ = self.command_tx.send(PlayerCommand::GetPosition(reply_tx));
        reply_rx.recv().unwrap_or(0.0)
    }
}
