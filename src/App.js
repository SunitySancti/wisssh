import { Routes, Route, Navigate } from 'react-router-dom';

import './App.scss';
import { AppHeader } from 'containers/AppHeader';
import { SideBar } from 'containers/SideBar';
import { MultiColumnTapeLayout } from 'containers/MultiColumnTapeLayout';

function App() {
  return (
    <Routes>
        <Route path='/' element={ <AppHeader/> } >
          <Route index element={ <Navigate to='/my-wishes/actual' replace/> } />
          <Route path='my-wishes/' element={ <SideBar/> } >
            <Route index element={ <Navigate to='/my-wishes/actual' replace/> } />
            <Route path='actual' element={ <MultiColumnTapeLayout/> } />
            <Route path='done' element={ <MultiColumnTapeLayout/> } />
            <Route path='all' element={ <MultiColumnTapeLayout/> } />
          </Route>
          <Route path='my-invites/' element={ <SideBar/> } >
            <Route index element={ <Navigate to='/my-invites/actual' replace/> } />
            <Route path='actual' element={ <MultiColumnTapeLayout/> } />
            <Route path='past' element={ <MultiColumnTapeLayout/> } />
            <Route path='presented-by-me' element={ <MultiColumnTapeLayout/> } />
          </Route>
          <Route path='wishlists/' element={ <SideBar/> } >
            <Route index element={ <Navigate to='/my-wishes/actual' replace/> } />
            <Route path='my/:wishListId' element={ <MultiColumnTapeLayout/> } />
            <Route path=':userId/:wishListId' element={ <MultiColumnTapeLayout/> } />
          </Route>
        </Route>
    </Routes>
  );
}

export default App;
