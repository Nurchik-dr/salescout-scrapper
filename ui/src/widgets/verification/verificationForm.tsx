import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Space, Typography } from 'antd';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import { registration, verification } from '../../shared/api/login';
import { toaster } from '../../shared/ui/toaster/toaster';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Text, Link } = Typography;

const OTP_LENGTH = 6;
const RESEND_TIMEOUT = 30;

const VerificationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const previousPage = location.state?.previousPage;
  const phoneNumber = location.state?.phoneNumber;

  useEffect(() => {
    if (!phoneNumber) {
      navigate(previousPage || '/login');
    }
  }, [phoneNumber, navigate, previousPage]);

  const [timer, setTimer] = useState(RESEND_TIMEOUT);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const resendCode = async () => {
    try {
      await registration({
        phoneNumber: phoneNumber,
      });
      setTimer(RESEND_TIMEOUT);
    } catch (error) {
      toaster.error('Не удалось отправить код');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await verification({
        phoneNumber: phoneNumber,
        code: values.code,
      });
      console.log(response);
      sessionStorage.setItem('tempToken', response.data.tempToken);

      navigate('/set-password', {
        state: {
          previousPage,
          redirectUri: sessionStorage.getItem('redirect_uri'),
          phoneNumber: phoneNumber,
        },
      });
    } catch (error: any) {
      console.log(error);
      toaster.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card title="Верификация" style={{ width: 350 }}>
      <Form name="verification" layout="vertical" onFinish={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Код будет отправлен вам на WhatsApp: <strong>{phoneNumber}</strong>
          </Text>
        </div>

        <Form.Item
          name="code"
          rules={[
            { required: true, message: 'Введите код' },
            {
              len: OTP_LENGTH,
              message: `Код должен содержать ${OTP_LENGTH} цифр`,
            },
          ]}
        >
          <Input.OTP length={OTP_LENGTH} autoFocus formatter={(str) => str.replace(/\D/g, '')} />
        </Form.Item>

        <div style={{ marginBottom: 16 }}>
          {timer > 0 ? (
            <Text type="secondary" style={{ fontSize: 13 }}>
              Отправить код повторно через {timer} сек
            </Text>
          ) : (
            <Link onClick={resendCode}>Не получили код? Отправить ещё раз</Link>
          )}
        </div>

        <Form.Item style={{ marginBottom: 5 }}>
          <Button disabled={loading} type="primary" htmlType="submit" block>
            {loading ? 'Загрузка...' : 'Подтвердить'}
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center', marginTop: 0 }}>
        <RouterLink to="/registration">
          <ArrowLeftOutlined /> Вернуться на страницу регистрации
        </RouterLink>
      </div>
    </Card>
  );
};

export default VerificationForm;
