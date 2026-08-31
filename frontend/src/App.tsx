import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Investigations } from './pages/Investigations';
import { InvestigationDetail } from './pages/InvestigationDetail';
import { NetworkExplorer } from './pages/NetworkExplorer';
import { EntityProfile } from './pages/EntityProfile';
import { AlertsPage } from './pages/AlertsPage';
import { IngestionPage } from './pages/IngestionPage';
import { EntityResolutionPage } from './pages/EntityResolutionPage';
import { TimelinePage } from './pages/TimelinePage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SystemAnalyticsPage } from './pages/SystemAnalyticsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="investigations" element={<Investigations />} />
            <Route path="investigations/:id" element={<InvestigationDetail />} />
            <Route path="explorer" element={<NetworkExplorer />} />
            <Route path="entities/:id" element={<EntityProfile />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="ingestion" element={<IngestionPage />} />
            <Route path="resolution" element={<EntityResolutionPage />} />
            <Route path="timeline" element={<TimelinePage />} />
            <Route path="analytics" element={<SystemAnalyticsPage />} />
            <Route path="audit" element={<AuditLogPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
