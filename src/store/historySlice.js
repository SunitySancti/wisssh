import { createSlice } from '@reduxjs/toolkit'


const myWishesSectionInitial = {
    itemsModeLast: '/my-wishes/items',
    listsModeLast: '/my-wishes/lists',
    last: '/my-wishes/items',
}
const myInvitesSectionInitial = {
    itemsModeLast: '/my-invites/items',
    listsModeLast: '/my-invites/lists',
    last: '/my-invites/items',
}

const historySlice = createSlice({
    name: 'history',
    initialState: {
        myWishesSection: myWishesSectionInitial,
        myInvitesSection: myInvitesSectionInitial,
        anySectionLast: '/my-wishes/items',
    },
    reducers: {
        clearHistory(state) {
            state.myWishesSection = myWishesSectionInitial;
            state.myInvitesSection = myInvitesSectionInitial;
            state.anySectionLast = '/my-wishes/items';
        },
        updateHistory(state,{ payload }) {
            const [, section, mode, tab] = payload.split('/');
            
            if(!mode || tab === 'new') return state;

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