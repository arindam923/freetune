import { memo } from "react";

export type VisualizerType = "bars" | "pulse" | "orbit" | "wave" | "rainbow" | "neon";

interface VisualizerProps {
	isPlaying: boolean;
	type?: VisualizerType;
	barCount?: number;
}

const rainbowColors = [
	"#ff6b6b",
	"#feca57",
	"#48dbfb",
	"#ff9ff3",
	"#54a0ff",
	"#5f27cd",
	"#00d2d3",
	"#ff9f43",
];

const neonColors = [
	"#00ff87",
	"#60efff",
	"#ff00ff",
	"#00ffff",
	"#ff0080",
	"#8000ff",
];

function hexToRgba(hex: string, alpha: number): string {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const Visualizer = memo(function Visualizer({
	isPlaying,
	type = "bars",
	barCount = 30,
}: VisualizerProps) {
	if (type === "pulse") {
		const pulseColors = ["#ff6b6b", "#48dbfb", "#ff9ff3", "#00ff87"];
		return (
			<div className="absolute inset-0 flex items-center justify-center">
				<div
					className={`w-32 h-32 rounded-full border-4 ${isPlaying ? "animate-music-pulse" : "scale-100 opacity-20"}`}
					style={{ 
						borderColor: isPlaying ? pulseColors[0] : "rgba(255,255,255,0.4)",
						boxShadow: isPlaying ? `0 0 30px ${pulseColors[0]}80` : "none"
					}}
				/>
				<div
					className={`absolute w-24 h-24 rounded-full border-2 ${isPlaying ? "animate-music-pulse" : "scale-100 opacity-10"}`}
					style={{ 
						animationDelay: "-0.5s",
						borderColor: isPlaying ? pulseColors[1] : "rgba(255,255,255,0.2)",
						boxShadow: isPlaying ? `0 0 20px ${pulseColors[1]}60` : "none"
					}}
				/>
				<div
					className={`absolute w-16 h-16 rounded-full ${isPlaying ? "animate-music-pulse" : "scale-100 opacity-10"}`}
					style={{ 
						animationDelay: "-1s",
						backgroundColor: isPlaying ? pulseColors[2] : "rgba(255,255,255,0.1)",
						boxShadow: isPlaying ? `0 0 15px ${pulseColors[2]}80` : "none"
					}}
				/>
			</div>
		);
	}

	if (type === "orbit") {
		const orbitColors = ["#00ffff", "#ff00ff", "#ffff00"];
		return (
			<div className="absolute inset-0 flex items-center justify-center">
				<div
					className={`w-40 h-40 rounded-full border border-dashed ${isPlaying ? "animate-music-orbit" : "rotate-0 opacity-10"}`}
					style={{ 
						animationDuration: "10s",
						borderColor: isPlaying ? orbitColors[0] : "rgba(255,255,255,0.3)",
						boxShadow: isPlaying ? `0 0 20px ${orbitColors[0]}40` : "none"
					}}
				/>
				<div
					className={`absolute w-3 h-3 ${isPlaying ? "animate-music-orbit" : "opacity-0"}`}
					style={{
						animationDuration: "3s",
						backgroundColor: orbitColors[1],
						boxShadow: isPlaying ? `0 0 10px ${orbitColors[1]}` : "none",
						offsetPath: "path('M 20,0 A 20,20 0 1,1 -20,0 A 20,20 0 1,1 20,0')",
						offsetDistance: "0%",
					}}
				/>
				<div 
					className="w-2 h-2 rounded-full blur-[1px]" 
					style={{ backgroundColor: orbitColors[2] }}
				/>
			</div>
		);
	}

	if (type === "rainbow" || type === "neon") {
		const isRainbow = type === "rainbow";
		const colors = isRainbow ? rainbowColors : neonColors;
		
		return (
			<div className="flex justify-center gap-1.5 absolute inset-0 px-4 h-full w-full items-end pb-0">
				{Array.from({ length: barCount }).map((_, i) => {
					const randomFactor = (i * 1.34) % 1;
					const duration = 0.3 + randomFactor * 0.5;
					const delay = -randomFactor * 2;
					const barColor = colors[i % colors.length];
					const barId = `v-bar-${type}-${i}`;

					return (
						<div
							key={barId}
							className={`flex-1 rounded-sm backface-hidden will-change-transform ${isPlaying ? "animate-music-bar" : "scale-y-[0.05] opacity-30 shadow-none"}`}
							style={{
								height: "100%",
								animationDuration: `${duration}s`,
								animationDelay: `${delay}s`,
								transformOrigin: "bottom",
								animationPlayState: isPlaying ? "running" : "paused",
								backgroundColor: isPlaying ? barColor : "rgba(255,255,255,0.3)",
								boxShadow: isPlaying ? `0 0 12px ${barColor}80, 0 0 4px ${barColor}` : "none",
							}}
						/>
					);
				})}
			</div>
		);
	}

	const isWave = type === "wave";
	const useColors = isWave;

	return (
		<div
			className={`flex justify-center gap-1.5 absolute inset-0 px-4 h-full w-full ${isWave ? "items-center" : "items-end pb-0"}`}
		>
			{Array.from({ length: barCount }).map((_, i) => {
				const randomFactor = (i * 1.34) % 1;
				const duration = 0.3 + randomFactor * 0.5;
				const delay = -randomFactor * 2;
				const barId = `v-bar-${type}-${i}`;
				const barColor = useColors ? rainbowColors[i % rainbowColors.length] : "#ffffff";

				return (
					<div
						key={barId}
						className={`flex-1 rounded-sm backface-hidden will-change-transform ${isPlaying ? "animate-music-bar" : "scale-y-[0.05] opacity-30 shadow-none"}`}
						style={{
							height: isWave ? "60%" : "100%",
							animationDuration: `${duration}s`,
							animationDelay: `${delay}s`,
							transformOrigin: isWave ? "center" : "bottom",
							animationPlayState: isPlaying ? "running" : "paused",
							backgroundColor: isPlaying ? barColor : "rgba(255,255,255,0.3)",
							boxShadow: isPlaying ? `0 0 10px ${hexToRgba(barColor, 0.4)}` : "none",
						}}
					/>
				);
			})}
		</div>
	);
});
