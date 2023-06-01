import { mergeArrays } from 'utils'
import { useGetCurrentUserQuery,
         useGetAllUserNamesQuery,
         useGetUsersQuery,
         useGetWishesQuery,
         useGetWishlistsQuery  } from 'store/apiSlice'


const getCurrentUser = () => {
    const { data:       user,
            isSuccess:  userHasLoaded } = useGetCurrentUserQuery();
            
    return { user, userHasLoaded }
}


const getUserWishlists = () => {
    const { user, userHasLoaded } = getCurrentUser();

    const { data:       userWishlists,
            error:      userWishlistsError,
            isLoading:  awaitingUserWishlists,
            isSuccess:  userWishlistsHaveLoaded,
            isError:    loadingUserWishlistsWasCrashed,
            refetch:    refreshUserWishlists } = useGetWishlistsQuery(
                user?.wishlists,
                { skip: !userHasLoaded || !user.wishlists?.length }
    );

    return { userWishlists, userWishlistsError, awaitingUserWishlists, userWishlistsHaveLoaded, loadingUserWishlistsWasCrashed, refreshUserWishlists }
}

const getInvites = () => {
    const { user, userHasLoaded } = getCurrentUser();
    
    const { data:       invites,
            error:      invitesError,
            isLoading:  awaitingInvites,
            isSuccess:  invitesHaveLoaded,
            isError:    loadingInvitesWasCrashed,
            refetch:    refreshInvites } = useGetWishlistsQuery(
                user?.invites,
                { skip: !userHasLoaded || !user.invites?.length }
    );

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


const getUserWishes = () => {
    const { user, userHasLoaded } = getCurrentUser();

    const { data:       userWishes,
            error:      userWishesError,
            isLoading:  awaitingUserWishes,
            isSuccess:  userWishesHaveLoaded,
            isError:    loadingUserWishesWasCrashed,
            refetch:    refreshUserWishes } = useGetWishesQuery(
                user?.wishes,
                { skip: !userHasLoaded }
    );

    return { userWishes, userWishesError, awaitingUserWishes, userWishesHaveLoaded, loadingUserWishesWasCrashed, refreshUserWishes }
}

const getFriendsWishes = () => {
    const { invites, invitesHaveLoaded } = getInvites();

    const { data:       friendsWishes,
            error:      friendsWishesError,
            isLoading:  awaitingFriendsWishes,
            isSuccess:  friendsWishesHaveLoaded,
            isError:    loadingFriendsWishesWasCrashed,
            refetch:    refreshFriendsWishes } = useGetWishesQuery(
                mergeArrays(invites?.map(list => list?.wishes)),
                { skip: !invitesHaveLoaded }
    );

    return { friendsWishes, friendsWishesError, awaitingFriendsWishes, friendsWishesHaveLoaded, loadingFriendsWishesWasCrashed, refreshFriendsWishes }
}

const getAllRelevantWishes = () => {
    const { userWishes } = getUserWishes();
    const { friendsWishes } = getFriendsWishes();
    return userWishes?.concat(friendsWishes) || []
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
    return getAllRelevantWishes()?.filter(wish => wish?.inWishlists?.includes(wishlistId))
}


const getFriends = () => {
    const { invites, invitesHaveLoaded } = getInvites();

    const { data:       friends,
            error:      friendsError,
            isLoading:  awaitingFriends,
            isSuccess:  friendsHaveLoaded,
            isError:    loadingFriendsWasCrashed,
            refetch:    refreshFriends } = useGetUsersQuery(
                invites?.map(list => list?.author),
                { skip: !invitesHaveLoaded }
    );

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
            refetch:    refreshAllUserNames } = useGetAllUserNamesQuery();

    return { allUserNames, allUserNamesError, awaitingAllUserNames, allUserNamesHaveLoaded, loadingAllUserNamesWasCrashed, refreshAllUserNames }
}

export {
    getCurrentUser,
    getFriends,
    getUserById,
    getUsersByIdList,
    getAllUserNames,

    getUserWishlists,
    getInvites,
    getWishlistById,
    getWishlistsByIdList,

    getUserWishes,
    getFriendsWishes,
    getWishById,
    getWishesByIdList,
    getActualWishes,
    getWishesByWishlistId,
}
