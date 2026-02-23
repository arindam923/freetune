import { useState, useCallback, useEffect } from "react";
import { tauriApi } from "../../services/tauriApi";
import type { Track } from "../../types";

interface SearchBarProps {
	onResults: (tracks: Track[]) => void;
	triggerSearch?: string;
}

export function SearchBar({ onResults, triggerSearch }: SearchBarProps) {
	const [query, setQuery] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSearch = useCallback(async () => {
		if (!query.trim()) return;
		setLoading(true);
		try {
			console.log(`Searching jamendo for:`, query);
			const tracks = await tauriApi.search.jamendo(query, 20);
			console.log("API returned:", tracks);
			if (tracks && tracks.length > 0) {
				onResults(tracks);
			} else {
				console.log("No tracks returned");
				onResults([]);
			}
		} catch (error) {
			console.error("Search failed:", error);
			onResults([]);
		} finally {
			setLoading(false);
		}
	}, [query, onResults]);

	useEffect(() => {
		if (triggerSearch) {
			setQuery(triggerSearch);
		}
	}, [triggerSearch]);

	useEffect(() => {
		if (query && query === triggerSearch) {
			handleSearch();
		}
	}, [query, triggerSearch, handleSearch]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	return (
		<div className="px-4 md:px-6 py-3 md:py-4 space-y-4">
			<div className="flex gap-2 md:gap-3">
				<div className="flex-1 relative">
					<svg
						className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
						fill="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
					</svg>
					<input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Search for music..."
						className="w-full pl-10 pr-4 py-2 md:py-2.5 rounded-xl bg-white/5 text-white border border-white/10 focus:border-white/30 focus:bg-white/10 focus:outline-none placeholder:text-white/30 transition-all text-sm md:text-base"
					/>
				</div>
				<button
					type="button"
					onClick={handleSearch}
					disabled={loading}
					className="px-4 md:px-6 py-2 md:py-2.5 bg-white hover:bg-white/90 disabled:bg-white/50 rounded-xl text-black font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
				>
					{loading ? (
						<span className="flex items-center gap-2">
							<svg
								className="w-3 h-3 md:w-4 md:h-4 animate-spin"
								fill="none"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
							<span className="hidden xs:inline">Searching...</span>
							<span className="xs:hidden">...</span>
						</span>
					) : (
						"Search"
					)}
				</button>
			</div>
		</div>
	);
}
