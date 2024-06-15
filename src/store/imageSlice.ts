import { createSlice,
         createAsyncThunk, 
         current} from '@reduxjs/toolkit'
import { Mutex } from 'async-mutex'

import { reAuth } from 'store/authSlice'

import { __API_URL__ } from 'environment'
const __DEV_MODE__ = import.meta.env.DEV

import type { RootState,
              AppDispatch } from 'store'


interface GetImageData {
    id: ImageId;
    url: ImageURL;
    timestamp: number
}

interface GetImageResponse {
    data?: GetImageData;
    error?: any
}

interface PostImageArgs {
    id: ImageId;
    file: File | Blob;
    imageAR?: number;
}

interface CopyWishCoverArgs {
    sourceId: ImageId;
    targetId: ImageId;
}

interface LoadingImageIds {
    [key: ImageId]: boolean
    undefined?: false;
}

type ImageId = string & { length: 6 }
type ImageURL = string

interface ImageURLs {
    [key: ImageId]: {
        url: ImageURL;
        timestamp: number
    } | null
}

interface ImageState {
    imageURLs: ImageURLs;
    backupURLs: ImageURLs;
    loading: LoadingImageIds;
}


const mutex = new Mutex();

async function fetchImage(
    id: ImageId,
    getState: () => RootState
) {
    const { token } = getState().auth;
    if(!id) {
        return ({ data: undefined, error: undefined })
    };
    const endpoint = [__API_URL__, 'images', id ].join('/');

    return await fetch(endpoint,{
        'headers': {
            'Authorization': token,
        }
    })  .then(res => res.json())
        .then(data => {
            const { buffer, type, timestamp } = data;
            const uint8Array = new Uint8Array(buffer.data);
            const blob = new Blob([ uint8Array ], { type });
            const url = URL.createObjectURL(blob);
            return ({
                data: {
                    id,
                    url,
                    timestamp
                },
                error: undefined
            })
        })
        .catch(error => ({
            data: undefined,
            error
        }))
}

async function fetchImageWithReauth(
    id: ImageId,
    getState: () => RootState,
    dispatch: AppDispatch
) {
    await mutex.waitForUnlock();
    let result = await fetchImage(id, getState);
    if(result.error) {
        if(__DEV_MODE__) {
            console.log('Error in image fetch.', result.error)
        }
        if(result.error.status === 403) {
            if (!mutex.isLocked()) {
                const release = await mutex.acquire();
                try {
                    const reAuthSuccess = await reAuth(getState, dispatch);
                    if(reAuthSuccess) {
                        result = await fetchImage(id, getState)
                    }
                } finally {
                    release()
                }
            } else {
                await mutex.waitForUnlock();
                result = await fetchImage(id, getState);
            }
        }
    }
    return result
}

export const getImage = createAsyncThunk<
    GetImageResponse,
    ImageId, {
        state: RootState;
        dispatch: AppDispatch;
}>(
    'images/getImage',
    async (id, thunkApi) => {
        const { getState, dispatch } = thunkApi
        return await fetchImageWithReauth(id, getState, dispatch)
    }
);

export const postImage = createAsyncThunk<
    any,
    PostImageArgs, {
        state: RootState;
        dispatch: AppDispatch;
}>(
    'images/postImage',
    async ({ id, file, imageAR },{ getState }) => {
        if(!id || !file) {
            return {
                error: { message: 'No id or file has specified. Image was not save' },
                data: undefined
            }
        };
        
        const endpoint = [__API_URL__, 'images/post', id].join('/');
        const token = getState().auth.token;
        
        const formData = new FormData();
        formData.append('file', file)
        if(imageAR) {
            formData.append('aspectRatio', String(imageAR))
        }

        return await fetch(endpoint, {
            'method': 'POST',
            'headers': {
                'Authorization': token
            },
            'body': formData
        })
            .then(res => res.json())
            .then(data => ({ data, error: undefined }))
    }
);

export const deleteImage = createAsyncThunk<
    any,
    ImageId, {
        state: RootState;
        dispatch: AppDispatch;
}>(
    'images/deleteImage',
    async (id,{ getState }) => {
        if(!id) {
            return {
                error: { message: 'No id has specified. Image has not been deleted' },
                data: undefined
            }
        };
        
        const endpoint = [__API_URL__, 'images/delete', id].join('/');
        const token = getState().auth?.token;

        return await fetch(endpoint, {
            'method': 'DELETE',
            'headers': {
                'Authorization': token
            }
        })
            .then(res => res.json())
            .then(imageId => ({ data: imageId, error: undefined }))
    }
);

