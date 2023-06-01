import { createSlice,
         createAsyncThunk } from '@reduxjs/toolkit'
import { Mutex } from 'async-mutex'

import { reAuth } from 'store/authSlice';

const apiUrl = import.meta.env.VITE_API_URL;


const mutex = new Mutex();

async function fetchImage(id, drive, getState) {
    const { token } = getState().auth;
    if(!id) return;
    const endpoint = [apiUrl, 'images', drive, id].join('/');

    return await fetch(endpoint,{
        'headers': {
            'Authorization': token
        }
    })  .then(res => res.blob())
        .then(blob => {
            if(blob.size) return URL.createObjectURL(blob)
            else return null
        })
        .then(url => ({ data: { id, url }}))
        .catch(err => ({ error: err }))
}

async function fetchImageWithReauth(id, drive, thunkApi) {
    await mutex.waitForUnlock();
    let result = await fetchImage(id, drive, thunkApi.getState);

    if(result.error) {
        console.log('Async error (image).', result.error)

        if(result.error.status === 403) {
            if (!mutex.isLocked()) {
                const release = await mutex.acquire();
                try {
                    const { reAuthSuccess } = await reAuth(thunkApi);
                    if(reAuthSuccess) {
                        result = await fetchImage(id, drive, thunkApi.getState)
                    }
                } finally {
                    release()
                }
            } else {
                await mutex.waitForUnlock();
                result = await fetchImage(id, drive, thunkApi.getState);
            }
        }
    }
    return result
}

export const fetchUserAvatar = createAsyncThunk(
    'images/fetchUserAvatar',
    async (id, thunkApi) => {
        return await fetchImageWithReauth(id, 'avatars', thunkApi)
    }
);

export const fetchWishCover = createAsyncThunk(
    'images/fetchWishCover',
    async (id, thunkApi) => {
        return await fetchImageWithReauth(id, 'covers', thunkApi)
    }
);

export const postImage = createAsyncThunk(
    'images/postImage',
    async ({ id, file, drive },{ getState }) => {
        if(!id || !file || !drive) return;
        
        const endpoint = [apiUrl, 'images', drive, id].join('/');
        const token = getState().auth?.token;

        const formData = new FormData();
        formData.append('file', file)

        return await fetch(endpoint, {
            'method': 'POST',
            'headers': {
                'Authorization': token
            },
            'body': formData
        })
            .then(res => res.json())
    }
);


const imageSlice = createSlice({
    name: 'images',
    initialState: {
        imageURLs: {},
        backupURLs: {},
        loading: {}
    },
    reducers: {
        resetImageStore(state) {
            state.imageURLs = {};
            state.backupURLs = {};
            state.loading = {}
        },
        addImageURL(state,{ payload }) {
            const { id, url } = payload;
            if (!id) return;
            
            state.imageURLs[id] = url
        },
        deleteImageURL(state,{ payload: id }) {
            state.imageURLs[id] = null
        },
    },
    extraReducers: builder => {
        builder.addCase(fetchUserAvatar.pending, (state,{ meta:{ arg: id }}) => {
            state.loading[id] = true;
        });
        builder.addCase(fetchUserAvatar.fulfilled, (state,{ payload:{ data } }) => {
            if(!data) return state;
            const { id, url } = data;
            state.imageURLs[id] = url
            delete state.loading[id];
        });
        builder.addCase(fetchUserAvatar.rejected, (state,{ meta:{ arg: id }}) => {
            delete state.loading[id];
            console.log('fetching user avatar was rejected');
        });


        builder.addCase(fetchWishCover.pending, (state,{ meta:{ arg: id }}) => {
            state.loading[id] = true;
        });
        builder.addCase(fetchWishCover.fulfilled, (state,{ payload:{ data } }) => {
            if(!data) return state;
            const { id, url } = data;
            state.imageURLs[id] = url
        });
        builder.addCase(fetchWishCover.rejected, (state,{ meta:{ arg: id }}) => {
            delete state.loading[id];
            console.log('fetching wish cover was rejected')
        });


        builder.addCase(postImage.pending, (state, action) => {
            const { id, file } = action.meta.arg;
            state.backupURLs[id] = state.imageURLs[id] || null;
            state.imageURLs[id] = URL.createObjectURL(file);
            state.loading[id] = true;
        });
        builder.addCase(postImage.fulfilled, (state, action) => {
            const { id } = action.meta.arg
            delete state.backupURLs[id];
            delete state.loading[id];
        });
        builder.addCase(postImage.rejected, (state, action) => {
            const { id } = action.meta.arg;
            state.imageURLs[id] = state.backupURLs[id];
            delete state.backupURLs[id];
            delete state.loading[id];
            console.log('posting image was rejected')
        });
    }
});

export const {
    resetImageStore,
    addImageURL,
    deleteImageURL,
} = imageSlice.actions;

export default imageSlice.reducer;