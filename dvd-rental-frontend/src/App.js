import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import MovieList from './components/Movies/MovieList';
import MovieDetail from './components/Movies/MovieDetail';
import DVDList from './components/DVDs/DVDList';
import MyBookings from './components/Client/MyBookings';
import BookingForm from './components/Client/BookingForm';
import MyRentals from './components/Client/MyRentals';
import MovieManage from './components/Employee/MovieManage';
import GenreManage from './components/Employee/GenreManage';
import DVDManage from './components/Employee/DVDManage';
import BookingListAll from './components/Employee/BookingListAll';
import RentalListAll from './components/Employee/RentalListAll';
import IssueDVD from './components/Employee/IssueDVD';
import ReturnDVD from './components/Employee/ReturnDVD';
import UserManage from './components/Admin/UserManage';
import RoleManage from './components/Admin/RoleManage';
import BlockManage from './components/Admin/BlockManage';
import AdminDashboard from './components/Admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          
          {/* Movies */}
          <Route path="/movies" element={<ProtectedRoute><MovieList /></ProtectedRoute>} />
          <Route path="/movies/:id" element={<ProtectedRoute><MovieDetail /></ProtectedRoute>} />
          
          {/* DVDs */}
          <Route path="/dvds" element={<ProtectedRoute><DVDList /></ProtectedRoute>} />
          
          {/* Client */}
          <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/bookings/new" element={<ProtectedRoute><BookingForm /></ProtectedRoute>} />
          <Route path="/rentals" element={<ProtectedRoute><MyRentals /></ProtectedRoute>} />
          
          {/* Employee */}
          <Route path="/employee/movies" element={<ProtectedRoute requiredRole="employee"><MovieManage /></ProtectedRoute>} />
          <Route path="/employee/genres" element={<ProtectedRoute requiredRole="employee"><GenreManage /></ProtectedRoute>} />
          <Route path="/employee/dvds" element={<ProtectedRoute requiredRole="employee"><DVDManage /></ProtectedRoute>} />
          <Route path="/employee/bookings" element={<ProtectedRoute requiredRole="employee"><BookingListAll /></ProtectedRoute>} />
          <Route path="/employee/rentals" element={<ProtectedRoute requiredRole="employee"><RentalListAll /></ProtectedRoute>} />
          <Route path="/employee/issue" element={<ProtectedRoute requiredRole="employee"><IssueDVD /></ProtectedRoute>} />
          <Route path="/employee/return" element={<ProtectedRoute requiredRole="employee"><ReturnDVD /></ProtectedRoute>} />
          
          {/* Admin */}
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UserManage /></ProtectedRoute>} />
          <Route path="/admin/roles" element={<ProtectedRoute requiredRole="admin"><RoleManage /></ProtectedRoute>} />
          <Route path="/admin/blocks" element={<ProtectedRoute requiredRole="admin"><BlockManage /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const Home = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return (
    <div>
      <h1>Добро пожаловать!</h1>
      <p>Вы вошли как: {user.name}</p>
      <p>Ваши роли: {user.roles?.map(r => r.name).join(', ') || 'Нет ролей'}</p>
    </div>
  );
};

export default App;