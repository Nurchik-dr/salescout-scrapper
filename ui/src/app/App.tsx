import { Provider } from 'react-redux';
import { withProviders } from './providers';
import { store } from './store/store';
import { Router } from './router/router';
import './index.scss';
import { useWebSocket } from '../shared/hooks/useWebSocket';

const App = () => {
  useWebSocket();

  return (
    <Provider store={store}>
      <Router />
    </Provider>
  );
};

const AppWithProviders = withProviders(App);

export default AppWithProviders;
