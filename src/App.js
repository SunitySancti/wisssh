import { Routes, Route } from 'react-router-dom';

import './App.scss';
import { MyWishesPage } from 'pages/MyWishes'
import { AppLayout } from 'containers/AppLayout';
import { MultiColumnTapeLayout } from 'containers/MultiColumnTapeLayout';

function App() {
  return (
    <Routes>
        <Route path='/' element={ <AppLayout/> }>
          <Route index element={ <MultiColumnTapeLayout/> } />
          <Route path='my-wishes/all' element={ <MultiColumnTapeLayout/> } />
          <Route path='my-wishes/actual' element={ <MultiColumnTapeLayout/> } />
          <Route path='my-wishes/done' element={ <MultiColumnTapeLayout/> } />
        </Route>
    </Routes>
  );
}

export default App;
