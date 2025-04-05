import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MovingSquare from "./MovingSqaure";
import "./App.css";
import { toast, ToastContainer } from "react-toastify";

import { API_URL, GRID_ROWS, GRID_COLS } from "./utils";

const hasColoredCells = (grid) => {
	return grid.some((row) => row.some((cell) => cell !== -1));
};

function App() {
	const [mounted, setMounted] = useState(false);
	const [gridColors, setGridColors] = useState([]);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [header, setHeader] = useState("🔬 Microscope");
	const [error, setError] = useState("");
	const [keyPressed, setKeyPressed] = useState(false);

	useEffect(() => {
		const handleKeyPress = () => {
			// setMounted(true);
			setKeyPressed(true);
		};

		// Listen for any key press
		window.addEventListener("keydown", handleKeyPress);

		// Clean up
		return () => {
			window.removeEventListener("keydown", handleKeyPress);
		};
	}, []);

	useEffect(() => {
		fetch(`${API_URL}/grid`)
			.then((response) => {
				console.log("response", response);
				return response.json();
			})
			.then((data) => {
				console.log("data fetched", data);
				setGridColors(data.grid);
				setPosition({
					x: data.currentPosition.x,
					y: data.currentPosition.y,
				});
				if (data?.grid?.length > 0 && hasColoredCells(data.grid)) {
					setMounted(true);
				}
			})
			.catch((error) => {
				console.error("Error fetching initial data:", error);
				// toast.error("Error fetching initial data");
				setHeader("Internal Server Error");
				setError("Error fetching initial data");
			});
	}, []);

	return (
		<div className='h-screen min-w-screen bg-gradient-to-br from-purple-800 via-indigo-900 to-black flex flex-col items-center justify-center text-white font-mono relative overflow-hidden'>
			<ToastContainer />
			{/* Title */}
			<motion.h1
				className='text-5xl md:text-6xl font-bold mb-8 z-10 text-center tracking-widest'
				initial={{ opacity: 0, y: -60 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1, delay: 0.3 }}
			>
				{header}
			</motion.h1>

			{mounted ? (
				<>
					<div className='flex items-center justify-center bg-black/30 border-4 border-indigo-500 rounded shadow-lg z-10'>
						<MovingSquare
							gridColors={gridColors}
							setGridColors={setGridColors}
							position={position}
							setPosition={setPosition}
						/>
					</div>
					<motion.p
						className='mt-10 z-10 bg-black hover:bg-slate-900 text-white text-xl px-8 py-3 rounded-xl shadow-lg transition-all duration-300 cursor-pointer select-none'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 1, delay: 0.3 }}
						whileTap={{ scale: 0.95, y: 2 }}
						onClick={() => {
							fetch(`${API_URL}/clear`)
								.then((response) => {
									console.log("response", response);
									return response.ok;
								})
								.then((data) => {
									if (!data) {
										console.error("Error clearing the grid");
										return;
									}
									setGridColors(
										Array.from({ length: GRID_ROWS }, () =>
											Array(GRID_COLS).fill(-1)
										)
									);
									setPosition({
										x: 0,
										y: 0,
									});
								})
								.catch((error) => {
									console.error("Error fetching initial data:", error);
									toast.error("Internal Server Error. Error clearing the grid");
								});
						}}
					>
						Reset
					</motion.p>
					{!keyPressed && (
						<motion.p
							className='text-lg text-center mt-6 z-10 animate-pulse'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 1, delay: 0.8 }}
						>
							🎮 Press any key to continue
						</motion.p>
					)}
				</>
			) : error && error.length > 0 ? (
				<p className='text-white mt-4 z-10'>{error}</p>
			) : (
				<motion.button
					className='mt-10 z-10 bg-pink-600 hover:bg-pink-700 text-white text-xl px-8 py-3 rounded-xl shadow-lg transition-all duration-300'
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 1 }}
					onClick={() => setMounted(true)}
				>
					🎮 Start
				</motion.button>
			)}
			<div className='absolute top-0 left-0 w-full h-full pointer-events-none z-0'></div>
		</div>
	);
}

export default App;
