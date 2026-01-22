import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch } from '../../app/store/store';
import { createSearchTaskThunk, getSearchTask } from '../../shared/api/searchTaskApi';
import { getVideosWithPagination, VideoQueryParams } from '../../shared/api/video';

type TaskStatus = 'pending' | 'connect' | 'analyze' | 'process' | 'completed' | 'failed';

// Статусы, при которых задача считается активной (в процессе)
export const ACTIVE_STATUSES: TaskStatus[] = ['pending', 'connect', 'analyze', 'process'];

interface ISearchTask {
  _id: string;
  userId: string;
  companyId: string;
  url: string;
  hotWord: string;
  status: TaskStatus;
  platform: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
  lastRunAt: string;
  totalVideos: number;
  processedVideos: number;
  progress: number;
}

export interface IVideo {
  _id: string;
  url: string;
  searchTaskId: string;
  previewUrl: string;
  author: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  growthPercent: number;
  viralScore: number;
  isViral: boolean;
  isAd: boolean;
}

interface IState {
  tasks: ISearchTask[];
  videos: IVideo[];
  error: Boolean;
  loading: boolean;
  isLoaded: boolean;
  // Pagination
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sortBy: 'views' | 'likes' | 'viralScore' | 'publishedAt';
  order: 'asc' | 'desc';
}

export const getTasksThunk = createAsyncThunk<
  any,
  { companyId: string },
  { dispatch: AppDispatch }
>(
  'searchTask/getTasks',
  async ({companyId}, { rejectWithValue }) => {
    try {
      const response = await getSearchTask(companyId);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'Ошибка при получении задач' });
    }
  },
);

export const getVideosForTaskThunk = createAsyncThunk(
  'searchTask/getVideos',
  async (params: VideoQueryParams, { rejectWithValue }) => {
    try {
      const response = await getVideosWithPagination(params);
      return response;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'Ошибка при получении видео' });
    }
  },
);

export const createTaskThunk = createAsyncThunk<
  any,
  { companyId: string },
  { dispatch: AppDispatch }
>('searchTask/createTask', async ({ companyId }, { dispatch, rejectWithValue }) => {
  try {
    return await dispatch(createSearchTaskThunk(companyId)).unwrap();
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: 'Неизвестная ошибка...' });
  }
});

const initialState: IState = {
  tasks: [],
  videos: [],
  error: false,
  loading: false,
  isLoaded: false,
  // Pagination
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  sortBy: 'publishedAt',
  order: 'desc',
};

const searchTaskSlice = createSlice({
  name: 'searchTask',
  initialState,
  reducers: {
    clearVideoState(state) {
      state.videos = [];
    },
    clearTasks(state) {
      state.tasks = [];
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setSortBy(state, action: PayloadAction<'views' | 'likes' | 'viralScore' | 'publishedAt'>) {
      state.sortBy = action.payload;
      state.page = 1; // Сбрасываем на первую страницу при изменении сортировки
    },
    setOrder(state, action: PayloadAction<'asc' | 'desc'>) {
      state.order = action.payload;
      state.page = 1; // Сбрасываем на первую страницу при изменении порядка
    },
    // Обновление задачи через WebSocket
    updateTaskFromWs(state, action: PayloadAction<{
      taskId: string;
      status: TaskStatus;
      progress?: number;
      processedVideos?: number;
      totalVideos?: number;
    }>) {
      const { taskId, status, progress, processedVideos, totalVideos } = action.payload;
      const taskIndex = state.tasks.findIndex((t) => t._id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].status = status;
        if (progress !== undefined) state.tasks[taskIndex].progress = progress;
        if (processedVideos !== undefined) state.tasks[taskIndex].processedVideos = processedVideos;
        if (totalVideos !== undefined) state.tasks[taskIndex].totalVideos = totalVideos;
      }
    },
    // Добавление нового видео через WebSocket (real-time от скраппера)
    addVideoFromWs(state, action: PayloadAction<{ video: IVideo; companyTaskIds: string[] }>) {
      const { video, companyTaskIds } = action.payload;
      // Добавляем только если видео относится к текущей компании
      if (companyTaskIds.includes(video.searchTaskId)) {
        // Проверяем что такого видео ещё нет
        const exists = state.videos.some((v) => v._id === video._id);
        if (!exists) {
          // Добавляем в начало списка
          state.videos.unshift(video);
          state.total += 1;
          // Если превысили limit - убираем последнее
          if (state.videos.length > state.limit) {
            state.videos.pop();
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Получение задач
    builder.addCase(getTasksThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
    builder.addCase(getTasksThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      state.tasks = action.payload;
      state.isLoaded = true;
    });
    builder.addCase(getTasksThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
      state.isLoaded = true;
    });

    // Создание задачи
    builder.addCase(createTaskThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
    builder.addCase(createTaskThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
    });
    builder.addCase(createTaskThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = true;
    });

    // Получение видео для задачи
    builder.addCase(getVideosForTaskThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });
    builder.addCase(getVideosForTaskThunk.fulfilled, (state, action) => {
      const { videos, total, page, limit, totalPages } = action.payload;
      // Заменяем видео новой страницей
      state.videos = videos;
      state.total = total;
      state.page = page;
      state.limit = limit;
      state.totalPages = totalPages;
      state.loading = false;
      state.error = false;
    });
    builder.addCase(getVideosForTaskThunk.rejected, (state) => {
      state.loading = false;
      state.error = true;
    });
  },
});

export const { clearVideoState, setPage, setSortBy, setOrder, clearTasks, updateTaskFromWs, addVideoFromWs } = searchTaskSlice.actions;
export const searchTasksReducer = searchTaskSlice.reducer;
