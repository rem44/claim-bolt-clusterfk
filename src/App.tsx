import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { ClaimsProvider } from './context/ClaimsContext';
import { ProductsProvider } from './context/ProductsContext';
import { InvoicesProvider } from './context/InvoicesContext';
import { ClientsProvider } from './context/ClientsContext';

function App() {
  return (
    <ClaimsProvider>
      <ClientsProvider>
        <ProductsProvider>
          <InvoicesProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Layout />}>
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
            </Router>
          </InvoicesProvider>
        </ProductsProvider>
      </ClientsProvider>
    </ClaimsProvider>
  );
}

export default App;