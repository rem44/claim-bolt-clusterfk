import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ClaimDetails from './pages/ClaimDetails';
import CreateClaim from './pages/CreateClaim';
import SettingsPage from './pages/SettingsPage';
import ClientsPage from './pages/ClientsPage';
import ReportsPage from './pages/ReportsPage';
import AllClaimsPage from './pages/AllClaimsPage';
import HelpPage from './pages/HelpPage';
import AlertsPage from './pages/AlertsPage';
import SmartChatPage from './pages/SmartChatPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import { ClaimsProvider } from './context/ClaimsContext';
import { ProductsProvider } from './context/ProductsContext';
import { InvoicesProvider } from './context/InvoicesContext';
import { ClientsProvider } from './context/ClientsProvider';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Router>
        <AuthProvider>
          <ClaimsProvider>
            <ClientsProvider>
              <ProductsProvider>
                <InvoicesProvider>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Layout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Dashboard />} />
                      <Route path="claims" element={<AllClaimsPage />} />
                      <Route path="claims/:id" element={<ClaimDetails />} />
                      <Route path="claims/new" element={<CreateClaim />} />
                      <Route path="settings" element={<SettingsPage />} />
                      <Route path="clients" element={<ClientsPage />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="help" element={<HelpPage />} />
                      <Route path="alerts" element={<AlertsPage />} />
                      <Route path="chat" element={<SmartChatPage />} />
                    </Route>
                  </Routes>
                </InvoicesProvider>
              </ProductsProvider>
            </ClientsProvider>
          </ClaimsProvider>
        </AuthProvider>
      </Router>
    </SessionContextProvider>
  );
}

export default App;