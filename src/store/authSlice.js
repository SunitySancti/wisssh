import { createSlice,
         current } from '@reduxjs/toolkit'

import { apiSlice } from 'store/apiSlice'

const __API_URL__ = import.meta.env.VITE_API_URL;
const __DEV_MODE__ = import.meta.env.VITE_DEV_MODE === 'true';


const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: sessionStorage.getItem('token') || localStorage.getItem('token') || '',
        refreshToken: localStorage.getItem('refreshToken') || '',
        remember: true
    },
    reducers: {
        refresh(state,{ payload: { token, refreshToken } }) {
            state.token = token;
            state.refreshToken = refreshToken;
        },
        logout(state) {
            sessionStorage.setItem('token', '');
            localStorage.setItem('token', '');
            localStorage.setItem('refreshToken', '');
            state.token = '';
            state.refreshToken = '';
            state.remember = true
        },
        setRemember(state,{ payload }) {
            state.remember = payload
        },
    },
    extraReducers: builder => {
        [ apiSlice.endpoints.login,
          apiSlice.endpoints.signup ].forEach(endpoint => {

            builder.addMatcher(
                endpoint.matchFulfilled,

                (state,{ payload:{ token, refreshToken }}) => {
                    state.token = token;
                    state.refreshToken = refreshToken;
                    const storage = current(state).remember ? localStorage : sessionStorage;
                    storage.setItem('token', token);
                    localStorage.setItem('refreshToken', refreshToken)
                }
            )
        })
    },
});

export async function reAuth(thunkApi) {
    const { token, refreshToken } = thunkApi.getState().auth;

    const refreshResult = await fetch(__API_URL__ + '/auth/refresh-token', {
        'method': 'POST',
        'headers': {
            "Content-Type": "application/json",
            "Authorization": token
        },
        'body': JSON.stringify({ refreshToken })
    })
        .then(res => res.json())
        .then(obj => ({ data: obj }))
        .catch(err => ({ error: err }))

    const { data, error } = refreshResult;

    if(data) {
        if(__DEV_MODE__) {
            console.log('Re-auth data:', data)
        }
        thunkApi.dispatch(authSlice.actions.refresh(data))
    } else if(error) {
        if(__DEV_MODE__) {
            console.log('Re-auth error:', error)
        }
        thunkApi.dispatch(authSlice.actions.logout())
    }

    return({ reAuthSuccess: !!data })
}


export const {
    refresh,
    logout,
    setRemember
} = authSlice.actions;

export default authSlice.reducer;
