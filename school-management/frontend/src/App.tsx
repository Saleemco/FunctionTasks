import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import Subjects from "./pages/Subjects";
import Results from "./pages/Results";
import Fees from "./pages/Fees";
import ParentFees from "./pages/ParentFees";
import TermManagement from "./components/admin/terms/TermManagement";
import SessionManagement from "./components/admin/SessionManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="classes" element={<Classes />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="results" element={<Results />} />
              <Route path="fees" element={<Fees />} />
              <Route path="parent-fees" element={
                <ProtectedRoute allowedRoles={['PARENT']}>
                  <ParentFees />
                </ProtectedRoute>
              } />
              <Route path="admin/terms" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL']}>
                  <TermManagement />
                </ProtectedRoute>
              } />
              <Route path="admin/sessions" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL']}>
                  <SessionManagement />
                </ProtectedRoute>
              } />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;