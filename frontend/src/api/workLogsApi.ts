import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  WorkType,
  WorkLog,
  PaginatedWorkLogs,
  CreateWorkLogInput,
  UpdateWorkLogInput,
  WorkLogFilterParams,
} from '@/types';

/**
 * Константы маршрутов API для взаимодействия с бэкендом.
 */
export const API_ROUTES = {
  /** Маршрут для получения списка видов работ */
  WORK_TYPES: '/work-types',
  /** Маршрут для работы со списком логов работ */
  WORK_LOGS: '/work-logs',
  /** Функция для получения маршрута конкретного лога работы по его идентификатору */
  WORK_LOGS_DETAIL: (id: string) => `/work-logs/${id}`,
} as const;

/**
 * Константы ключей запросов React Query для управления кэшированием.
 */
export const QUERY_KEYS = {
  /** Ключ кэша для списка видов работ */
  WORK_TYPES: ['work-types'] as const,
  /** Базовый ключ кэша для списка логов работ */
  WORK_LOGS: ['work-logs'] as const,
  /** Базовый ключ кэша для бесконечного списка логов работ */
  INFINITE_WORK_LOGS_BASE: ['work-logs', 'infinite'] as const,
  /**
   * Функция для генерации уникального ключа кэша бесконечного списка логов с фильтрами.
   * 
   * @param params Параметры фильтрации и пагинации
   * @returns Массив, представляющий ключ кэша в React Query
   */
  INFINITE_WORK_LOGS: (params: WorkLogFilterParams) => ['work-logs', 'infinite', params] as const,
} as const;

// ==========================================
// API ХУКИ REACT QUERY
// ==========================================

/**
 * Хук React Query для получения полного списка логов работ (без постраничного разбиения).
 * Используется для получения всех записей одним запросом.
 * 
 * @returns Объект запроса React Query со списком WorkLog[]
 */
export const useWorkLogs = () => {
  return useQuery<WorkLog[]>({
    queryKey: QUERY_KEYS.WORK_LOGS,
    queryFn: async () => {
      const response = await apiClient.get<WorkLog[]>(API_ROUTES.WORK_LOGS);
      return response.data;
    },
    retry: false, // Предотвращает бесконечные попытки загрузки при недоступности сервера
  });
};

/**
 * Хук React Query для бесконечной прокрутки / постраничной загрузки логов работ с фильтрацией.
 * Получает данные порциями, зависящими от параметров фильтрации.
 * 
 * @param params Параметры фильтрации, поиска и сортировки
 * @returns Объект бесконечного запроса React Query с постраничными данными PaginatedWorkLogs
 */
export const useInfiniteWorkLogs = (params: WorkLogFilterParams) => {
  return useInfiniteQuery<PaginatedWorkLogs, Error>({
    queryKey: QUERY_KEYS.INFINITE_WORK_LOGS(params),
    queryFn: async ({ pageParam = 1 }) => {
      const page = pageParam as number;
      const response = await apiClient.get<PaginatedWorkLogs>(API_ROUTES.WORK_LOGS, {
        params: {
          page,
          limit: params.limit,
          search: params.search,
          startDate: params.startDate,
          endDate: params.endDate,
          sort: params.sort,
        },
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    retry: false,
  });
};

/**
 * Хук React Query для получения списка всех доступных видов работ.
 * Используется, например, для заполнения выпадающего списка при создании/редактировании лога.
 * 
 * @returns Объект запроса React Query с массивом WorkType[]
 */
export const useWorkTypes = () => {
  return useQuery<WorkType[]>({
    queryKey: QUERY_KEYS.WORK_TYPES,
    queryFn: async () => {
      const response = await apiClient.get<WorkType[]>(API_ROUTES.WORK_TYPES);
      return response.data;
    },
    retry: false,
  });
};

/**
 * Хук React Query для создания новой записи о выполненной работе.
 * После успешного создания автоматически сбрасывает кэш списка логов для их мгновенного обновления.
 * 
 * @returns Объект мутации React Query для создания записи
 */
export const useCreateWorkLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateWorkLogInput) => {
      const response = await apiClient.post<WorkLog>(API_ROUTES.WORK_LOGS, data);
      return response.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORK_LOGS });
    },
  });
};

/**
 * Хук React Query для обновления существующей записи о выполненной работе.
 * После успешного обновления автоматически сбрасывает кэш списка логов для их мгновенного обновления.
 * 
 * @returns Объект мутации React Query для обновления записи
 */
export const useUpdateWorkLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateWorkLogInput) => {
      const response = await apiClient.put<WorkLog>(API_ROUTES.WORK_LOGS_DETAIL(id), data);
      return response.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORK_LOGS });
    },
  });
};

/**
 * Хук React Query для удаления записи о выполненной работе по её идентификатору.
 * После успешного удаления автоматически сбрасывает кэш списка логов для их мгновенного обновления.
 * 
 * @returns Объект мутации React Query для удаления записи
 */
export const useDeleteWorkLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ success: boolean }>(API_ROUTES.WORK_LOGS_DETAIL(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORK_LOGS });
    },
  });
};
