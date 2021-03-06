import { IConfig } from "../types";
import store from "../redux/Store";
import {
	setIsConnected,
	setIsHost,
	setIsLoading,
	setIsSessionActive,
	setJoinedSession,
	setSessionId,
} from "../redux/General";
import {
	addPlayer as reduxAddPlayer,
	removePlayer as reduxRemovePlayer,
	updatePlayer as reduxUpdatePlayer,
	addCourt as reduxAddCourt,
	removeCourt as reduxRemoveCourt,
	setConfig
} from "../redux/Config";
import {
	addRound,
	updateScore as reduxUpdateScore,
	setGameState
} from "../redux/GameState";
import { setError } from "../redux/Lobby";

let token: string;
let userId: string;
let sessionId: string;
let socket: any = null;
let keepAlive: boolean = true;

const send = (payload: any, showSpinner: boolean) => {
	if (showSpinner) {
		store.dispatch(setIsLoading(true));
	}

	socket.send(JSON.stringify(payload));
}

const heartbeat = () => {
	if (keepAlive) {
		const payload: any = {
			action: "ping"
		}

		send(payload, false);
		setTimeout(heartbeat, 30000);
	}
}

export const initSocket = () => {
	console.log("Initialising web socket.");

	token = store.getState().general.token;
	userId = store.getState().general.userId;
	sessionId = store.getState().general.sessionId;

	if (!socket || (socket.readyState !== WebSocket.CONNECTING && socket.readyState === WebSocket.CLOSED)) {
		socket = new WebSocket(`${process.env.REACT_APP_WEBSOCKET_URL}` || "");
	}

	socket.onmessage = (ev: MessageEvent<any>) => {
		const data = JSON.parse(ev.data);

		switch (data.action) {
			case "add_player":
				store.dispatch(setIsLoading(false));
				store.dispatch(reduxAddPlayer(JSON.parse(data.player)));
				break;
			case "remove_player":
				store.dispatch(setIsLoading(false));
				store.dispatch(reduxRemovePlayer(JSON.parse(data.player)));
				break;
			case "update_player":
				store.dispatch(reduxUpdatePlayer(JSON.parse(data.player)));
				break;
			case "add_court":
				store.dispatch(setIsLoading(false));
				store.dispatch(reduxAddCourt(data.court));
				break;
			case "remove_court":
				store.dispatch(setIsLoading(false));
				store.dispatch(reduxRemoveCourt(data.court));
				break;
			case "update_config":
				store.dispatch(setConfig(JSON.parse(data.config)));
				break;
			case "add_round":
				store.dispatch(addRound(JSON.parse(data.round)));
				store.dispatch(setConfig(JSON.parse(data.config)));
				store.dispatch(setIsLoading(false));
				break;
			case "update_score":
				store.dispatch(reduxUpdateScore(JSON.parse(data.data)));
				break;
			case "update_gamestate":
				store.dispatch(setGameState(JSON.parse(data.gameState)));
				store.dispatch(setConfig(JSON.parse(data.config)));
				break;
			case "created_session":
				console.log(data.message);
				updateLocalSessionId(data.sessionId);
				store.dispatch(setSessionId(data.sessionId));
				store.dispatch(setConfig(JSON.parse(data.config)));
				store.dispatch(setJoinedSession(true));
				store.dispatch(setIsHost(data.isHost));
				store.dispatch(setIsSessionActive(data.isSessionActive));
				store.dispatch(setIsLoading(false));
				break;
			case "joined_session":
				console.log(data.message);
				updateLocalSessionId(data.sessionId);
				store.dispatch(setSessionId(data.sessionId));
				store.dispatch(setJoinedSession(true));
				store.dispatch(setIsHost(data.isHost));
				store.dispatch(setIsSessionActive(data.isSessionActive));

				// If no game state is returned, then the game hasn't started yet, so show a loading screen until data is pushed.
				store.dispatch(setGameState(JSON.parse(data.gameState)));
				store.dispatch(setConfig(JSON.parse(data.config)));
				store.dispatch(setIsLoading(false));
				break;
			case "ended_session":
				store.dispatch(setIsSessionActive(false));
				store.dispatch(setIsLoading(false));
				break;
			case "join_failed":
				updateLocalSessionId("");
				store.dispatch(setError(data.message));
				store.dispatch(setSessionId(""));
				store.dispatch(setJoinedSession(false));
				store.dispatch(setIsLoading(false));
				break;
		}
	};

	socket.onopen = () => {
		// setTimeout(() => {
		// 	console.log("Manually closing the socket");
		// 	  socket.close();
		// }, 2000);
		heartbeat();

		console.log("WebSocket is connected.");
		store.dispatch(setIsConnected(true));

		if (sessionId) {
			console.log("Joining session.");
			joinSession(sessionId);
		}
	};

	socket.onclose = () => {
		console.log("WebSocket is closed.");
		keepAlive = false;
		store.dispatch(setIsConnected(false));
	};
}

