import React from 'react';
import CompanyDesk from '../../widgets/company/companyDesk';
import { TestWebSocket } from '../../shared/ui/TestWebSocket';

const CompanyPage = () => {
  return (
    <div
      style={{
        padding: '24px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/*<TestWebSocket />*/}
      <CompanyDesk />
    </div>
  );
};

export default CompanyPage;
