import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch } from '../../app/store/store';
import { getOrCreateAnalysis } from '../../shared/api/repeat';
import { IAnalysis, IAnalysisTask, IAnalysisWebSocketPayload, AnalysisTaskStatus } from './repeat.type';

interface AnalysisTaskState {
  status: AnalysisTaskStatus;
  isProcessing: boolean;
  message: string;
  analysis?: any;
}

interface UserState {
  error: boolean;
  description: IAnalysis | null;
  loading: boolean;
  loadingVideoId: string | null;
  pendingVideoIds: string[];
  // Состояния задач анализа по videoId
  analysisTasks: Record<string, AnalysisTaskState>;
}

const initialState: UserState = {
  error: false,
  description: null,
  loading: false,
  loadingVideoId: null,
  pendingVideoIds: [],
  analysisTasks: {},
};

export const getOrCreateRepeat = createAsyncThunk<
  IAnalysis,
  { videoId: string,
    companyId: string
  },
  { dispatch: AppDispatch }
>(
  'repeat/getOrCreateRepeat',
  async ({ videoId, companyId }, { rejectWithValue }) => {
    try {
      const res = await getOrCreateAnalysis(videoId, companyId);
      console.log('res.data', res.data)
      return res.data
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to get analysis');
    }
  },
);

// Статусы, означающие что анализ в процессе
const PROCESSING_STATUSES: AnalysisTaskStatus[] = ['pending', 'parsing', 'analysis'];

const repeatSlice = createSlice({
  name: 'repeat',
  initialState,
  reducers: {
    clearAnalysis: (state) => {
      state.description = null;
      state.error = false;
      state.loading = false;
      state.loadingVideoId = null;
    },

    // Обновление статуса анализа из WebSocket
    updateAnalysisFromWs: (state, action: PayloadAction<IAnalysisWebSocketPayload>) => {
      const { videoId, status, analysis } = action.payload;
      const isProcessing = PROCESSING_STATUSES.includes(status);

      state.analysisTasks[videoId] = {
        status,
        isProcessing,
        message: getStatusMessage(status),
        analysis: analysis || state.analysisTasks[videoId]?.analysis,
      };

      // Если анализ в процессе, добавляем в pendingVideoIds
      if (isProcessing && !state.pendingVideoIds.includes(videoId)) {
        state.pendingVideoIds.push(videoId);
      }
    },

    // Анализ завершен успешно
    analysisCompleted: (state, action: PayloadAction<IAnalysisWebSocketPayload>) => {
      const { videoId, analysis } = action.payload;

      state.analysisTasks[videoId] = {
        status: 'completed',
        isProcessing: false,
        message: 'Анализ завершен',
        analysis,
      };

      // Удаляем из pendingVideoIds
      state.pendingVideoIds = state.pendingVideoIds.filter(id => id !== videoId);

      // Если это текущее открытое видео, обновляем description
      if (state.loadingVideoId === videoId && analysis) {
        state.description = analysis;
        state.loading = false;
      }
    },

    // Анализ завершился с ошибкой
    analysisFailed: (state, action: PayloadAction<IAnalysisWebSocketPayload>) => {
      const { videoId } = action.payload;

      state.analysisTasks[videoId] = {
        status: 'failed',
        isProcessing: false,
        message: 'Анализ завершился с ошибкой',
      };

      // Удаляем из pendingVideoIds
      state.pendingVideoIds = state.pendingVideoIds.filter(id => id !== videoId);

      // Если это текущее открытое видео, показываем ошибку
      if (state.loadingVideoId === videoId) {
        state.error = true;
        state.loading = false;
      }
    },

    // Сброс состояния задачи для конкретного видео
    clearAnalysisTask: (state, action: PayloadAction<string>) => {
      const videoId = action.payload;
      delete state.analysisTasks[videoId];
      state.pendingVideoIds = state.pendingVideoIds.filter(id => id !== videoId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrCreateRepeat.pending, (state, action) => {
        state.loading = true;
        state.error = false;
        state.loadingVideoId = action.meta.arg.videoId;
        // Добавляем videoId в список активных запросов
        if (!state.pendingVideoIds.includes(action.meta.arg.videoId)) {
          state.pendingVideoIds.push(action.meta.arg.videoId);
        }
      })
      .addCase(getOrCreateRepeat.fulfilled, (state, action) => {
        const videoId = action.meta.arg.videoId;
        const data = action.payload as any;

        // Если вернулась задача в процессе (isProcessing: true), оставляем в pending
        if (data.isProcessing) {
          state.analysisTasks[videoId] = {
            status: data.status || 'pending',
            isProcessing: true,
            message: data.message || getStatusMessage(data.status),
          };
          // Не убираем из pendingVideoIds - ждем WebSocket события
          return;
        }

        // Если анализ уже завершен
        if (data.status === 'completed' && data.analysis) {
          state.description = data;
          state.analysisTasks[videoId] = {
            status: 'completed',
            isProcessing: false,
            message: 'Анализ завершен',
            analysis: data.analysis,
          };
        }

        state.loading = false;
        state.error = false;
        // Удаляем videoId из списка активных запросов только если не в процессе
        if (!data.isProcessing) {
          state.pendingVideoIds = state.pendingVideoIds.filter(
            (id) => id !== videoId
          );
        }
      })
      .addCase(getOrCreateRepeat.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.description = null;
        state.loadingVideoId = null;
        // Удаляем videoId из списка активных запросов
        state.pendingVideoIds = state.pendingVideoIds.filter(
          (id) => id !== action.meta.arg.videoId
        );
      });
  },
});

// Хелпер для получения сообщения по статусу
function getStatusMessage(status: AnalysisTaskStatus): string {
  switch (status) {
    case 'pending':
      return 'Анализ в очереди...';
    case 'parsing':
      return 'Парсинг видео...';
    case 'analysis':
      return 'AI анализирует контент...';
    case 'completed':
      return 'Анализ завершен';
    case 'failed':
      return 'Анализ завершился с ошибкой';
    default:
      return 'Обработка...';
  }
}

export const {
  clearAnalysis,
  updateAnalysisFromWs,
  analysisCompleted,
  analysisFailed,
  clearAnalysisTask,
} = repeatSlice.actions;
export const repeatReducer = repeatSlice.reducer;
