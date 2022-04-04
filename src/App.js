import './App.scss';
import { Layout } from 'containers/Layout'
import { WishCard } from 'components/WishCard'
import { wishes } from 'api/mockWishes'
import { Wishes } from 'containers/Wishes'

function App() {
  return (
    <Wishes/>
  );
}

export default App;
