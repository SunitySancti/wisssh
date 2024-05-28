import { useEffect } from 'react'
import { useLocation,
         useParams } from 'react-router-dom'
import { useDeepCompareMemo } from 'use-deep-compare'

import { useGetCurrentUserQuery,
         useGetAllUserNamesQuery,
         useGetFriendsQuery,
         useGetUserWishesQuery,
         useGetFriendWishesQuery,
         useGetUserWishlistsQuery,
         useGetInvitesQuery } from 'store/apiSlice'

import type { UserId,
              WishId,
              WishlistId,
              InvitationCode } from 'typings';

// It needs to do additional render optimizing if you want to set polling to every single endpoint
const pollingInterval = undefined;

// USERS //

const getCurrentUser = () => {
    const { data:               user,
            isLoading:          awaitingUser,
            isSuccess:          userHasLoaded,
            refetch:            refreshUser,
            isFetching:         fetchingUser,
            fulfilledTimeStamp: userTimeStamp } = useGetCurrentUserQuery(undefined,{ pollingInterval });

    const memoizedUser = useDeepCompareMemo(() => (
        user
    ),[ user ]);
            
    return { user: memoizedUser, awaitingUser, userHasLoaded, refreshUser, fetchingUser, userTimeStamp }
}

const getFriends = () => {
    const { data:               friends,
            error:              friendsError,
            isLoading:          awaitingFriends,
            isSuccess:          friendsHaveLoaded,
            isError:            loadingFriendsWasCrashed,
            refetch:            refreshFriends,
            isFetching:         fetchingFriends,
            fulfilledTimeStamp: friendsTimeStamp } = useGetFriendsQuery(undefined,{ pollingInterval });

    const memoizedFriends = useDeepCompareMemo(() => (
        friends || []
    ),[ friends ]);

    return { friends: memoizedFriends,
             friendsError, awaitingFriends, friendsHaveLoaded, loadingFriendsWasCrashed, refreshFriends, fetchingFriends, friendsTimeStamp }
}

const getAllRelevantUsers = () => {
    const { user } = getCurrentUser();
    const { friends } = getFriends();

    return useDeepCompareMemo(() => (
        user ? friends.concat(user) : friends
    ),[ user, friends ]);
}

const getUserById = (id?: UserId) => {
    return getAllRelevantUsers().find(user => user.id === id)
}

const getUsersByIdList = (ids?: UserId[]) => {
    const allUsers = getAllRelevantUsers();
    return useDeepCompareMemo(() => (
        allUsers.filter(user => ids?.includes(user.id))
    ),[ allUsers, ids ]);
}

const getAllUserNames = () => {
    const { data:               allUserNames,
            error:              allUserNamesError,
            isLoading:          awaitingAllUserNames,
            isSuccess:          allUserNamesHaveLoaded,
            isError:            loadingAllUserNamesWasCrashed,
            refetch:            refreshAllUserNames,
            isFetching:         fetchingAllUserNames,
            fulfilledTimeStamp: allUserNamesTimeStamp } = useGetAllUserNamesQuery(undefined,{ pollingInterval });
            
    return { allUserNames: allUserNames || [],
             allUserNamesError, awaitingAllUserNames, allUserNamesHaveLoaded, loadingAllUserNamesWasCrashed, refreshAllUserNames, fetchingAllUserNames, allUserNamesTimeStamp }
}


// WISHLISTS //

const getUserWishlists = () => {
    const { data:               userWishlists,
            error:              userWishlistsError,
            isLoading:          awaitingUserWishlists,
            isSuccess:          userWishlistsHaveLoaded,
            isError:            loadingUserWishlistsWasCrashed,
            refetch:            refreshUserWishlists,
            isFetching:         fetchingUserWishlists,
            fulfilledTimeStamp: userWishlistsTimeStamp } = useGetUserWishlistsQuery(undefined,{ pollingInterval });

    const memoizedWishlists = useDeepCompareMemo(() => (
        userWishlists || []
    ),[ userWishlists ]);

    return { userWishlists: memoizedWishlists,
             userWishlistsError, awaitingUserWishlists, userWishlistsHaveLoaded, loadingUserWishlistsWasCrashed, refreshUserWishlists, fetchingUserWishlists, userWishlistsTimeStamp }
}

