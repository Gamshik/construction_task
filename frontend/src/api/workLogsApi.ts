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

// ==========================================
// LOCAL MOCK DATABASE FALLBACKS FOR TESTING
// ==========================================

export const MOCK_WORK_TYPES: WorkType[] = [
  { id: 'wt-1', title: 'Заливка фундамента бетоном М350', unit: 'м³' },
  { id: 'wt-2', title: 'Штукатурка стен по маякам', unit: 'м²' },
  { id: 'wt-3', title: 'Укладка арматурной сетки A3', unit: 'м²' },
  { id: 'wt-4', title: 'Разводка медного кабеля 3х2.5', unit: 'м' },
];

const DEFAULT_MOCK_LOGS: WorkLog[] = [
  {
    id: 'log-1',
    date: new Date().toISOString(),
    workTypeId: 'wt-1',
    workType: MOCK_WORK_TYPES[0],
    volume: 18.5,
    executorName: 'Бригада Иванова И.В.',
  },
  {
    id: 'log-2',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    workTypeId: 'wt-2',
    workType: MOCK_WORK_TYPES[1],
    volume: 120,
    executorName: 'Бригада Петрова С.П.',
  },
  {
    id: 'log-3',
    date: new Date(Date.now() - 172800000).toISOString(), // 2 Days Ago
    workTypeId: 'wt-3',
    workType: MOCK_WORK_TYPES[2],
    volume: 240,
    executorName: 'Бригада Сидорова А.А.',
  },
];

const getMockLogs = (): WorkLog[] => {
  const saved = localStorage.getItem('mock-work-logs');
  if (saved) return JSON.parse(saved);
  localStorage.setItem('mock-work-logs', JSON.stringify(DEFAULT_MOCK_LOGS));
  return DEFAULT_MOCK_LOGS;
};

const saveMockLogs = (logs: WorkLog[]) => {
  localStorage.setItem('mock-work-logs', JSON.stringify(logs));
};

// ==========================================
// REACT QUERY API HOOKS WITH SMART FALLBACKS
// ==========================================

export const useWorkLogs = () => {
  return useQuery<WorkLog[]>({
    queryKey: ['work-logs'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<WorkLog[]>('/work-logs');
        return response.data;
      } catch (error) {
        console.warn('Backend API connection failed, falling back to localStorage mock work logs.', error);
        return getMockLogs();
      }
    },
    retry: false, // Prevent infinite loading loops when server is unreachable
  });
};

export const useWorkTypes = () => {
  return useQuery<WorkType[]>({
    queryKey: ['work-types'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<WorkType[]>('/work-types');
        return response.data;
      } catch (error) {
        console.warn('Backend API connection failed, falling back to local mock work types.', error);
        return MOCK_WORK_TYPES;
      }
    },
    retry: false,
  });
};

export const useCreateWorkLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateWorkLogInput) => {
      try {
        const response = await apiClient.post<WorkLog>('/work-logs', data);
        return response.data;
      } catch (error) {
        console.warn('Backend API offline, saving new log locally to localStorage mock database.', error);
        const logs = getMockLogs();
        const workType = MOCK_WORK_TYPES.find(wt => wt.id === data.workTypeId) || null;
        
        const newLog: WorkLog = {
          id: `mock-log-${Date.now()}`,
          date: data.date,
          workTypeId: data.workTypeId,
          workType,
          volume: data.volume,
          executorName: data.executorName,
        };
        
        const updatedLogs = [newLog, ...logs];
        saveMockLogs(updatedLogs);
        return newLog;
      }
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
      try {
        const response = await apiClient.put<WorkLog>(`/work-logs/${id}`, data);
        return response.data;
      } catch (error) {
        console.warn('Backend API offline, updating log locally in localStorage mock database.', error);
        const logs = getMockLogs();
        const workType = MOCK_WORK_TYPES.find(wt => wt.id === data.workTypeId) || null;
        
        const updatedLog: WorkLog = {
          id,
          date: data.date,
          workTypeId: data.workTypeId,
          workType,
          volume: data.volume,
          executorName: data.executorName,
        };
        
        const updatedLogs = logs.map(l => l.id === id ? updatedLog : l);
        saveMockLogs(updatedLogs);
        return updatedLog;
      }
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
      try {
        const response = await apiClient.delete<{ success: boolean }>(`/work-logs/${id}`);
        return response.data;
      } catch (error) {
        console.warn('Backend API offline, deleting log locally from localStorage mock database.', error);
        const logs = getMockLogs();
        const updatedLogs = logs.filter(l => l.id !== id);
        saveMockLogs(updatedLogs);
        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-logs'] });
    },
  });
};
