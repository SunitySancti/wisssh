import { createSlice,
         current } from '@reduxjs/toolkit'

import { apiSlice } from 'store/apiSlice'

import { __API_URL__ } from 'environment'
const __DEV_MODE__ = import.meta.env.DEV

import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState,
              AppDispatch } from 'store'


interface AuthState {
    token: string;
    refreshToken: string;
    remember: boolean
}

const initialState: AuthState = {
    token: sessionStorage.getItem('token') || localStorage.getItem('token') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    remember: true
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        refresh(state, action: PayloadAction<{ token: string; refreshToken: string }> ) {
            const { token, refreshToken } = action.payload 
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
        setRemember(state, action: PayloadAction<boolean>) {
            state.remember = action.payload
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
    }
});

interface RefreshResult {
    data?: any;
    error?: any
}

export async function reAuth(
    getState: () => RootState,
    dispatch: AppDispatch
) {
    const { token, refreshToken } = getState().auth;

    const refreshResult: RefreshResult = await fetch(__API_URL__ + '/auth/refresh-token', {
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
        dispatch(authSlice.actions.refresh(data))
    }

    if(__DEV_MODE__) {
        if(data) {
            console.log('Re-auth data:', data)
        } else if(error) {
            console.log('Re-auth error:', error)
        }
    }

    return data ? true : false
}


export const {
    refresh,
    logout,
    setRemember
} = authSlice.actions;

export default authSlice.reducer;