const getInvites = () => {
    const { data:               invites,
            error:              invitesError,
            isLoading:          awaitingInvites,
            isSuccess:          invitesHaveLoaded,
            isError:            loadingInvitesWasCrashed,
            refetch:            refreshInvites,
            isFetching:         fetchingInvites,
            fulfilledTimeStamp: invitesTimeStamp } = useGetInvitesQuery(undefined,{ pollingInterval });

    const memoizedInvites = useDeepCompareMemo(() => (
        invites || []
    ),[ invites ]);

    return { invites: memoizedInvites,
             invitesError, awaitingInvites, invitesHaveLoaded, loadingInvitesWasCrashed, refreshInvites, fetchingInvites, invitesTimeStamp }
}

const getAllRelevantWishlists = () => {
    const { userWishlists } = getUserWishlists();
    const { invites } = getInvites();

    return useDeepCompareMemo(() => (
        userWishlists.concat(invites) || []
    ),[ userWishlists, invites ]);
}

const getWishlistById = (id?: WishlistId) => {
    return getAllRelevantWishlists().find(wishlist => wishlist.id === id)
}

const getWishlistsByIdList = (ids?: WishlistId[]) => {
    const allWishlists = getAllRelevantWishlists();

    return useDeepCompareMemo(() => (
        allWishlists.filter(wishlist => ids?.includes(wishlist.id))
    ),[ allWishlists, ids ]);
}

const useInvitesPolling = (ms?: number) => {
    // POLLING WISHES OF FRIENDS TO CATCH STATUS CHANGING //
    const { refreshInvites } = getInvites();
    useEffect(() => {
        const intervalId = setInterval(() => {
            refreshInvites();
        }, ms || 3000);
        return () => clearInterval(intervalId);
    },[]);
}


// WISHES //

const getUserWishes = () => {
    const { data:               userWishes,
            error:              userWishesError,
            isLoading:          awaitingUserWishes,
            isSuccess:          userWishesHaveLoaded,
            isError:            loadingUserWishesWasCrashed,
            refetch:            refreshUserWishes,
            isFetching:         fetchingUserWishes,
            fulfilledTimeStamp: userWishesTimeStamp } = useGetUserWishesQuery(undefined,{ pollingInterval });

    const memoizedWishes = useDeepCompareMemo(() => (
        userWishes || []
    ),[ userWishes ]);

    return { userWishes: memoizedWishes,
             userWishesError, awaitingUserWishes, userWishesHaveLoaded, loadingUserWishesWasCrashed, refreshUserWishes, fetchingUserWishes, userWishesTimeStamp }
}

const getFriendWishes = () => {
    const { data:               friendWishes,
            error:              friendWishesError,
            isLoading:          awaitingFriendWishes,
            isSuccess:          friendWishesHaveLoaded,
            isError:            loadingFriendWishesWasCrashed,
            refetch:            refreshFriendWishes,
            isFetching:         fetchingFriendWishes,
            fulfilledTimeStamp: friendWishesTimeStamp } = useGetFriendWishesQuery(undefined,{ pollingInterval });

    const memoizedWishes = useDeepCompareMemo(() => (
        friendWishes || []
    ),[ friendWishes ]);

    return { friendWishes: memoizedWishes,
             friendWishesError, awaitingFriendWishes, friendWishesHaveLoaded, loadingFriendWishesWasCrashed, refreshFriendWishes, fetchingFriendWishes, friendWishesTimeStamp }
}

const getAllRelevantWishes = () => {
    const { userWishes } = getUserWishes();
    const { friendWishes } = getFriendWishes();

    return useDeepCompareMemo(() => (
        userWishes.concat(friendWishes) || []
    ),[ userWishes, friendWishes ])
}

const getWishById = (id?: WishId) => {
    return getAllRelevantWishes().find(wish => wish.id === id)
}

const getWishesByIdList = (ids?: WishId[]) => {
    const allWishes = getAllRelevantWishes();
    return useDeepCompareMemo(() => (
        allWishes.filter(wish => ids?.includes(wish.id))
    ),[ allWishes, ids ]);
}

const getActualWishes = () => {
    const { userWishes } = getUserWishes();
    const actualWishes =  useDeepCompareMemo(() => (
        userWishes.filter(wish => !wish.isCompleted)
    ),[ userWishes ]);
    return ({ actualWishes })
}

const getWishesByWishlistId = (id?: WishlistId) => {
    const wishlist = getWishlistById(id);
    return getWishesByIdList(wishlist?.wishes)
}

