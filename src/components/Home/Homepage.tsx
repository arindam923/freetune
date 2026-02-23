import { memo } from "react";

interface HomepageProps {
	onSearch: (query: string) => void;
}

const GENRES = [
	{
		id: "pop",
		name: "Pop",
		color: "from-blue-500/20 to-transparent",
		image: "/genre_pop.png",

		icon: (
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
					strokeWidth={1.5}
					d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
				/>
			</svg>
		),
	},
	{
		id: "electronic",
		name: "Electronic",
		color: "from-purple-500/20 to-transparent",
		image: "/genre_electronic.png",

		icon: (
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
					strokeWidth={1.5}
					d="M13 10V3L4 14h7v7l9-11h-7z"
				/>
			</svg>
		),
	},
	{
		id: "ambient",
		name: "Ambient",
		color: "from-emerald-500/20 to-transparent",
		image: "/genre_ambient.png",

		icon: (
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
					strokeWidth={1.5}
					d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
				/>
			</svg>
		),
	},
	{
		id: "jazz",
		name: "Jazz",
		color: "from-orange-500/20 to-transparent",
		image: "/genre_jazz.png",

		icon: (
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
					strokeWidth={1.5}
					d="M9 19V6l12-3v13"
				/>
				<circle cx="6" cy="19" r="3" strokeWidth={1.5} />
				<circle cx="18" cy="16" r="3" strokeWidth={1.5} />
			</svg>
		),
	},
];

const CURATED_PLAYLISTS = [
	{
		id: "chill",
		name: "Midnight City",
		description: "Lofi beats and city nights",
		query: "midnight city lofi chill",
		image: "/collection_1.png",
	},
	{
		id: "energy",
		name: "Crimson Drive",
		description: "Synthwave for the highway",
		query: "synthwave retro drive energy",
		image: "/collection_2.png",
	},
	{
		id: "focus",
		name: "White Noise",
		description: "Deep focus for deep work",
		query: "ambient focus noise study",
		image: "/collection_3.png",
	},
	{
		id: "party",
		name: "Velvet Lounge",
		description: "Smooth grooves for late nights",
		query: "nu-jazz electronic lounge",
		image: "/collection_4.png",
	},
];

