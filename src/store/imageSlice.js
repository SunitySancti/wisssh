import { createSlice,
         createAsyncThunk } from '@reduxjs/toolkit'

import { json,
         checkStatus } from 'utils'


async function fetchImage(id, drive) {
    if(!id) return;

    const url = await fetch(`/api/images/${drive}/${id}`)
        .then(checkStatus)
        .then(res => res.blob())
        .then(blob => {
            if(blob.size) return URL.createObjectURL(blob)
            else return null
        })
        .catch(err => console.error(err))
    
    return ({ id, url })
}

export const fetchUserAvatar = createAsyncThunk(
    'images/fetchUserAvatar',
    async id => fetchImage(id, 'avatars')
);

export const fetchWishCover = createAsyncThunk(
    'images/fetchWishCover',
    async id => fetchImage(id, 'covers')
);

export const postImage = createAsyncThunk(
    'images/postImage',
    async ({ id, file, drive }) => {
        if(!id || !file || !drive) return;

        const formData = new FormData();
        formData.append('file', file)

        return await fetch(`https://wissshapi-1-u7107658.deta.app/api/images/${drive}/${id}`,{
            'method': 'POST',
            'body': formData
        })
            .then(checkStatus)
            .then(json)
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
        builder.addCase(fetchUserAvatar.fulfilled, (state,{ payload }) => {
            if(!payload) return state;
            const { id, url } = payload;
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
        builder.addCase(fetchWishCover.fulfilled, (state,{ payload }) => {
            if(!payload) return state;
            const { id, url } = payload;
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