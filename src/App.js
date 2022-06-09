import { Routes, Route, Navigate } from 'react-router-dom'

import './App.scss';
import { AppHeader } from 'containers/AppHeader'
import { NavBar } from 'containers/NavBar'
import { MultiColumnTapeLayout } from 'containers/MultiColumnTapeLayout'
import { WishPage } from 'pages/WishPage'
import { WishListPage } from 'pages/WishListPage'
import { ListOfListsPage } from 'pages/ListOfListsPage'

function App() {
  return (
    <Routes>
        <Route path='/' element={ <AppHeader/> } >
          <Route index element={ <Navigate to='/my-wishes/items/actual' replace/> } />
          <Route path='my-wishes/' element={ <NavBar/> } >
            <Route path='items/actual' element={ <MultiColumnTapeLayout/> } />
            <Route path='items/completed' element={ <MultiColumnTapeLayout/> } />
            <Route path='items/all' element={ <MultiColumnTapeLayout/> } />
            <Route path='items/:wishId' element={ <WishPage/> } />
          </Route>
          <Route path='my-wishes/' element={ <NavBar/> } >
            <Route path='lists/' element={ <ListOfListsPage/> } />
            <Route path='lists/:wishlistId/' element={ <WishListPage/> } />
            <Route path='lists/:wishlistId/:wishId' element={ <WishPage/> } />
          </Route>
          <Route path='my-invites/' element={ <NavBar/> } >
            <Route path='items/reserved' element={ <MultiColumnTapeLayout/> } />
            <Route path='items/presented' element={ <MultiColumnTapeLayout/> } />
            <Route path='items/all' element={ <MultiColumnTapeLayout/> } />
            <Route path='items/:wishId' element={ <WishPage/> } />
          </Route>
          <Route path='my-invites/' element={ <NavBar/> } >
            <Route path='lists/' element={ <ListOfListsPage/> } />
            <Route path='lists/:wishlistId/' element={ <WishListPage/> } />
            <Route path='lists/:wishlistId/:wishId' element={ <WishPage/> } />
          </Route>
        </Route>
    </Routes>
  );
}

export default App;
