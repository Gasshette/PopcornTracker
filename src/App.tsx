import { ConfigProvider } from './contexts/ConfigProvider';
import { ItemsProvider } from './contexts/ItemsProvider';
import { Home } from './pages/Home';
import { AuthProvider } from './contexts/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <ItemsProvider>
        <ConfigProvider>
          <Home />
        </ConfigProvider>
      </ItemsProvider>
    </AuthProvider>
  );
}

export default App;
