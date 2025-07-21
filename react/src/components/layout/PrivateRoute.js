import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { instance } from '../../api/axios';

const PrivateRoute = ({ children }) => {
  const location = useLocation();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: () => instance.get('/api/user').then(res => res.data),
    retry: false,
  });

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: 50 }}>Загрузка...</div>;
  }

  if (error || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
