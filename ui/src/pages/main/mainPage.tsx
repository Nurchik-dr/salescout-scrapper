import { useSelector } from 'react-redux';
import { RootState } from '../../app/store/store';
import EmptyWord from '../../shared/ui/emtyWord/emptyWord';
import { Row, Col, Pagination, Select, Space, Tag, Progress, Card } from 'antd';
import { VideoCard } from '../../shared/ui/card/card';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import {
  getTasksThunk,
  getVideosForTaskThunk,
  IVideo,
  setOrder,
  setPage,
  setSortBy,
  ACTIVE_STATUSES,
  clearVideoState,
  updateTaskFromWs,
} from '../../widgets/searchTasks/searchTaskStore';
import { VideoRepeatModal } from '../../shared/ui/analysisModal';
import { toaster } from '../../shared/ui/toaster/toaster';
import {
  getOrCreateRepeat,
  clearAnalysis,
  updateAnalysisFromWs,
  analysisCompleted,
  analysisFailed,
} from '../../widgets/repeat/repeat';
import { useParams } from 'react-router-dom';
import NotFoundPage from '../notFound/notFoundPage';
import Loading from '../../shared/ui/loading/loading';
import { useWebSocket } from '../../shared/hooks/useWebSocket';

// Сообщения для этапа connect (меняются каждые 5 сек)
const CONNECT_MESSAGES = [
  'Подключение к серверу...',
  'Поиск подходящих видео...',
  'Анализ постов...',
  'Загрузка видео...',
];

