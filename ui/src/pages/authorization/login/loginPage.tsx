import React from 'react';
import LoginForm from '../../../widgets/login/loginForm';

const LoginPage = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <LoginForm />
    </div>
  );
};

export default LoginPage;
