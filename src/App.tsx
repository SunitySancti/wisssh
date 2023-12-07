import { Navigate,
         Routes,
         Route } from 'react-router-dom'

import './App.scss'
import { AppHeader } from 'organisms/AppHeader/index'
import { NavBar } from 'organisms/NavBar'
import { WishesPage } from 'pages/WishesPage'
import { SingleWishPage } from 'pages/SingleWishPage'
import { ListOfListsPage } from 'pages/ListOfListsPage'
import { WishlistPage } from 'pages/WishlistPage'
import { NewWishPage } from 'pages/NewWishPage'
import { NewListPage } from 'pages/NewListPage'
import { LoginPage } from 'pages/LoginPage'
import { LogoutPage } from 'pages/LogoutPage'
import { RedirectPage } from 'pages/RedirectPage'
import { ProfilePage } from 'pages/ProfilePage'
import { InvitationAcceptancePage } from 'pages/InvitationAcceptancePage'


const App = () => (
    <Routes>
        <Route path='/' element={ <AppHeader/> }>
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
                <Route path=':wishlistId' element={ <WishlistPage/> }/>
                <Route path=':wishlistId/editing' element={ <NewListPage/> }/>
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
                <Route path=':wishlistId' element={ <WishlistPage/> }/>
                <Route path=':wishlistId/:wishId' element={ <SingleWishPage/> }/>
            </Route>

            <Route path='profile' element={ <ProfilePage/> }/>
            <Route path='share/:invitationCode' element={ <InvitationAcceptancePage/> }/>
        </Route>

        <Route path='/login/:encodedEmail?' element={ <LoginPage/> }/>
        <Route path='/logout' element={ <LogoutPage/> }/>
        <Route path='/redirect' element={ <RedirectPage/> }/>
        <Route path='*' element={ <Navigate to='/my-wishes/items/actual' replace/> }/>
    </Routes>
);

export default App;
