import { configureStore,
         combineReducers } from '@reduxjs/toolkit'
import { persistReducer,
         FLUSH,
         REHYDRATE,
         PAUSE,
         PERSIST,
         PURGE,
         REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { apiSlice } from 'store/apiSlice'
import authReducer from 'store/authSlice'
import historyReducer from 'store/historySlice'
import imageReducer from 'store/imageSlice'


const rootReducer = combineReducers({
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    history: historyReducer,
    images: imageReducer,
});

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    blacklist: ['images']
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(apiSlice.middleware)
})