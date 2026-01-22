import React from 'react';
import { Modal, Typography, Divider, Tag, Spin, Alert, Space, Steps } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store/store';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  video: any;
}

// Маппинг статусов на шаги
const STATUS_TO_STEP: Record<string, number> = {
  'pending': 0,
  'parsing': 1,
  'analysis': 2,
  'completed': 3,
  'failed': -1,
};

export const VideoRepeatModal: React.FC<Props> = ({ open, onClose, video }) => {
  const { pendingVideoIds, analysisTasks } = useSelector(
    (state: RootState) => state.repeat,
  );
  const { description, error } = useSelector((state: RootState) => state.repeat);

  // Получаем состояние задачи анализа для текущего видео
  const analysisTask = video ? analysisTasks[video._id] : null;
  const isProcessing = video && pendingVideoIds.includes(video._id);
  const currentStatus = analysisTask?.status;
  const statusMessage = analysisTask?.message;

  // Определяем анализ: либо из завершенной задачи, либо из description
  const analysis = analysisTask?.analysis || description?.analysis;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnHidden={true}
      width={800}
      style={{ maxHeight: '90vh' }}
      styles={{
        body: {
          maxHeight: 'calc(90vh - 110px)',
          overflowY: 'auto',
          padding: '24px'
        }
      }}
    >
      <Title level={3}>🎯 Как повторить формат</Title>
      <Text type="secondary">Разбор вирусного видео и рекомендации для вашего бизнеса</Text>

      <Divider />

      {/* Загрузка с прогрессом */}
      {video && isProcessing && (
        <div style={{ padding: '40px 20px' }}>
          <Steps
            current={STATUS_TO_STEP[currentStatus || 'pending']}
            status={currentStatus === 'failed' ? 'error' : 'process'}
            items={[
              {
                title: 'В очереди',
                description: currentStatus === 'pending' ? 'Ожидание обработки...' : '',
                icon: currentStatus === 'pending' ? <LoadingOutlined /> : <CheckCircleOutlined />,
              },
              {
                title: 'Парсинг',
                description: currentStatus === 'parsing' ? 'Загрузка видео...' : '',
                icon: currentStatus === 'parsing' ? <LoadingOutlined /> :
                      STATUS_TO_STEP[currentStatus || 'pending'] > 1 ? <CheckCircleOutlined /> : <ClockCircleOutlined />,
              },
              {
                title: 'AI анализ',
                description: currentStatus === 'analysis' ? 'Анализируем контент...' : '',
                icon: currentStatus === 'analysis' ? <LoadingOutlined /> :
                      STATUS_TO_STEP[currentStatus || 'pending'] > 2 ? <CheckCircleOutlined /> : <ClockCircleOutlined />,
              },
              {
                title: 'Готово',
                description: '',
                icon: currentStatus === 'completed' ? <CheckCircleOutlined /> : <ClockCircleOutlined />,
              },
            ]}
          />
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Text strong style={{ fontSize: 16 }}>{statusMessage || 'Обработка...'}</Text>
            <br/>
            <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
              Анализ видео может длиться до 30 секунд
            </Text>
            <Text type="secondary">
              Вы можете закрыть окно и вернуться позже - статус сохранится
            </Text>
          </div>
        </div>
      )}

      {/* Ошибка */}
      {error && (
        <Alert
          message="Ошибка"
          description="Не удалось получить анализ видео. Попробуйте еще раз."
          type="error"
          showIcon
        />
      )}

      {/* Нет данных */}
      {video && !isProcessing && !error && !analysis && currentStatus !== 'failed' && (
        <Alert
          message="Данные недоступны"
          description="Анализ видео пока недоступен. Нажмите на карточку видео для запуска анализа."
          type="warning"
          showIcon
        />
      )}

      {/* Ошибка анализа */}
      {video && currentStatus === 'failed' && (
        <Alert
          message="Ошибка анализа"
          description="Не удалось проанализировать видео. Попробуйте еще раз позже."
          type="error"
          showIcon
        />
      )}

      {/* Основной контент */}
      {video && !isProcessing && !error && analysis && (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>

          {/* Адаптация под бизнес */}
          {analysis.businessAdaptation && (
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '20px',
              borderRadius: '12px',
              color: 'white'
            }}>
              <Title level={4} style={{ color: 'white', margin: 0 }}>
                {analysis.businessAdaptation.title}
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.95)', marginTop: 12, marginBottom: 8 }}>
                {analysis.businessAdaptation.connectionIdea}
              </Paragraph>
              <div style={{ marginTop: 12 }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                  <strong>Целевая аудитория:</strong> {analysis.businessAdaptation.targetAudienceMatch}
                </Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                  <strong>Уникальный угол:</strong> {analysis.businessAdaptation.uniqueAngle}
                </Text>
              </div>
            </div>
          )}

          {/* План съёмки */}
          {analysis.shootingPlan && (
            <div style={{
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              padding: '16px',
              borderRadius: '12px'
            }}>
              <Title level={5} style={{ marginTop: 0, color: '#389e0d' }}>
                {analysis.shootingPlan.title}
              </Title>
              <Paragraph style={{ marginBottom: 8 }}>{analysis.shootingPlan.concept}</Paragraph>
              <Space size="large">
                <Text><strong>⏱ Длительность:</strong> {analysis.shootingPlan.duration} сек</Text>
                <Text><strong>🎭 Настроение:</strong> {analysis.shootingPlan.mood}</Text>
              </Space>
            </div>
          )}

          {/* HOOK */}
          {analysis.hook && (
            <div style={{
              border: '2px solid #ff4d4f',
              borderRadius: '12px',
              padding: '20px',
              background: '#fff1f0'
            }}>
              <Title level={4} style={{ marginTop: 0, color: '#cf1322' }}>
                {analysis.hook.title}
              </Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                {analysis.hook.goal}
              </Text>

              {/* Описание кадра */}
              {analysis.hook.frame && (
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>📹 Описание кадра:</Text>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #ffccc7' }}>
                    <div><Text type="secondary">Локация:</Text> {analysis.hook.frame.setting}</div>
                    <div><Text type="secondary">В кадре:</Text> {analysis.hook.frame.subject}</div>
                    <div><Text type="secondary">Композиция:</Text> {analysis.hook.frame.composition}</div>
                    <div><Text type="secondary">Свет:</Text> {analysis.hook.frame.lighting}</div>
                    {analysis.hook.frame.props && (
                      <div><Text type="secondary">Реквизит:</Text> {analysis.hook.frame.props}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Озвучка */}
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>🎙️ Текст озвучки:</Text>
                <Paragraph style={{
                  marginBottom: 0,
                  fontStyle: 'italic',
                  background: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ffccc7'
                }}>
                  "{analysis.hook.voiceover}"
                </Paragraph>
              </div>

              {/* Текст на экране */}
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>📱 Текст на экране:</Text>
                <div style={{
                  background: '#262626',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  {analysis.hook.onScreenText}
                </div>
              </div>

              {/* Интеграция бизнеса */}
              {analysis.hook.businessIntegration && (
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #ffccc7' }}>
                  <Text type="secondary">💼 Интеграция бизнеса: </Text>
                  <Text>{analysis.hook.businessIntegration}</Text>
                </div>
              )}
            </div>
          )}

          {/* ИНТРИГА */}
          {analysis.intrigue && (
            <div style={{
              border: '2px solid #faad14',
              borderRadius: '12px',
              padding: '20px',
              background: '#fffbe6'
            }}>
              <Title level={4} style={{ marginTop: 0, color: '#d48806' }}>
                {analysis.intrigue.title}
              </Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                {analysis.intrigue.goal}
              </Text>

              {/* Описание кадра */}
              {analysis.intrigue.frame && (
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>📹 Описание кадра:</Text>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #ffe58f' }}>
                    <div><Text type="secondary">Локация:</Text> {analysis.intrigue.frame.setting}</div>
                    <div><Text type="secondary">В кадре:</Text> {analysis.intrigue.frame.subject}</div>
                    <div><Text type="secondary">Композиция:</Text> {analysis.intrigue.frame.composition}</div>
                    {analysis.intrigue.frame.transition && (
                      <div><Text type="secondary">Переход:</Text> {analysis.intrigue.frame.transition}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Озвучка */}
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>🎙️ Текст озвучки:</Text>
                <Paragraph style={{
                  marginBottom: 0,
                  fontStyle: 'italic',
                  background: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ffe58f'
                }}>
                  "{analysis.intrigue.voiceover}"
                </Paragraph>
              </div>

              {/* Текст на экране */}
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>📱 Текст на экране:</Text>
                <div style={{
                  background: '#262626',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  {analysis.intrigue.onScreenText}
                </div>
              </div>

              {/* Эмоциональный крючок */}
              {analysis.intrigue.emotionalHook && (
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #ffe58f' }}>
                  <Text type="secondary">💡 Эмоция зрителя: </Text>
                  <Text>{analysis.intrigue.emotionalHook}</Text>
                </div>
              )}
            </div>
          )}

          {/* ОСНОВНОЙ КОНТЕНТ */}
          {analysis.mainContent && (
            <div style={{
              border: '2px solid #52c41a',
              borderRadius: '12px',
              padding: '20px',
              background: '#f6ffed'
            }}>
              <Title level={4} style={{ marginTop: 0, color: '#389e0d' }}>
                {analysis.mainContent.title}
              </Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                {analysis.mainContent.goal}
              </Text>

              {/* Сегменты */}
              {analysis.mainContent.segments?.map((segment: any, index: number) => (
                <div key={index} style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #b7eb8f',
                  marginBottom: 12
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text strong>{segment.name}</Text>
                    <Tag color="green">{segment.duration}</Tag>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text type="secondary">📹 Кадр: </Text>
                    <Text>{segment.frame}</Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text type="secondary">🎙️ Озвучка: </Text>
                    <Text italic>"{segment.voiceover}"</Text>
                  </div>
                  <div style={{
                    background: '#262626',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: 8
                  }}>
                    {segment.onScreenText}
                  </div>
                  <div>
                    <Text type="secondary">💼 Ценность: </Text>
                    <Text>{segment.businessValue}</Text>
                  </div>
                </div>
              ))}

              {/* Ключевое сообщение */}
              {analysis.mainContent.keyMessage && (
                <div style={{
                  background: '#389e0d',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  marginTop: 8
                }}>
                  <Text strong style={{ color: 'white' }}>
                    💬 Ключевое сообщение: {analysis.mainContent.keyMessage}
                  </Text>
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          {analysis.cta && (
            <div style={{
              border: '2px solid #1890ff',
              borderRadius: '12px',
              padding: '20px',
              background: '#e6f7ff'
            }}>
              <Title level={4} style={{ marginTop: 0, color: '#0050b3' }}>
                {analysis.cta.title}
              </Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                {analysis.cta.goal}
              </Text>

              {/* Описание кадра */}
              {analysis.cta.frame && (
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>📹 Описание кадра:</Text>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #91d5ff' }}>
                    <div><Text type="secondary">Локация:</Text> {analysis.cta.frame.setting}</div>
                    <div><Text type="secondary">В кадре:</Text> {analysis.cta.frame.subject}</div>
                    <div><Text type="secondary">Энергия:</Text> {analysis.cta.frame.energy}</div>
                  </div>
                </div>
              )}

              {/* Озвучка */}
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>🎙️ Текст озвучки:</Text>
                <Paragraph style={{
                  marginBottom: 0,
                  fontStyle: 'italic',
                  background: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #91d5ff'
                }}>
                  "{analysis.cta.voiceover}"
                </Paragraph>
              </div>

              {/* Текст на экране */}
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>📱 Текст на экране:</Text>
                <div style={{
                  background: '#262626',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  {analysis.cta.onScreenText}
                </div>
              </div>

              {/* Целевое действие и срочность */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {analysis.cta.targetAction && (
                  <Tag color="blue" style={{ padding: '4px 12px' }}>
                    🎯 {analysis.cta.targetAction}
                  </Tag>
                )}
                {analysis.cta.urgencyElement && (
                  <Tag color="red" style={{ padding: '4px 12px' }}>
                    ⚡ {analysis.cta.urgencyElement}
                  </Tag>
                )}
              </div>
            </div>
          )}

          <Divider />

          {/* Техническое руководство */}
          {analysis.productionGuide && (
            <div style={{
              background: '#f5f5f5',
              padding: '20px',
              borderRadius: '12px'
            }}>
              <Title level={5} style={{ marginTop: 0 }}>
                {analysis.productionGuide.title}
              </Title>

              {/* Оборудование */}
              {analysis.productionGuide.equipment && (
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>📷 Оборудование:</Text>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div><Text type="secondary">Камера:</Text> {analysis.productionGuide.equipment.camera}</div>
                    <div><Text type="secondary">Звук:</Text> {analysis.productionGuide.equipment.audio}</div>
                    <div><Text type="secondary">Свет:</Text> {analysis.productionGuide.equipment.lighting}</div>
                    <div><Text type="secondary">Стабилизация:</Text> {analysis.productionGuide.equipment.stabilization}</div>
                  </div>
                </div>
              )}

              {/* Советы по съёмке */}
              {analysis.productionGuide.shootingTips && (
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>🎬 Советы по съёмке:</Text>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {analysis.productionGuide.shootingTips.map((tip: string, index: number) => (
                      <div key={index} style={{ display: 'flex', gap: 8 }}>
                        <span style={{ color: '#52c41a' }}>✓</span>
                        <Text>{tip}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Советы по монтажу */}
              {analysis.productionGuide.editingTips && (
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>✂️ Советы по монтажу:</Text>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {analysis.productionGuide.editingTips.map((tip: string, index: number) => (
                      <div key={index} style={{ display: 'flex', gap: 8 }}>
                        <span style={{ color: '#1890ff' }}>✓</span>
                        <Text>{tip}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Музыка */}
              {analysis.productionGuide.musicRecommendation && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>🎵 Музыка:</Text>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px' }}>
                    <div><Text type="secondary">Стиль:</Text> {analysis.productionGuide.musicRecommendation.style}</div>
                    <div><Text type="secondary">Темп:</Text> {analysis.productionGuide.musicRecommendation.tempo}</div>
                    <div><Text type="secondary">Где искать:</Text> {analysis.productionGuide.musicRecommendation.examples}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Копирайтинг */}
          {analysis.copywriting && (
            <div>
              <Title level={5}>{analysis.copywriting.title}</Title>

              {/* Описание поста */}
              {analysis.copywriting.caption && (
                <div style={{
                  background: '#f0f0f0',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: 16
                }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>📝 Описание поста:</Text>
                  <Paragraph style={{ marginBottom: 0 }}>{analysis.copywriting.caption.text}</Paragraph>
                </div>
              )}

              {/* Хэштеги */}
              {analysis.copywriting.hashtags && (
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>🏷️ Хэштеги:</Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {analysis.copywriting.hashtags.primary?.map((tag: string, index: number) => (
                      <Tag key={`p-${index}`} color="blue">{tag}</Tag>
                    ))}
                    {analysis.copywriting.hashtags.secondary?.map((tag: string, index: number) => (
                      <Tag key={`s-${index}`} color="geekblue">{tag}</Tag>
                    ))}
                    {analysis.copywriting.hashtags.niche?.map((tag: string, index: number) => (
                      <Tag key={`n-${index}`} color="purple">{tag}</Tag>
                    ))}
                  </div>
                </div>
              )}

              {/* Стратегия комментариев */}
              {analysis.copywriting.commentsStrategy && (
                <div style={{ background: '#fff7e6', border: '1px solid #ffd591', padding: '16px', borderRadius: '8px' }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>💬 Стратегия комментариев:</Text>
                  {analysis.copywriting.commentsStrategy.pinComment && (
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary">Закреплённый комментарий: </Text>
                      <Text>"{analysis.copywriting.commentsStrategy.pinComment}"</Text>
                    </div>
                  )}
                  {analysis.copywriting.commentsStrategy.engagementQuestion && (
                    <div>
                      <Text type="secondary">Вопрос для вовлечения: </Text>
                      <Text>"{analysis.copywriting.commentsStrategy.engagementQuestion}"</Text>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </Space>
      )}
    </Modal>
  );
};