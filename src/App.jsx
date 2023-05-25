import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useLocation } from 'react-router'

import './App.scss'
import { AppHeader } from 'organisms/AppHeader/index'
import { NavBar } from 'organisms/NavBar'
import { IconSet } from 'atoms/Icon'
import { WishesPage } from 'pages/WishesPage'
import { SingleWishPage } from 'pages/SingleWishPage'
import { ListOfListsPage } from 'pages/ListOfListsPage'
import { WishlistPage } from 'pages/WishlistPage'
import { NewWishPage } from 'pages/NewWishPage'
import { NewListPage } from 'pages/NewListPage'
import { LoginPage } from 'pages/LoginPage'
import { ProfilePage } from 'pages/ProfilePage'
import { PasswordResetEmail } from 'emails/PasswordResetEmail'

import { updateHistory,
         clearHistory } from 'store/historySlice'
import { resetImageStore,
         fetchUserAvatar,
         fetchWishCover } from 'store/imageSlice'
import { useGetSingleUserQuery,
         useGetSomeWishesQuery,
         useGetSomeWishlistsQuery,
         useGetSomeUsersQuery } from 'store/apiSlice'
import { mergeArrays } from 'utils'


function App() {
    const location = useLocation().pathname;
    const dispatch = useDispatch();
    const currentUserId = useSelector(state => state.auth?.userId);

    const { data: currentUser,
            isSuccess: currentUserHasLoaded } = useGetSingleUserQuery(currentUserId,
          { skip: !currentUserId }
    );

    const { data: userWishes,
            isSuccess: userWishesHaveLoaded } = useGetSomeWishesQuery(currentUser?.wishes,
          { skip: !currentUserHasLoaded }
    );

    const { data: userWishlists } = useGetSomeWishlistsQuery(currentUser?.wishlists);

    const { data: friendsWishlists,
            isSuccess: friendsWishlistsHaveLoaded } = useGetSomeWishlistsQuery(currentUser?.invites);

    const { data: friendsWishes,
            isSuccess: friendsWishesHaveLoaded } = useGetSomeWishesQuery(
                mergeArrays(friendsWishlists?.map(list => list.wishes)),
                {skip: !friendsWishlistsHaveLoaded}
    );

    const { data: friends,
            isSuccess: friendsHaveLoaded } = useGetSomeUsersQuery(
                friendsWishlists?.map(list => list.author),
                {skip: !friendsWishlistsHaveLoaded}
    );

    useEffect(() => {
        if(currentUserId) dispatch(fetchUserAvatar(currentUserId))
    },[ currentUserId ])
    
    useEffect(() => {
        if(!userWishes || !userWishes?.length) return
        for (const wish of userWishes) {
            dispatch(fetchWishCover(wish.id))
        }
    },[ userWishes, userWishesHaveLoaded ]);

    useEffect(() => {
        if(!friendsWishes || !friendsWishes?.length) return
        for (const wish of friendsWishes) {
            dispatch(fetchWishCover(wish.id))
        }
    },[ friendsWishes, friendsWishesHaveLoaded ]);

    useEffect(() => {
        if(!friends || !friends?.length) return
        for (const user of friends) {
            dispatch(fetchUserAvatar(user.id))
        }
    },[ friends, friendsHaveLoaded ]);
        
    // updating history on each path change:

    useEffect(() => {
        dispatch(updateHistory(location));
    },[ location ]);

    useEffect(() => {
        return () => {
            dispatch(clearHistory());
            dispatch(resetImageStore());
        }
    },[]);

    // what click on wisssh logo do:

    const state = useSelector(state => state)
    const handleLogoClick = async () => {
        console.log(state);
    }

    return (
        <Routes>
            <Route path='/' element={ <AppHeader onLogoClick={ handleLogoClick }/>}>
                <Route index element={ <Navigate to='/my-wishes/items/actual' replace/> } />
                <Route path='my-wishes/items/' element={ <NavBar/> } >
                    <Route index element={ <Navigate to='/my-wishes/items/actual' replace/> } />
                    <Route path='new' element={ <NewWishPage/> } />
                    <Route path=':tabName' element={ <WishesPage/> } />
                    <Route path=':tabName/:wishId' element={ <SingleWishPage/> } />
                    <Route path=':tabName/:wishId/editing' element={ <NewWishPage/> } />
                </Route>
                <Route path='my-wishes/lists/' element={ <NavBar/> } >
                    <Route index element={ <ListOfListsPage/> } />
                    <Route path='new' element={ <NewListPage/> } />
                    <Route path=':wishlistId/' element={ <WishlistPage/> } />
                    <Route path=':wishlistId/:wishId' element={ <SingleWishPage/> } />
                    <Route path=':wishlistId/:wishId/editing' element={ <NewWishPage/> } />
                </Route>
                <Route path='my-invites/items/' element={ <NavBar/> } >
                    <Route index element={ <Navigate to='/my-invites/items/reserved' replace/> } />
                    <Route path=':tabName' element={ <WishesPage/> } />
                    <Route path=':tabName/:wishId' element={ <SingleWishPage/> } />
                </Route>
                <Route path='my-invites/lists/' element={ <NavBar/> } >
                    <Route index element={ <ListOfListsPage/> } />
                    <Route path=':wishlistId/' element={ <WishlistPage/> } />
                    <Route path=':wishlistId/:wishId' element={ <SingleWishPage/> } />
                </Route>
                <Route path='profile' element={ <ProfilePage/> } />
            </Route>
            <Route path='/icon-set' element={ <IconSet/> } />
            <Route path='/login/:encodedEmail?' element={ <LoginPage/> } />
            <Route path='/email-preview' element={ <PasswordResetEmail/> } />
            <Route path='*' element={ <Navigate to='/my-wishes/items/actual' replace/> } />
        </Routes>
    );
}

export default App;
