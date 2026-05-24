import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export interface CreateWorkLogInput {
  date: string;
  workTypeId: string;
  volume: number;
  executorName: string;
}

export interface UpdateWorkLogInput extends CreateWorkLogInput {
  id: string;
}

export const useWorkLogs = () => {
  return useQuery<WorkLog[]>({
    queryKey: ['work-logs'],
    queryFn: async () => {
      const response = await apiClient.get<WorkLog[]>('/work-logs');
      return response.data;
    },
  });
};

export const useWorkTypes = () => {
  return useQuery<WorkType[]>({
    queryKey: ['work-types'],
    queryFn: async () => {
      const response = await apiClient.get<WorkType[]>('/work-types');
      return response.data;
    },
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
