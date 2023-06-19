import { createSlice,
         current } from '@reduxjs/toolkit'


const processingSlice = createSlice({
    name: 'processing',
    initialState: {
        wishes: {},
        wishlists: {}
    },
    reducers: {
        addProcessingWish(state,{ payload: wishId }) {
            state.wishes[wishId] = true
        },
        removeProcessingWish(state,{ payload: wishId }) {
            // delete state.wishes[wishId]
            state.wishes[wishId] = false
        },
        addProcessingWishlist(state,{ payload: wishlistId }) {
            state.wishlists[wishlistId] = true
        },
        removeProcessingWishlist(state,{ payload: wishlistId }) {
            // delete state.wishlists[wishlistId]
            state.wishlists[wishlistId] = false
        }
    },
});

export const {
    addProcessingWish,
    removeProcessingWish,
    addProcessingWishlist,
    removeProcessingWishlist
} = processingSlice.actions;

export default processingSlice.reducer;