export const copyWishCover = createAsyncThunk<
    any,
    CopyWishCoverArgs, {
        state: RootState;
        dispatch: AppDispatch;
}>(
    'images/copyWishCover',
    async ({ sourceId, targetId },{ getState }) => {
        if(!sourceId || !targetId) {
            return {
                error: { message: 'Source id, target id or image extension was not specified. Image copying was crash' },
                data: undefined
            }
        };

        const token = getState().auth?.token;

        await fetch(__API_URL__ + '/images/copy-wish-cover', {
            'method': 'POST',
            'headers': {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
            'body': JSON.stringify({ sourceId, targetId })
        })
    }
);


const initialState: ImageState = Object.freeze({
    imageURLs: {},
    backupURLs: {},
    loading: {},
})

const imageSlice = createSlice({
    name: 'images',
    initialState,
    reducers: {
        resetImageStore(state) {
            const currentState = current(state);
            const URLs = Object.values(currentState.imageURLs).map(obj => obj?.url)
                 .concat(Object.values(currentState.backupURLs).map(obj => obj?.url));
            
            for(const url of URLs) {
                if(url) URL.revokeObjectURL(url)
            }
            Object.assign(state, initialState)
        },
        removeUrl(state,{ payload: id }) {
            const currentState = current(state);
            const { url } = currentState.imageURLs[id] || currentState.backupURLs[id] || {};
            if(url) {
                URL.revokeObjectURL(url)
            }
            delete state.imageURLs[id];
            delete state.backupURLs[id]
            delete state.loading[id]
        }
    },
    extraReducers: builder => {

        builder.addCase(getImage.pending, (state, action) => {
            const id = action.meta.arg;
            state.loading[id] = true;
        });
        builder.addCase(getImage.fulfilled, (state, action) => {
            if(!action.payload.data) return state
            const { id, url, timestamp } = action.payload.data

            state.imageURLs[id] = url
                ? { url, timestamp }
                : null
            delete state.loading[id];
        });
        builder.addCase(getImage.rejected, (state, action) => {
            const id = action.meta.arg
            delete state.loading[id];
        });


        builder.addCase(postImage.pending, (state, action) => {
            const { id, file } = action.meta.arg;
            state.backupURLs[id] = state.imageURLs[id] || null;
    
            state.imageURLs[id] = {
                url: URL.createObjectURL(file),
                timestamp: Date.now()
            };
        });
        builder.addCase(postImage.fulfilled, (state, action) => {
            if(!action.payload.data) return state
            const { id } = action.meta.arg;
            const backupURL = current(state).backupURLs[id]
            if(backupURL) {
                URL.revokeObjectURL(backupURL.url)
            }
            delete state.backupURLs[id]
        });
        builder.addCase(postImage.rejected, (state, action) => {
            const { id } = action.meta.arg;
            state.imageURLs[id] = state.backupURLs[id];
            delete state.backupURLs[id];
        });


        builder.addCase(deleteImage.pending, (state, action) => {
            const id = action.meta.arg;
            delete state.loading[id]
            state.backupURLs[id] = state.imageURLs[id];
            delete state.imageURLs[id]
        });
        builder.addCase(deleteImage.fulfilled, (state, action) => {
            if(!action.payload.data) return state
            const id = action.meta.arg;
            const backupURL = current(state).backupURLs[id]
            if(backupURL) {
                URL.revokeObjectURL(backupURL.url)
            }
            delete state.backupURLs[id]
        });
        builder.addCase(deleteImage.rejected, (state, action) => {
            const id = action.meta.arg;
            state.imageURLs[id] = state.backupURLs[id];
            delete state.backupURLs[id]
        });

        
        builder.addCase(copyWishCover.pending, (state, action) => {
            const { sourceId, targetId } = action.meta.arg;
            state.imageURLs[targetId] = current(state).imageURLs[sourceId]
        });
        builder.addCase(copyWishCover.rejected, (state, action) => {
            const { targetId } = action.meta.arg;
            delete state.imageURLs[targetId]
        });
    }
});

export const {
    resetImageStore,
    removeUrl
} = imageSlice.actions;

export default imageSlice.reducer;
