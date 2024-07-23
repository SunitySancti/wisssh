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
import { ProfilePage } from 'pages/ProfilePage'
import { InvitationAcceptancePage } from 'pages/InvitationAcceptancePage'

import { useWindowSize } from 'hooks/useWindowSize'
import { getLocationConfig } from 'store/getters'
import { useAppDispatch } from 'store'
import { responseWidth } from 'store/responsivenessSlice'


const Controllers = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { width } = useWindowSize();
    const { location } = getLocationConfig();

    // RESPONSIVENESS CONTROLLER
    useEffect(() => {
        dispatch(responseWidth(width))
    },[ width ]);

    // URL CORRECTOR
    useEffect(() => {
        const corrected = '/' + location.split('/').filter(str => str).join('/');
        if(corrected !== location) {
            navigate(corrected,{ replace: true })
        }
    },[ location ]);

    return null
}

const App = () => (
    <>
        <Controllers/>
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
                    <Route path=':wishlistId/new-wish' element={ <NewWishPage/> }/>
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

                <Route path='profile' element={ <NavBarLayout/> }>
                    <Route index element={ <ProfilePage/> }/>
                </Route>
                <Route path='share/:invitationCode' element={ <InvitationAcceptancePage/> }/>
            </Route>

            <Route path='/login/:encodedEmail?/:incomePassword?' element={ <LoginPage/> }/>
            <Route path='/logout' element={ <LogoutPage/> }/>
            <Route path='*' element={ <Navigate to='/my-wishes/items/actual' replace/> }/>
        </Routes>
    </>
);

export default App;
