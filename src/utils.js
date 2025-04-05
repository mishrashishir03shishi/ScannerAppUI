const GRID_ROWS = 10;
const GRID_COLS = 15;
const SOCKET_URL = "ws://13.235.77.139:8080/ws/canvas";
const API_URL = "http://13.235.77.139:8080/canvas";

const directionOffsets = {
	up: { x: 0, y: -1 },
	down: { x: 0, y: 1 },
	left: { x: -1, y: 0 },
	right: { x: 1, y: 0 },
};

export { GRID_ROWS, GRID_COLS, SOCKET_URL, API_URL, directionOffsets };
