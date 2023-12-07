import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'


interface HistoryState {
    myWishesSection: {
        itemsModeLast: string,
        listsModeLast: string,
        last: string,
    },
    myInvitesSection: {
        itemsModeLast: string,
        listsModeLast: string,
        last: string,
    },
    anySectionLast: string
}

const initialState: HistoryState = Object.freeze({
    myWishesSection: {
        itemsModeLast: '/my-wishes/items',
        listsModeLast: '/my-wishes/lists',
        last: '/my-wishes/items',
    },
    myInvitesSection: {
        itemsModeLast: '/my-invites/items',
        listsModeLast: '/my-invites/lists',
        last: '/my-invites/items',
    },
    anySectionLast: '/my-wishes/items',
})

const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {
        clearHistory(state) {
            Object.assign(state, initialState)
        },
        updateHistory(state, action: PayloadAction<string>) {
            const { payload } = action 
            const [, section, mode, tab] = payload.split('/');
            
            if(mode !== 'items' && mode !== 'lists' || tab === 'new') {
                return state
            };

            switch (section) {
                case 'my-wishes':
                    state.anySectionLast = payload;
                    state.myWishesSection.last = payload;
                    state.myWishesSection[`${mode}ModeLast`] = payload;
                    break;
                            
                case 'my-invites':
                    state.anySectionLast = payload;
                    state.myInvitesSection.last = payload;
                    state.myInvitesSection[`${mode}ModeLast`] = payload;
                    break;

                default: return state;
            }
        }
    },
});

export const {
    clearHistory,
    updateHistory,
} = historySlice.actions;

export default historySlice.reducer;