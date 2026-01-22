import React from 'react';
import RegistrationForm from '../../../widgets/registration/registrationForm';

const RegistrationPage = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <RegistrationForm />
    </div>
  );
};

export default RegistrationPage;
