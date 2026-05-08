import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './apps/LandingPage';
import UserApp from './apps/UserApp';
import AdminApp from './apps/AdminApp';
import DevApp from './apps/DevApp';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user" element={<UserApp />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/dev" element={<DevApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
