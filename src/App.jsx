import   React,
       { useEffect } from 'react'
import { useDispatch,
         useSelector } from 'react-redux'
import { Routes,
         Route,
         Navigate } from 'react-router-dom'
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


function App() {
    const location = useLocation().pathname;
    const dispatch = useDispatch();
    const state = useSelector(state => state)
        
    // HISTORY UPDATING

    useEffect(() => {
        dispatch(updateHistory(location));
    },[ location ]);

    // MOUNTING / UNMOMUNTING

    useEffect(() => {
        return () => {
            dispatch(clearHistory());
        }
    },[]);

    // LOGO CLICK

    const handleLogoClick = async () => {
        console.log(state);
    }

    return (
        <Routes>
            <Route path='/' element={ <AppHeader onLogoClick={ handleLogoClick }/> }>
            {/* <Route path='/' element={ token
                ? <AppHeader onLogoClick={ handleLogoClick }/>
                : <Navigate to='/login' replace/>
            }> */}
                <Route index element={ <Navigate to='/my-wishes/items/actual' replace/> }/>
                <Route path='my-wishes/items/' element={ <NavBar/> }>
                    <Route index element={ <Navigate to='/my-wishes/items/actual' replace/> }/>
                    <Route path='new' element={ <NewWishPage/> }/>
                    <Route path=':tabName' element={ <WishesPage/> }/>
                    <Route path=':tabName/:wishId' element={ <SingleWishPage/> }/>
                    <Route path=':tabName/:wishId/editing' element={ <NewWishPage/> }/>
                </Route>
                <Route path='my-wishes/lists/' element={ <NavBar/> }>
                    <Route index element={ <ListOfListsPage/> }/>
                    <Route path='new' element={ <NewListPage/> }/>
                    <Route path=':wishlistId/' element={ <WishlistPage/> }/>
                    <Route path=':wishlistId/:wishId' element={ <SingleWishPage/> }/>
                    <Route path=':wishlistId/:wishId/editing' element={ <NewWishPage/> }/>
                </Route>
                <Route path='my-invites/items/' element={ <NavBar/> }>
                    <Route index element={ <Navigate to='/my-invites/items/reserved' replace/> }/>
                    <Route path=':tabName' element={ <WishesPage/> }/>
                    <Route path=':tabName/:wishId' element={ <SingleWishPage/> }/>
                </Route>
                <Route path='my-invites/lists/' element={ <NavBar/> }>
                    <Route index element={ <ListOfListsPage/> }/>
                    <Route path=':wishlistId/' element={ <WishlistPage/> }/>
                    <Route path=':wishlistId/:wishId' element={ <SingleWishPage/> }/>
                </Route>
                <Route path='profile' element={ <ProfilePage/> }/>
            </Route>
            <Route path='/login/:encodedEmail?' element={ <LoginPage/> }/>
            {/* <Route path='/login/:encodedEmail?' element={ token
                ? <Navigate to='/my-wishes/items/actual' replace/>
                : <LoginPage/>
            }/> */}
            <Route path='/email-preview' element={ <PasswordResetEmail/> }/>
            <Route path='/icon-set' element={ <IconSet/> }/>
            <Route path='*' element={ <Navigate to='/my-wishes/items/actual' replace/> }/>
        </Routes>
    );
}

export default App;
