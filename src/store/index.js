import { configureStore,
         combineReducers } from '@reduxjs/toolkit'

import { apiSlice } from 'store/apiSlice'
import   authReducer from 'store/authSlice'
import   historyReducer from 'store/historySlice'
import   imageReducer from 'store/imageSlice'
import   processingReducer from 'store/processingSlice'


const rootReducer = combineReducers({
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    history: historyReducer,
    images: imageReducer,
    processing: processingReducer
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware)
})