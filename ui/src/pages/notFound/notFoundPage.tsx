import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="Такой страницы не существует"
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            На главную
          </Button>
        }
      />
    </div>
  );
};

export default NotFoundPage;
