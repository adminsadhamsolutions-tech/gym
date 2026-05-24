import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberForm from './pages/MemberForm';
import Payments from './pages/Payments';
import Renewals from './pages/Renewals';
import Expenses from './pages/Expenses';
import Packages from './pages/Packages';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import PrivateRoute from './auth/PrivateRoute';

function App() {
  return (
    <div className="min-h-screen bg-sky-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/members" element={<PrivateRoute><Members /></PrivateRoute>} />
        <Route path="/members/new" element={<PrivateRoute><MemberForm mode="create" /></PrivateRoute>} />
        <Route path="/members/edit/:id" element={<PrivateRoute><MemberForm mode="edit" /></PrivateRoute>} />
        <Route path="/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
        <Route path="/renewals" element={<PrivateRoute><Renewals /></PrivateRoute>} />
        <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
        <Route path="/packages" element={<PrivateRoute><Packages /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
