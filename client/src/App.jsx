import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminDashboard from './pages/Admin/Dashboard';
import PendingUsers from './pages/Admin/PendingUsers';
import EventRequestsPage from './pages/Admin/EventRequests';
import MemberDashboard from './pages/Member/Dashboard';
import Team from './pages/Team';
import MemberEvents from './pages/Member/Events';
import ProposeEvent from './pages/Member/ProposeEvent';
import Profile from './pages/Member/Profile';
import MyProposals from './pages/Member/MyProposals';
import CommunityProposals from './pages/Member/CommunityProposals';
import Layout from './components/Layout/Layout';
import './index.css';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/login" replace />;

  const isAllowed = Array.isArray(allowedRole)
    ? allowedRole.includes(user.role)
    : user.role === allowedRole;

  if (allowedRole && !isAllowed) return <Navigate to="/" replace />;

  return <Layout role={user.role}>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/admin/*" element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute allowedRole="admin">
              <PendingUsers />
            </ProtectedRoute>
          } />

          <Route path="/admin/requests" element={
            <ProtectedRoute allowedRole="admin">
              <EventRequestsPage />
            </ProtectedRoute>
          } />

          <Route path="/team" element={
            <ProtectedRoute allowedRole={['admin', 'member']}>
              <Team />
            </ProtectedRoute>
          } />

          <Route path="/member" element={
            <ProtectedRoute allowedRole="member">
              <MemberDashboard />
            </ProtectedRoute>
          } />

          <Route path="/member/events" element={
            <ProtectedRoute allowedRole={['member', 'admin']}>
              <MemberEvents />
            </ProtectedRoute>
          } />

          <Route path="/member/proposals" element={
            <ProtectedRoute allowedRole={['member', 'admin']}>
              <MyProposals />
            </ProtectedRoute>
          } />

          <Route path="/member/community" element={
            <ProtectedRoute allowedRole={['member', 'admin']}>
              <CommunityProposals />
            </ProtectedRoute>
          } />

          <Route path="/member/propose" element={
            <ProtectedRoute allowedRole={['member', 'admin']}>
              <ProposeEvent />
            </ProtectedRoute>
          } />

          <Route path="/member/profile" element={
            <ProtectedRoute allowedRole={['member', 'admin']}>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
