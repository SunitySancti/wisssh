import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'


interface ResponsivenessState {
    isNarrow: boolean;
    isMobile: boolean;
    sidePadding: number;
}

// RESPONSIVENESS CONFIG //

const minPadding = 44;
const maxPadding = 110
const upperPaddingsBreakPoint = 850;
const lowerPaddingsBreakPoint = upperPaddingsBreakPoint - (maxPadding - minPadding) * 2;
const narrowBreakPoint = 600;

const askMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const initialState: ResponsivenessState = Object.freeze({
    isNarrow: false,
    isMobile: true,
    sidePadding: maxPadding,
})

const responsivenessSlice = createSlice({
    name: 'responsiveness',
    initialState,
    reducers: {
        setNarrow(state, action: PayloadAction<boolean>) {
            state.isNarrow = action.payload
        },
        responseWidth(state, action: PayloadAction<number>) {
            const width = action.payload;
            
            if(width > narrowBreakPoint) {
                state.isNarrow = false
            } else {
                state.isNarrow = true
            }

            if(width > upperPaddingsBreakPoint) {
                state.sidePadding = maxPadding;
            } else if(width < lowerPaddingsBreakPoint) {
                state.sidePadding = minPadding;
            } else {
                state.sidePadding = minPadding + (width - lowerPaddingsBreakPoint) / 2
            }

            if(askMobile() || width < narrowBreakPoint) {
                state.isMobile = true
            } else {
                state.isMobile = false
            }
        }
    }
})

export const {
    setNarrow,
    responseWidth
} = responsivenessSlice.actions;

export default responsivenessSlice.reducer
