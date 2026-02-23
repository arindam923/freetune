import { memo } from "react";
import type { Track } from "../../types";
import { usePlayerStore } from "../../stores/playerStore";
import { tauriApi } from "../../services/tauriApi";
import { useQueueStore } from "../../stores/queueStore";

interface MobilePlayerProps {
	track: Track;
}

export const MobilePlayer = memo(function MobilePlayer({
	track,
}: MobilePlayerProps) {
	const { isPlaying, isLoading, progress, duration, repeat, setIsPlaying } =
		usePlayerStore();

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

	const handlePrev = () => {
		if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
	};

	const handleNext = () => {
		if (currentIndex < queue.length - 1) {
			setCurrentIndex(currentIndex + 1);
		} else if (repeat === "all") {
			setCurrentIndex(0);
		}
	};

	return (
		<div className="fixed inset-x-0 bottom-0 bg-black/60 backdrop-blur-2xl border-t border-white/5 z-30 glass">
			<div className="flex flex-col relative">
				{/* Slim progress bar at the very top of the bar */}
				<div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5">
					<div
						className="h-full bg-white/60 transition-all duration-300"
						style={{ width: `${progressPercent}%` }}
					/>
				</div>

				<div className="flex items-center justify-between px-4 py-3 gap-4">
					<div className="flex items-center gap-3 min-w-0 flex-1">
						<div className="relative group flex-shrink-0">
							<img
								src={
									track.coverUrl || "https://archive.org/images/notfound2x.png"
								}
								alt={`${track.album} cover`}
								className={`w-12 h-12 rounded-lg object-cover shadow-lg transition-transform duration-500 ${isPlaying && !isLoading ? "scale-105" : "scale-100"}`}
								onError={(e) => {
									(e.target as HTMLImageElement).src =
										"https://archive.org/images/notfound2x.png";
								}}
							/>
							{isLoading && (
								<div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg backdrop-blur-[2px]">
									<div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
								</div>
							)}
						</div>
						<div className="min-w-0">
							<p className="text-white font-semibold text-[14px] truncate leading-tight tracking-tight">
								{track.title}
							</p>
							<p className="text-white/40 text-[12px] truncate mt-1 font-medium tracking-wide">
								{track.artist}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-1">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								handlePrev();
							}}
							disabled={isLoading}
							className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white active:scale-90 transition-all"
						>
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<title>Previous</title>
								<path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
							</svg>
						</button>

						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								handlePlayPause();
							}}
							disabled={isLoading}
							className="w-11 h-11 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
						>
							{isLoading ? (
								<div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
							) : isPlaying ? (
								<svg
									className="w-6 h-6"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<title>Pause</title>
									<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
								</svg>
							) : (
								<svg
									className="w-6 h-6 ml-0.5"
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
							onClick={(e) => {
								e.stopPropagation();
								handleNext();
							}}
							disabled={isLoading}
							className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white active:scale-90 transition-all"
						>
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<title>Next</title>
								<path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
});
