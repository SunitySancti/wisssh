import { useLocation,
         useParams } from 'react-router-dom'
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


// USERS //

const getCurrentUser = () => {
    const { data:               user,
            isLoading:          awaitingUser,
            isSuccess:          userHasLoaded,
            refetch:            refreshUser,
            isFetching:         fetchingUser,
            fulfilledTimeStamp: userTimeStamp } = useGetCurrentUserQuery();
            
    return { user, awaitingUser, userHasLoaded, refreshUser, fetchingUser, userTimeStamp }
}

const getFriends = () => {
    const { data:               friends,
            error:              friendsError,
            isLoading:          awaitingFriends,
            isSuccess:          friendsHaveLoaded,
            isError:            loadingFriendsWasCrashed,
            refetch:            refreshFriends,
            isFetching:         fetchingFriends,
            fulfilledTimeStamp: friendsTimeStamp } = useGetFriendsQuery();

    return { friends: friends || [],
             friendsError, awaitingFriends, friendsHaveLoaded, loadingFriendsWasCrashed, refreshFriends, fetchingFriends, friendsTimeStamp }
}

const getAllRelevantUsers = () => {
    const { user } = getCurrentUser();
    const { friends } = getFriends();
    return user ? friends.concat(user) : friends
}

const getUserById = (id?: UserId) => {
    return getAllRelevantUsers().find(user => user.id === id)
}

const getUsersByIdList = (ids?: UserId[]) => {
    return getAllRelevantUsers().filter(user => ids?.includes(user.id))
}

const getAllUserNames = () => {
    const { data:               allUserNames,
            error:              allUserNamesError,
            isLoading:          awaitingAllUserNames,
            isSuccess:          allUserNamesHaveLoaded,
            isError:            loadingAllUserNamesWasCrashed,
            refetch:            refreshAllUserNames,
            isFetching:         fetchingAllUserNames,
            fulfilledTimeStamp: allUserNamesTimeStamp } = useGetAllUserNamesQuery();

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
            fulfilledTimeStamp: userWishlistsTimeStamp } = useGetUserWishlistsQuery();

    return { userWishlists: userWishlists || [],
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
            fulfilledTimeStamp: invitesTimeStamp } = useGetInvitesQuery();

    return { invites: invites || [],
             invitesError, awaitingInvites, invitesHaveLoaded, loadingInvitesWasCrashed, refreshInvites, fetchingInvites, invitesTimeStamp }
}

const getAllRelevantWishlists = () => {
    const { userWishlists } = getUserWishlists();
    const { invites } = getInvites();
    return userWishlists.concat(invites)
}

const getWishlistById = (id?: WishlistId) => {
    return getAllRelevantWishlists().find(wishlist => wishlist.id === id)
}

const getWishlistsByIdList = (ids?: WishlistId[]) => {
    return getAllRelevantWishlists().filter(wishlist => ids?.includes(wishlist.id))
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
            fulfilledTimeStamp: userWishesTimeStamp } = useGetUserWishesQuery();

    return { userWishes: userWishes || [],
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
            fulfilledTimeStamp: friendWishesTimeStamp } = useGetFriendWishesQuery();

    return { friendWishes: friendWishes || [],
             friendWishesError, awaitingFriendWishes, friendWishesHaveLoaded, loadingFriendWishesWasCrashed, refreshFriendWishes, fetchingFriendWishes, friendWishesTimeStamp }
}

const getAllRelevantWishes = () => {
    const { userWishes } = getUserWishes();
    const { friendWishes } = getFriendWishes();
    return userWishes.concat(friendWishes)
}

const getWishById = (id?: WishId) => {
    return getAllRelevantWishes().find(wish => wish.id === id)
}

const getWishesByIdList = (ids?: WishId[]) => {
    return getAllRelevantWishes().filter(wish => ids?.includes(wish.id))
}

const getActualWishes = () => {
    const actualWishes = getUserWishes().userWishes.filter(wish => !wish.isCompleted);
    return ({ actualWishes })
}

const getWishesByWishlistId = (id?: WishlistId) => {
    const wishlist = getWishlistById(id);
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

    getUserWishlists,
    getInvites,
    getWishlistById,
    getWishlistsByIdList,

    getLoadingStatus,
    getLocationConfig
}
