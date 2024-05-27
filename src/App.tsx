import { useEffect } from 'react'
import { Navigate,
         Routes,
         Route, 
         useNavigate} from 'react-router-dom'

import './App.scss'
import './responsiveness.scss'
import { AppLayout } from 'organisms/AppLayout'
import { NavBarLayout } from 'organisms/NavBarLayout'
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

import { useWindowSize } from 'hooks/useWindowSize'
import { getFriends,
         getUserWishlists,
         getUserWishes,
         getInvites,
         getFriendWishes,
         getLocationConfig } from 'store/getters'
import { useAppDispatch } from 'store'
import { usePrefetch } from 'store/apiSlice'
import { responseWidth } from 'store/responsivenessSlice'


const DataFetchController = () => {
    const { section, mode } = getLocationConfig();

    const   triggerFriends = usePrefetch('getFriends');
    const { friendsHaveLoaded } = getFriends();

    const   triggerUserWishes = usePrefetch('getUserWishes');
    const { userWishesHaveLoaded } = getUserWishes();
        
    const   triggerUserWishlists = usePrefetch('getUserWishlists');
    const { userWishlistsHaveLoaded } = getUserWishlists();
            
    const   triggerFriendWishes = usePrefetch('getFriendWishes');
    const { friendWishesHaveLoaded } = getFriendWishes();
                
    const   triggerInvites = usePrefetch('getInvites');
    const { invitesHaveLoaded } = getInvites();

    const fetchRest = () => {
        if(!userWishesHaveLoaded)       triggerUserWishes()
        if(!userWishlistsHaveLoaded)    triggerUserWishlists()
        if(!friendWishesHaveLoaded)     triggerFriendWishes()
        if(!invitesHaveLoaded)          triggerInvites()
        if(!friendsHaveLoaded)          triggerFriends()
    }

    useEffect(() => {
        switch(section + '/' + mode) {
            case 'my-wishes/items':
                triggerUserWishes();
                if(userWishesHaveLoaded) fetchRest()
                break
            case 'my-wishes/lists':
                triggerUserWishlists();
                if(userWishlistsHaveLoaded) fetchRest()
                break
            case 'my-invites/items':
                triggerFriendWishes();
                if(friendWishesHaveLoaded) fetchRest()
                break
            case 'my-invites/lists':
                triggerInvites();
                triggerFriends();
                if(invitesHaveLoaded && friendsHaveLoaded) fetchRest()
        }
    },[ section,
        mode,
        userWishesHaveLoaded,
        userWishlistsHaveLoaded,
        friendWishesHaveLoaded,
        invitesHaveLoaded,
        friendsHaveLoaded
    ]);

    return null
}

const ResponsivenessController = () => {
    const dispatch = useAppDispatch();
    const { width } = useWindowSize();

    useEffect(() => {
        dispatch(responseWidth(width))
    },[ width ]);

    return null
}

const URLCorrector = () => {
    const navigate = useNavigate();
    const { location } = getLocationConfig();

    useEffect(() => {
        const corrected = '/' + location.split('/').filter(str => str).join('/');
        if(corrected !== location) {
            navigate(corrected)
        }
    },[ location ]);

    return null
}

const App = () => (
    <>
        <DataFetchController/>
        <ResponsivenessController/>
        <URLCorrector/>
        <Routes>
            <Route path='/' element={ <AppLayout/> }>
                <Route index element={ <Navigate to='/my-wishes/items/actual' replace/> }/>
                
                <Route path='my-wishes/items' element={ <NavBarLayout/> }>
                    <Route index element={ <Navigate to='/my-wishes/items/actual' replace/> }/>
                    <Route path='new' element={ <NewWishPage/> }/>
                    <Route path=':tabName' element={ <WishesPage/> }/>
                    <Route path=':tabName/:wishId' element={ <SingleWishPage/> }/>
                    <Route path=':tabName/:wishId/editing' element={ <NewWishPage/> }/>
                </Route>

                <Route path='my-wishes/lists' element={ <NavBarLayout/> }>
                    <Route index element={ <ListOfListsPage/> }/>
                    <Route path='new' element={ <NewListPage/> }/>
                    <Route path=':wishlistId' element={ <WishlistPage/> }/>
                    <Route path=':wishlistId/editing' element={ <NewListPage/> }/>
                    <Route path=':wishlistId/:wishId' element={ <SingleWishPage/> }/>
                    <Route path=':wishlistId/:wishId/editing' element={ <NewWishPage/> }/>
                </Route>
                
                <Route path='my-invites/items' element={ <NavBarLayout/> }>
                    <Route index element={ <Navigate to='/my-invites/items/reserved' replace/> }/>
                    <Route path=':tabName' element={ <WishesPage/> }/>
                    <Route path=':tabName/:wishId' element={ <SingleWishPage/> }/>
                </Route>

                <Route path='my-invites/lists' element={ <NavBarLayout/> }>
                    <Route index element={ <ListOfListsPage/> }/>
                    <Route path=':wishlistId' element={ <WishlistPage/> }/>
                    <Route path=':wishlistId/:wishId' element={ <SingleWishPage/> }/>
                </Route>

                {/* <Route path='profile' element={ <ProfilePage/> }/> */}
                <Route path='profile' element={ <NavBarLayout/> }>
                    <Route index element={ <ProfilePage/> }/>
                </Route>
                <Route path='share/:invitationCode' element={ <InvitationAcceptancePage/> }/>
            </Route>

            <Route path='/login/:encodedEmail?' element={ <LoginPage/> }/>
            <Route path='/logout' element={ <LogoutPage/> }/>
            <Route path='/redirect' element={ <RedirectPage/> }/>
            <Route path='*' element={ <Navigate to='/my-wishes/items/actual' replace/> }/>
        </Routes>
    </>
);

export default App;
