import { createSlice,
         createAsyncThunk, 
         current} from '@reduxjs/toolkit'
import { Mutex } from 'async-mutex'

import { reAuth } from 'store/authSlice'
import { apiSlice } from 'store/apiSlice'

import { __API_URL__ } from 'environment'
const __DEV_MODE__ = import.meta.env.DEV

import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState,
              AppDispatch } from 'store'


interface GetImageData {
    data?: {
        id: ImageId;
        url: ImageURL;
        timestamp: number
    };
    error?: any
}

interface GetImageArgs {
    id: ImageId;
    ext: 'jpg' | 'png';
    type: 'cover' | 'avatar'
}

interface PostImageArgs {
    id: ImageId;
    file: File | Blob;
    drive: 'covers' | 'avatars'
}

interface DeleteImageArgs {
    id: ImageId;
    drive: 'covers' | 'avatars'
}

interface CopyWishCoverArgs {
    sourceId: ImageId;
    targetId: ImageId;
    extension: 'jpg' | 'png' | null
}

interface LoadingImageIds {
    [key: ImageId]: boolean
    undefined?: false;
}

export interface QueueItem {
    id: ImageId;
    ext: 'jpg' | 'png';
    type: 'avatar' | 'cover'
}

type ImageId = string & { length: 6 }
type ImageURL = string

interface ImageURLs {
    [key: ImageId]: {
        url: ImageURL;
        timestamp: number
    } | null
    // undefined?: null
}

interface ImageState {
    imageURLs: ImageURLs;
    backupURLs: ImageURLs;
    loading: LoadingImageIds;
    queue: Array<QueueItem>;
    prior: Array<QueueItem>;
}

const initialState: ImageState = Object.freeze({
    imageURLs: {},
    backupURLs: {},
    loading: {},
    queue: [],
    prior: [],
})


const mutex = new Mutex();

async function fetchImage(
    name: string,
    type: 'cover' | 'avatar',
    getState: () => RootState
) {
    const { token } = getState().auth;
    if(!name) {
        return ({ data: undefined, error: undefined })
    };
    const id = name.split('.')[0];
    const endpoint = [__API_URL__, 'images', type + 's', name ].join('/');

    return await fetch(endpoint,{
        'headers': {
            'Authorization': token,
            'Content-Type': 'application/json'
        }
    })  .then(res => res.json())
        .then(data => {
            const { buffer, type, timestamp } = data;
            const uint8Array = new Uint8Array(buffer.data);
            const blob = new Blob([ uint8Array ], { type });
            const url = URL.createObjectURL(blob);
            return ({
                data: {
                    id: id as ImageId,
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
    name: string,
    type: 'cover' | 'avatar',
    getState: () => RootState,
    dispatch: AppDispatch
) {
    await mutex.waitForUnlock();
    let result = await fetchImage(name, type, getState);
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
                        result = await fetchImage(name, type, getState)
                    }
                } finally {
                    release()
                }
            } else {
                await mutex.waitForUnlock();
                result = await fetchImage(name, type, getState);
            }
        }
    }
    return result
}

export const getImage = createAsyncThunk<
    GetImageData,
    GetImageArgs, {
        state: RootState;
        dispatch: AppDispatch;
}>(
    'images/fetchWishCover',
    async ({ id, ext, type }, thunkApi) => {
        const { getState, dispatch } = thunkApi
        return await fetchImageWithReauth(id + '.' + ext, type, getState, dispatch)
    }
);

export const postImage = createAsyncThunk<
    any,
    PostImageArgs, {
        state: RootState;
        dispatch: AppDispatch;
}>(
    'images/postImage',
    async ({ id, file, drive },{ getState }) => {
        if(!id || !file || !drive) {
            return {
                error: { message: 'No id, file or drive was specified. Image was not save' },
                data: undefined
            }
        };
        
        const endpoint = [__API_URL__, 'images/post', drive, id].join('/');
        const token = getState().auth.token;
        
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
            .then(data => ({ data, error: undefined }))
    }
);

