import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import LoginPage from '@pages/Login/LoginPage';
import MainLayout from '@components/layout/MainLayout';
import Dashboard from '@pages/Dashboard/Dashboard';
import ClientsList from '@pages/Clients/ClientsList';
import ClientDetail from '@pages/Clients/ClientDetail';
import QuotesList from '@pages/Quotes/QuotesList';
import NewQuote from '@pages/Quotes/NewQuote';
import QuoteDetail from '@pages/Quotes/QuoteDetail';
import OrdersList from '@pages/Orders/OrdersList';
import OrderDetail from '@pages/Orders/OrderDetail';
import InventoryList from '@pages/Inventory/InventoryList';
import FuseDiagramsViewer from '@pages/FuseDiagrams/FuseDiagramsViewer';

// Componente para proteger rutas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Ruta de Login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rutas protegidas con Layout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  {/* Dashboard */}
                  <Route path="/" element={<Dashboard />} />
                  
                  {/* Clientes */}
                  <Route path="/clientes" element={<ClientsList />} />
                  <Route path="/clientes/:id" element={<ClientDetail />} />
                  
                  {/* Presupuestos */}
                  <Route path="/presupuestos" element={<QuotesList />} />
                  <Route path="/presupuestos/nuevo" element={<NewQuote />} />
                  <Route path="/presupuestos/:id" element={<QuoteDetail />} />
                  
                  {/* Órdenes */}
                  <Route path="/ordenes" element={<OrdersList />} />
                  <Route path="/ordenes/:id" element={<OrderDetail />} />
                  
                  {/* Inventario */}
                  <Route path="/inventario" element={<InventoryList />} />
                  
                  {/* Diagramas */}
                  <Route path="/diagramas" element={<FuseDiagramsViewer />} />
                  
                  {/* Ruta por defecto */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRouter;