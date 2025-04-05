import React, { useEffect } from "react";
import { motion } from "framer-motion";

import { GRID_ROWS, GRID_COLS, SOCKET_URL, directionOffsets } from "./utils";

const MovingSquare = ({ gridColors, setGridColors, position, setPosition }) => {
	const socketRef = React.useRef(null);

	useEffect(() => {
		// Establish WebSocket connection
		const ws = new WebSocket(SOCKET_URL);
		ws.onopen = () => console.log("Connected to WebSocket");
		ws.onmessage = (message) => {
			const data = JSON.parse(message.data);
			console.log("data", data);
			setGridColors((prev) => {
				const newGrid = prev.map((row) => [...row]);
				newGrid[data.position.y][data.position.x] = data.colorCode;
				return newGrid;
			});
		};
		socketRef.current = ws;
	}, []);

	console.log("grid", gridColors);

	const sendMoveEvent = (direction) => {
		const socket = socketRef.current;
		console.log("sendMoveEvent", direction);
		console.log("socket", socket);
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(direction.toUpperCase());
		} else {
			console.warn("WebSocket is not open yet.");
			toast.warn("WebSocket is not open yet.");
		}
	};

	const moveSquare = (direction) => {
		setPosition((prev) => {
			const newX = Math.max(
				0,
				Math.min(GRID_COLS - 1, prev.x + directionOffsets[direction].x)
			);
			const newY = Math.max(
				0,
				Math.min(GRID_ROWS - 1, prev.y + directionOffsets[direction].y)
			);
			return { x: newX, y: newY };
		});
		console.log("direction", direction.toUpperCase());
		sendMoveEvent(direction.toUpperCase());
	};

	const handleKeyDown = (e) => {
		const direction = e.key.replace("Arrow", "").toLowerCase();
		if (directionOffsets[direction]) {
			moveSquare(direction);
		}
	};

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<div
			className='relative w-[450px] h-[300px] border border-black grid'
			style={{
				gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
				gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
			}}
		>
			{gridColors.map((row, rowIndex) =>
				row.map((cell, colIndex) => (
					<div
						key={`${rowIndex}-${colIndex}`}
						className={`border border-gray-300 w-full h-full ${
							cell === 0
								? "bg-green-500"
								: cell === 1
								? "bg-red-500"
								: "bg-white"
						}`}
					></div>
				))
			)}
			<motion.div
				className='absolute w-[30px] h-[30px] rounded border-4 border-black'
				animate={{ left: `${position.x * 30}px`, top: `${position.y * 30}px` }}
				transition={{ duration: 0.5 }}
			></motion.div>
		</div>
	);
};

export default MovingSquare;
