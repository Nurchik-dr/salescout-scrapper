import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Progress } from 'antd';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUserDataThunk, setPasswordRequest } from '../../shared/api/login';
import { useAppDispatch } from '../../app/store/hooks';
import { toaster } from '../../shared/ui/toaster/toaster';

interface IValues {
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

const PASSWORD_RULES = {
  minLength: 8,
  hasLetter: /[A-Za-z]/,
  hasNumber: /\d/,
};

const SetPasswordForm = () => {
  const [form] = Form.useForm<IValues>();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);
  const token = sessionStorage.getItem('tempToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const phoneNumber = location.state?.phoneNumber;

  const onSubmit = async (values: IValues) => {
    setLoading(true);
    try {
      const res = await setPasswordRequest({
        tempToken: token,
        password: values.password,
      });
      console.log('res', res);
      const accessToken = res.data.access_token;
      localStorage.setItem('access_token', accessToken);
      await dispatch(getUserDataThunk()).unwrap();
      navigate('/');
    } catch (error: any) {
      toaster.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (value: string) => {
    let passed = 0;
    if (value.length >= PASSWORD_RULES.minLength) passed += 1;
    if (PASSWORD_RULES.hasLetter.test(value)) passed += 1;
    if (PASSWORD_RULES.hasNumber.test(value)) passed += 1;
    setStrength((passed / 3) * 100);
  };

  return (
    <Card title="Установка пароля" style={{ width: 350 }}>
      <Form form={form} name="setPassword" layout="vertical" onFinish={onSubmit}>
        {/* Пароль */}
        <Form.Item
          label="Пароль"
          name="password"
          rules={[
            { required: true, message: 'Введите пароль' },
            {
              pattern: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
              message: 'Пароль должен содержать минимум 8 символов, одну букву и одну цифру',
            },
          ]}
          style={{ marginBottom: 5 }}
        >
          <Input.Password
            placeholder="Пароль"
            autoComplete="password"
            onChange={(e) => validatePassword(e.target.value)}
          />
        </Form.Item>

        {/* Индикатор прогресса */}
        {strength > 0 && (
          <Progress
            percent={strength}
            showInfo={false}
            strokeColor={{
              '0%': '#ff4d4f',
              '50%': '#faad14',
              '100%': '#52c41a',
            }}
            style={{ marginBottom: 12 }}
          />
        )}

        {/* Подтвердить пароль */}
        <Form.Item
          label="Подтвердите пароль"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Подтвердите пароль' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Пароли не совпадают'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Подтвердите пароль" autoComplete="confirmPassword" />
        </Form.Item>

        {/* Кнопка */}
        <Form.Item style={{ marginBottom: 5 }}>
          <Button disabled={loading} type="primary" htmlType="submit" block>
            {loading ? 'Загрузка...' : 'Подтвердить'}
          </Button>
        </Form.Item>
      </Form>

      {/* Ссылка на вход */}
      <div style={{ textAlign: 'center', marginTop: 0 }}>
        <span>Уже есть аккаунт? </span>
        <Link to="/login">Войти</Link>
      </div>
    </Card>
  );
};

export default SetPasswordForm;
