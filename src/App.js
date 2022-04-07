import { Routes, Route } from 'react-router-dom';

import './App.scss';
import { Wishes } from 'containers/Wishes'
import { WishCardsLayout } from 'containers/WishCardsLayout';

function App() {
  return (
    <Routes>
        <Route path='/' element={<WishCardsLayout />} />
    </Routes>
  );
}

export default App;
