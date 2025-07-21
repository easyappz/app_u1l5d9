import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Layout, Typography, Button } from 'antd';
import { HomeOutlined, UploadOutlined, StarOutlined, BarChartOutlined, LogoutOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { instance } from '../../api/axios';

const { Header } = Layout;
const { Title, Text } = Typography;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => instance.get('/api/user').then(res => res.data),
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: () => instance.post('/api/auth/logout'),
    onSuccess: () => {
      navigate('/login');
    },
  });

  const handleMenuClick = (e) => {
    navigate(e.key);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isAuthenticated = !!user;
  const items = isAuthenticated
    ? [
        { key: '/rate', icon: <StarOutlined />, label: 'Оценить' },
        { key: '/upload', icon: <UploadOutlined />, label: 'Загрузить' },
        { key: '/my-photos', icon: <HomeOutlined />, label: 'Мои фото' },
        { key: '/statistics', icon: <BarChartOutlined />, label: 'Статистика' },
      ]
    : [];

  return (
    <Header style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center' }}>
      <Title level={3} style={{ margin: 0, flex: 1, cursor: 'pointer' }} onClick={() => navigate(isAuthenticated ? '/rate' : '/login')}>
        ФотоОценка
      </Title>
      {isAuthenticated && (
        <>
          <Text style={{ marginRight: 16 }}>Баллы: {user?.points || 0}</Text>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={items}
            onClick={handleMenuClick}
            style={{ flex: 1, justifyContent: 'center' }}
          />
          <Button
            type="link"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            loading={logoutMutation.isPending || isLoading}
          >
            Выйти
          </Button>
        </>
      )}
    </Header>
  );
};

export default Navbar;
