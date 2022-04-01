import './App.scss';
import { Layout } from 'containers/Layout'
import { WishCard } from 'components/WishCard'
import { wishes } from 'api/mockWishes'

function App() {
  return (
    <Layout>
      <WishCard wish={ wishes[0] }/>
    </Layout>
  );
}

export default App;
