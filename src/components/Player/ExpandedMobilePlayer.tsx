import { memo, useState } from "react";
import type { Track } from "../../types";
import { usePlayerStore } from "../../stores/playerStore";
import { useQueueStore } from "../../stores/queueStore";
import { tauriApi } from "../../services/tauriApi";
import { Visualizer, type VisualizerType } from "./Visualizer";

interface ExpandedMobilePlayerProps {
	track: Track;
	onClose: () => void;
}

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

type DisplayMode = "cover" | VisualizerType;

export const ExpandedMobilePlayer = memo(function ExpandedMobilePlayer({
	track,
	onClose,
}: ExpandedMobilePlayerProps) {
	const [displayMode, setDisplayMode] = useState<DisplayMode>("cover");
	const {
		isPlaying,
		isLoading,
		progress,
		duration,
		volume,
		repeat,
		shuffle,
		setIsPlaying,
		setProgress,
		setVolume,
		setRepeat,
		setShuffle,
	} = usePlayerStore();

	const modes: DisplayMode[] = ["cover", "bars", "wave", "pulse", "orbit"];

	const cycleMode = () => {
		const currentIndex = modes.indexOf(displayMode);
		const nextIndex = (currentIndex + 1) % modes.length;
		setDisplayMode(modes[nextIndex]);
	};

	const { queue, currentIndex, setCurrentIndex } = useQueueStore();

	const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

	const handlePlayPause = async () => {
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

	const handleNext = () => {
		if (currentIndex < queue.length - 1) {
			setCurrentIndex(currentIndex + 1);
		} else if (repeat === "all") {
			setCurrentIndex(0);
		}
	};

	const handlePrev = () => {
		if (currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
		}
	};

	const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
		const pos = parseFloat(e.target.value);
		setProgress(pos);
	};

	const handleSeekEnd = async () => {
		try {
			await tauriApi.player.seek(progress);
		} catch (e) {
			console.error("Seek error:", e);
		}
	};

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const vol = parseFloat(e.target.value);
		setVolume(vol);
		tauriApi.player.setVolume(vol).catch(console.error);
	};

	const handleRepeatToggle = () => {
		const modes: Array<"off" | "one" | "all"> = ["off", "one", "all"];
		const idx = modes.indexOf(repeat);
		setRepeat(modes[(idx + 1) % modes.length]);
	};

	return (
		<div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">
			{/* Immersive Background */}
			<div className="absolute inset-0 z-0">
				<div
					className="absolute inset-0 bg-cover bg-center scale-150 blur-[100px] opacity-40 transition-all duration-1000"
					style={{
						backgroundImage: `url(${track.coverUrl || "https://archive.org/images/notfound2x.png"})`,
					}}
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
			</div>

			<div className="relative z-10 flex flex-col h-full">
				{/* Header */}
				<div className="flex items-center justify-between px-6 pt-14 pb-4">
					<button
						type="button"
						onClick={onClose}
						className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
					>
						<svg
							className="w-6 h-6 text-white/70"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<title>Close</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
					<div className="flex flex-col items-center">
						<span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">
							Now Playing
						</span>
						<span className="text-[13px] text-white/60 font-medium mt-0.5 truncate max-w-[200px] uppercase tracking-wider">
							{track.album || "FreeTune"}
						</span>
					</div>
					<button
						type="button"
						className="p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors"
					>
						<svg
							className="w-5 h-5 text-white/70"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<title>More options</title>
							<circle cx="12" cy="12" r="1" />
							<circle cx="19" cy="12" r="1" />
							<circle cx="5" cy="12" r="1" />
						</svg>
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 flex flex-col items-center justify-center px-10">
					<div className="w-full aspect-square max-w-sm relative group">
						<div className="absolute inset-0 bg-white/5 rounded-[40px] blur-2xl scale-95 group-hover:scale-100 transition-transform duration-700" />
						<button
							type="button"
							onClick={cycleMode}
							className="absolute inset-0 w-full h-full border-0 bg-transparent p-0 overflow-hidden rounded-[32px] cursor-pointer shadow-2xl relative z-10 transition-transform duration-700 group-hover:scale-[1.02]"
							aria-label="Change visualization mode"
						>
							{displayMode === "cover" ? (
								<img
									src={
										track.coverUrl ||
										"https://archive.org/images/notfound2x.png"
									}
									alt={`${track.album} cover`}
									className="w-full h-full object-cover rounded-[32px]"
									onError={(e) => {
										(e.target as HTMLImageElement).src =
											"https://archive.org/images/notfound2x.png";
									}}
								/>
							) : (
								<div className="w-full h-full bg-black/40 backdrop-blur-md rounded-[32px] overflow-hidden relative">
									<Visualizer
										isPlaying={isPlaying}
										type={displayMode as VisualizerType}
										barCount={displayMode === "wave" ? 20 : 30}
									/>
									<div className="absolute bottom-4 left-0 right-0 text-center">
										<span className="text-[10px] uppercase tracking-widest text-white/40 font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
											{displayMode}
										</span>
									</div>
								</div>
							)}
						</button>
					</div>

					<div className="w-full mt-12 px-2">
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1 min-w-0">
								<h2 className="text-2xl md:text-3xl font-bold text-white truncate tracking-tight">
									{track.title}
								</h2>
								<p className="text-white/50 text-lg md:text-xl font-medium mt-1.5 truncate tracking-wide">
									{track.artist}
								</p>
							</div>
							<button
								type="button"
								className="mt-1 p-2 rounded-full hover:bg-white/10 transition-colors"
							>
								<svg
									className="w-6 h-6 text-white/40"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<title>Like</title>
									<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
								</svg>
							</button>
						</div>
					</div>

					<div className="w-full mt-10">
						<div className="relative group">
							<div className="absolute inset-0 h-1.5 bg-white/10 rounded-full" />
							<div
								className="absolute inset-y-0 h-1.5 bg-white/80 rounded-full transition-all duration-100"
								style={{ width: `${progressPercent}%` }}
							/>
							<input
								type="range"
								min={0}
								max={duration || 100}
								value={progress}
								onChange={handleSeek}
								onMouseUp={handleSeekEnd}
								onTouchEnd={handleSeekEnd}
								className="relative w-full h-1.5 opacity-0 cursor-pointer z-10"
							/>
							<div
								className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform duration-200 pointer-events-none"
								style={{ left: `calc(${progressPercent}% - 8px)` }}
							/>
						</div>
						<div className="flex justify-between text-[11px] font-bold text-white/30 mt-3 tabular-nums tracking-widest">
							<span>{formatTime(progress)}</span>
							<span>{formatTime(duration)}</span>
						</div>
					</div>

					{/* Controls */}
					<div className="w-full flex items-center justify-between mt-8 px-2">
						<button
							type="button"
							onClick={() => setShuffle(!shuffle)}
							className={`p-2 rounded-full transition-all duration-300 ${shuffle ? "text-white bg-white/10" : "text-white/30"}`}
						>
							<svg
								className="w-5 h-5"
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

						<div className="flex items-center gap-8">
							<button
								type="button"
								onClick={handlePrev}
								className="text-white/70 hover:text-white active:scale-90 transition-all duration-200"
							>
								<svg
									className="w-9 h-9"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<title>Previous</title>
									<path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
								</svg>
							</button>

							<button
								type="button"
								onClick={handlePlayPause}
								disabled={isLoading}
								className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center shadow-2xl active:scale-95 transition-all duration-300"
							>
								{isLoading ? (
									<div className="w-8 h-8 border-3 border-black/20 border-t-black rounded-full animate-spin" />
								) : isPlaying ? (
									<svg
										className="w-8 h-8"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<title>Pause</title>
										<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
									</svg>
								) : (
									<svg
										className="w-8 h-8 ml-1.5"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<title>Play</title>
										<path d="M8 5v14l11-7z" />
									</svg>
								)}
							</button>

							<button
								type="button"
								onClick={handleNext}
								className="text-white/70 hover:text-white active:scale-90 transition-all duration-200"
							>
								<svg
									className="w-9 h-9"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<title>Next</title>
									<path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
								</svg>
							</button>
						</div>

						<button
							type="button"
							onClick={handleRepeatToggle}
							className={`p-2 rounded-full transition-all duration-300 relative ${repeat !== "off" ? "text-white bg-white/10" : "text-white/30"}`}
						>
							<svg
								className="w-5 h-5"
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

					{/* Volume Group */}
					<div className="w-full mt-10 flex items-center gap-4 px-2">
						<svg
							className="w-4 h-4 text-white/30 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							viewBox="0 0 24 24"
						>
							<title>Volume Low</title>
							<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
							<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
						</svg>
						<div className="flex-1 h-1 bg-white/10 rounded-full relative">
							<div
								className="absolute inset-y-0 bg-white/40 rounded-full"
								style={{ width: `${volume * 100}%` }}
							/>
							<input
								type="range"
								min={0}
								max={1}
								step={0.01}
								value={volume}
								onChange={handleVolumeChange}
								className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							/>
						</div>
						<svg
							className="w-4 h-4 text-white/30 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							viewBox="0 0 24 24"
						>
							<title>Volume High</title>
							<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
							<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
							<path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
						</svg>
					</div>

					{/* Footer bar */}
					<div className="w-12 h-1 bg-white/20 rounded-full mt-auto mb-10" />
				</div>
			</div>
		</div>
	);
});
