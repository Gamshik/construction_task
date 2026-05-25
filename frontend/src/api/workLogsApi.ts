import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from './client';

export interface WorkType {
  id: string;
  title: string;
  unit: string;
}

export interface WorkLog {
  id: string;
  date: string;
  workTypeId: string;
  workType: WorkType | null;
  volume: number;
  executorName: string;
}

export interface PaginatedWorkLogs {
  data: WorkLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateWorkLogInput {
  date: string;
  workTypeId: string;
  volume: number;
  executorName: string;
}

export interface UpdateWorkLogInput extends CreateWorkLogInput {
  id: string;
}

// ==========================================
// REACT QUERY API HOOKS
// ==========================================

export const useWorkLogs = () => {
  return useQuery<WorkLog[]>({
    queryKey: ['work-logs'],
    queryFn: async () => {
      const response = await apiClient.get<WorkLog[]>('/work-logs');
      return response.data;
    },
    retry: false, // Prevent infinite loading loops when server is unreachable
  });
};

export interface WorkLogFilterParams {
  limit: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  sort?: 'asc' | 'desc';
}

export const useInfiniteWorkLogs = (params: WorkLogFilterParams) => {
  return useInfiniteQuery<PaginatedWorkLogs, Error>({
    queryKey: ['work-logs', 'infinite', params],
    queryFn: async ({ pageParam = 1 }) => {
      const page = pageParam as number;
      const response = await apiClient.get<PaginatedWorkLogs>('/work-logs', {
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

export const useWorkTypes = () => {
  return useQuery<WorkType[]>({
    queryKey: ['work-types'],
    queryFn: async () => {
      const response = await apiClient.get<WorkType[]>('/work-types');
      return response.data;
    },
    retry: false,
  });
};

export const useCreateWorkLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateWorkLogInput) => {
      const response = await apiClient.post<WorkLog>('/work-logs', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-logs'] });
    },
  });
};

export const useUpdateWorkLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateWorkLogInput) => {
      const response = await apiClient.put<WorkLog>(`/work-logs/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-logs'] });
    },
  });
};

export const useDeleteWorkLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ success: boolean }>(`/work-logs/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-logs'] });
    },
  });
};
