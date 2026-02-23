import { useState, useMemo, memo, useEffect } from "react";
import { SearchBar } from "./components/Search/SearchBar";
import { SearchResults } from "./components/Search/SearchResults";
import { Controls } from "./components/Player/Controls";
import { NowPlaying } from "./components/Player/NowPlaying";
import { Homepage } from "./components/Home/Homepage";
import { MobilePlayer } from "./components/Player/MobilePlayer";
import { ExpandedMobilePlayer } from "./components/Player/ExpandedMobilePlayer";
import type { Track } from "./types";
import { usePlayerStore } from "./stores/playerStore";

const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
	const [isMobile, setIsMobile] = useState(
		typeof window !== "undefined"
			? window.innerWidth < MOBILE_BREAKPOINT
			: false,
	);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return isMobile;
}

function App() {
	const [results, setResults] = useState<Track[]>([]);
	const [hasSearched, setHasSearched] = useState(false);
	const [searchTrigger, setSearchTrigger] = useState("");
	const [showExpandedPlayer, setShowExpandedPlayer] = useState(false);
	const currentTrack = usePlayerStore((state) => state.currentTrack);
	const isMobile = useIsMobile();

	const [showBrowserOnTablet, setShowBrowserOnTablet] = useState(false);

	const handleGenreClick = (query: string) => {
		setSearchTrigger(query);
		setHasSearched(true);
		setShowBrowserOnTablet(true);
	};

	const goHome = () => {
		setHasSearched(false);
		setSearchTrigger("");
		setResults([]);
		setShowBrowserOnTablet(true);
	};

	const suggestions = useMemo(() => {
		if (!currentTrack) return [];
		return results.filter((t) => t.id !== currentTrack.id).slice(0, 10);
	}, [currentTrack, results]);

	if (isMobile) {
		return (
			<div className="h-screen flex flex-col bg-black text-white overflow-hidden">
				<header className="bg-black/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex-shrink-0 z-20">
					<div className="flex items-center justify-between">
						{hasSearched || (currentTrack && showExpandedPlayer) ? (
							<button
								type="button"
								onClick={() => {
									if (showExpandedPlayer) {
										setShowExpandedPlayer(false);
									} else {
										goHome();
									}
								}}
								className="flex items-center gap-2 -ml-2 px-2 py-1"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 19l-7-7 7-7"
									/>
								</svg>
								<span className="text-sm font-medium">
									{showExpandedPlayer ? "Back to Browse" : "Home"}
								</span>
							</button>
						) : (
							<div className="flex items-center gap-2">
								<div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
									<svg
										className="w-4 h-4 text-white"
										fill="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
									</svg>
								</div>
								<span className="text-base font-semibold">FreeTune</span>
							</div>
						)}
						<span className="text-xs text-white/40">Jamendo</span>
					</div>
				</header>

				<div className="flex-1 overflow-hidden flex flex-col">
					{!currentTrack || !showExpandedPlayer ? (
						<div
							className={`flex-1 overflow-hidden flex flex-col ${currentTrack && showExpandedPlayer ? "hidden" : ""}`}
						>
							{!hasSearched ? (
								<Homepage onSearch={handleGenreClick} />
							) : (
								<div className="flex-1 overflow-hidden flex flex-col">
									<SearchBar
										onResults={setResults}
										triggerSearch={searchTrigger}
									/>
									<div className="flex-1 overflow-hidden">
										<SearchResults tracks={results} />
									</div>
								</div>
							)}
						</div>
					) : (
						<ExpandedMobilePlayer
							track={currentTrack}
							onClose={() => setShowExpandedPlayer(false)}
						/>
					)}
				</div>

				{currentTrack && !showExpandedPlayer && (
					<button
						type="button"
						onClick={() => setShowExpandedPlayer(true)}
						className="w-full text-left"
					>
						<MobilePlayer track={currentTrack} />
					</button>
				)}
			</div>
		);
	}

	return (
		<div className="h-screen flex flex-col bg-black text-white overflow-hidden">
			<header className="bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex-shrink-0">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
							<svg
								className="w-4 h-4 text-white"
								fill="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
							</svg>
						</div>
						<h1 className="text-lg font-semibold tracking-tight">FreeTune</h1>
					</div>
					<div className="flex items-center gap-4">
						{currentTrack && !showBrowserOnTablet && (
							<button
								type="button"
								onClick={() => setShowBrowserOnTablet(true)}
								className="hidden md:flex lg:hidden items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
								<span className="text-sm">Browse</span>
							</button>
						)}
						{currentTrack && showBrowserOnTablet && (
							<button
								type="button"
								onClick={() => setShowBrowserOnTablet(false)}
								className="hidden md:flex lg:hidden items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 19V6l-7 7 7 7zm8-13v13l7-7-7-7z"
									/>
								</svg>
								<span className="text-sm">Player</span>
							</button>
						)}
						{hasSearched && (
							<button
								type="button"
								onClick={goHome}
								className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
									/>
								</svg>
								<span className="text-sm">Home</span>
							</button>
						)}
					</div>
				</div>
			</header>

			<div
				className={`flex-1 flex overflow-hidden ${currentTrack ? "md:flex-row" : ""}`}
			>
				<div
					className={`flex-1 overflow-hidden transition-all duration-300 ${currentTrack && !showBrowserOnTablet ? "hidden lg:block" : "block"}`}
				>
					<SearchBar onResults={setResults} triggerSearch={searchTrigger} />
					{!hasSearched ? (
						<Homepage onSearch={handleGenreClick} />
					) : (
						<SearchResults tracks={results} />
					)}
				</div>

				{currentTrack && (
					<div
						className={`flex-1 lg:flex-none lg:w-80 border-l border-white/5 overflow-hidden flex-shrink-0 bg-black/20 ${showBrowserOnTablet ? "hidden lg:block" : "block"}`}
					>
						<div className="h-full flex flex-col">
							<div className="lg:hidden p-4 flex items-center justify-between border-b border-white/5">
								<h2 className="text-lg font-bold">Now Playing</h2>
								<button
									type="button"
									onClick={() => {
										// Logic to see browse again?
										// Actually on small screens we hide Browse, so we need a way to see it.
										// Let's add a button in the main NowPlaying component or here.
									}}
									className="hidden text-sm text-white/40"
								>
									Browse
								</button>
							</div>
							<NowPlaying track={currentTrack} suggestions={suggestions} />
						</div>
					</div>
				)}
			</div>

			<div className="w-full flex-shrink-0 border-t border-white/5">
				<Controls />
			</div>
		</div>
	);
}

export default memo(App);
