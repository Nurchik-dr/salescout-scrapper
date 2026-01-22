import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Space, Typography } from 'antd';
import { WhatsAppOutlined } from '@ant-design/icons';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { registration } from '../../shared/api/login';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toaster } from '../../shared/ui/toaster/toaster';
import { useAppSelector } from '../../app/store/hooks';
const { Text } = Typography;

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  const onSubmit = async (values: any) => {
    values.phoneNumber = values.phoneNumber.replace(/[^\d]/g, '');
    setLoading(true);

    try {
      await registration({
        phoneNumber: values.phoneNumber,
      });

      const redirectUri = searchParams.get('redirect_uri');
      if (redirectUri) {
        sessionStorage.setItem('redirect_uri', redirectUri);
      }
      navigate(
        '/verification' +
          (searchParams.get('refCode') ? `?refCode=${searchParams.get('refCode')}` : ''),
        { state: { previousPage: '/registration', phoneNumber: values.phoneNumber } },
      );
    } catch (error: any) {
      console.log(error);
      toaster.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Card title="Регистрация" style={{ width: 350 }}>
      <Form name="registration" layout="vertical" onFinish={onSubmit}>
        <Form.Item
          label="Номер телефона"
          name="phoneNumber"
          rules={[
            { required: true, message: 'Введите номер телефона' },
          ]}
          style={{ marginBottom: 9 }}
        >
          <PhoneInput disableDropdown={true} placeholder="+7 777 777 77 77" country={'kz'} />
        </Form.Item>

        <div style={{ marginBottom: 12 }}>
          <Space size={6}>
            <WhatsAppOutlined style={{ color: '#25D366' }} />
            <Text type="secondary" style={{ fontSize: 13 }}>
              Код будет отправлен вам на WhatsApp
            </Text>
          </Space>
        </div>

        <Form.Item style={{ marginBottom: 5 }}>
          <Button disabled={loading} type="primary" htmlType="submit" block>
            {loading ? 'Загрузка...' : 'Подтвердить и отправить код'}
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 0 }}>
        <span>Уже есть аккаунт? </span>
        <Link to="/login">Войти</Link>
      </div>
    </Card>
  );
};

export default RegistrationForm;
