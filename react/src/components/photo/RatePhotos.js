import React, { useState } from 'react';
import { Button, Card, Typography, Select, Slider, Alert, Spin } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { instance } from '../../api/axios';

const { Title, Text } = Typography;
const { Option } = Select;

const RatePhotos = () => {
  const [genderFilter, setGenderFilter] = useState('any');
  const [ageRange, setAgeRange] = useState([18, 99]);
  const [rating, setRating] = useState(0);
  const [error, setError] = useState('');

  const { data: photo, isLoading, refetch } = useQuery({
    queryKey: ['photoToRate', genderFilter, ageRange],
    queryFn: () => instance.get(`/api/photos/rate?gender=${genderFilter}&ageMin=${ageRange[0]}&ageMax=${ageRange[1]}`).then(res => res.data),
    staleTime: 0,
  });

  const rateMutation = useMutation({
    mutationFn: (data) => instance.post('/api/photos/rate', data),
    onSuccess: () => {
      refetch(); // Загружаем новое фото
      setRating(0);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Ошибка при оценке. Попробуйте снова.');
    },
  });

  const handleRate = () => {
    if (!photo || rating < 1 || rating > 5) {
      setError('Пожалуйста, выберите оценку от 1 до 5.');
      return;
    }
    rateMutation.mutate({ photoId: photo.id, rating });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
      <Card style={{ width: 600, padding: 20, boxShadow: '0 4px 8px rgba(0,0,0,0.1)', marginTop: 20 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Оценить фотографию
        </Title>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Select
            placeholder="Пол"
            value={genderFilter}
            onChange={(value) => setGenderFilter(value)}
            style={{ width: '30%' }}
            disabled={isLoading || rateMutation.isPending}
          >
            <Option value="any">Любой</Option>
            <Option value="male">Мужской</Option>
            <Option value="female">Женский</Option>
            <Option value="other">Другое</Option>
          </Select>
          <div style={{ width: '60%' }}>
            <Text>Возраст: {ageRange[0]} - {ageRange[1]}</Text>
            <Slider
              range
              min={1}
              max={120}
              value={ageRange}
              onChange={(value) => setAgeRange(value)}
              disabled={isLoading || rateMutation.isPending}
            />
          </div>
        </div>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
            <Text>Загрузка фотографии...</Text>
          </div>
        ) : photo ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <img
                src={photo.url}
                alt={photo.title}
                style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 8 }}
              />
              <Title level={4} style={{ marginTop: 8 }}>{photo.title}</Title>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Text>Ваша оценка:</Text>
              <div>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    type={star <= rating ? 'primary' : 'default'}
                    shape="circle"
                    icon={<StarOutlined />}
                    onClick={() => setRating(star)}
                    disabled={rateMutation.isPending}
                    style={{ margin: '0 5px' }}
                  />
                ))}
              </div>
            </div>
            <Button
              type="primary"
              onClick={handleRate}
              loading={rateMutation.isPending}
              disabled={rating === 0}
              style={{ width: '100%' }}
            >
              Оценить и продолжить
            </Button>
          </>
        ) : (
          <Alert
            message="Фотографии не найдены"
            description="Попробуйте изменить фильтры или вернуться позже."
            type="info"
            showIcon
          />
        )}
      </Card>
    </div>
  );
};

export default RatePhotos;
