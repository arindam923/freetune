import { memo } from "react";
import type { Track } from "../../types";
import { usePlayerStore } from "../../stores/playerStore";
import { useQueueStore } from "../../stores/queueStore";

interface SearchResultsProps {
	tracks: Track[];
}

function formatDuration(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export const SearchResults = memo(function SearchResults({
	tracks,
}: SearchResultsProps) {
	console.log("SearchResults received tracks:", tracks);
	const playTrack = usePlayerStore((state) => state.playTrack);
	const setQueue = useQueueStore((state) => state.setQueue);
	const addToQueue = useQueueStore((state) => state.addToQueue);

	const handlePlay = async (track: Track, index: number) => {
		setQueue(tracks, index);
		await playTrack(track);
	};

	const handleAddToQueue = (track: Track) => {
		addToQueue(track);
	};

	if (tracks.length === 0) {
		return (
			<div className="p-8 text-center text-white/40">
				<p>No results found. Try a different search.</p>
			</div>
		);
	}

	return (
		<div
			className="h-full w-full overflow-y-auto scrollbar-hide"
			style={{ contentVisibility: "auto" }}
		>
			<table className="w-full border-collapse">
				<thead className="bg-black/30 sticky top-0 backdrop-blur-md z-10">
					<tr className="text-left text-white/40 text-[10px] md:text-xs font-medium uppercase tracking-wider">
						<th className="p-3 w-12 hidden md:table-cell">#</th>
						<th className="p-3">Title</th>
						<th className="p-3 hidden sm:table-cell">Artist</th>
						<th className="p-3 hidden lg:table-cell">Album</th>
						<th className="p-3 w-16 md:w-20 hidden sm:table-cell">Duration</th>
						<th className="p-3 w-16 md:w-24 text-right">Actions</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-white/5">
					{tracks.map((track, index) => (
						<tr
							key={`${track.id}-${index}`}
							className="hover:bg-white/5 transition-colors group cursor-pointer"
							onClick={() => handlePlay(track, index)}
						>
							<td className="p-3 text-white/30 text-sm font-mono hidden md:table-cell">
								{index + 1}
							</td>
							<td className="p-3">
								<div className="flex items-center gap-3">
									<div className="relative flex-shrink-0">
										<img
											src={
												track.coverUrl ||
												"https://archive.org/images/notfound2x.png"
											}
											alt={`Cover for ${track.album}`}
											className="w-10 h-10 md:w-12 md:h-12 rounded shadow-lg object-cover"
											onError={(e) => {
												(e.target as HTMLImageElement).src =
													"https://archive.org/images/notfound2x.png";
											}}
										/>
										<div className="absolute inset-0 bg-black/40 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity hidden md:flex">
											<svg
												className="w-5 h-5 text-white"
												fill="currentColor"
												viewBox="0 0 24 24"
												aria-hidden="true"
											>
												<path d="M8 5v14l11-7z" />
											</svg>
										</div>
									</div>
									<div className="flex flex-col min-w-0">
										<span className="text-white text-sm font-medium truncate">
											{track.title}
										</span>
										<span className="text-white/50 text-xs truncate sm:hidden">
											{track.artist}
										</span>
									</div>
								</div>
							</td>
							<td className="p-3 text-white/50 text-sm hidden sm:table-cell">
								<span className="truncate block max-w-[150px] lg:max-w-[200px]">
									{track.artist}
								</span>
							</td>
							<td className="p-3 text-white/40 text-sm hidden lg:table-cell">
								<span className="truncate block max-w-[150px] lg:max-w-[200px]">
									{track.album}
								</span>
							</td>
							<td className="p-3 text-white/40 text-sm font-mono hidden sm:table-cell">
								{formatDuration(track.duration)}
							</td>
							<td className="p-3">
								<div className="flex items-center justify-end gap-1 md:gap-2">
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											handlePlay(track, index);
										}}
										className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all md:opacity-0 md:group-hover:opacity-100"
										aria-label={`Play ${track.title}`}
									>
										<svg
											className="w-4 h-4 ml-0.5"
											fill="currentColor"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path d="M8 5v14l11-7z" />
										</svg>
									</button>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											handleAddToQueue(track);
										}}
										className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white/60 hover:text-white transition-colors"
										aria-label={`Add ${track.title} to queue`}
									>
										<svg
											className="w-4 h-4"
											fill="currentColor"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
										</svg>
									</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
});
