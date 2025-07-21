import React, { useState, useEffect } from 'react';
import { Card, Form, Select, Button, Radio, message, Spin, Empty } from 'antd';
import { instance } from '../../api/axios';

const { Option } = Select;

const RatePhotos = () => {
  const [form] = Form.useForm();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userScore, setUserScore] = useState(0);

  const fetchRandomPhoto = async (filters) => {
    setLoading(true);
    try {
      const response = await instance.get('/api/photos/random', {
        params: filters,
      });
      if (response.data) {
        setPhoto(response.data);
      } else {
        setPhoto(null);
        message.info('Фотографии по заданным фильтрам не найдены.');
      }
    } catch (error) {
      message.error('Ошибка при загрузке фотографии');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Загружаем первую фотографию при монтировании компонента
    fetchRandomPhoto({});
    // Можно добавить загрузку текущего счета пользователя, если есть API
  }, []);

  const onFilterChange = (values) => {
    fetchRandomPhoto(values);
  };

  const handleRate = async (value) => {
    if (!photo) return;
    setLoading(true);
    try {
      await instance.post(`/api/photos/${photo._id}/rate`, { rating: value });
      setUserScore(userScore + value); // Обновляем баллы пользователя
      message.success('Оценка сохранена!');
      fetchRandomPhoto(form.getFieldsValue()); // Загружаем следующую фотографию
    } catch (error) {
      message.error('Ошибка при сохранении оценки');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card title="Оценка фотографий" style={{ marginBottom: 20 }}>
        <Form
          form={form}
          layout="inline"
          initialValues={{ gender: '', age: '' }}
          onValuesChange={(_, values) => onFilterChange(values)}
          style={{ marginBottom: 20 }}
        >
          <Form.Item name="gender" label="Пол">
            <Select placeholder="Выберите пол" style={{ width: 150 }}>
              <Option value="">Любой</Option>
              <Option value="male">Мужской</Option>
              <Option value="female">Женский</Option>
            </Select>
          </Form.Item>
          <Form.Item name="age" label="Возраст">
            <Select placeholder="Выберите возраст" style={{ width: 150 }}>
              <Option value="">Любой</Option>
              <Option value="18-25">18-25</Option>
              <Option value="26-35">26-35</Option>
              <Option value="36-50">36-50</Option>
              <Option value="50+">50+</Option>
            </Select>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <h3>Ваши баллы: {userScore}</h3>
        </div>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : photo ? (
        <Card style={{ textAlign: 'center' }}>
          <img
            src={`/uploads/${photo.filename}`}
            alt="Фото для оценки"
            style={{ maxWidth: '100%', maxHeight: 400, marginBottom: 20 }}
          />
          <div>
            <Radio.Group onChange={(e) => handleRate(e.target.value)}>
              <Radio.Button value={1}>1</Radio.Button>
              <Radio.Button value={2}>2</Radio.Button>
              <Radio.Button value={3}>3</Radio.Button>
              <Radio.Button value={4}>4</Radio.Button>
              <Radio.Button value={5}>5</Radio.Button>
            </Radio.Group>
          </div>
        </Card>
      ) : (
        <Empty description="Фотографии не найдены. Попробуйте изменить фильтры." />
      )}
    </div>
  );
};

export default RatePhotos;
