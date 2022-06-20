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
          <Route path='my-wishes/items/' element={ <NavBar/> } >
            <Route index element={ <Navigate to='/my-wishes/items/actual' replace/> } />
            <Route path='actual' element={ <MultiColumnTapeLayout/> } />
            <Route path='completed' element={ <MultiColumnTapeLayout/> } />
            <Route path='all' element={ <MultiColumnTapeLayout/> } />
            <Route path=':wishId' element={ <WishPage/> } />
          </Route>
          <Route path='my-wishes/lists/' element={ <NavBar/> } >
            <Route index element={ <ListOfListsPage/> } />
            <Route path=':wishlistId/' element={ <WishListPage/> } />
            <Route path=':wishlistId/:wishId' element={ <WishPage/> } />
          </Route>
          <Route path='my-invites/items' element={ <NavBar/> } >
            <Route index element={ <Navigate to='/my-invites/items/reserved' replace/> } />
            <Route path='reserved' element={ <MultiColumnTapeLayout/> } />
            <Route path='presented' element={ <MultiColumnTapeLayout/> } />
            <Route path='all' element={ <MultiColumnTapeLayout/> } />
            <Route path=':wishId' element={ <WishPage/> } />
          </Route>
          <Route path='my-invites/lists/' element={ <NavBar/> } >
            <Route index element={ <ListOfListsPage/> } />
            <Route path=':wishlistId/' element={ <WishListPage/> } />
            <Route path=':wishlistId/:wishId' element={ <WishPage/> } />
          </Route>
        </Route>
    </Routes>
  );
}

export default App;
