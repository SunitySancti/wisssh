import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api/',
        prepareHeaders: (headers,{ getState }) => {
            const token = getState().auth.token;
            if(token) {
                headers.set('Authorization', token)
            }
            headers.set('Access-Control-Request-Headers', 'Authorization,Content-Type')
            return headers
        }
    }),
    tagTypes: ['User', 'Wish', 'Wishlist', 'Id'],

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
            invalidatesTags: ['User']
        }),
        signup: builder.mutation({
            query: ({ name, email, password }) => ({
                url: 'auth/signup',
                method: 'POST',
                body: { name, email, password },
            }),
            invalidatesTags: ['User']
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
        updateProfile: builder.mutation({
            query: (profileData) => ({
                url: 'users/update-profile',
                method: 'POST',
                body: profileData
            }),
            invalidatesTags: ['User']
        }),


        getUsers: builder.query({
            query: () => 'users/all',
            providesTags: ['User']
        }),
        getSomeUsers: builder.query({
            query: (idList) => `users/query/${idList?.join('+')}`,
            providesTags: ['User']
        }),
        getSingleUser: builder.query({
            query: (id) => `users/${id}`,
            providesTags: ['User']
        }),


        getWishes: builder.query({
            query: () => 'wishes/all',
            providesTags: ['Wish']
        }),
        getSomeWishes: builder.query({
            query: (idList) => `wishes/query/${idList?.join('+')}`,
            providesTags: ['Wish']
        }),
        getSingleWish: builder.query({
            query: (id) => `wishes/${id}`,
            providesTags: ['Wish']
        }),


        getWishlists: builder.query({
            query: () => 'wishlists/all',
            providesTags: ['Wishlist']
        }),
        getSomeWishlists: builder.query({
            query: (idList) => `wishlists/query/${idList?.join('+')}`,
            providesTags: ['Wishlist']
        }),
        getSingleWishlist: builder.query({
            query: (id) => `wishlists/${id}`,
            providesTags: ['Wishlist']
        }),


        getIdList: builder.query({
            query: () => 'ids/all',
            providesTags: ['Id']
        }),
    })
});

export const checkPassword = async ({ id, password }) => {
    return await fetch('api/auth/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password })
    })
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

    useGetUsersQuery,
    useGetSomeUsersQuery,
    useGetSingleUserQuery,
    
    useGetWishesQuery,
    useGetSomeWishesQuery,
    useGetSingleWishQuery,
    
    useGetWishlistsQuery,
    useGetSomeWishlistsQuery,
    useGetSingleWishlistQuery,

    useGetIdListQuery,
} = apiSlice
