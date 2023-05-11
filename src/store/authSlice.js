import { createSlice } from '@reduxjs/toolkit'

import { apiSlice } from 'store/apiSlice'


const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: localStorage.getItem('token') || '',
        user: localStorage.getItem('user') || {},
    },
    reducers: {
        logout(state) {
            state.token = '';
            state.user = {};
        },
    },
    extraReducers: builder => {
        builder.addMatcher(
            apiSlice.endpoints.login.matchFulfilled,
            (state,{ payload }) => {
                console.log('matcher fired', payload)
                state.token = payload.token;
                state.user = payload.user;
            }
        );
    },
});

export const {
    logout
} = authSlice.actions;

export default authSlice.reducer;
