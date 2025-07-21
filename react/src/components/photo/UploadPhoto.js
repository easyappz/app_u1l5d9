import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Button, Card, Alert, Typography, Input, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { instance } from '../../api/axios';

const { Title } = Typography;
const { Option } = Select;

const UploadPhoto = () => {
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [genderPreference, setGenderPreference] = useState('any');
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(99);

  const { data: userData, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => instance.get('/api/user').then(res => res.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData) => instance.post('/api/photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      navigate('/my-photos');
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Ошибка загрузки фото. Попробуйте снова.');
    },
  });

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList.slice(-1)); // Оставляем только последнее загруженное фото
  };

  const handleSubmit = () => {
    if (fileList.length === 0) {
      setError('Пожалуйста, загрузите фотографию!');
      return;
    }
    if (!title) {
      setError('Пожалуйста, введите название фотографии!');
      return;
    }
    if (userData?.points < 10) {
      setError('Недостаточно баллов для активации фото. Нужно минимум 10 баллов.');
      return;
    }

    setError('');
    const formData = new FormData();
    formData.append('photo', fileList[0].originFileObj);
    formData.append('title', title);
    formData.append('genderPreference', genderPreference);
    formData.append('ageMin', ageMin);
    formData.append('ageMax', ageMax);

    uploadMutation.mutate(formData);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
      <Card style={{ width: 600, padding: 20, boxShadow: '0 4px 8px rgba(0,0,0,0.1)', marginTop: 20 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Загрузить фотографию
        </Title>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        {userData && userData.points < 10 && (
          <Alert
            message={`У вас ${userData.points} баллов. Нужно минимум 10 баллов для активации фото.`}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Название фотографии"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploadMutation.isPending || isLoading}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Select
            placeholder="Пол аудитории"
            value={genderPreference}
            onChange={(value) => setGenderPreference(value)}
            style={{ width: '100%' }}
            disabled={uploadMutation.isPending || isLoading}
          >
            <Option value="any">Любой</Option>
            <Option value="male">Мужской</Option>
            <Option value="female">Женский</Option>
            <Option value="other">Другое</Option>
          </Select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Input
            type="number"
            placeholder="Минимальный возраст"
            value={ageMin}
            onChange={(e) => setAgeMin(Number(e.target.value))}
            style={{ width: '45%' }}
            min={1}
            max={120}
            disabled={uploadMutation.isPending || isLoading}
          />
          <Input
            type="number"
            placeholder="Максимальный возраст"
            value={ageMax}
            onChange={(e) => setAgeMax(Number(e.target.value))}
            style={{ width: '45%' }}
            min={1}
            max={120}
            disabled={uploadMutation.isPending || isLoading}
          />
        </div>
        <Upload
          accept="image/*"
          fileList={fileList}
          onChange={handleUploadChange}
          beforeUpload={() => false} // Отключаем автоматическую загрузку
          disabled={uploadMutation.isPending || isLoading}
        >
          <Button icon={<UploadOutlined />} disabled={uploadMutation.isPending || isLoading}>
            Выбрать фото
          </Button>
        </Upload>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={uploadMutation.isPending || isLoading}
          style={{ marginTop: 16, width: '100%' }}
          disabled={fileList.length === 0 || !title || userData?.points < 10}
        >
          Загрузить (10 баллов)
        </Button>
      </Card>
    </div>
  );
};

export default UploadPhoto;
