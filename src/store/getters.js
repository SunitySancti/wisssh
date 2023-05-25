import { useSelector } from 'react-redux'

import { mergeArrays } from 'utils'
import { useGetUsersQuery,
         useGetSomeWishesQuery,
         useGetSingleWishQuery,
         useGetSomeWishlistsQuery,
         useGetSingleWishlistQuery,
         useGetSingleUserQuery,
         useGetSomeUsersQuery } from 'store/apiSlice'


export const getCurrentUser = () => {
    const currentUserId = useSelector(state => state.auth?.userId);
    const { data: currentUser } = useGetSingleUserQuery(currentUserId);

    return currentUser || {}
}

export const getUserById = (id) => {
    const { data: allUsers } = useGetUsersQuery();
    const user = allUsers?.find(user => user.id === id);

    return user || {}
}

export const getUserWishes = () => {
    const user = getCurrentUser();
    const { data: userWishes } = useGetSomeWishesQuery(user?.wishes);

    return userWishes || []
}

export const getFriendsWishes = () => {
    const userId = useSelector(state => state.auth?.userId);
    const { data: user,
            isSuccess: userHasLoaded } = useGetSingleUserQuery(userId);

    const { data: friendsWishlists,
            isSuccess: friendsWishlistsHaveLoaded } = useGetSomeWishlistsQuery(user?.invites,
          { skip: !userHasLoaded }
    );

    const { data: friendsWishes } = useGetSomeWishesQuery(mergeArrays(friendsWishlists?.map(list => list.wishes)),
          { skip: !friendsWishlistsHaveLoaded }
    );

    return friendsWishes || []
}

export const getAllRelevantWishes = () => {
    return getUserWishes().concat( getFriendsWishes() ) || []
}

export const getWishById = (id) => {
    return getAllRelevantWishes().find(wish => wish.id === id) || null
}

export const getUserWishlists = () => {
    const userId = useSelector(state => state.auth?.userId);
    const { data: user,
            isSuccess: userHasLoaded } = useGetSingleUserQuery(userId);

    const { data: userWishlists } = useGetSomeWishlistsQuery(user?.wishlists,
          { skip: !userHasLoaded }
    );

    return userWishlists || []
}

export const getFriendsWishlists = () => {
    const userId = useSelector(state => state.auth?.userId);
    const { data: user,
            isSuccess: userHasLoaded } = useGetSingleUserQuery(userId);

    const { data: friendsWishlists } = useGetSomeWishlistsQuery(user?.invites,
          { skip: !userHasLoaded }
    );

    return friendsWishlists || []
}

export const getAllRelevantWishlists = () => {
    return getUserWishlists().concat( getFriendsWishlists() ) || []
}

export const getWishlistById = (id) => {
    return getAllRelevantWishlists().find(wishlist => wishlist.id === id) || null
}

export const getWishlistsByIdList = (ids) => {
    return getAllRelevantWishlists().filter(wishlist => ids?.includes(wishlist.id)) || []
}


export const getFriends = () => {
    const userId = useSelector(state => state.auth?.userId);
    const { data: user,
            isSuccess: userHasLoaded } = useGetSingleUserQuery(userId);

    const { data: friendsWishlists,
            isSuccess: friendsWishlistsHaveLoaded } = useGetSomeWishlistsQuery(user?.invites,
          { skip: !userHasLoaded });

    const { data: friends } = useGetSomeUsersQuery(friendsWishlists?.map(list => list.author),
          { skip: !friendsWishlistsHaveLoaded }
    );

    return friends || []
}
