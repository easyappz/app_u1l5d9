import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { instance } from '../../api/axios';

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: (data) => instance.post('/api/auth/login', data),
    onSuccess: () => {
      navigate('/rate');
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Ошибка входа. Попробуйте снова.');
    },
  });

  const onFinish = (values) => {
    setError('');
    loginMutation.mutate(values);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card style={{ width: 400, padding: 20, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Вход
        </Title>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Пожалуйста, введите ваш email!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Пожалуйста, введите ваш пароль!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loginMutation.isPending} style={{ width: '100%' }}>
              Войти
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text>
            Нет аккаунта? <a href="/register">Зарегистрируйтесь</a>
          </Text>
          <br />
          <Text>
            Забыли пароль? <a href="/forgot-password">Восстановить</a>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
