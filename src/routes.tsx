import { createRoutesFromElements, Route } from 'react-router-dom';
import { DetailsPage } from './pages/DetailsPage/DetailsPage';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';

export const routes = createRoutesFromElements(
  <Route element={<Layout />}>
    <Route path="/:userId?">
      <Route index element={<Home />} />
      <Route path="details/:id" element={<DetailsPage />} />
    </Route>
    <Route path="*" element={<Home />} />
  </Route>
);
