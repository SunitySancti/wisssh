import React, { useEffect, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useLocation } from 'react-router'

import './App.scss';
import { AppHeader } from 'containers/AppHeader'
import { NavBar } from 'containers/NavBar'
import { NotFoundPage } from 'pages/NotFoundPage'
import { WishesPage } from 'pages/WishesPage'
import { SingleWishPage } from 'pages/SingleWishPage'
import { NewWishPage } from 'pages/NewWishPage'
import { WishlistPage } from 'pages/WishlistPage'
import { ListOfListsPage } from 'pages/ListOfListsPage'
import { IconSet } from 'components/Icon'

import { fetchWishes, filterWishesByUser } from 'store/wishesSlice'
import { filterWishlistsByUser } from 'store/wishlistSlice'
import { updateHistory } from 'store/historySlice'

const App = () => {
  const loca = useLocation().pathname;
  const currentUser = useSelector(state => state.users.current);
  const wishes = useSelector(state => state.wishes);
  const dispatch = useDispatch();
  const loadWishes = () => dispatch(fetchWishes());
  const filterWishes = () => dispatch(filterWishesByUser(currentUser));
  const filterWishlists = () => dispatch(filterWishlistsByUser(currentUser));

  useLayoutEffect(() => {
    loadWishes();
  },[currentUser]);

  useEffect(() => {
    filterWishes();
  },[wishes.all]);

  useEffect(() => {
    filterWishlists();
  },[]);

  useEffect(() => {
    dispatch(updateHistory(loca));
  },[loca]);

  return (
    <Routes>
        <Route path='/' element={ <AppHeader/> } >
          <Route index element={ <Navigate to='/my-wishes/items/actual' replace/> } />
          <Route path='my-wishes/items/' element={ <NavBar/> } >
            <Route index element={ <Navigate to='/my-wishes/items/actual' replace/> } />
            <Route path='new' element={ <NewWishPage/> } />
            <Route path=':tabName' element={ <WishesPage/> } />
            {/* <Route path='completed' element={ <WishesPage/> } />
            <Route path='all' element={ <WishesPage/> } /> */}
            <Route path='actual/:wishId' element={ <SingleWishPage/> } />
            <Route path='completed/:wishId' element={ <SingleWishPage/> } />
            <Route path='all/:wishId' element={ <SingleWishPage/> } />
          </Route>
          <Route path='my-wishes/lists/' element={ <NavBar/> } >
            <Route index element={ <ListOfListsPage/> } />
            <Route path=':wishlistId/' element={ <WishlistPage/> } />
            <Route path=':wishlistId/:wishId' element={ <SingleWishPage/> } />
          </Route>
          <Route path='my-invites/items' element={ <NavBar/> } >
            <Route index element={ <Navigate to='/my-invites/items/reserved' replace/> } />
            <Route path=':tabName' element={ <WishesPage/> } />
            {/* <Route path='completed' element={ <WishesPage/> } />
            <Route path='all' element={ <WishesPage/> } /> */}
            <Route path='reserved/:wishId' element={ <SingleWishPage/> } />
            <Route path='completed/:wishId' element={ <SingleWishPage/> } />
            <Route path='all/:wishId' element={ <SingleWishPage/> } />
          </Route>
          <Route path='my-invites/lists/' element={ <NavBar/> } >
            <Route index element={ <ListOfListsPage/> } />
            <Route path=':wishlistId/' element={ <WishlistPage/> } />
            <Route path=':wishlistId/:wishId' element={ <SingleWishPage/> } />
          </Route>
        </Route>
        <Route path='/icon-set' element={ <IconSet/> } />
        <Route path='*' element={ <NotFoundPage/> } />
    </Routes>
  );
}

export default App;
