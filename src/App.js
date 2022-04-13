import { Routes, Route } from 'react-router-dom';

import './App.scss';
import { MyWishes } from 'pages/MyWishes'

function App() {
  return (
    <Routes>
        <Route path='/' element={<MyWishes />} />
    </Routes>
  );
}

export default App;
