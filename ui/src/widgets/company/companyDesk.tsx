import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Input, Space, Tag, Switch, Row, Col, Modal, Popconfirm } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Company } from '../../shared/api/company';
import { toaster } from '../../shared/ui/toaster/toaster';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import {
  getAllCompaniesThunk,
  createCompanyThunk,
  updateCompanyThunk,
  deleteCompanyThunk,
} from './company.store';
import { Link } from 'react-router-dom';
import { IValues } from '../../pages/company/company.type';
import { getSearchTask } from '../../shared/api/searchTaskApi';
import { createTaskThunk } from '../searchTasks/searchTaskStore';

const { TextArea } = Input;

const CompanyDesk = () => {
  const dispatch = useAppDispatch();
  const { allCompanies, loading: storeLoading } = useAppSelector((state) => state.company);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const openEditModal = async (company: Company) => {
    try {
      const { data } = await getSearchTask(company._id);
      const value = data.find((item: any) => item.status !== 'completed');
      if (value) {
        return toaster.info('Пока идет анализ контент нельзя изменить компанию');
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        return toaster.error(error.response.data.message);
      }
      return toaster.error('Ошибка при получении задач');
    }

    setEditingCompany(company);
    form.setFieldsValue({
      title: company.title,
      description: company.description,
      hotWord: company.hotWords.join(', '),
      isActive: company.isActive,
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingCompany(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
    form.resetFields();
  };

  useEffect(() => {
    dispatch(getAllCompaniesThunk());
  }, [dispatch]);

  const handleSubmit = async (values: IValues) => {
    setLoading(true);
    const hotWords = values.hotWord.split(',').map((item) => item.replace(/\s+/g, ''));

    try {
      const dto = {
        title: values.title,
        hotWords,
        description: values.description,
        isActive: values.isActive,
      };

      let savedCompany: Company;

      handleCancel();

      if (editingCompany) {
        savedCompany = await dispatch(
          updateCompanyThunk({
            companyId: editingCompany._id,
            dto,
          }),
        ).unwrap();
        toaster.success('Компания успешно обновлена');
      } else {
        savedCompany = await dispatch(createCompanyThunk(dto)).unwrap();
        toaster.success('Компания успешно создана');
      }

      // Запускаем скрапер только для этой компании, если она активна (в фоне)
      if (savedCompany.isActive) {
        await handleStartScraping(savedCompany);
      }

      // Закрываем модалку сразу после успешного сохранения
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Ошибка при сохранении компании';
      toaster.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (companyId: string) => {
    try {
      const { data } = await getSearchTask(companyId);
      const value = data.find((item: any) => item.status !== 'completed');
      if (value) {
        return toaster.info('Пока идет анализ контент нельзя удалить компанию');
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        return toaster.error(error.response.data.message);
      }
      return toaster.error('Ошибка при получении задач');
    }
    try {
      await dispatch(deleteCompanyThunk(companyId)).unwrap();
      toaster.success('Компания успешно удалена');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Ошибка при удалении компании';
      toaster.error(errorMessage);
    }
  };

  const handleStartScraping = async (company: Company) => {
    if (!company.hotWords || company.hotWords.length === 0) {
      toaster.error('У компании нет ключевых слов. Добавьте их для начала сбора данных.');
      return;
    }

    try {
      await dispatch(createTaskThunk({ companyId: company._id })).unwrap();
      toaster.success(`Сбор данных для "${company.title}" запущен!`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Ошибка при запуске сбора данных';
      toaster.error(errorMessage);
    }
  };

  if (storeLoading && allCompanies.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ fontSize: 18 }}>Загрузка компаний...</div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 'bold' }}>Управление компаниями</h1>

        <Button
          type="dashed"
          size="large"
          icon={<PlusOutlined />}
          onClick={openAddModal}
          style={{
            height: 50,
            paddingLeft: 10,
            paddingRight: 10,
            fontSize: 16,
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
          }}
        >
          Добавить компанию
        </Button>
      </div>

      {allCompanies.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#f5f5f5',
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 16, color: '#666', marginBottom: 16 }}>
            У вас пока нет компаний
          </div>
          <div style={{ fontSize: 14, color: '#999' }}>
            Создайте первую компанию для работы с системой
          </div>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {allCompanies.map((company) => (
            <Col key={company._id} xs={24} sm={12} lg={8}>
              <Card
                style={{
                  height: '100%',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                styles={{
                  body: { padding: '16px' },
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                    <Link className="link" to={`/recomendation/${company._id}`}>
                      {company.title}
                    </Link>
                  </h3>
                  <Space size={4}>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => {
                        openEditModal(company);
                      }}
                      style={{ padding: '4px 8px' }}
                    />
                    <Popconfirm
                      title="Удалить компанию?"
                      description="Это действие нельзя отменить"
                      onConfirm={() => handleDelete(company._id)}
                      okText="Удалить"
                      cancelText="Отмена"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        style={{ padding: '4px 8px' }}
                      />
                    </Popconfirm>
                  </Space>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ fontSize: 14, color: '#666' }}>Статус:</span>
                    <Tag color={company.isActive ? 'green' : 'default'}>
                      {company.isActive ? 'Активна' : 'Неактивна'}
                    </Tag>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        color: '#666',
                        marginBottom: 8,
                      }}
                    >
                      Ключевые слова:
                    </div>
                    {company.hotWords.length > 0 ? (
                      <Space size={[4, 8]} wrap>
                        {company.hotWords.map((word, index) => (
                          <Tag key={index} color="blue">
                            {word}
                          </Tag>
                        ))}
                      </Space>
                    ) : (
                      <div style={{ fontSize: 14, color: '#999' }}>Нет ключевых слов</div>
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editingCompany ? 'Редактировать компанию' : 'Добавить компанию'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={500}
        forceRender
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isActive: true }}
        >
          <Form.Item
            label="Название компании"
            name="title"
            rules={[
              { required: true, message: 'Введите название компании' },
              { min: 2, message: 'Минимум 2 символа' },
            ]}
          >
            <Input placeholder="Введите название" size="large" />
          </Form.Item>

          <Form.Item
            label="О вашей компании"
            tooltip="Помогает адаптировать анализ видео под ваш бизнес"
            name="description"
            extra={
              <span style={{ color: '#8c8c8c' }}>
                Например: Мы — онлайн-магазин молодежной одежды ZARA. Продаем стильную повседневную
                одежду и аксессуары. Целевая аудитория — девушки и парни 16-30 лет, следящие за
                трендами.
              </span>
            }
            rules={[
              { required: true, message: 'Заполните описание компании' },
              { min: 20, message: 'Минимум 20 символов для точного анализа' },
              { max: 500, message: 'Максимум 500 символов' },
            ]}
          >
            <TextArea rows={4} placeholder="Расскажите о вашей компании..." maxLength={500} />
          </Form.Item>

          <Form.Item
            label="Ключевые слова"
            name="hotWord"
            tooltip="Напишите ключевые слова через запятую для поиска подходящего контента"
            rules={[{ required: true, message: 'Введите ключевые слова' }]}
          >
            <Input placeholder="Введите ключевые слова" size="large" />
          </Form.Item>

          <Form.Item
            label="Статус активности"
            name="isActive"
            valuePropName="checked"
            layout="horizontal"
          >
            <Switch />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel} disabled={loading}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingCompany ? 'Сохранить' : 'Добавить'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CompanyDesk;
