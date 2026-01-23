import React from 'react';
import CompanyDesk from '../../widgets/company/companyDesk';

const CompanyPage = () => {
  return (
    <div
      style={{
        padding: '24px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <CompanyDesk />
    </div>
  );
};

export default CompanyPage;
