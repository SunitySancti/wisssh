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

import type { ImageId,
              UserId,
              WishId,
              WishlistId,
              InvitationCode } from 'typings';
import { useAppSelector } from 'store';

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
            fulfilledTimeStamp: invitesTimeStamp } = useGetInvitesQuery(undefined,{ pollingInterval: 3000 });

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
            fulfilledTimeStamp: friendWishesTimeStamp } = useGetFriendWishesQuery(undefined,{ pollingInterval: 3000 });

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

const getActualWishIds = () => {
    const { actualWishes } = getActualWishes();
    const ids = actualWishes.map(wish => wish.id);
        
    const actualWishIds =  useDeepCompareMemo(() => ids,[ ids ]);
    return actualWishIds
}

const getWishesByWishlistId = (id?: WishlistId) => {
    const wishlist = getWishlistById(id);
    return getWishesByIdList(wishlist?.wishes)
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

    const isListOfLists = location === 'my-invites/lists';
    
    const section = checkSection(steps[1]);
    const mode: Mode | undefined = (steps[2] === 'items' || steps[2] === 'lists') ? steps[2] : undefined;
    const tab = checkTabName(params.tabName);
    const wishId = checkId<WishId>(params.wishId);
    const wishlistId = checkId<WishlistId>(params.wishlistId);
    const invitationCode = checkId<InvitationCode>(params.invitationCode, 11);
    const encodedEmail = params.encodedEmail;
    const incomePassword = params.incomePassword;

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
        redirectedFrom: state as string || undefined,
        section,
        mode,
        tab,
        wishId,
        wishlistId,
        invitationCode,
        encodedEmail,
        incomePassword,
        isWishesSection,
        isInvitesSection,
        isProfileSection,
        isItemsMode,
        isListsMode,
        isListOfLists,
        isNewWish,
        isEditWish,
        isNewWishlist,
        isEditWishlist,
        isWrongLocation
    }
}


// PRIMARY IMAGES //

function getPrimaryImageIds() {
    const { isWishesSection,
            isInvitesSection,
            isItemsMode,
            tab,
            wishlistId,
            wishId,
            isNewWishlist,
            isEditWishlist,
            isListOfLists } = getLocationConfig();
    
    const { user,
            userHasLoaded } = getCurrentUser();
    const { friends,
            friendsHaveLoaded } = getFriends();
    const { userWishes,
            userWishesHaveLoaded } = getUserWishes();
    const { friendWishes,
            friendWishesHaveLoaded } = getFriendWishes();
    const { actualWishes } = getActualWishes();
    const currentWish = getWishById(wishId);
    const currentWishlist = getWishlistById(wishlistId);
    const wishAuthor = getUserById(currentWish?.author);
    const wishlistAuthor = getUserById(currentWishlist?.author);
    const wishlistWishes = getWishesByWishlistId(wishlistId);

    const { imageURLs,
            backupURLs,
            loading } = useAppSelector(state => state.images);

    const assimilatedIds = [
        ...Object.keys(imageURLs),
        ...Object.keys(backupURLs),
        ...Object.keys(loading),
    ]

    let imageIds: ImageId[] = [];

    if(user && user.withImage) {
        imageIds.push(user.id)
    }

    if(wishId) {
        if(currentWish?.withImage) {
            imageIds.push(currentWish.id)

            if(isInvitesSection && wishAuthor?.withImage) {
                imageIds.push(wishAuthor.id)
            }
        }

    } else if(wishlistId) {
        if(wishlistWishes) {
            imageIds.push(...wishlistWishes
                .filter(wish => wish.withImage)
                .map(wish => wish.id)
            )

            if(isInvitesSection && wishlistAuthor?.withImage) {
                imageIds.push(wishlistAuthor.id)
            }

            if(isEditWishlist || isNewWishlist) {
                // actual wishes for card select
                imageIds.push(...actualWishes
                    .filter(wish => wish.withImage)
                    .map(wish => wish.id))
            }
        }

    } else if(isItemsMode && tab) {
        const allWishes = isWishesSection 
            ? userWishes.filter(wish => wish.withImage)
                        : isInvitesSection
            ? friendWishes.filter(wish => wish.withImage)
                        : [];
        switch (tab) {
            case 'actual':
                imageIds.push(...allWishes
                    .filter(wish => !wish.isCompleted)
                    .map(wish => wish.id)
                )
            break
            case 'reserved':
                imageIds.push(...allWishes
                    .filter(wish => !wish.isCompleted && wish.reservedBy === user?.id)
                    .map(wish => wish.id)
                )
            break
            case 'completed':
                imageIds.push(...allWishes
                    .filter(wish => wish.isCompleted)
                    .map(wish => wish.id)
                )
            break
            case 'all':
                imageIds.push(...allWishes
                    .map(wish => wish.id)
                )
        }
    } else if(isListOfLists) {
        imageIds.push(...friends
            .filter(user => user.withImage)
            .map(user => user.id)
        )
    }

    const isReady = userHasLoaded && (
          isWishesSection   ? userWishesHaveLoaded
        : isInvitesSection  ? friendWishesHaveLoaded && friendsHaveLoaded
                            : true
    );

    imageIds = imageIds.filter(id => !assimilatedIds.includes(id));

    const isEmpty = !imageIds.length;

    return ({ imageIds, isReady, isEmpty })
}

