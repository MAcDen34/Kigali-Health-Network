import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import PatientPortal from './pages/PatientPortal'
import ClinicDashboard from './pages/ClinicDashboard'
import PharmacyDashboard from './pages/PharmacyDashboard'
import InsuranceDashboard from './pages/InsuranceDashboard'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/patient"
              element={
                <ProtectedRoute allow={['patient']}>
                  <PatientPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clinic"
              element={
                <ProtectedRoute allow={['doctor', 'nurse']}>
                  <ClinicDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pharmacy"
              element={
                <ProtectedRoute allow={['pharmacist']}>
                  <PharmacyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insurance"
              element={
                <ProtectedRoute allow={['insurance']}>
                  <InsuranceDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allow={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
