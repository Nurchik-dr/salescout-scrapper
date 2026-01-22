import React from 'react';
import RegistrationForm from '../../../widgets/registration/registrationForm';
import SetPasswordForm from '../../../widgets/setPassword/setPasswordForm';

const SetPasswordPage = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <SetPasswordForm />
    </div>
  );
};

export default SetPasswordPage;
