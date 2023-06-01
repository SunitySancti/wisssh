import { createApi,
         fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Mutex } from 'async-mutex'

import { reAuth } from 'store/authSlice';

const apiUrl = import.meta.env.VITE_API_URL;


const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
    baseUrl: apiUrl + '/',
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
        console.log('Async error.', result.error);

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
    tagTypes: ['Auth', 'User', 'Wish', 'Wishlist', 'Id'],

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
            invalidatesTags: ['Auth', 'User']
        }),
        refreshToken: builder.mutation({
            query: ({ refreshToken }) => ({
                url: 'auth/token/refresh',
                method: 'POST',
                body: { refreshToken }
            })
        }),


        postWish: builder.mutation({
            query: (wish) => ({
                url: 'wishes/create-or-edit',
                method: 'POST',
                body: wish
            }),
            invalidatesTags: ['Wish', 'Wishist', 'User', 'Id']
        }),
        postWishlist: builder.mutation({
            query: (wishlist) => ({
                url: 'wishlists/create-or-edit',
                method: 'POST',
                body: wishlist
            }),
            invalidatesTags: ['Wish', 'Wishist', 'User', 'Id']
        }),
        updateProfile: builder.mutation({
            query: (profileData) => ({
                url: 'users/update-profile',
                method: 'POST',
                body: profileData
            }),
            invalidatesTags: ['User']
        }),
        deleteWish: builder.mutation({
            query: (id) => ({
                url: `wishes/${ id }`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Wish', 'Wishist', 'User', 'Id']
        }),
        deleteWishlist: builder.mutation({
            query: (id) => ({
                url: `wishlists/${ id }`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Wish', 'Wishist', 'User', 'Id']
        }),


        getCurrentUser: builder.query({
            query: () => 'users/single/current',
            providesTags: ['Auth', 'User']
        }),
        getAllUserNames: builder.query({
            query: () => 'auth/get-all-usernames',
            providesTags: ['User']
        }),
        getUsers: builder.query({
            query: (idList) => `users/query/${idList?.join('+')}`,
            providesTags: ['Auth', 'User']
        }),
        getWishes: builder.query({
            query: (idList) => `wishes/query/${idList?.join('+')}`,
            providesTags: ['Auth', 'Wish']
        }),
        getWishlists: builder.query({
            query: (idList) => `wishlists/query/${idList?.join('+')}`,
            providesTags: ['Auth', 'Wishlist']
        }),


        // getSingleUser: builder.query({
        //     query: (id) => `users/single/${id}`,
        //     providesTags: ['Auth', 'User']
        // }),
        // getSingleWish: builder.query({
        //     query: (id) => `wishes/single/${id}`,
        //     providesTags: ['Auth', 'Wish']
        // }),
        // getSingleWishlist: builder.query({
        //     query: (id) => `wishlists/single/${id}`,
        //     providesTags: ['Auth', 'Wishlist']
        // }),
        // getAllWishes: builder.query({
        //     query: () => 'wishes/all',
        //     providesTags: ['Auth', 'Wish']
        // }),
        // getAllWishlists: builder.query({
        //     query: () => 'wishlists/all',
        //     providesTags: ['Auth', 'Wishlist']
        // }),
        // getIdList: builder.query({
        //     query: () => 'ids/all',
        //     providesTags: ['Id']
        // }),
    })
});

export const getUserNameByEmail = async (email) => {
    return await fetch(apiUrl + '/auth/get-username-by-email/' + email)
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

    useGetCurrentUserQuery,
    useGetAllUserNamesQuery,
    useGetUsersQuery,
    useGetWishesQuery,
    useGetWishlistsQuery,
    
    // useGetSingleUserQuery,
    // useGetSingleWishQuery,
    // useGetAllWishesQuery,
    // useGetSingleWishlistQuery,
    // useGetAllWishlistsQuery,
    // useGetIdListQuery,
} = apiSlice
