import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initStore } from './data/store';
import LandingPage from './apps/LandingPage';
import UserApp from './apps/UserApp';
import AdminApp from './apps/AdminApp';
import DevApp from './apps/DevApp';
import FacilityApp from './apps/FacilityApp';
import MiddleAdminApp from './apps/MiddleAdminApp';

initStore();

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user" element={<UserApp />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/dev" element={<DevApp />} />
        <Route path="/facility" element={<FacilityApp />} />
        <Route path="/midadmin" element={<MiddleAdminApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
