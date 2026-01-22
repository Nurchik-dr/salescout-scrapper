import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button } from 'antd';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import { Link, useNavigate } from 'react-router-dom';
import { loginThunk } from './loginStore';
import { toaster } from '../../shared/ui/toaster/toaster';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const navigate = useNavigate();

  const onSubmit = async (values: any) => {
    values.phoneNumber = values.phoneNumber.replace(/[^\d]/g, '');
    setLoading(true);
    try {
      await dispatch(
        loginThunk({
          phoneNumber: values.phoneNumber,
          password: values.password,
        }),
      ).unwrap();
    } catch (error: any) {
      console.log(error);
      toaster.error(error.message);
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
    <Card title="Вход" style={{ width: 350 }}>
      <Form
        name="login"
        layout="vertical"
        onFinish={onSubmit}
        onSubmitCapture={(e) => e.preventDefault()}
      >
        <Form.Item
          label="Номер телефона"
          name="phoneNumber"
          rules={[
            { required: true, message: 'Введите номер телефона' },
          ]}
        >
          <PhoneInput disableDropdown={true} placeholder="+7 777 777 77 77" country={'kz'} />
        </Form.Item>

        <Form.Item
          label="Пароль"
          name="password"
          rules={[{ required: true, message: 'Введите пароль' }]}
        >
          <Input.Password placeholder="Пароль" autoComplete="current-password" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 5 }}>
          <Button disabled={loading} type="primary" htmlType="submit" block>
            {loading ? 'Загрузка...' : 'Войти'}
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center', marginTop: 0 }}>
        <span>Нет аккаунта? </span>
        <Link to="/registration">Зарегистрируйтесь</Link>
      </div>
    </Card>
  );
};

export default LoginForm;
