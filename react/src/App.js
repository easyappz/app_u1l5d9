import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Layout } from 'antd';
import ruRU from 'antd/locale/ru_RU';

import ErrorBoundary from './ErrorBoundary';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import UploadPhoto from './components/photo/UploadPhoto';
import RatePhotos from './components/photo/RatePhotos';
import MyPhotos from './components/photo/MyPhotos';
import Statistics from './components/stats/Statistics';
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/layout/PrivateRoute';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={ruRU}>
          <Router>
            <Layout>
              <Navbar />
              <Layout.Content style={{ padding: '20px', minHeight: 'calc(100vh - 64px)' }}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/upload" element={
                    <PrivateRoute>
                      <UploadPhoto />
                    </PrivateRoute>
                  } />
                  <Route path="/rate" element={
                    <PrivateRoute>
                      <RatePhotos />
                    </PrivateRoute>
                  } />
                  <Route path="/my-photos" element={
                    <PrivateRoute>
                      <MyPhotos />
                    </PrivateRoute>
                  } />
                  <Route path="/statistics" element={
                    <PrivateRoute>
                      <Statistics />
                    </PrivateRoute>
                  } />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </Layout.Content>
            </Layout>
          </Router>
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