const updateLocalSessionId = (sessionId: string) => {
	const user = JSON.parse(localStorage.getItem("crosscourt_user") || "");

	localStorage.setItem("crosscourt_user", JSON.stringify({
		...user,
		currentSessionId: sessionId
	}));
}

// Public Socket Helper functions
export const generateRound = (sessionId: string, config: IConfig) => {
	send({
		action: "generate_round",
		userId: userId,
		sessionId: sessionId,
		config: JSON.stringify(config)
	}, true);
}

export const addCourt = (sessionId: string, court: string) => {
	send({
		action: "session",
		method: "add_court",
		userId: userId,
		sessionId: sessionId,
		court: court
	}, true);
}

export const removeCourt = (sessionId: string, court: string) => {
	send({
		action: "session",
		method: "remove_court",
		userId: userId,
		sessionId: sessionId,
		court: court
	}, true);
}

export const addPlayer = (sessionId: string, playerId: string, alias: string, avatarUrl: string) => {
	send({
		action: "session",
		method: "add_player",
		userId: userId,
		sessionId: sessionId,
		playerId: playerId,
		alias: alias,
		avatarUrl: avatarUrl
	}, true);
}

export const removePlayer = (sessionId: string, playerId: string) => {
	send({
		action: "session",
		method: "remove_player",
		userId: userId,
		sessionId: sessionId,
		playerId: playerId
	}, true);
}

export const updatePlayer = (sessionId: string, playerId: string) => {
	send({
		action: "session",
		method: "update_player",
		userId: userId,
		sessionId: sessionId,
		playerId: playerId
	}, false);
}

export const updateScore = (sessionId: string, roundKey: number, matchKey: number, team: number, score: number) => {
	send({
		action: "session",
		method: "update_score",
		userId: userId,
		sessionId: sessionId,
		roundKey: roundKey,
		matchKey: matchKey,
		team: team,
		score: score
	}, false);
}

// export const updatePlayer = (sessionId: string, roundKey: number, matchKey: number, player: number, name: string) => {
// 	send({
// 		action: "session",
// 		method: "update_player",
// 		userId: userId,
// 		sessionId: sessionId,
// 		roundKey: roundKey,
// 		matchKey: matchKey,
// 		player: player,
// 		name: name
// 	});
// }

export const updateBye = (sessionId: string, roundKey: number, byeKey: number, name: string) => {
	send({
		action: "session",
		method: "update_bye",
		userId: userId,
		sessionId: sessionId,
		roundKey: roundKey,
		byeKey: byeKey,
		name: name
	}, true);
}

export const createSession = () => {
	send({
		action: "session",
		method: "create",
		userId: userId
	}, true);
}

export const joinSession = (sessionId: string) => {
	send({
		action: "session",
		method: "join",
		userId: userId,
		sessionId: sessionId
	}, true);
}

export const leaveSession = (sessionId: string) => {
	send({
		action: "session",
		method: "leave",
		userId: userId,
		sessionId: sessionId
	}, false);
}

export const endSession = (sessionId: string) => {
	send({
		action: "session",
		method: "end",
		userId: userId,
		sessionId: sessionId
	}, true);
}