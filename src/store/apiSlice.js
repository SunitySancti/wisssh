import { createApi,
         fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Mutex } from 'async-mutex'

import { reAuth } from 'store/authSlice'

import { __API_URL__ } from 'environment'
const __DEV_MODE__ = import.meta.env.DEV


const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
    baseUrl: __API_URL__ + '/',
    prepareHeaders: (headers,{ getState }) => {
        const token = getState().auth?.token;
        if(token) {
            headers.set('Authorization', token)
        }
        return headers
    }
});
const baseQueryWithReauth = async (args, api, extraOptions) => {
    await mutex.waitForUnlock();
    let result = await baseQuery(args, api, extraOptions);

    if(result.error) {
        if(__DEV_MODE__) {
            console.log('Api error.', result.error)
        }
        if(result.error.status === 403) {
            if (!mutex.isLocked()) {
                const release = await mutex.acquire();
                try {
                    const { reAuthSuccess } = await reAuth(api);
                    if(reAuthSuccess) {
                        result = await baseQuery(args, api, extraOptions)
                    }
                } finally {
                    release()
                }
            } else {
                await mutex.waitForUnlock();
                result = await baseQuery(args, api, extraOptions)
            }
        }
    }
    return result
}


export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    refetchOnReconnect: true,
    // refetchOnMountOrArgChange: 10,
    tagTypes: ['Auth', 'User', 'Friends', 'UserWishes', 'FriendWishes', 'UserWishlists', 'Invites'],
    endpoints: builder => ({

        signup: builder.mutation({
            query: ({ name, email, password }) => ({
                url: 'auth/signup',
                method: 'POST',
                body: { name, email, password },
                validateStatus: (response, result) => {
                    return (response.status === 200 && result.token)
                }
            }),
            invalidatesTags: ['Auth']
        }),
        login: builder.mutation({
            query: ({ email, password, newPassword }) => ({
                url: 'auth/login',
                method: 'POST',
                body: { email, password, newPassword },
                validateStatus: (response, result) => {
                    return (response.status === 200 && result.token)
                }
            }),
            invalidatesTags: ['Auth', 'User', 'Friends', 'UserWishes', 'FriendWishes', 'UserWishlists', 'Invites']
        }),
        updateProfile: builder.mutation({
            query: ({ id: userId, name, email, newPassword }) => ({
                url: 'users/update-profile',
                method: 'POST',
                body: { userId, name, email, newPassword }
            }),
            async onQueryStarted( userUpdates,{ dispatch, getState, queryFulfilled }) {
                const updateUser = dispatch(
                    apiSlice.util.updateQueryData('getCurrentUser', null, (draftUser) => {
                        Object.assign(draftUser, userUpdates)
                    })
                )
                const currentUser = getState().api.queries['getCurrentUser(null)'].data;
                queryFulfilled.catch(updateUser.undo)
            }
        }),


        postWish: builder.mutation({
            query: (wish) => ({
                url: 'wishes/create-or-edit',
                method: 'POST',
                body: wish
            }),
            async onQueryStarted( wish,{ dispatch, getState, queryFulfilled }) {
                const currentWishes = getState().api.queries['getUserWishes(null)'].data || [];
                const processingWishIndex = currentWishes.map(item => item.id).indexOf(wish.id);
                const isCreating = processingWishIndex === -1;

                const updateWishes = dispatch(
                    apiSlice.util.updateQueryData('getUserWishes', null, (draftWishes) => {
                        if(isCreating) {
                            draftWishes.unshift(wish)
                        } else {
                            draftWishes.splice(processingWishIndex, 1, wish)
                        }
                    })
                );
                queryFulfilled.catch(updateWishes.undo)
            },
            invalidatesTags: ['UserWishlists', 'User']
        }),
        deleteWish: builder.mutation({
            query: (wishId) => ({
                url: `wishes/delete-wish/${ wishId }`,
                method: 'DELETE'
            }),
            async onQueryStarted( wishId,{ dispatch, getState, queryFulfilled }) {
                const currentWishes = getState().api.queries['getUserWishes(null)'].data || [];
                const processingWishIndex = currentWishes.map(item => item.id).indexOf(wishId);

                const updateWishes = dispatch(
                    apiSlice.util.updateQueryData('getUserWishes', null, (draftWishes) => {
                        if(processingWishIndex >= 0) {
                            draftWishes.splice(processingWishIndex, 1)
                        }
                    })
                );
                queryFulfilled.catch(updateWishes.undo)
            },
            invalidatesTags: ['UserWishlists', 'User']
        }),
        completeWish: builder.mutation({
            query: (wishId) => ({
                url: `wishes/complete-wish`,
                method: 'POST',
                body: { wishId }
            }),
            async onQueryStarted( wishId,{ dispatch, getState, queryFulfilled }) {
                const currentUserWishes = getState().api.queries['getUserWishes(null)'].data || [];
                const currentFriendWishes = getState().api.queries['getFriendWishes(null)'].data || [];
                const userWish = currentUserWishes.find(item => item.id === wishId);
                const friendWish = currentFriendWishes.find(item => item.id === wishId);
                if(!userWish && !friendWish) return

                const queryName = userWish ? 'getUserWishes' : 'getFriendWishes';
                const updateWishes = dispatch(
                    apiSlice.util.updateQueryData(queryName, null, (draftWishes) => {
                        draftWishes.find(wish => wish.id === wishId).isCompleted = true
                    })
                );
                queryFulfilled.catch(updateWishes.undo)
            }
        }),
        uncompleteWish: builder.mutation({
            query: (wishId) => ({
                url: `wishes/uncomplete-wish`,
                method: 'POST',
                body: { wishId }
            }),
            async onQueryStarted( wishId,{ dispatch, getState, queryFulfilled }) {
                const currentUserWishes = getState().api.queries['getUserWishes(null)'].data || [];
                const currentFriendWishes = getState().api.queries['getFriendWishes(null)'].data || [];
                const userWish = currentUserWishes.find(item => item.id === wishId);
                const friendWish = currentFriendWishes.find(item => item.id === wishId);
                if(!userWish && !friendWish) return

                const queryName = userWish ? 'getUserWishes' : 'getFriendWishes';
                const updateWishes = dispatch(
                    apiSlice.util.updateQueryData(queryName, null, (draftWishes) => {
                        draftWishes.find(wish => wish.id === wishId).isCompleted = false
                    })
                );
                queryFulfilled.catch(updateWishes.undo)
            }
        }),
        reserveWish: builder.mutation({
            query: (wishId) => ({
                url: `wishes/reserve-wish`,
                method: 'POST',
                body: { wishId }
            }),
            async onQueryStarted( wishId,{ dispatch, getState, queryFulfilled }) {
                const currentUser = getState().api.queries['getCurrentUser(null)'].data;
                const currentFriendWishes = getState().api.queries['getFriendWishes(null)'].data || [];
                const friendWish = currentFriendWishes.find(item => item.id === wishId);
                if(!currentUser || !friendWish) return

                const updateWishes = dispatch(
                    apiSlice.util.updateQueryData('getFriendWishes', null, (draftWishes) => {
                        draftWishes.find(wish => wish.id === wishId).reservedBy = currentUser.id
                    })
                );
                queryFulfilled.catch(updateWishes.undo)
            }
        }),
        unreserveWish: builder.mutation({
            query: (wishId) => ({
                url: `wishes/unreserve-wish`,
                method: 'POST',
                body: { wishId }
            }),
            async onQueryStarted( wishId,{ dispatch, getState, queryFulfilled }) {
                const currentFriendWishes = getState().api.queries['getFriendWishes(null)'].data || [];
                const friendWish = currentFriendWishes.find(item => item.id === wishId);
                if(!friendWish) return

                const updateWishes = dispatch(
                    apiSlice.util.updateQueryData('getFriendWishes', null, (draftWishes) => {
                        draftWishes.find(wish => wish.id === wishId).reservedBy = ''
                    })
                );
                queryFulfilled.catch(updateWishes.undo)
            }
        }),


        postWishlist: builder.mutation({
            query: (wishlist) => ({
                url: 'wishlists/create-or-edit',
                method: 'POST',
                body: wishlist
            }),
            async onQueryStarted( wishlist,{ dispatch, getState, queryFulfilled }) {
                const currentWishlists = getState().api.queries['getUserWishlists(null)'].data || [];
                const processingWishlistIndex = currentWishlists.map(item => item.id).indexOf(wishlist.id);
                const isCreating = processingWishlistIndex === -1;

                const updateWishlists = dispatch(
                    apiSlice.util.updateQueryData('getUserWishlists', null, (draftWishlists) => {
                        if(isCreating) {
                            draftWishlists.unshift(wishlist)
                        } else {
                            draftWishlists.splice(processingWishlistIndex, 1, wishlist)
                        }
                    })
                );
                queryFulfilled.catch(updateWishlists.undo)
            },
            invalidatesTags: ['UserWishes', 'User']
        }),
        deleteWishlist: builder.mutation({
            query: (wishlistId) => ({
                url: `wishlists/delete-wishlist/${ wishlistId }`,
                method: 'DELETE'
            }),
            async onQueryStarted( wishlistId,{ dispatch, getState, queryFulfilled }) {
                const currentWishlists = getState().api.queries['getUserWishlists(null)'].data || [];
                const processingWishlistIndex = currentWishlists.map(item => item.id).indexOf(wishlistId);

                const updateWishlists = dispatch(
                    apiSlice.util.updateQueryData('getUserWishlists', null, (draftWishlists) => {
                        if(processingWishlistIndex >= 0) {
                            draftWishlists.splice(processingWishlistIndex, 1)
                        }
                    })
                );
                queryFulfilled.catch(updateWishlists.undo)
            },
            invalidatesTags: ['UserWishes', 'User']
        }),
        acceptInvitation: builder.mutation({
            query: (invitationCode) => ({
                url: 'wishlists/accept-invitation',
                method: 'POST',
                body: { invitationCode }
            }),
            invalidatesTags: ['Invites', 'FriendWishes', 'Friends', 'User']
        }),
        deleteInvitation: builder.mutation({
            query: (inviteId) => ({
                url: `wishlists/delete-invitation/${ inviteId }`,
                method: 'DELETE'
            }),
            async onQueryStarted( inviteId,{ dispatch, getState, queryFulfilled }) {
                const currentInvites = getState().api.queries['getInvites(null)'].data || [];
                const processingInviteIndex = currentInvites.map(item => item.id).indexOf(inviteId);

                const updateInvites = dispatch(
                    apiSlice.util.updateQueryData('getInvites', null, (draftInvites) => {
                        if(processingInviteIndex >= 0) {
                            draftInvites.splice(processingInviteIndex, 1)
                        }
                    })
                );
                queryFulfilled.catch(updateInvites.undo)
            },
            invalidatesTags: ['FriendWishes', 'User']
        }),


        getAllUserNames: builder.query({
            query: () => 'auth/get-all-usernames',
            providesTags: ['Auth', 'User']
        }),
        getCurrentUser: builder.query({
            query: () => 'users/single/current',
            providesTags: ['Auth', 'User']
        }),
        getFriends: builder.query({
            query: () => 'users/get-friends',
            providesTags: ['Auth', 'Friends']
        }),


        getUserWishes: builder.query({
            query: () => 'wishes/get-user-wishes',
            transformResponse: res => res.sort((a, b) => {
                return b.createdAt - a.createdAt
            }),
            providesTags: ['Auth', 'UserWishes']
        }),
        getFriendWishes: builder.query({
            query: () => 'wishes/get-friend-wishes',
            transformResponse: res => res.sort((a, b) => {
                return b.createdAt - a.createdAt
            }),
            providesTags: ['Auth', 'FriendWishes']
        }),


        getUserWishlists: builder.query({
            query: () => 'wishlists/get-user-wishlists',
            providesTags: ['Auth', 'UserWishlists']
        }),
        getInvites: builder.query({
            query: () => 'wishlists/get-invites',
            providesTags: ['Auth', 'Invites']
        }),
    })
});

export const getUserNameByEmail = async (email) => {
    const username = await fetch(__API_URL__ + '/auth/get-username-by-email/' + email)
        .then(res => res.json())
    return username
}

export const {
    useSignupMutation,
    useLoginMutation,
    useUpdateProfileMutation,

    usePostWishMutation,
    useDeleteWishMutation,
    useCompleteWishMutation,
    useUncompleteWishMutation,
    useReserveWishMutation,
    useUnreserveWishMutation,

    usePostWishlistMutation,
    useDeleteWishlistMutation,
    useAcceptInvitationMutation,
    useDeleteInvitationMutation,

    useGetAllUserNamesQuery,
    useGetCurrentUserQuery,
    useGetFriendsQuery,
    
    useGetUserWishesQuery,
    useGetFriendWishesQuery,
    
    useGetUserWishlistsQuery,
    useLazyGetUserWishlistsQuery,
    useGetInvitesQuery,

    usePrefetch,
} = apiSlice