const useFriendWishesPolling = (ms?: number) => {
    // POLLING WISHES OF FRIENDS TO CATCH STATUS CHANGING //
    const { refreshFriendWishes } = getFriendWishes();
    useEffect(() => {
        const intervalId = setInterval(() => {
            refreshFriendWishes();
        }, ms || 3000);
        return () => clearInterval(intervalId);
    },[]);
}


// LOADING STATUS

const getLoadingStatus = () => {
    const { isLoading: awaitingUser } = useGetCurrentUserQuery();
    const { isLoading: awaitingFriends } = useGetFriendsQuery();
    const { isLoading: awaitingUserWishes } = useGetUserWishesQuery();
    const { isLoading: awaitingFriendWishes } = useGetFriendWishesQuery();
    const { isLoading: awaitingUserWishlists } = useGetUserWishlistsQuery();
    const { isLoading: awaitingInvites } = useGetInvitesQuery();
    return {
        awaitingUser,
        awaitingFriends,

        awaitingUserWishes,
        awaitingFriendWishes,
        awaitingWishes: awaitingUserWishes || awaitingFriendWishes,

        awaitingUserWishlists,
        awaitingInvites,
        awaitingWishlists: awaitingUserWishlists || awaitingInvites
    }
}


// GET LOCATION INFO

export type Section = 'my-wishes' | 'my-invites' | 'profile' | 'share' | 'login'
type Mode = 'items' | 'lists'
type Tab = 'actual' | 'reserved' | 'completed' | 'all'

function checkSection(section: string | undefined) {
    switch(section) {
        case 'my-wishes':
        case 'my-invites':
        case 'profile':
        case 'share':
        case 'login':
            return section as Section
        default:
            return undefined
    }
}

function checkTabName(tabName: string | undefined) {
    switch(tabName) {
        case 'actual':
        case 'reserved':
        case 'completed':
        case 'all':
            return tabName as Tab
        default:
            return undefined
    }
}

function checkId<IdType> (id: string | undefined, length: number = 6) {
    if(typeof id === 'string') {
        return id.length === length
            ? id as IdType
            : undefined
    } else {
        return undefined
    }
}

const getLocationConfig = () => {
    const { pathname: location,
            state } = useLocation()
    const params = useParams();
    const steps = location.split('/');

    const isWishesSection = steps[1] === 'my-wishes';
    const isInvitesSection = steps[1] === 'my-invites';
    const isProfileSection = steps[1] === 'profile';
    const isItemsMode = steps[2] === 'items';
    const isListsMode = steps[2] === 'lists';
    
    const section = checkSection(steps[1]);
    const mode: Mode | undefined = (steps[2] === 'items' || steps[2] === 'lists') ? steps[2] : undefined;
    const tab = checkTabName(params.tabName);
    const wishId = checkId<WishId>(params.wishId);
    const wishlistId = checkId<WishlistId>(params.wishlistId);
    const invitationCode = checkId<InvitationCode>(params.invitationCode, 11);
    const encodedEmail = params.encodedEmail;

    const isNewWish = isWishesSection && isItemsMode && steps[3] === 'new';
    const isEditWish = isWishesSection && !!wishId && steps[5] === 'editing';
    const isNewWishlist = isWishesSection && isListsMode && steps[3] === 'new';
    const isEditWishlist = isWishesSection && isListsMode && !!wishlistId && steps[4] === 'editing';

    const isWrongLocation = !section
                         || (isWishesSection || isInvitesSection) && !mode
                         || isItemsMode && !(tab || isNewWish)
                         || isWishesSection && isListsMode && !(wishlistId || isNewWishlist)

    return {
        location: location[-1] === '/' ? location.slice(0,-1) : location,
        redirectedFrom: state?.redirectedFrom as string || undefined,
        redirectTo: state?.redirectTo as string || undefined,
        section,
        mode,
        tab,
        wishId,
        wishlistId,
        invitationCode,
        encodedEmail,
        isWishesSection,
        isInvitesSection,
        isProfileSection,
        isItemsMode,
        isListsMode,
        isNewWish,
        isEditWish,
        isNewWishlist,
        isEditWishlist,
        isWrongLocation
    }
}


export {
    getCurrentUser,
    getFriends,
    getUserById,
    getUsersByIdList,
    getAllUserNames,

    getUserWishes,
    getFriendWishes,
    getWishById,
    getWishesByIdList,
    getActualWishes,
    getWishesByWishlistId,
    useFriendWishesPolling,

    getUserWishlists,
    getInvites,
    getWishlistById,
    getWishlistsByIdList,
    useInvitesPolling,

    getLoadingStatus,
    getLocationConfig
}
