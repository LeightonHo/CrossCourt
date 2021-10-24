import { createSlice } from '@reduxjs/toolkit'

const initialState: any = {
    userId: "",
    sessionId: "",
	isHost: false,
    isConnected: false,
    isLoading: false,
    isJoiningSession: false,
    joinedSession: false
}

export const configSlice = createSlice({
	name: "general",
	initialState,
	reducers: {
        setUserId: (state, action) => {
            state.userId = action.payload;
        },
        setSessionId: (state, action) => {
            state.sessionId = action.payload;
        },
		setIsHost: (state, action) => {
			state.isHost = action.payload;
		},
        setIsConnected: (state, action) => {
			state.isConnected = action.payload;
		},
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
		},
        setJoinedSession: (state, action) => {
			state.joinedSession = action.payload;
		}
	},
})

export const { 
    setUserId,
    setSessionId,
	setIsHost,
    setIsConnected,
    setIsLoading,
    setJoinedSession
} = configSlice.actions;

export default configSlice.reducer;