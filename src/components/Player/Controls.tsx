import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "../../stores/playerStore";
import { useQueueStore } from "../../stores/queueStore";
import { tauriApi } from "../../services/tauriApi";

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function Controls() {
	const {
		currentTrack,
		isPlaying,
		isLoading,
		progress,
		duration,
		volume,
		repeat,
		shuffle,
		setIsPlaying,
		setIsLoading,
		setProgress,
		setDuration,
		setVolume,
		setRepeat,
		setShuffle,
	} = usePlayerStore();
	const { queue, currentIndex, setCurrentIndex } = useQueueStore();
	const [isDragging, setIsDragging] = useState(false);
	const [displayProgress, setDisplayProgress] = useState(0);
	const progressRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isDragging) {
			setDisplayProgress(progress);
		}
	}, [progress, isDragging]);

	useEffect(() => {
		if (!currentTrack) return;

		const interval = setInterval(async () => {
			try {
				const status = await tauriApi.player.getStatus();
				setIsPlaying(status.isPlaying);
				if (!isDragging) {
					setProgress(status.position);
				}
				if (status.duration > 0) {
					setDuration(status.duration);
				}
				if (status.isPlaying) {
					setIsLoading(false);
				}
			} catch (e) {
				console.error("Failed to get status:", e);
			}
		}, 500);

		return () => clearInterval(interval);
	}, [
		currentTrack,
		setIsPlaying,
		setProgress,
		setDuration,
		setIsLoading,
		isDragging,
	]);

	const handlePlayPause = async () => {
		if (!currentTrack) return;
		try {
			if (isPlaying) {
				await tauriApi.player.pause();
				setIsPlaying(false);
			} else {
				await tauriApi.player.resume();
				setIsPlaying(true);
			}
		} catch (e) {
			console.error("Playback error:", e);
		}
	};

	const handleNext = async () => {
		if (currentIndex >= queue.length - 1) {
			if (repeat === "all") {
				setCurrentIndex(0);
			}
			return;
		}
		setCurrentIndex(currentIndex + 1);
	};

	const handlePrev = async () => {
		if (currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
		}
	};

	const handleSeek = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const pos = parseFloat(e.target.value);
		setDisplayProgress(pos);
	};

	const handleSeekCommit = async () => {
		try {
			await tauriApi.player.seek(displayProgress);
			setProgress(displayProgress);
		} catch (e) {
			console.error("Seek error:", e);
		}
		setIsDragging(false);
	};

	const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const vol = parseFloat(e.target.value);
		setVolume(vol);
		try {
			await tauriApi.player.setVolume(vol);
		} catch (e) {
			console.error("Volume error:", e);
		}
	};

	const handleRepeatToggle = () => {
		const modes: Array<"off" | "one" | "all"> = ["off", "one", "all"];
		const currentIdx = modes.indexOf(repeat);
		setRepeat(modes[(currentIdx + 1) % modes.length]);
	};

	const handleShuffleToggle = () => {
		setShuffle(!shuffle);
	};

	const progressPercent = duration > 0 ? (displayProgress / duration) * 100 : 0;

	if (!currentTrack) {
		return (
			<div className="h-24 bg-black/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-center">
				<p className="text-white/30 text-sm font-medium">
					Select a track to play
				</p>
			</div>
		);
	}

	return (
		<div className="h-24 bg-black/40 backdrop-blur-2xl border-t border-white/5 flex items-center px-6 gap-6 glass">
			<div className="hidden lg:flex items-center gap-4 w-72 min-w-0">
				<div className="relative group">
					<div
						className={`relative rounded-xl overflow-hidden transition-all duration-500 ${isPlaying && !isLoading ? "ring-2 ring-white/10 shadow-2xl shadow-white/5 scale-105" : "scale-100"}`}
					>
						<img
							src={
								currentTrack.coverUrl ||
								"https://archive.org/images/notfound2x.png"
							}
							alt={`Cover for ${currentTrack.album}`}
							className="w-14 h-14 rounded-xl object-cover"
							onError={(e) => {
								(e.target as HTMLImageElement).src =
									"https://archive.org/images/notfound2x.png";
							}}
						/>
						{isLoading && (
							<div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
								<div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
							</div>
						)}
					</div>
				</div>
				<div className="overflow-hidden min-w-0">
					<p className="text-white text-[15px] font-semibold truncate leading-tight tracking-tight">
						{currentTrack.title}
					</p>
					<p className="text-white/40 text-[13px] truncate mt-1.5 font-medium">
						{isLoading ? "Loading..." : currentTrack.artist}
					</p>
				</div>
			</div>

			<div className="flex-1 flex flex-col items-center gap-3 max-w-2xl mx-auto">
				<div className="flex items-center gap-6">
					<button
						type="button"
						onClick={handleShuffleToggle}
						disabled={isLoading}
						aria-label="Shuffle"
						className={`p-2 rounded-full transition-all duration-300 ${shuffle ? "text-white bg-white/10" : "text-white/30 hover:text-white hover:bg-white/5"} disabled:opacity-30 disabled:cursor-not-allowed`}
					>
						<svg
							className="w-4 h-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<title>Shuffle</title>
							<path d="m16 3 4 4-4 4"></path>
							<path d="M20 7H9c-2.2 0-4 1.8-4 4v2"></path>
							<path d="m8 21-4-4 4-4"></path>
							<path d="M4 17h11c2.2 0 4-1.8 4-4v-2"></path>
						</svg>
					</button>

					<button
						type="button"
						onClick={handlePrev}
						disabled={isLoading}
						aria-label="Previous track"
						className="text-white/40 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-90"
					>
						<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
							<title>Previous</title>
							<path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
						</svg>
					</button>

					<button
						type="button"
						onClick={handlePlayPause}
						disabled={isLoading}
						aria-label={isPlaying ? "Pause" : "Play"}
						className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isPlaying && !isLoading ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "bg-white text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"}`}
					>
						{isLoading ? (
							<div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
						) : isPlaying ? (
							<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
								<title>Pause</title>
								<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
							</svg>
						) : (
							<svg
								className="w-5 h-5 ml-1"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<title>Play</title>
								<path d="M8 5v14l11-7z" />
							</svg>
						)}
					</button>

					<button
						type="button"
						onClick={handleNext}
						disabled={isLoading}
						aria-label="Next track"
						className="text-white/40 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-90"
					>
						<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
							<title>Next</title>
							<path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
						</svg>
					</button>

					<button
						type="button"
						onClick={handleRepeatToggle}
						disabled={isLoading}
						aria-label={`Repeat: ${repeat}`}
						className={`p-2 rounded-full transition-all duration-300 ${repeat !== "off" ? "text-white bg-white/10" : "text-white/30 hover:text-white hover:bg-white/5"} disabled:opacity-30 disabled:cursor-not-allowed relative`}
					>
						<svg
							className="w-4 h-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<title>Repeat</title>
							<polyline points="17 1 21 5 17 9"></polyline>
							<path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
							<polyline points="7 23 3 19 7 15"></polyline>
							<path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
						</svg>
						{repeat === "one" && (
							<span className="absolute text-[8px] font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[1px]">
								1
							</span>
						)}
					</button>
				</div>

				<div className="w-full flex items-center gap-4">
					<span className="text-[11px] text-white/30 w-10 text-right font-medium tabular-nums">
						{isLoading ? "--:--" : formatTime(displayProgress)}
					</span>

					<div
						ref={progressRef}
						className="flex-1 h-1 bg-white/5 rounded-full relative cursor-pointer group transition-all duration-300 hover:h-1.5"
						role="slider"
						aria-label="Progress bar"
						aria-valuemin={0}
						aria-valuemax={duration || 100}
						aria-valuenow={displayProgress}
						tabIndex={0}
						onKeyDown={(e) => {
							if (isLoading || !duration) return;
							if (e.key === "ArrowRight") {
								const next = Math.min(displayProgress + 5, duration);
								setDisplayProgress(next);
								tauriApi.player.seek(next).catch(console.error);
							} else if (e.key === "ArrowLeft") {
								const prev = Math.max(displayProgress - 5, 0);
								setDisplayProgress(prev);
								tauriApi.player.seek(prev).catch(console.error);
							}
						}}
						onClick={(e) => {
							if (isLoading || !duration) return;
							const rect = e.currentTarget.getBoundingClientRect();
							const percent = (e.clientX - rect.left) / rect.width;
							const newPos = percent * duration;
							setDisplayProgress(newPos);
							handleSeekCommit();
						}}
					>
						<div
							className="absolute inset-y-0 left-0 bg-white/60 rounded-full transition-all duration-100 group-hover:bg-white"
							style={{ width: `${progressPercent}%` }}
						/>
						<div
							className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-xl opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200"
							style={{
								left: `calc(${progressPercent}% - 6px)`,
							}}
						/>
						<input
							type="range"
							min={0}
							max={duration || 100}
							value={displayProgress}
							onChange={handleSeek}
							onMouseDown={() => setIsDragging(true)}
							onMouseUp={handleSeekCommit}
							onTouchStart={() => setIsDragging(true)}
							onTouchEnd={handleSeekCommit}
							disabled={isLoading}
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
						/>
					</div>

					<span className="text-[11px] text-white/30 w-10 font-medium tabular-nums">
						{isLoading ? "--:--" : formatTime(duration)}
					</span>
				</div>
			</div>

			<div className="hidden md:flex items-center gap-4 w-40 min-w-0">
				<button
					type="button"
					className="text-white/30 hover:text-white transition-colors flex-shrink-0"
					aria-label="Volume"
				>
					{volume === 0 ? (
						<svg
							className="w-5 h-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<title>Muted</title>
							<path d="m11 5-7 7v2h4l7 7V2l-7 7v2h-4V9l2-2"></path>
							<line x1="22" y1="9" x2="16" y2="15"></line>
							<line x1="16" y1="9" x2="22" y2="15"></line>
						</svg>
					) : (
						<svg
							className="w-5 h-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<title>Volume</title>
							<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
							<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
							<path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
						</svg>
					)}
				</button>
				<div className="flex-1 h-1 bg-white/5 rounded-full relative cursor-pointer group transition-all duration-300 hover:h-1.5 min-w-[60px]">
					<div
						className="absolute inset-y-0 left-0 bg-white/40 rounded-full group-hover:bg-white/60 transition-colors"
						style={{ width: `${volume * 100}%` }}
					/>
					<div
						className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-xl opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200"
						style={{ left: `calc(${volume * 100}% - 6px)` }}
					/>
					<input
						type="range"
						min={0}
						max={1}
						step={0.01}
						value={volume}
						onChange={handleVolumeChange}
						aria-label="Volume slider"
						className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
				</div>
			</div>
		</div>
	);
}
