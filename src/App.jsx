import   React,
       { useEffect } from 'react'
import { useSelector,
         useDispatch } from 'react-redux'
import { createBrowserRouter,
         RouterProvider,
         Navigate } from 'react-router-dom'

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
import { ProfilePage } from 'pages/ProfilePage'
import { InvitationAcceptancePage } from 'pages/InvitationAcceptancePage'

import { getImage } from 'store/imageSlice'


function App() {
    const dispatch = useDispatch();
    const queue = useSelector(state => state.images?.queue);
    const prior = useSelector(state => state.images?.prior);
    const isLoading = useSelector(state => Boolean(Object.keys(state.images?.loading)?.length));

    useEffect(() => {
        console.log({ queue, prior, isLoading });
        if(!isLoading) {
            let part;
            if(prior instanceof Array && prior.length) {
                part = prior.slice(0,8)
            } else if(queue instanceof Array && queue.length) {
                part = queue.slice(0,8)
            }

            part?.forEach(item => dispatch(getImage(item)))
        }
    },[ queue, prior, isLoading ]);


    const router = createBrowserRouter([
        {
            path: '/',
            element: <AppHeader/>,
            children: [
                {
                    index: true,
                    element: <Navigate to='/my-wishes/items/actual' replace/>
                },{
                    path: 'my-wishes/items/',
                    element: <NavBar/>,
                    children: [
                        {
                            index: true,
                            element: <Navigate to='/my-wishes/items/actual' replace/>
                        },{
                            path: 'new',
                            element: <NewWishPage/>
                        },{
                            path: ':tabName',
                            element: <WishesPage/>
                        },{
                            path: ':tabName/:wishId',
                            element: <SingleWishPage/>
                        },{
                            path: ':tabName/:wishId/editing',
                            element: <NewWishPage/>
                        },
                    ]
                },{
                    path: 'my-wishes/lists/',
                    element: <NavBar/>,
                    children: [
                        {
                            index: true,
                            element: <ListOfListsPage/>
                        },{
                            path: 'new',
                            element: <NewListPage/>
                        },{
                            path: ':wishlistId',
                            element: <WishlistPage/>
                        },{
                            path: ':wishlistId/editing',
                            element: <NewListPage/>
                        },{
                            path: ':wishlistId/:wishId',
                            element: <SingleWishPage/>
                        },{
                            path: ':wishlistId/:wishId/editing',
                            element: <NewWishPage/>
                        },
                    ]
                },{
                    path: 'my-invites/items/',
                    element: <NavBar/>,
                    children: [
                        {
                            index: true,
                            element: <Navigate to='/my-invites/items/reserved' replace/>
                        },{
                            path: ':tabName',
                            element: <WishesPage/>
                        },{
                            path: ':tabName/:wishId',
                            element: <SingleWishPage/>
                        },
                    ]
                },{
                    path: 'my-invites/lists/',
                    element: <NavBar/>,
                    children: [
                        {
                            index: true,
                            element: <ListOfListsPage/>
                        },{
                            path: ':wishlistId',
                            element: <WishlistPage/>
                        },{
                            path: ':wishlistId/:wishId',
                            element: <SingleWishPage/>
                        },
                    ]
                },{
                    path: 'profile',
                    element: <ProfilePage/>
                },{
                    path: 'share/:invitationCode',
                    element: <InvitationAcceptancePage/>
                }
            ]
        },{
            path: '/login/:encodedEmail?',
            element: <LoginPage/>
        },{
            path: '*',
            element: <Navigate to='/my-wishes/items/actual' replace/>
        }
    ])

    return <RouterProvider router={ router }/>
}

export default App;
