import React from 'react';
import { Card, Typography, List, Image, Statistic, Alert, Spin, Button, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instance } from '../../api/axios';

const { Title, Text } = Typography;

const MyPhotos = () => {
  const queryClient = useQueryClient();

  const { data: photos, isLoading, error } = useQuery({
    queryKey: ['myPhotos'],
    queryFn: () => instance.get('/api/photos/my').then(res => res.data),
  });

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: () => instance.get('/api/user').then(res => res.data),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (photoId) => instance.post(`/api/photos/${photoId}/toggle-active`),
    onSuccess: () => {
      queryClient.invalidateQueries(['myPhotos']);
      queryClient.invalidateQueries(['user']);
      message.success('Статус фотографии изменен');
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Ошибка при изменении статуса фотографии');
    },
  });

  const handleToggleActive = (photo) => {
    if (!photo.isActive && userData?.points < 10) {
      message.error('Недостаточно баллов для активации. Нужно минимум 10 баллов.');
      return;
    }
    toggleActiveMutation.mutate(photo.id);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
      <Card style={{ width: '90%', maxWidth: 800, padding: 20, boxShadow: '0 4px 8px rgba(0,0,0,0.1)', marginTop: 20 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Мои фотографии
        </Title>
        {error && (
          <Alert
            message="Ошибка"
            description={error.response?.data?.message || 'Не удалось загрузить фотографии. Попробуйте снова.'}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {userData && userData.points < 10 && (
          <Alert
            message={`У вас ${userData.points} баллов. Нужно минимум 10 баллов для активации фото.`}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
            <Text>Загрузка...</Text>
          </div>
        ) : photos && photos.length > 0 ? (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
            dataSource={photos}
            renderItem={(photo) => (
              <List.Item>
                <Card
                  hoverable
                  cover={
                    <Image
                      src={photo.url}
                      alt={photo.title}
                      style={{ height: 200, objectFit: 'cover' }}
                      preview={{ mask: 'Просмотреть' }}
                    />
                  }
                  actions={
                    [
                      <Button
                        key="toggle"
                        type={photo.isActive ? 'default' : 'primary'}
                        onClick={() => handleToggleActive(photo)}
                        loading={toggleActiveMutation.isPending}
                        disabled={!photo.isActive && userData?.points < 10}
                      >
                        {photo.isActive ? 'Деактивировать' : 'Активировать (10 баллов)'}
                      </Button>
                    ]
                  }
                >
                  <Card.Meta
                    title={photo.title}
                    description={
                      <div>
                        <Statistic title="Средняя оценка" value={photo.averageRating || '-'} precision={1} />
                        <Statistic title="Количество оценок" value={photo.ratingCount} />
                        <Text type={photo.isActive ? 'success' : 'secondary'}>
                          Статус: {photo.isActive ? 'Активна для оценки' : 'Неактивна'}
                        </Text>
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Alert
            message="Фотографии отсутствуют"
            description="Вы еще не загрузили ни одной фотографии."
            type="info"
            showIcon
          />
        )}
      </Card>
    </div>
  );
};

export default MyPhotos;
