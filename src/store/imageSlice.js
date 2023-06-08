import { createSlice,
         createAsyncThunk, 
         current} from '@reduxjs/toolkit'
import { Mutex } from 'async-mutex'

import { reAuth } from 'store/authSlice'
import { apiSlice } from 'store/apiSlice'

const __API_URL__ = import.meta.env.VITE_API_URL;
const __DEV_MODE__ = import.meta.env.VITE_DEV_MODE === 'true';


const mutex = new Mutex();

async function fetchImage(name, drive, getState) {
    const { token } = getState().auth;
    if(!name) return;
    const endpoint = [__API_URL__, 'images', drive, name ].join('/');

    return await fetch(endpoint,{
        'headers': {
            'Authorization': token
        }
    })  .then(res => res.blob())
        .then(blob => {
            if(blob.size) return URL.createObjectURL(blob)
            else return null
        })
        .then(url => ({ data: { id: name.split('.')[0], url, drive }}))
        .catch(err => ({ error: err }))
}

async function fetchImageWithReauth(name, drive, thunkApi) {
    await mutex.waitForUnlock();
    let result = await fetchImage(name, drive, thunkApi.getState);
    if(result.error) {
        if(__DEV_MODE__) {
            console.log('Error in image fetch.', result.error)
        }
        if(result.error.status === 403) {
            if (!mutex.isLocked()) {
                const release = await mutex.acquire();
                try {
                    const { reAuthSuccess } = await reAuth(thunkApi);
                    if(reAuthSuccess) {
                        result = await fetchImage(name, drive, thunkApi.getState)
                    }
                } finally {
                    release()
                }
            } else {
                await mutex.waitForUnlock();
                result = await fetchImage(name, drive, thunkApi.getState);
            }
        }
    }
    return result
}


export const getImage = createAsyncThunk(
    'images/fetchWishCover',
    async ({ id, ext, type }, thunkApi) => {
        return await fetchImageWithReauth(id + '.' + ext, type + 's', thunkApi)
    }
);

export const postImage = createAsyncThunk(
    'images/postImage',
    async ({ id, file, drive },{ getState }) => {
        if(!id || !file || !drive) return;
        
        const endpoint = [__API_URL__, 'images', drive, id].join('/');
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


const defaultState = {
    imageURLs: {},
    backupURLs: {},
    loading: {},
    queue: [],      // [...QueueItems]
    prior: [],      // { id: 'Kj1s9g', ext: 'jpg', type: 'avatar' }
}

const imageSlice = createSlice({
    name: 'images',
    initialState: defaultState,
    reducers: {
        resetImageStore(state) {
            state = defaultState
        },
        addImageURL(state,{ payload }) {
            const { id, url } = payload;
            if (!id) return;
            
            state.imageURLs[id] = url
        },
        deleteImageURL(state,{ payload: id }) {
            state.imageURLs[id] = null
        },
        promoteImages(state,{ payload }) { // imageId or [...imageIds]
            if(!payload || !payload?.length) return state
            
            const { queue, prior } = current(state);
            const queueIds = queue?.map(item => item?.id)
            const priorIds = prior?.map(item => item?.id)

            const newPrior = [];
            function pickPriors(id) {
                if(queueIds?.includes(id) && !priorIds?.includes(id)) {
                    newPrior?.push(queue?.find(item => item.id === id))
                }
            }
            if(payload instanceof Array && payload.length) {
                payload.forEach(pickPriors)
            } else if(payload) {
                pickPriors(payload)
            }
            const newPriorIds = newPrior?.map(item => item.id);
            state.prior = prior?.concat(newPrior);
            state.queue = queue?.filter(item => !newPriorIds?.includes(item.id))
        }
    },
    extraReducers: builder => {

        builder.addCase(getImage.pending, (state,{ meta:{ arg:{ id }}}) => {
            state.loading[id] = true;
            state.queue = current(state).queue.filter(item => item.id !== id);
            state.prior = current(state).prior.filter(item => item.id !== id);
        });
        builder.addCase(getImage.fulfilled, (state,{ payload:{ data:{ id, url }}}) => {
            if(!id || !url) return state;
            state.imageURLs[id] = url;
            delete state.loading[id];
        });
        builder.addCase(getImage.rejected, (state,{ meta:{ arg:{ id }}}) => {
            delete state.loading[id];
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
        });


        [ apiSlice.endpoints.getCurrentUser,
          apiSlice.endpoints.getFriends,
          apiSlice.endpoints.getUserWishes,
          apiSlice.endpoints.getFriendWishes ].forEach(endpoint => {

            builder.addMatcher(
                endpoint.matchFulfilled,
                (state,{ payload }) => {
                    if(payload instanceof Array && payload.length) {
                        const type = payload[0]?.title ? 'cover' : 'avatar'
                        payload.forEach(item => {
                            if(item?.imageExtension) {

                                state.queue.push({
                                    id: item.id,
                                    ext: item.imageExtension,
                                    type
                                })
                            }
                        })
                    } else if(payload && typeof payload === 'object') {
                        const type = payload.title ? 'cover' : 'avatar'
                        if(payload.imageExtension) {

                            state.queue.push({
                                id: payload.id,
                                ext: payload.imageExtension,
                                type
                            })
                        }
                    }
                }
            )
        })
    }
});

export const {
    resetImageStore,
    addImageURL,
    deleteImageURL,
    promoteImages,
} = imageSlice.actions;

export default imageSlice.reducer;