const MainPage = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const [open, setOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [previousTasksLength, setPreviousTasksLength] = useState(0);
  const [connectMessageIndex, setConnectMessageIndex] = useState(0);
  const { allCompanies } = useAppSelector((state) => state.company);
  const currentCompany = allCompanies.find((item) => item._id === id);

  const { tasks, videos, isLoaded, page, limit, total, totalPages, sortBy, order, loading } =
    useSelector((state: RootState) => state.searchTasks);
  const { pendingVideoIds, analysisTasks } = useSelector((state: RootState) => state.repeat);

  // Проверка статусов
  const hasConnectStatus = tasks.some((task) =>
    ['pending', 'connect', 'analyze'].includes(task.status),
  );
  const hasActiveTasks = tasks.some((task) => ACTIVE_STATUSES.includes(task.status as any));

  // Загрузка задач для текущей компании
  useEffect(() => {
    if (id) {
      dispatch(getTasksThunk({ companyId: id }));
    }
  }, [dispatch, id]);

  // Анимация сообщений для connect (каждые 5 сек)
  useEffect(() => {
    if (!hasConnectStatus) {
      setConnectMessageIndex(0);
      return;
    }

    const intervalId = setInterval(() => {
      setConnectMessageIndex((prev) => (prev < CONNECT_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 5000);

    return () => clearInterval(intervalId);
  }, [hasConnectStatus]);

  // WebSocket подписка на обновления задач
  const { on } = useWebSocket();

  useEffect(() => {
    if (!id) return;

    // Получаем ID задач текущей компании для фильтрации видео
    const companyTaskIds = tasks.map((t) => t._id);

    // Подписываемся на обновления задач - обновляем напрямую через WebSocket данные
    const unsubscribeTaskUpdate = on('task:update', (data: any) => {
      if (data.companyId === id) {
        dispatch(updateTaskFromWs({
          taskId: data.taskId,
          status: data.status,
          progress: data.progress,
          processedVideos: data.processedVideos,
          totalVideos: data.totalVideos,
        }));
      }
    });

    // Подписываемся на завершение задач - обновляем задачу и загружаем видео
    const unsubscribeTaskComplete = on('task:completed', (data: any) => {
      if (data.companyId === id) {
        dispatch(updateTaskFromWs({
          taskId: data.taskId,
          status: data.status,
          progress: data.progress,
        }));
        dispatch(getVideosForTaskThunk({ page, limit, sortBy, order, companyId: id }));
      }
    });

    // Подписываемся на новые видео от скраппера - делаем refetch для корректной пагинации
    const unsubscribeNewVideo = on('video:new', (data: any) => {
      if (data.video && companyTaskIds.includes(data.video.searchTaskId)) {
        // Перезагружаем видео с сервера для корректной пагинации и сортировки
        dispatch(getVideosForTaskThunk({ page, limit, sortBy, order, companyId: id }));
      }
    });

    // Подписываемся на обновления статуса анализа видео
    const unsubscribeAnalysisUpdate = on('analysis:update', (data: any) => {
      if (data.companyId === id) {
        dispatch(updateAnalysisFromWs(data));
      }
    });

    // Подписываемся на завершение анализа
    const unsubscribeAnalysisComplete = on('analysis:completed', (data: any) => {
      if (data.companyId === id) {
        dispatch(analysisCompleted(data));
      }
    });

    // Подписываемся на ошибки анализа
    const unsubscribeAnalysisFailed = on('analysis:failed', (data: any) => {
      if (data.companyId === id) {
        dispatch(analysisFailed(data));
        toaster.error('Анализ видео завершился с ошибкой');
      }
    });

    return () => {
      unsubscribeTaskUpdate();
      unsubscribeTaskComplete();
      unsubscribeNewVideo();
      unsubscribeAnalysisUpdate();
      unsubscribeAnalysisComplete();
      unsubscribeAnalysisFailed();
    };
  }, [on, dispatch, id, page, limit, sortBy, order, tasks]);

  // Загрузка видео для завершенных задач
  useEffect(() => {
    if (!isLoaded) return;

    const hasCompletedTasks = tasks.some((task) => task.status === 'completed');

    if (hasCompletedTasks && id) {
      // Загружаем видео с текущими параметрами пагинации и сортировки
      dispatch(getVideosForTaskThunk({ page, limit, sortBy, order, companyId: id }));
    }
  }, [dispatch, tasks, isLoaded, page, limit, sortBy, order]);

  // Уведомление о завершении скрапинга
  useEffect(() => {
    const currentActiveCount = tasks.filter((task) =>
      ACTIVE_STATUSES.includes(task.status as any),
    ).length;

    setPreviousTasksLength(currentActiveCount);
  }, [tasks, videos.length, previousTasksLength]);

  // Очистка при unmount - ВАЖНО: этот хук должен быть до любых ранних return'ов
  useEffect(() => {
    return () => {
      dispatch(clearVideoState());
    };
  }, [dispatch]);

  // Показываем Loading пока компании не загружены
  if (!allCompanies.length) {
    return <Loading />;
  }

  // Если компания не найдена - показываем 404
  if (!currentCompany) {
    return <NotFoundPage />;
  }

  if (currentCompany.hotWords.length === 0) {
    return <EmptyWord />;
  }

  // Функция для отображения статуса задачи
  const getStatusLabel = (status: string) => {
    // Для connect/pending/analyze показываем анимированное сообщение
    if (['pending', 'connect', 'analyze'].includes(status)) {
      return CONNECT_MESSAGES[connectMessageIndex];
    }
    const statusMap: Record<string, string> = {
      process: 'Обработка данных...',
      completed: 'Завершено',
      failed: 'Ошибка',
    };
    return statusMap[status] || status;
  };

  // Функция для получения прогресса
  // Connect этапы: 0-20% (5%, 10%, 15%, 20%)
  // Process этап: 20-100% (оставшиеся 80% от серверного прогресса)
  const getDisplayProgress = (task: any) => {
    if (['pending', 'connect', 'analyze'].includes(task.status)) {
      // Каждый шаг добавляет 5%: 5%, 10%, 15%, 20%
      return (connectMessageIndex + 1) * 5;
    }
    // Для process: 20% базовых + 80% от реального прогресса сервера
    // Если сервер показывает 0% -> UI показывает 20%
    // Если сервер показывает 100% -> UI показывает 100%
    const serverProgress = task.progress || 0;
    return Math.round(20 + serverProgress * 0.8);
  };

  const repeatHandle = async (video: IVideo) => {
    const existingTask = analysisTasks[video._id];

    // Если анализ уже в процессе, показываем модалку со статусом
    if (pendingVideoIds.includes(video._id) || existingTask?.isProcessing) {
      toaster.info(existingTask?.message || 'Анализ уже выполняется. Следите за статусом.');
      setSelectedVideo(video);
      setOpen(true);
      return;
    }

    // Если анализ уже завершен, показываем результат
    if (existingTask?.status === 'completed' && existingTask?.analysis) {
      setSelectedVideo(video);
      setOpen(true);
      return;
    }

    setSelectedVideo(video);
    setOpen(true);
    try {
      const result = await dispatch(
        getOrCreateRepeat({ videoId: video._id, companyId: currentCompany._id }),
      ).unwrap();

      // Если вернулась задача в процессе, показываем информационный тостер
      if ((result as any).isProcessing) {
        toaster.info((result as any).message || 'Анализ запущен. Следите за статусом.');
      }
    } catch (error: any) {
      toaster.error('Не удалось получить анализ видео');
      console.error('Analysis error:', error);
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
    dispatch(clearAnalysis());
  };

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/* Информация о текущей компании */}
      <div
        style={{
          marginBottom: 24,
          padding: '16px 20px',
          background: '#f6ffed',
          borderRadius: 8,
          border: '1px solid #b7eb8f',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#52c41a' }}>📊 Компания:</span>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>
            {currentCompany.title}
          </span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {currentCompany.hotWords.map((word, index) => (
              <Tag key={index} color="blue">
                {word}
              </Tag>
            ))}
          </div>
        </div>
      </div>

      {/* Отображение прогресса сбора данных */}
      {hasActiveTasks && (
        <Card
          style={{
            marginBottom: 24,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: 12,
          }}
        >
          <div style={{ color: 'white' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 600, color: 'white' }}>
              Сбор данных в процессе...
            </h3>
            {tasks.map((task) => {
              if (ACTIVE_STATUSES.includes(task.status as any)) {
                const progressPercent = getDisplayProgress(task);

                return (
                  <div key={task._id} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{task.hotWord}</span>
                      <Tag color="cyan" style={{ marginLeft: 8 }}>
                        {getStatusLabel(task.status)}
                      </Tag>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                    ></div>
                    <Progress
                      percent={progressPercent}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                      railColor="rgba(255, 255, 255, 0.3)"
                      format={(percent) => `${percent}%`}
                      status="active"
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        </Card>
      )}

      {videos.length > 0 && !hasActiveTasks && (
        <div style={{ marginBottom: 24 }}>
          <Space>
            <span>Сортировка:</span>
            <Select
              value={sortBy}
              onChange={(value) => dispatch(setSortBy(value))}
              style={{ width: 180 }}
              options={[
                { label: 'Дата публикации', value: 'publishedAt' },
                { label: 'Просмотры', value: 'views' },
                { label: 'Лайки', value: 'likes' },
                { label: 'Вирусность', value: 'viralScore' },
              ]}
            />
            <Select
              value={order}
              onChange={(value) => dispatch(setOrder(value))}
              style={{ width: 120 }}
              options={[
                { label: 'По убыванию', value: 'desc' },
                { label: 'По возрастанию', value: 'asc' },
              ]}
            />
          </Space>
        </div>
      )}

      <Row gutter={[16, 16]}>
        {videos.map((video) => (
          <Col key={video._id} xs={24} sm={12} md={8} lg={6}>
            <VideoCard
              previewUrl={video.previewUrl}
              author={video.author}
              publishedAt={video.publishedAt}
              views={video.views}
              likes={video.likes}
              comments={video.comments}
              growthPercent={video.growthPercent}
              viralScore={video.viralScore}
              isViral={video.isViral}
              isAd={video.isAd}
              onWatch={() => window.open(video.url, '_blank')}
              onRepeat={() => repeatHandle(video)}
            />
          </Col>
        ))}
      </Row>

      {videos.length > 0 && totalPages > 1 && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Pagination
            current={page}
            total={total}
            pageSize={limit}
            onChange={(newPage) => dispatch(setPage(newPage))}
            showSizeChanger={false}
            showTotal={(total) => `Всего ${total} видео`}
          />
        </div>
      )}

      <VideoRepeatModal open={open} onClose={handleCloseModal} video={selectedVideo} />
    </div>
  );
};

export default MainPage;