export const Homepage = memo(function Homepage({ onSearch }: HomepageProps) {
	return (
		<div className="h-full overflow-y-auto bg-[#030303] custom-scrollbar animate-fade-in selection:bg-rose-500/30">
			{/* Immersive Editorial Header */}
			<div className="relative pt-6 px-6 md:px-10 pb-6 overflow-hidden max-w-6xl mx-auto">
				<div className="max-w-3xl relative z-10">
					<div className="flex items-center gap-3 mb-3 animate-slide-up">
						<span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[9px] font-bold uppercase tracking-widest text-rose-500">
							Live
						</span>
						<span className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em]">
							Broadcast 01 • Winter Edition
						</span>
					</div>
					<h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-white tracking-tight leading-[1.1] mb-6 animate-slide-up [animation-delay:100ms]">
						Pure sound. <br />
						<span className="text-white/40">Unfiltered emotion.</span>
					</h1>
					<p className="text-white/30 text-lg md:text-xl font-light max-w-xl mb-10 leading-relaxed animate-slide-up [animation-delay:200ms]">
						A curated anthology of royalty-free tracks from the world's most
						compelling independent artists.
					</p>
					<div className="flex flex-wrap items-center gap-8 animate-slide-up [animation-delay:300ms]">
						<button
							type="button"
							onClick={() => onSearch("trending")}
							className="px-8 py-4 bg-white text-black text-sm font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.15)]"
						>
							Start Listening
						</button>
						<button
							type="button"
							onClick={() => onSearch("latest releases")}
							className="text-white/40 hover:text-white text-sm font-bold tracking-widest uppercase transition-colors flex items-center gap-3 group"
						>
							New Releases
							<svg
								className="w-5 h-5 text-white/20 transition-transform group-hover:translate-x-1"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17 8l4 4m0 0l-4 4m4-4H3"
								/>
							</svg>
						</button>
					</div>
				</div>

				{/* Ambient background glow - even smaller and tighter */}
				<div className="absolute top-0 right-0 w-[250px] h-[250px] bg-rose-500/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/4 translate-x-1/4" />
			</div>

			<div className="px-6 md:px-10 space-y-20 pb-32 max-w-6xl mx-auto">
				{/* Curated Fragments (Main Featured Section) */}
				<section className="animate-slide-up [animation-delay:400ms]">
					<div className="flex items-center justify-between mb-12">
						<h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white/20">
							Featured Anthology
						</h2>
						<div className="h-px flex-1 bg-white/[0.05] ml-8" />
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{CURATED_PLAYLISTS.slice(0, 2).map((playlist, idx) => (
							<button
								key={playlist.id}
								type="button"
								onClick={() => onSearch(playlist.query)}
								className="group relative h-[300px] md:h-[340px] rounded-[2.5rem] overflow-hidden bg-white/[0.02] border border-white/[0.05] transition-all duration-700 hover:border-white/10"
							>
								<div className="absolute inset-x-8 top-8 bottom-32 rounded-[2rem] overflow-hidden bg-white/[0.03] group">
									<div
										className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105 group-hover:scale-100"
										style={{ backgroundImage: `url(${playlist.image})` }}
									/>
									<div
										className={`absolute inset-0 bg-gradient-to-br ${idx === 0 ? "from-rose-500/20" : "from-indigo-500/20"} to-black/60 opacity-60 transition-opacity duration-700 group-hover:opacity-40`}
									/>
									<div className="absolute inset-0 flex items-center justify-center">
										<svg
											className="w-16 h-16 text-white/5 group-hover:text-white/20 transition-all duration-700 group-hover:scale-110"
											fill="currentColor"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
										</svg>
									</div>
								</div>

								<div className="absolute bottom-10 left-10 right-10 text-left">
									<div className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 mb-3 underline decoration-rose-500/30 underline-offset-8">
										Collection 0{idx + 1}
									</div>
									<h3 className="text-3xl font-light text-white tracking-tight">
										{playlist.name}
									</h3>
									<p className="text-white/30 text-sm mt-2 font-light">
										{playlist.description}
									</p>
								</div>

								<div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
									<div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
										<svg
											className="w-6 h-6 ml-0.5"
											fill="currentColor"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path d="M8 5v14l11-7z" />
										</svg>
									</div>
								</div>
							</button>
						))}
					</div>
				</section>

				{/* Categories Section */}
				<section className="animate-slide-up [animation-delay:500ms]">
					<div className="flex items-center justify-between mb-12">
						<h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white/20">
							Sonic Categories
						</h2>
					</div>

					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
						{GENRES.map((genre) => (
							<button
								key={genre.id}
								type="button"
								onClick={() => onSearch(genre.name)}
								className="group relative aspect-[1/1] sm:aspect-[4/3] flex items-end justify-start p-6 rounded-[2rem] overflow-hidden bg-white/[0.02] border border-white/[0.05] transition-all duration-500 hover:border-white/20 hover:-translate-y-1 shadow-2xl"
							>
								<div
									className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-105 group-hover:scale-100"
									style={{ backgroundImage: `url(${genre.image})` }}
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-500 group-hover:opacity-80" />
								<div className="absolute inset-0 bg-black/20" />

								<div className="relative z-10 flex flex-col items-start w-full min-w-0">
									<div className="w-10 h-10 mb-4 rounded-xl flex-shrink-0 flex items-center justify-center bg-white/10 backdrop-blur-md text-white border border-white/10 shadow-lg transition-transform duration-500 group-hover:scale-110">
										<div className="flex-shrink-0 flex items-center justify-center">
											{genre.icon}
										</div>
									</div>
									<div className="flex items-center justify-between w-full">
										<div className="text-left">
											<span className="block text-white font-semibold text-lg tracking-tight">
												{genre.name}
											</span>
											<span className="block text-white/40 text-[10px] font-medium uppercase tracking-[0.2em] mt-1">
												Explore
											</span>
										</div>
										<div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur border border-white/5 flex items-center justify-center translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
											<svg
												className="w-4 h-4 text-white"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												aria-hidden="true"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 5l7 7-7 7"
												/>
											</svg>
										</div>
									</div>
								</div>
							</button>
						))}
					</div>
				</section>

				{/* Minimalist Playlist Grid */}
				<section className="animate-slide-up [animation-delay:600ms]">
					<div className="flex items-center justify-between mb-12">
						<h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white/20">
							Curated Series
						</h2>
						<button
							type="button"
							className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors"
						>
							Archive
						</button>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-4 gap-12">
						{CURATED_PLAYLISTS.map((playlist) => (
							<button
								key={playlist.id}
								type="button"
								onClick={() => onSearch(playlist.query)}
								className="group text-left"
							>
								<div className="aspect-square rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.05] mb-6 relative group/card">
									<div
										className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105 group-hover/card:scale-100"
										style={{ backgroundImage: `url(${playlist.image})` }}
									/>
									<div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/80 opacity-60 group-hover/card:opacity-40 transition-opacity duration-500" />
									<div className="absolute inset-0 flex items-center justify-center scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500">
										<div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl">
											<svg
												className="w-6 h-6 ml-0.5"
												fill="currentColor"
												viewBox="0 0 24 24"
												aria-hidden="true"
											>
												<path d="M8 5v14l11-7z" />
											</svg>
										</div>
									</div>
								</div>
								<h3 className="text-white text-sm font-bold tracking-tight mb-1 group-hover:text-rose-500 transition-colors">
									{playlist.name}
								</h3>
								<p className="text-white/20 text-[11px] font-medium leading-relaxed uppercase tracking-wider">
									{playlist.description}
								</p>
							</button>
						))}
					</div>
				</section>
			</div>
		</div>
	);
});
