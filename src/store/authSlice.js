import { createSlice } from '@reduxjs/toolkit'

import { apiSlice } from 'store/apiSlice'


const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: sessionStorage.getItem('token') || localStorage.getItem('token') || undefined,
        userId: sessionStorage.getItem('userId') || localStorage.getItem('userId') || undefined
    },
    reducers: {
        logout(state) {
            sessionStorage.setItem('token', '');
            sessionStorage.setItem('userId', '');
            state.token = '';
            state.userId = '';
        },
    },
    extraReducers: builder => {
        builder.addMatcher(
            apiSlice.endpoints.login.matchFulfilled,
            (state,{ payload:{ token, userId }}) => {
                console.log({ token, userId })
                state.token = token;
                state.userId = userId
            }
        );
        builder.addMatcher(
            apiSlice.endpoints.signup.matchFulfilled,
            (state,{ payload:{ token, userId }}) => {
                console.log({ token, userId })
                state.token = token;
                state.userId = userId
            }
        );
    },
});

export const {
    logout
} = authSlice.actions;

export default authSlice.reducer;
