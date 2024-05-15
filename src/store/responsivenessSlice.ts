import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'


interface ResponsivenessState {
    isNarrow: boolean
}


const initialState: ResponsivenessState = Object.freeze({
    isNarrow: false
})

const responsivenessSlice = createSlice({
    name: 'responsiveness',
    initialState,
    reducers: {
        setNarrow(state, action: PayloadAction<boolean>) {
            state.isNarrow = action.payload
        }
    }
})

export const { setNarrow } = responsivenessSlice.actions;

export default responsivenessSlice.reducer
