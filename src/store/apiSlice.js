import { createApi,
         fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Mutex } from 'async-mutex'

import { reAuth } from 'store/authSlice';

const __API_URL__ = import.meta.env.VITE_API_URL;
const __DEV_MODE__ = import.meta.env.VITE_DEV_MODE === 'true';


const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
    baseUrl: __API_URL__ + '/',
    prepareHeaders: (headers,{ getState }) => {
        const token = getState().auth?.token;
        if(token) {
            headers.set('Authorization', token)
        }
        headers.set('Access-Control-Request-Headers', 'Authorization,Content-Type');
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
    tagTypes: ['Auth', 'User', 'Friends', 'Wishes', 'FriendWishes', 'Wishlists', 'Invites'],
    endpoints: builder => ({

        login: builder.mutation({
            query: (credentials) => ({
                url: 'auth/login',
                method: 'POST',
                body: credentials,
                validateStatus: (response, result) => {
                    return (response.status === 200 && result.token)
                }
            }),
            invalidatesTags: ['Auth']
        }),
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


        updateProfile: builder.mutation({
            query: (profileData) => ({
                url: 'users/update-profile',
                method: 'POST',
                body: profileData
            }),
            invalidatesTags: ['User']
        }),
        postWish: builder.mutation({
            query: (wish) => ({
                url: 'wishes/create-or-edit',
                method: 'POST',
                body: wish
            }),
            invalidatesTags: ['Wishes', 'Wishists', 'User']
        }),
        deleteWish: builder.mutation({
            query: (id) => ({
                url: `wishes/${ id }`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Wishes', 'Wishists', 'User']
        }),


        postWishlist: builder.mutation({
            query: (wishlist) => ({
                url: 'wishlists/create-or-edit',
                method: 'POST',
                body: wishlist
            }),
            invalidatesTags: ['Wishes', 'Wishists', 'User']
        }),
        deleteWishlist: builder.mutation({
            query: (id) => ({
                url: `wishlists/${ id }`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Wishes', 'Wishists', 'User']
        }),
        acceptInvitation: builder.mutation({
            query: (invitationCode) => ({
                url: 'wishlists/accept-invitation',
                method: 'POST',
                body: { invitationCode }
            }),
            // invalidatesTags: (result, error, arg) => 
            //     result
            //         ? ['Invites', 'User', { type: 'Friends', id: result.authorId }]
            //         : ['Invites', 'User', 'Friends']
            invalidatesTags: ['Invites', 'Friends', 'User']
        }),


        getAllUserNames: builder.query({
            query: () => 'auth/get-all-usernames',
            providesTags: ['User']
        }),
        getCurrentUser: builder.query({
            query: () => 'users/single/current',
            providesTags: ['Auth', 'User']
        }),
        getFriends: builder.query({
            query: () => 'users/get-friends',
            // providesTags: (result, error, arg) =>
            //     result
            //         ? [...result.map(({ id }) => ({ type: 'Friends', id })), 'Auth']
            //         : ['Friends', 'Auth'],
            providesTags: ['Auth', 'Friends']
        }),


        getUserWishes: builder.query({
            query: () => 'wishes/get-user-wishes',
            providesTags: ['Auth', 'Wishes']
        }),
        getFriendWishes: builder.query({
            query: () => 'wishes/get-friend-wishes',
            providesTags: ['Auth', 'FriendWishes']
        }),


        getUserWishlists: builder.query({
            query: () => 'wishlists/get-user-wishlists',
            providesTags: ['Auth', 'Wishlists']
        }),
        getInvites: builder.query({
            query: () => 'wishlists/get-invites',
            providesTags: ['Auth', 'Invites']
        }),


        // getUsers: builder.query({
        //     query: (idList) => `users/query/${idList?.join('+')}`,
        //     providesTags: ['Auth', 'User']
        // }),
        // getWishes: builder.query({
        //     query: (idList) => `wishes/query/${idList?.join('+')}`,
        //     providesTags: ['Auth', 'Wish']
        // }),
        // getWishlists: builder.query({
        //     query: (idList) => `wishlists/query/${idList?.join('+')}`,
        //     providesTags: ['Auth', 'Wishlist']
        // }),
    })
});

export const getUserNameByEmail = async (email) => {
    return await fetch(__API_URL__ + '/auth/get-username-by-email/' + email)
        .then(res => res.json())
}

export const {
    useLoginMutation,
    useSignupMutation,

    usePostWishMutation,
    usePostWishlistMutation,
    useDeleteWishMutation,

    useDeleteWishlistMutation,
    useUpdateProfileMutation,
    useAcceptInvitationMutation,

    useGetAllUserNamesQuery,
    useGetCurrentUserQuery,
    useGetFriendsQuery,
    // useLazyGetFriendsQuery,

    useGetUserWishesQuery,
    useGetFriendWishesQuery,
    // useLazyGetUserWishesQuery,
    // useLazyGetFriendWishesQuery,

    useGetUserWishlistsQuery,
    useGetInvitesQuery,
    // useLazyGetUserWishlistsQuery,
    // useLazyGetInvitesQuery,

    usePrefetch,

    // useGetUsersQuery,
    // useGetWishesQuery,
    // useGetWishlistsQuery,
} = apiSlice
