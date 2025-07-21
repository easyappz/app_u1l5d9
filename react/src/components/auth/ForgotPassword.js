import React, { useState } from 'react';
import { Form, Input, Button, Card, Alert, Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { instance } from '../../api/axios';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const forgotPasswordMutation = useMutation({
    mutationFn: (data) => instance.post('/api/auth/forgot-password', data),
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Ошибка. Попробуйте снова.');
    },
  });

  const onFinish = (values) => {
    setError('');
    forgotPasswordMutation.mutate(values);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card style={{ width: 400, padding: 20, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Восстановление пароля
        </Title>
        {success ? (
          <Alert
            message="Инструкции отправлены"
            description="Проверьте ваш email для получения инструкций по восстановлению пароля."
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
        ) : (
          <>
            {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
            <Form
              name="forgot-password"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                name="email"
                rules={[{ required: true, message: 'Пожалуйста, введите ваш email!' }]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={forgotPasswordMutation.isPending} style={{ width: '100%' }}>
                  Отправить инструкции
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text>
            Вернуться к <a href="/login">входу</a>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
