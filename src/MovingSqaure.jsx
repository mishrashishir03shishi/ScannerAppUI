import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import {
	GRID_ROWS,
	GRID_COLS,
	SOCKET_URL,
	directionOffsets,
	CELL_SIZE,
} from "./utils";

const MovingSquare = ({
	gridColors,
	setGridColors,
	position,
	setPosition,
	socketRef,
}) => {
	const [glowCell, setGlowCell] = useState(null);

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
			setGlowCell(`${data.position.y}-${data.position.x}`);
			setTimeout(() => setGlowCell(null), 1000);
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
				width: `${GRID_COLS * CELL_SIZE}px`,
				height: `${GRID_ROWS * CELL_SIZE}px`,
				gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)`,
				gridTemplateRows: `repeat(${GRID_ROWS}, ${CELL_SIZE}px)`,
			}}
		>
			{gridColors.map((row, rowIndex) =>
				row.map((cell, colIndex) => {
					const isGlow = glowCell === `${rowIndex}-${colIndex}`;
					return (
						<div
							key={`${rowIndex}-${colIndex}`}
							className={`border border-gray-300 w-full h-full ${
								cell === 0
									? "bg-green-500"
									: cell === 1
									? "bg-red-500"
									: "bg-white"
							} ${isGlow ? "animate-glowPulse" : ""}`}
						></div>
					);
				})
			)}
			<motion.div
				className='absolute rounded border-4 border-black'
				style={{
					width: `${CELL_SIZE}px`,
					height: `${CELL_SIZE}px`,
				}}
				animate={{
					left: `${position.x * CELL_SIZE}px`,
					top: `${position.y * CELL_SIZE}px`,
				}}
				transition={{ duration: 1 }}
			></motion.div>
		</div>
	);
};

export default MovingSquare;