// SECONDARY IMAGES //

function getSecondaryImageIds() {
    const { isWishesSection,
            isInvitesSection } = getLocationConfig();
    
    const { userWishes,
            userWishesHaveLoaded } = getUserWishes();
    const { friendWishes,
            friendWishesHaveLoaded } = getFriendWishes();
    const { friends,
            friendsHaveLoaded } = getFriends();

    const { imageURLs,
            backupURLs,
            loading } = useAppSelector(state => state.images);

    const assimilatedIds = [
        ...Object.keys(imageURLs),
        ...Object.keys(backupURLs),
        ...Object.keys(loading),
    ]

    const imageIds: ImageId[] = [];

    if(isWishesSection) {
        imageIds.push(...userWishes
            .filter(wish => wish.withImage)
            .map(wish => wish.id)
            .filter(id => !assimilatedIds.includes(id))
        )
    } else if(isInvitesSection) {
        imageIds.push(...friendWishes
            .filter(wish => wish.withImage)
            .map(wish => wish.id)
            .filter(id => !assimilatedIds.includes(id))
        )
        imageIds.push(...friends
            .filter(user => user.withImage)
            .map(user => user.id)
            .filter(id => !assimilatedIds.includes(id))
        )
    }

    const isReady = isWishesSection     ? userWishesHaveLoaded
                  : isInvitesSection    ? friendWishesHaveLoaded && friendsHaveLoaded
                                        : true

    const isEmpty = !imageIds.length;

    return ({ imageIds, isReady, isEmpty })
}

// ALL IMAGES //

function getRestImageIds() {
    const { imageURLs,
            backupURLs,
            loading } = useAppSelector(state => state.images);

    const assimilatedIds = [
        ...Object.keys(imageURLs),
        ...Object.keys(backupURLs),
        ...Object.keys(loading),
    ]

    const imageIds: ImageId[] = [];

    imageIds.push(...getAllRelevantUsers()
        .filter(user => user.withImage)
        .map(user => user.id)
        .filter(id => !assimilatedIds.includes(id))
    )
    imageIds.push(...getAllRelevantWishes()
        .filter(wish => wish.withImage)
        .map(wish => wish.id)
        .filter(id => !assimilatedIds.includes(id))
    )

    const result = useDeepCompareMemo(() => (
        imageIds
    ),[ imageIds ]);

    const isEmpty = !result.length

    return { imageIds: result, isEmpty }
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
    getActualWishIds,

    getUserWishlists,
    getInvites,
    getWishlistById,
    getWishlistsByIdList,

    getLoadingStatus,
    getLocationConfig,

    getPrimaryImageIds,
    getSecondaryImageIds,
    getRestImageIds
}
