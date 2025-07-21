import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Typography, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { instance } from '../../api/axios';

const { Title, Text } = Typography;
const { Option } = Select;

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const registerMutation = useMutation({
    mutationFn: (data) => instance.post('/api/auth/register', data),
    onSuccess: () => {
      navigate('/login');
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Ошибка регистрации. Попробуйте снова.');
    },
  });

  const onFinish = (values) => {
    setError('');
    registerMutation.mutate(values);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card style={{ width: 400, padding: 20, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Регистрация
        </Title>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Пожалуйста, введите ваше имя!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Имя пользователя" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Пожалуйста, введите ваш email!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Пожалуйста, введите ваш пароль!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Пожалуйста, подтвердите ваш пароль!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Пароли не совпадают!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Подтвердите пароль" />
          </Form.Item>

          <Form.Item
            name="gender"
            rules={[{ required: true, message: 'Пожалуйста, выберите ваш пол!' }]}
          >
            <Select placeholder="Выберите пол">
              <Option value="male">Мужской</Option>
              <Option value="female">Женский</Option>
              <Option value="other">Другое</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="age"
            rules={[{ required: true, message: 'Пожалуйста, введите ваш возраст!' }]}
          >
            <Input type="number" placeholder="Возраст" min={1} max={120} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={registerMutation.isPending} style={{ width: '100%' }}>
              Зарегистрироваться
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text>
            Уже есть аккаунт? <a href="/login">Войдите</a>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Register;
