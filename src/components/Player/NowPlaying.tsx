import { memo, useState } from "react";
import { Visualizer, type VisualizerType } from "./Visualizer";
import type { Track } from "../../types";
import { usePlayerStore } from "../../stores/playerStore";
import { useQueueStore } from "../../stores/queueStore";

interface NowPlayingProps {
	track: Track;
	suggestions: Track[];
}

type DisplayMode = "cover" | VisualizerType;

export const NowPlaying = memo(function NowPlaying({
	track,
	suggestions,
}: NowPlayingProps) {
	const playTrack = usePlayerStore((state) => state.playTrack);
	const isPlaying = usePlayerStore((state) => state.isPlaying);
	const [displayMode, setDisplayMode] = useState<DisplayMode>("cover");
	const setQueue = useQueueStore((state) => state.setQueue);

	const modes: DisplayMode[] = ["cover", "bars", "wave", "pulse", "orbit"];

	const cycleMode = () => {
		const currentIndex = modes.indexOf(displayMode);
		const nextIndex = (currentIndex + 1) % modes.length;
		setDisplayMode(modes[nextIndex]);
	};

	const handlePlaySuggestion = (track: Track, index: number) => {
		setQueue(suggestions, index);
		playTrack(track);
	};

	return (
		<div className="h-full flex flex-col bg-black/20 backdrop-blur-3xl glass border-l border-white/5">
			<div className="p-8 pb-12 flex-none flex flex-col items-center justify-center bg-gradient-to-b from-white/[0.02] to-transparent">
				<h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-10 self-start">
					Now Playing
				</h2>
				<div className="flex flex-col items-center w-full max-w-[240px]">
					<div className="relative group perspective-1000">
						<div className="absolute inset-0 bg-white/5 blur-2xl rounded-[24px] scale-90 group-hover:scale-100 transition-transform duration-700" />
						<button
							type="button"
							onClick={cycleMode}
							className="absolute inset-0 w-full h-full border-0 bg-transparent p-0 overflow-hidden rounded-[24px] cursor-pointer shadow-2xl relative z-10 transition-transform duration-700 group-hover:scale-[1.05]"
							aria-label="Change visualization mode"
						>
							{displayMode === "cover" ? (
								<img
									src={
										track.coverUrl ||
										"https://archive.org/images/notfound2x.png"
									}
									alt={`Cover for ${track.album}`}
									className="w-48 h-48 md:w-56 md:h-56 lg:w-48 lg:h-48 rounded-[24px] object-cover"
									onError={(e) => {
										(e.target as HTMLImageElement).src =
											"https://archive.org/images/notfound2x.png";
									}}
								/>
							) : (
								<div className="w-48 h-48 md:w-56 md:h-56 lg:w-48 lg:h-48 bg-black/40 backdrop-blur-md rounded-[24px] overflow-hidden relative">
									<Visualizer
										isPlaying={isPlaying}
										type={displayMode as VisualizerType}
										barCount={displayMode === "wave" ? 15 : 20}
									/>
									<div className="absolute bottom-3 left-0 right-0 text-center">
										<span className="text-[9px] uppercase tracking-widest text-white/40 font-bold bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/5">
											{displayMode}
										</span>
									</div>
								</div>
							)}
						</button>
					</div>
					<div className="mt-10 text-center w-full px-2">
						<h3 className="text-xl font-bold text-white truncate tracking-tight">
							{track.title}
						</h3>
						<p className="text-white/40 text-[15px] mt-2 truncate font-medium tracking-wide">
							{track.artist}
						</p>
					</div>
				</div>
			</div>

			{suggestions.length > 0 && (
				<div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20">
							Next in Queue
						</h2>
					</div>
					<div className="space-y-1">
						{suggestions.map((suggestion, index) => (
							<button
								key={suggestion.id}
								type="button"
								onClick={() => handlePlaySuggestion(suggestion, index)}
								className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] active:bg-white/[0.05] transition-all duration-300 group text-left"
							>
								<div className="relative flex-shrink-0">
									<img
										src={
											suggestion.coverUrl ||
											"https://archive.org/images/notfound2x.png"
										}
										alt=""
										className="w-10 h-10 rounded-lg object-cover transition-transform duration-500 group-hover:scale-105"
										onError={(e) => {
											(e.target as HTMLImageElement).src =
												"https://archive.org/images/notfound2x.png";
										}}
									/>
								</div>
								<div className="overflow-hidden flex-1">
									<p className="text-white/90 text-[13.5px] font-semibold truncate group-hover:text-white transition-colors">
										{suggestion.title}
									</p>
									<p className="text-white/40 text-[12px] truncate mt-0.5 group-hover:text-white/50 transition-colors">
										{suggestion.artist}
									</p>
								</div>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
});
