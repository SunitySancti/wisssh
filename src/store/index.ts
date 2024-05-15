import { configureStore,
         combineReducers } from '@reduxjs/toolkit'
import { useDispatch,
         useSelector } from 'react-redux'

import { apiSlice } from 'store/apiSlice'
import   authReducer from 'store/authSlice'
import   historyReducer from 'store/historySlice'
import   imageReducer from 'store/imageSlice'
import   responsivenessReducer from 'store/responsivenessSlice'

import type { TypedUseSelectorHook } from 'react-redux'


const rootReducer = combineReducers({
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    history: historyReducer,
    images: imageReducer,
    responsiveness: responsivenessReducer
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware)
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof rootReducer>
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
