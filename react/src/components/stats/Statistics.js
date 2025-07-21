import React from 'react';
import { Card, Typography, Statistic, Row, Col, Alert, Spin, Divider } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { instance } from '../../api/axios';

const { Title, Text } = Typography;

const Statistics = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['statistics'],
    queryFn: () => instance.get('/api/stats').then(res => res.data),
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
      <Card style={{ width: '90%', maxWidth: 800, padding: 20, boxShadow: '0 4px 8px rgba(0,0,0,0.1)', marginTop: 20 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Статистика
        </Title>
        {error && (
          <Alert
            message="Ошибка"
            description={error.response?.data?.message || 'Не удалось загрузить статистику. Попробуйте снова.'}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
            <Text>Загрузка...</Text>
          </div>
        ) : stats ? (
          <>
            <Row gutter={[16, 16]} justify="center">
              <Col xs={24} sm={12} md={8}>
                <Statistic title="Текущие баллы" value={stats.points} />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Statistic title="Загружено фотографий" value={stats.uploadedPhotos} />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Statistic title="Оценено фотографий" value={stats.ratedPhotos} />
              </Col>
            </Row>
            <Divider orientation="left">Средние оценки по категориям</Divider>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Statistic title="Средняя оценка (Мужчины)" value={stats.averageRatingByMale || '-'} precision={1} />
              </Col>
              <Col xs={24} sm={12}>
                <Statistic title="Средняя оценка (Женщины)" value={stats.averageRatingByFemale || '-'} precision={1} />
              </Col>
              <Col xs={24} sm={12}>
                <Statistic title="Средняя оценка (Возраст 18-25)" value={stats.averageRatingByAge1825 || '-'} precision={1} />
              </Col>
              <Col xs={24} sm={12}>
                <Statistic title="Средняя оценка (Возраст 26-35)" value={stats.averageRatingByAge2635 || '-'} precision={1} />
              </Col>
              <Col xs={24} sm={12}>
                <Statistic title="Средняя оценка (Возраст 36+)" value={stats.averageRatingByAge36Plus || '-'} precision={1} />
              </Col>
            </Row>
          </>
        ) : (
          <Alert
            message="Данные отсутствуют"
            description="Статистика пока недоступна."
            type="info"
            showIcon
          />
        )}
      </Card>
    </div>
  );
};

export default Statistics;
