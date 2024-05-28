import { createApi,
         fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Mutex } from 'async-mutex'

import { reAuth } from 'store/authSlice'

import { __API_URL__ } from 'environment'
const __DEV_MODE__ = import.meta.env.DEV

import type { RootState,
              AppDispatch } from 'store'
import type { BaseQueryFn,
              FetchArgs,
              FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { User,
              Wish,
              Wishlist,
              InvitationCode, 
              WishlistId,
              WishId,
              UserId } from 'typings'


interface SignupOrLoginData {
    token: string;
    refreshToken: string
}

interface SignupArgs {
    name: string;
    email: string;
    password: string
}

interface LoginArgs {
    email: string;
    password?: string;
    newPassword?: string
}

interface UpdateProfileData {
    message: string;
    updates: {
        name: string;
        email: string;
        password?: string
    }
}

interface UpdateProfileArgs {
    id: UserId;
    name: string;
    email: string;
    newPassword?: string;
    imageExtension?: 'jpg' | 'png' | null
}

interface SwitchWishCompletenessData {
    ofCurrentUser: boolean
}

interface AcceptInvitationData {
    inviteId: WishlistId;
    valid: boolean
}


const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
    baseUrl: __API_URL__ + '/',
    prepareHeaders: (headers,{ getState }) => {
        const token = (getState() as RootState).auth.token;
        if(token) {
            headers.set('Authorization', token)
        }
        return headers
    }
});
const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, thunkApi, extraOptions) => {
    await mutex.waitForUnlock();
    let result = await baseQuery(args, thunkApi, extraOptions);

    if(result.error) {
        if(__DEV_MODE__) {
            console.log('Api error.', result.error)
        }
        if(result.error.status === 403) {
            if (!mutex.isLocked()) {
                const release = await mutex.acquire();
                try {
                    const reAuthSuccess = await reAuth(thunkApi.getState as () => RootState, thunkApi.dispatch as AppDispatch);
                    if(reAuthSuccess) { 
                        result = await baseQuery(args, thunkApi, extraOptions)
                    }
                } finally {
                    release()
                }
            } else {
                await mutex.waitForUnlock();
                result = await baseQuery(args, thunkApi, extraOptions)
            }
        }
    }
    return result
}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    refetchOnReconnect: true,
    // refetchOnMountOrArgChange: 3,   // in seconds, like polling but only at render moment
    tagTypes: ['Auth', 'User', 'Friends', 'UserWishes', 'FriendWishes', 'UserWishlists', 'Invites'],
    endpoints: builder => ({

        signup: builder.mutation<SignupOrLoginData, SignupArgs>({
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
        login: builder.mutation<SignupOrLoginData, LoginArgs>({
            query: ({ email, password, newPassword }) => ({
                url: 'auth/login',
                method: 'POST',
                body: { email, password, newPassword },
                validateStatus: (response, result) => {
                    return (response.status === 200 && result.token)
                }
            }),
            invalidatesTags: ['Auth']
        }),
        updateProfile: builder.mutation<UpdateProfileData, UpdateProfileArgs>({
            query: ({ id, name, email, newPassword }) => ({
                url: 'users/update-profile',
                method: 'POST',
                body: { userId: id, name, email, newPassword }
            }),
            async onQueryStarted( userUpdates,{ dispatch, queryFulfilled }) {
                const updateUser = dispatch(
                    apiSlice.util.updateQueryData('getCurrentUser', undefined, (draftUser) => {
                        const { id, name, email, imageExtension } = userUpdates;
                        userUpdates = { id, name, email };
                        if(imageExtension !== undefined) {
                            userUpdates.imageExtension = imageExtension
                        }
                        Object.assign(draftUser, userUpdates)
                    })
                );
                queryFulfilled.catch(updateUser.undo)
            }
        }),


        postWish: builder.mutation<Wish, Wish>({
            query: (wish) => ({
                url: 'wishes/create-or-edit',
                method: 'POST',
                body: wish
            }),
            async onQueryStarted( newWish,{ dispatch, getState, queryFulfilled }) {
                const currentWishes = getState().api.queries['getUserWishes(undefined)']?.data as (Wish[] | undefined) || [];
                const existedWish = currentWishes.find(wish => wish.id === newWish.id);

                const updateWishes = dispatch(
                    apiSlice.util.updateQueryData('getUserWishes', undefined, (draftWishes) => {
                        const existedDraft = draftWishes.find(draft => draft.id === newWish.id);
                        if(existedDraft) {
                            Object.assign(existedDraft, newWish)
                        } else {
                            draftWishes.unshift(newWish)
                        }
                    })
                );
                const updateUser = dispatch(
                    apiSlice.util.updateQueryData('getCurrentUser', undefined, (draftUser) => {
                        draftUser.wishes.push(newWish.id)
                    })
                );
                const undoFunctions = [ updateWishes.undo, updateUser.undo ];
                const addedWishlistIds = newWish.inWishlists.filter(listId => !existedWish?.inWishlists.includes(listId)) || [];
                const removedWishlistIds = existedWish?.inWishlists.filter(listId => !newWish.inWishlists.includes(listId)) || [];

                addedWishlistIds.forEach(listId => {
                    const updateWishlist = dispatch(
                        apiSlice.util.updateQueryData('getUserWishlists', undefined, (draftWishlists) => {
                            const wishlist = draftWishlists.find(list => list.id === listId);
                            if(wishlist && !wishlist.wishes.includes(newWish.id)) {

                                wishlist.wishes.push(newWish.id);
                            }
                        })
                    );
                    undoFunctions.push(updateWishlist.undo)
                })

                removedWishlistIds.forEach(listId => {
                    const updateWishlist = dispatch(
                        apiSlice.util.updateQueryData('getUserWishlists', undefined, (draftWishlists) => {
                            const wishlist = draftWishlists.find(list => list.id === listId);
                            if(wishlist && wishlist.wishes.includes(existedWish!.id)) {
                                const wishIndex = wishlist.wishes.indexOf(existedWish!.id);

                                wishlist.wishes.splice(wishIndex, 1);
                            }
                        })
                    )
                    undoFunctions.push(updateWishlist.undo)
                })
                
                queryFulfilled.catch(() => { undoFunctions.forEach(undo => undo()) })
            }
        }),
        deleteWish: builder.mutation<WishId, WishId>({
            query: (wishId) => ({
                url: `wishes/delete-wish/${ wishId }`,
                method: 'DELETE'
            }),
            async onQueryStarted( wishId,{ dispatch, getState, queryFulfilled }) {
                const currentWishes = getState().api.queries['getUserWishes(undefined)']?.data as (Wish[] | undefined) || [];
                const processingWishIndex = currentWishes.map(item => item.id).indexOf(wishId);

                const updateWishes = dispatch(
                    apiSlice.util.updateQueryData('getUserWishes', undefined, (draftWishes) => {
                        if(processingWishIndex >= 0) {
                            draftWishes.splice(processingWishIndex, 1)
                        }
                    })
                );
                const updateUser = dispatch(
                    apiSlice.util.updateQueryData('getCurrentUser', undefined, (draftUser) => {
                        const wishIndex = draftUser.wishes.indexOf(wishId);
                        if(wishIndex >= 0) {
                            draftUser.wishes.splice(wishIndex, 1);
                        }
                    })
                );
                const undoFunctions = [ updateWishes.undo, updateUser.undo ];

                if(processingWishIndex >= 0) {
                    currentWishes[processingWishIndex].inWishlists.forEach((wishlistId) => {
                        const updateWishlist = dispatch(
                            apiSlice.util.updateQueryData('getUserWishlists', undefined, (draftWishlists) => {
                                const wishlist = draftWishlists.find(wishlist => wishlist.id === wishlistId);
                                if(wishlist) {
                                    const wishIndex = wishlist.wishes.indexOf(wishId);
                                    if(wishIndex >= 0) {
                                        wishlist.wishes.splice(wishIndex, 1);
                                    }
                                }
                            })
                        );
                        undoFunctions.push(updateWishlist.undo)
                    });
                }

                queryFulfilled.catch(() => { undoFunctions.forEach(undo => undo()) })
            }
        }),
        completeWish: builder.mutation<SwitchWishCompletenessData, WishId>({
            query: (wishId) => ({
                url: `wishes/complete-wish`,
                method: 'POST',
                body: { wishId }
            }),
            async onQueryStarted( wishId,{ dispatch, getState, queryFulfilled }) {
                const currentUserWishes = getState().api.queries['getUserWishes(undefined)']?.data as (Wish[] | undefined) || [];
                const currentFriendWishes = getState().api.queries['getFriendWishes(undefined)']?.data as (Wish[] | undefined) || [];
                const userWish = currentUserWishes.find(item => item.id === wishId);
                const friendWish = currentFriendWishes.find(item => item.id === wishId);
                if(!userWish && !friendWish) return

                const queryName = userWish ? 'getUserWishes' : 'getFriendWishes';
                const updateWishes = dispatch(
                    apiSlice.util.updateQueryData(queryName, undefined, (draftWishes) => {
                        const wish = draftWishes.find(wish => wish.id === wishId);
                        if(wish) {
                            wish.isCompleted = true;
                            wish.completedAt = Date.now()
                        }
                    })
                );
                queryFulfilled.catch(updateWishes.undo)
            }
        }),
        uncompleteWish: builder.mutation<SwitchWishCompletenessData, WishId>({
            query: (wishId) => ({
                url: `wishes/uncomplete-wish`,
                method: 'POST',
                body: { wishId }
            }),
            async onQueryStarted( wishId,{ dispatch, getState, queryFulfilled }) {
                const currentUserWishes = getState().api.queries['getUserWishes(undefined)']?.data as (Wish[] | undefined) || [];
                const currentFriendWishes = getState().api.queries['getFriendWishes(undefined)']?.data as (Wish[] | undefined) || [];
                const userWish = currentUserWishes.find(item => item.id === wishId);
                const friendWish = currentFriendWishes.find(item => item.id === wishId);
                if(!userWish && !friendWish) return

                const queryName = userWish ? 'getUserWishes' : 'getFriendWishes';
                const updateWishes = dispatch(
                    apiSlice.util.updateQueryData(queryName, undefined, (draftWishes) => {
                        const wish = draftWishes.find(wish => wish.id === wishId);
                        if(wish) {
                            wish.isCompleted = false;
                            wish.completedAt = null
                        }
                    })
                );
                queryFulfilled.catch(updateWishes.undo)
            }
        }),
        reserveWish: builder.mutation<void, WishId>({
            query: (wishId) => ({
                url: `wishes/reserve-wish`,
                method: 'POST',
                body: { wishId }
            }),
            async onQueryStarted( wishId,{ dispatch, getState, queryFulfilled }) {
                const currentUser = getState().api.queries['getCurrentUser(undefined)']?.data as (User | undefined);

                const updateWishes = dispatch(
                    apiSlice.util.updateQueryData('getFriendWishes', undefined, (draftWishes) => {
                        const wish = draftWishes.find(wish => wish.id === wishId);
                        if(wish && currentUser) wish.reservedBy = currentUser.id
                    })
                );
                queryFulfilled.catch(updateWishes.undo)
            }
        }),
        unreserveWish: builder.mutation<void, WishId>({
            query: (wishId) => ({
                url: `wishes/unreserve-wish`,
                method: 'POST',
                body: { wishId }
            }),
            async onQueryStarted( wishId,{ dispatch, queryFulfilled }) {
                const updateWishes = dispatch(
                    apiSlice.util.updateQueryData('getFriendWishes', undefined, (draftWishes) => {
                        const wish = draftWishes.find(wish => wish.id === wishId);
                        if(wish) wish.reservedBy = null
                    })
                );
                queryFulfilled.catch(updateWishes.undo)
            }
        }),


        postWishlist: builder.mutation<Wishlist, Wishlist>({
            query: (wishlist) => ({
                url: 'wishlists/create-or-edit',
                method: 'POST',
                body: wishlist
            }),
            async onQueryStarted( newWishlist,{ dispatch, getState, queryFulfilled }) {
                const currentWishlists = getState().api.queries['getUserWishlists(undefined)']?.data as (Wishlist[] | undefined) || [];
                const existedWishlist = currentWishlists.find(list => list.id === newWishlist.id);

                const updateWishlists = dispatch(
                    apiSlice.util.updateQueryData('getUserWishlists', undefined, (draftWishlists) => {
                        const existedDraft = draftWishlists.find(list => list.id === newWishlist.id);
                        if(existedDraft) {
                            Object.assign(existedDraft, newWishlist)
                        } else {
                            draftWishlists.unshift(newWishlist)
                        }
                    })
                );
                const updateUser = dispatch(
                    apiSlice.util.updateQueryData('getCurrentUser', undefined, (draftUser) => {
                        draftUser.wishlists.push(newWishlist.id)
                    })
                );
                const undoFunctions = [ updateWishlists.undo, updateUser.undo ];
                const addedWishesIds = newWishlist.wishes.filter(wishId => !existedWishlist?.wishes.includes(wishId)) || [];
                const removedWishesIds = existedWishlist?.wishes.filter(wishId => !newWishlist.wishes.includes(wishId)) || [];

                addedWishesIds.forEach(wishId => {
                    const updateWishlist = dispatch(
                        apiSlice.util.updateQueryData('getUserWishes', undefined, (draftWishes) => {
                            const existedDraft = draftWishes.find(wish => wish.id === wishId);
                            if(existedDraft && !existedDraft.inWishlists.includes(newWishlist.id)) {

                                existedDraft.inWishlists.push(newWishlist.id);
                            }
                        })
                    );
                    undoFunctions.push(updateWishlist.undo)
                });

                removedWishesIds.forEach(wishId => {
                    const updateWishlist = dispatch(
                        apiSlice.util.updateQueryData('getUserWishes', undefined, (draftWishes) => {
                            const existedDraft = draftWishes.find(wish => wish.id === wishId);
                            if(existedDraft && existedDraft.inWishlists.includes(existedWishlist!.id)) {
                                const wishIndex = existedDraft.inWishlists.indexOf(existedWishlist!.id);

                                existedDraft.inWishlists.splice(wishIndex, 1);
                            }
                        })
                    )
                    undoFunctions.push(updateWishlist.undo)
                });
                
                queryFulfilled.catch(() => { undoFunctions.forEach(undo => undo()) })
            }
        }),
        deleteWishlist: builder.mutation<WishlistId, WishlistId>({
            query: (wishlistId) => ({
                url: `wishlists/delete-wishlist/${ wishlistId }`,
                method: 'DELETE'
            }),
            async onQueryStarted( wishlistId,{ dispatch, getState, queryFulfilled }) {
                const currentWishlists = getState().api.queries['getUserWishlists(undefined)']?.data as (Wishlist[] | undefined) || [];
                const processingWishlistIndex = currentWishlists.map(item => item.id).indexOf(wishlistId);

                const updateWishlists = dispatch(
                    apiSlice.util.updateQueryData('getUserWishlists', undefined, (draftWishlists) => {
                        if(processingWishlistIndex >= 0) {
                            draftWishlists.splice(processingWishlistIndex, 1)
                        }
                    })
                );
                const updateUser = dispatch(
                    apiSlice.util.updateQueryData('getCurrentUser', undefined, (draftUser) => {
                        const wishlistIndex = draftUser.wishlists.indexOf(wishlistId);
                        if(wishlistIndex >= 0) {
                            draftUser.wishlists.splice(wishlistIndex, 1);
                        }
                    })
                );
                const undoFunctions = [ updateWishlists.undo, updateUser.undo ];

                if(processingWishlistIndex >= 0) {
                    currentWishlists[processingWishlistIndex].wishes.forEach((wishId) => {
                        const updateWish = dispatch(
                            apiSlice.util.updateQueryData('getUserWishes', undefined, (draftWishes) => {
                                const wish = draftWishes.find(wish => wish.id === wishId);
                                if(wish) {
                                    const wishlistIndex = wish.inWishlists.indexOf(wishlistId);
                                    if(wishlistIndex >= 0) {
                                        wish.inWishlists.splice(wishlistIndex, 1);
                                    }
                                }
                            })
                        );
                        undoFunctions.push(updateWish.undo)
                    });
                }

                queryFulfilled.catch(() => { undoFunctions.forEach(undo => undo()) })
            }
        }),
        acceptInvitation: builder.mutation<AcceptInvitationData, InvitationCode>({
            query: (invitationCode) => ({
                url: 'wishlists/accept-invitation',
                method: 'POST',
                body: { invitationCode }
            }),
            invalidatesTags: ['Invites', 'FriendWishes', 'Friends', 'User']
        }),
        deleteInvitation: builder.mutation<WishlistId, WishlistId>({
            query: (inviteId) => ({
                url: `wishlists/delete-invitation/${ inviteId }`,
                method: 'DELETE'
            }),
            async onQueryStarted( inviteId,{ dispatch, getState, queryFulfilled }) {
                const currentInvites = getState().api.queries['getInvites(undefined)']?.data as (Wishlist[] | undefined) || [];
                const processingInviteIndex = currentInvites.map(item => item.id).indexOf(inviteId);

                const updateInvites = dispatch(
                    apiSlice.util.updateQueryData('getInvites', undefined, (draftInvites) => {
                        if(processingInviteIndex >= 0) {
                            draftInvites.splice(processingInviteIndex, 1)
                        }
                    })
                );

                const updateUser = dispatch(
                    apiSlice.util.updateQueryData('getCurrentUser', undefined, (draftUser) => {
                        const wishlistIndex = draftUser.invites.indexOf(inviteId);
                        if(wishlistIndex >= 0) {
                            draftUser.invites.splice(wishlistIndex, 1);
                        }
                    })
                );
                const undoFunctions = [ updateInvites.undo, updateUser.undo ];

                if(processingInviteIndex >= 0) {
                    currentInvites[processingInviteIndex].wishes.forEach((wishId) => {
                        const updateWishes = dispatch(
                            apiSlice.util.updateQueryData('getFriendWishes', undefined, (draftWishes) => {
                                const processingWish = draftWishes.find(wish => wish.id === wishId);
                                if(processingWish) {
                                    const wishIndex = draftWishes.indexOf(processingWish);
                                    if(wishIndex >= 0) {
                                        draftWishes.splice(wishIndex, 1)
                                    }
                                }
                            })
                        );
                        undoFunctions.push(updateWishes.undo)
                    });
                }

                queryFulfilled.catch(() => { undoFunctions.forEach(undo => undo()) })
                // data of "getFriends" endpoint does not update. It is difficult and senselessly 
            }
        }),


        getAllUserNames: builder.query<string[], void>({
            query: () => 'auth/get-all-usernames',
            providesTags: ['Auth', 'User']
        }),
        getCurrentUser: builder.query<User, void>({
            query: () => 'users/single/current',
            providesTags: ['Auth', 'User']
        }),
        getFriends: builder.query<User[], void>({
            query: () => 'users/get-friends',
            providesTags: ['Auth', 'Friends']
        }),


        getUserWishes: builder.query<Wish[], void>({
            query: () => 'wishes/get-user-wishes',
            transformResponse: (res: Wish[]) => res
                // sort by stars...
                .sort((a, b) => (b.stars - a.stars)),
                // ... or by date of creation
                // .sort((a, b) => (b.createdAt || Date.now()) - (a.createdAt || Date.now())),
            providesTags: ['Auth', 'UserWishes']
        }),
        getFriendWishes: builder.query<Wish[], void>({
            query: () => 'wishes/get-friend-wishes',
            transformResponse: (res: Wish[]) => res.sort((a, b) => {
                return (b.createdAt || Date.now()) - (a.createdAt || Date.now())
            }),
            providesTags: ['Auth', 'FriendWishes']
        }),


        getUserWishlists: builder.query<Wishlist[], void>({
            query: () => 'wishlists/get-user-wishlists',
            providesTags: ['Auth', 'UserWishlists']
        }),
        getInvites: builder.query<Wishlist[], void>({
            query: () => 'wishlists/get-invites',
            providesTags: ['Auth', 'Invites']
        }),
    })
});

export const getUserNameByEmail: (email: string) => Promise<string | undefined> = async (email) => {
    const username = await fetch(__API_URL__ + '/auth/get-username-by-email/' + email)
        .then(res => res.json())
    return typeof username === 'string' ? username : undefined
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

    useGetAllUserNamesQuery,        // must never be cached
    useGetCurrentUserQuery,         // may be changed without user action
                                    // (another user delete wishlist current user invited in/ delete wish reserved by user)
    useGetFriendsQuery,             // may be changed without user action
                                    // (another user delete wishlist current user invited in so list of friends become less)
    
    useGetUserWishesQuery,          // "reservedBy" prop only may be changed by another user, doesn't matter
                                    // "isCompleted" prop may be changed by date (really may?)
    useGetFriendWishesQuery,        // may be changed without user action
                                    // (add wishes in/ remove wishes from wishlist, update wish)
    
    useGetUserWishlistsQuery,       // may be changed only by user
    useGetInvitesQuery,             // may be changed by another user
                                    // (delete wishlist user invited in or wish reserved by user)

    usePrefetch,
} = apiSlice
