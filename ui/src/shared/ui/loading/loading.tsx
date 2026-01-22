import { Spin } from 'antd';

const Loading = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
        position: 'absolute',
        flexDirection: 'column',
      }}
    >
      <Spin size="large" />
      <div style={{ marginTop: 16, fontSize: 16, color: '#999' }}>Загрузка...</div>
    </div>
  );
};

export default Loading;
