import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import VehicleDetails from './pages/VehicleDetails';
import Login from './pages/Login';
import Admin from './pages/Admin';
import AdminVehicles from './pages/AdminVehicles';
import AdminVehicleForm from './pages/AdminVehicleForm';
import ProtectedRoute from './components/ProtectedRoute';
import Events from './pages/Events';
import SoldVehicles from './pages/SoldVehicles';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/veiculos" element={<Vehicles />} />
            <Route path="/eventos" element={<Events />} />
            <Route path="/vendidas" element={<SoldVehicles />} />
            <Route path="/veiculo/:id" element={<VehicleDetails />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/veiculos"
              element={
                <ProtectedRoute>
                  <AdminVehicles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/veiculos/novo"
              element={
                <ProtectedRoute>
                  <AdminVehicleForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/veiculos/editar/:id"
              element={
                <ProtectedRoute>
                  <AdminVehicleForm />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
