import { useGetCurrentUserQuery,
         useGetAllUserNamesQuery,
         useGetFriendsQuery,
         useGetUserWishesQuery,
         useGetFriendWishesQuery,
         useGetUserWishlistsQuery,
         useGetInvitesQuery } from 'store/apiSlice'


// USERS //

const getCurrentUser = () => {
    const { data:       user,
            isLoading:  awaitingUser,
            isSuccess:  userHasLoaded } = useGetCurrentUserQuery(null);
            
    return { user, awaitingUser, userHasLoaded }
}

const getFriends = () => {
    const { data:       friends,
            error:      friendsError,
            isLoading:  awaitingFriends,
            isSuccess:  friendsHaveLoaded,
            isError:    loadingFriendsWasCrashed,
            refetch:    refreshFriends } = useGetFriendsQuery(null);

    return { friends, friendsError, awaitingFriends, friendsHaveLoaded, loadingFriendsWasCrashed, refreshFriends }
}

const getAllRelevantUsers = () => {
    const { user } = getCurrentUser();
    const { friends } = getFriends();
    return [user].concat(friends) || []
}

const getUserById = (id) => {
    return getAllRelevantUsers()?.find(user => user?.id === id) || {}
}

const getUsersByIdList = (ids) => {
    return getAllRelevantUsers()?.filter(user => ids?.includes(user?.id)) || []
}

const getAllUserNames = () => {
    const { data:       allUserNames,
            error:      allUserNamesError,
            isLoading:  awaitingAllUserNames,
            isSuccess:  allUserNamesHaveLoaded,
            isError:    loadingAllUserNamesWasCrashed,
            refetch:    refreshAllUserNames } = useGetAllUserNamesQuery(null);

    return { allUserNames, allUserNamesError, awaitingAllUserNames, allUserNamesHaveLoaded, loadingAllUserNamesWasCrashed, refreshAllUserNames }
}


// WISHLISTS //

const getUserWishlists = () => {
    const { data:       userWishlists,
            error:      userWishlistsError,
            isLoading:  awaitingUserWishlists,
            isSuccess:  userWishlistsHaveLoaded,
            isError:    loadingUserWishlistsWasCrashed,
            refetch:    refreshUserWishlists } = useGetUserWishlistsQuery(null);

    return { userWishlists, userWishlistsError, awaitingUserWishlists, userWishlistsHaveLoaded, loadingUserWishlistsWasCrashed, refreshUserWishlists }
}

const getInvites = () => {
    const { data:       invites,
            error:      invitesError,
            isLoading:  awaitingInvites,
            isSuccess:  invitesHaveLoaded,
            isError:    loadingInvitesWasCrashed,
            refetch:    refreshInvites } = useGetInvitesQuery(null);

    return { invites, invitesError, awaitingInvites, invitesHaveLoaded, loadingInvitesWasCrashed, refreshInvites }
}

const getAllRelevantWishlists = () => {
    const { userWishlists } = getUserWishlists();
    const { invites } = getInvites();
    return userWishlists?.concat(invites) || []
}

const getWishlistById = (id) => {
    return getAllRelevantWishlists()?.find(wishlist => wishlist?.id === id) || {}
}

const getWishlistsByIdList = (ids) => {
    return getAllRelevantWishlists()?.filter(wishlist => ids?.includes(wishlist?.id)) || []
}


// WISHES //

const getUserWishes = () => {
    const { data:       userWishes,
            error:      userWishesError,
            isLoading:  awaitingUserWishes,
            isSuccess:  userWishesHaveLoaded,
            isError:    loadingUserWishesWasCrashed,
            refetch:    refreshUserWishes } = useGetUserWishesQuery(null);

    return { userWishes, userWishesError, awaitingUserWishes, userWishesHaveLoaded, loadingUserWishesWasCrashed, refreshUserWishes }
}

const getFriendWishes = () => {
    const { data:       friendWishes,
            error:      friendWishesError,
            isLoading:  awaitingFriendWishes,
            isSuccess:  friendWishesHaveLoaded,
            isError:    loadingFriendWishesWasCrashed,
            refetch:    refreshFriendWishes } = useGetFriendWishesQuery(null);

    return { friendWishes, friendWishesError, awaitingFriendWishes, friendWishesHaveLoaded, loadingFriendWishesWasCrashed, refreshFriendWishes }
}

const getAllRelevantWishes = () => {
    const { userWishes } = getUserWishes();
    const { friendWishes } = getFriendWishes();
    return userWishes?.concat(friendWishes) || []
}

const getWishById = (id) => {
    return getAllRelevantWishes()?.find(wish => wish?.id === id) || {}
}

const getWishesByIdList = (ids) => {
    return getAllRelevantWishes()?.filter(wish => ids?.includes(wish?.id)) || []
}

const getActualWishes = () => {
    const { userWishes } = getUserWishes();
    return userWishes?.filter(wish => !wish?.isCompleted) || []
}

const getWishesByWishlistId = (wishlistId) => {
    const wishlist = getWishlistById(wishlistId);
    if(!wishlist) return []
    return getWishesByIdList(wishlist?.wishes)
}


// LOADING STATUS

const getLoadingStatus = () => {
    const { awaitingUser } = getCurrentUser();
    const { awaitingFriends } = getFriends();
    const { awaitingUserWishes } = getUserWishes();
    const { awaitingFriendWishes } = getFriendWishes();
    const { awaitingUserWishlists } = getUserWishlists();
    const { awaitingInvites } = getInvites();
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

    getUserWishlists,
    getInvites,
    getWishlistById,
    getWishlistsByIdList,

    getLoadingStatus
}