export const deleteImage = createAsyncThunk<
    any,
    DeleteImageArgs, {
        state: RootState;
        dispatch: AppDispatch;
}>(
    'images/deleteImage',
    async ({ id, drive },{ getState }) => {
        if(!id || !drive) {
            return {
                error: { message: 'No id or drive was specified. Image has not been deleted' },
                data: undefined
            }
        };
        
        const endpoint = [__API_URL__, 'images/delete', drive, id].join('/');
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
    async ({ sourceId, targetId, extension },{ getState }) => {
        if(!sourceId || !targetId || !extension) {
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
            'body': JSON.stringify({ sourceId, targetId, extension })
        })
    }
);


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
        promoteImages(state, action: PayloadAction<ImageId | ImageId[]>) {
            const { payload } = action;
            if(!payload || !payload?.length) return state
            
            const { queue, prior } = current(state);
            const queueIds = queue.map(item => item.id);
            const priorIds = prior.map(item => item.id);

            const newPrior: Array<QueueItem> = [];

            function pickPriors(id: ImageId) {
                if(queueIds.includes(id) && !priorIds.includes(id)) {
                    const next = queue.find(item => item.id === id)
                    if(next) {
                        newPrior.push(next)
                    }
                }
            }

            if(payload instanceof Array) {
                payload.forEach(pickPriors)
            } else {
                pickPriors(payload)
            }

            const newPriorIds = newPrior.map(item => item.id);

            state.prior = prior.concat(newPrior);
            state.queue = queue.filter(item => !newPriorIds.includes(item.id))
        }
    },
    extraReducers: builder => {

        builder.addCase(getImage.pending, (state, action) => {
            const { id } = action.meta.arg;
            state.loading[id] = true;
            state.queue = current(state).queue.filter(item => item.id !== id);
            state.prior = current(state).prior.filter(item => item.id !== id);
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
            const { id } = action.meta.arg
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
            const { id } = action.meta.arg;
            delete state.loading[id]
            state.backupURLs[id] = state.imageURLs[id];
            delete state.imageURLs[id]
        });
        builder.addCase(deleteImage.fulfilled, (state, action) => {
            if(!action.payload.data) return state
            const { id } = action.meta.arg;
            const backupURL = current(state).backupURLs[id]
            if(backupURL) {
                URL.revokeObjectURL(backupURL.url)
            }
            delete state.backupURLs[id]
        });
        builder.addCase(deleteImage.rejected, (state, action) => {
            const { id } = action.meta.arg;
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


        [ apiSlice.endpoints.getCurrentUser,
          apiSlice.endpoints.getFriends,
          apiSlice.endpoints.getUserWishes,
          apiSlice.endpoints.getFriendWishes ].forEach(endpoint => {

            builder.addMatcher(
                endpoint.matchFulfilled,
                (state,{ payload }) => {
                    const currentState = current(state)
                    const currentQueueIds = currentState.queue.map(item => item.id);
                    const currentPriorIds = currentState.prior.map(item => item.id);
                    const currentImageIds = Object.keys(currentState.imageURLs) as ImageId[];
                    const currentBackupIds = Object.keys(currentState.backupURLs) as ImageId[];
                    const currentLoadingIds = Object.keys(currentState.loading) as ImageId[];
                    const idList = [...currentQueueIds, ...currentPriorIds, ...currentImageIds, ...currentBackupIds, ...currentLoadingIds];

                    if(!(payload instanceof Array)) {
                        payload = [ payload ]
                    }

                    payload.forEach(unit => {
                        if(unit && typeof unit === 'object') {
                            const { id, imageExtension: ext, title } = unit;
                            const type = title ? 'cover' : 'avatar';
                            
                            if(!idList.includes(id) && ext) {
                                state.queue.push({ id, ext, type })
                            }

                            const unitTS = unit.lastImageUpdate || 0;
                            const imageTS = currentState.imageURLs[id]?.timestamp || 0

                            // we need to renew image data: fetch or delete url
                            if((unitTS > imageTS) && ext) {
                                if(ext) {
                                    state.queue.push({ id, ext, type })
                                } else {
                                    delete state.imageURLs[id];
                                    delete state.backupURLs[id]
                                }
                            }
                        }
                    })
                }
            )
        })
    }
});

export const {
    resetImageStore,
    promoteImages,
} = imageSlice.actions;

export default imageSlice.reducer;
