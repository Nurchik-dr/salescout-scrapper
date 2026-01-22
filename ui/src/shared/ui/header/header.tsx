import React from 'react';
import { Layout, Dropdown, Avatar, Select, Space, Typography, MenuProps } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../app/store/hooks';
import { logout } from '../../../widgets/user/userStore';
import { toaster } from '../toaster/toaster';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store/store';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const menuItems: MenuProps['items'] = [
  {
    key: 'company',
    icon: <SettingOutlined />,
    label: 'Мои компании',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Выйти',
  },
];

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.user);

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'logout':
        toaster.success('Вы успешно вышли из системы');
        dispatch(logout());
        navigate('/login');
        break;
      case 'company':
        navigate('/');
    }
  };

  return (
    <AntHeader
      style={{
        padding: '15px 16px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 18,
            cursor: 'pointer',
          }}
        >
          <Link to={'/'}>
            SaleScout
          </Link>
        </div>
      </div>

      <Space size="large">
        {/*<Select*/}
        {/*  defaultValue="ru"*/}
        {/*  size="small"*/}
        {/*  style={{ width: 70 }}*/}
        {/*  options={[*/}
        {/*    { value: 'ru', label: 'Ру' },*/}
        {/*    { value: 'en', label: 'En' },*/}
        {/*    { value: 'kz', label: 'Kz' },*/}
        {/*  ]}*/}
        {/*/>*/}

        <Dropdown
          menu={{ items: menuItems, onClick: onMenuClick }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Space style={{ cursor: 'pointer' }}>
            <Text type="secondary">{user?.phoneNumber}</Text>
            <Avatar size="small" icon={<UserOutlined />} />
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
