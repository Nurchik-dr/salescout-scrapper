import React from 'react';
import { Button, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const EmptyWord = () => {
  const navigate = useNavigate();

  const goToSettings = () => {
    navigate('/');
  };
  return (
    <Card
      style={{
        width: 400,
        textAlign: 'center',
        margin: '50px auto',
        padding: 20,
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16 }}>У вас нет горячих слов для показа рекомендаций</Text>
      </div>
      <div style={{ marginBottom: 20 }}>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Чтобы добавить горячие слова, перейдите в настройки
        </Text>
      </div>
      <Button type="primary" onClick={goToSettings}>
        Перейти в настройки
      </Button>
    </Card>
  );
};

export default EmptyWord;
