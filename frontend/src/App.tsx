import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, HardHat, CheckCircle, AlertCircle, BarChart3, Users, CalendarDays, Sun, Moon } from 'lucide-react';
import {
  useInfiniteWorkLogs,
  useWorkTypes,
  useCreateWorkLog,
  useUpdateWorkLog,
  useDeleteWorkLog,
  QUERY_KEYS,
} from '@/api';
import type { WorkLog } from '@/types';
import { useWorkLogFilters } from '@/features/work-logs/hooks';
import { WorkLogFilters, WorkLogTable, WorkLogForm } from '@/features/work-logs/components';
import { Modal, Button } from '@/components';
import styles from './App.module.scss';

/**
 * Корневой компонент приложения Журнал Работ.
 * Представляет собой контейнер дашборда (Dashboard View).
 * Управляет состоянием фильтров, пагинации, модальных окон, темы оформления,
 * уведомлениями и CRUD-операциями для журнала работ.
 * 
 * @returns React-элемент основного интерфейса приложения
 */
function App() {
  // --- Состояние лимита пагинации ---
  const [limit, setLimit] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLimit = Number(params.get('limit'));
    return urlLimit && urlLimit > 0 ? urlLimit : 5;
  });

  // Синхронизация лимита отображения в URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (limit && limit !== 5) {
      params.set('limit', String(limit));
    } else {
      params.delete('limit');
    }
    const newSearch = params.toString();
    const newUrl = `${window.location.pathname}${newSearch ? '?' + newSearch : ''}`;
    window.history.replaceState(null, '', newUrl);
  }, [limit]);

  // --- Фильтры логов ---
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    clearFilters,
  } = useWorkLogFilters();

  // Дебаунс поискового запроса для предотвращения спама запросами к серверу
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- Запросы данных React Query ---
  const {
    data,
    isLoading: isLoadingLogs,
    isError: isLogsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteWorkLogs({
    limit,
    search: debouncedSearch,
    startDate,
    endDate,
    sort: sortOrder,
  });

  const { data: workTypes = [], isError: isTypesError } = useWorkTypes();

  // --- Обработка и подготовка данных логов ---
  const workLogs: WorkLog[] = [];
  const seenIds = new Set<string>();
  if (data) {
    for (const page of data.pages) {
      for (const log of page.data) {
        if (!seenIds.has(log.id)) {
          seenIds.add(log.id);
          workLogs.push(log);
        }
      }
    }
  }
  const totalLogsCount = data?.pages[0]?.meta.total ?? workLogs.length;

  // --- Состояния UI загрузок ---
  const [showMetricsLoader, setShowMetricsLoader] = useState(false);

  useEffect(() => {
    if (!isLoadingLogs) {
      setShowMetricsLoader(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowMetricsLoader(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [isLoadingLogs]);

  // --- Мутации данных (CRUD) ---
  const createMutation = useCreateWorkLog();
  const updateMutation = useUpdateWorkLog();
  const deleteMutation = useDeleteWorkLog();

  // --- Состояния модальных окон и подсветок ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isFormSuccess, setIsFormSuccess] = useState(false);
  const [newLogId, setNewLogId] = useState<string | null>(null);
  const [updatedLogId, setUpdatedLogId] = useState<string | null>(null);

  // Сброс редактируемой записи по окончании анимации закрытия модального окна (380мс)
  useEffect(() => {
    if (!isModalOpen) {
      const timer = setTimeout(() => {
        setEditingLog(null);
      }, 380);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  // Сброс подсветки добавленной строки
  useEffect(() => {
    if (newLogId) {
      const timer = setTimeout(() => {
        setNewLogId(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [newLogId]);

  // Сброс подсветки обновленной строки
  useEffect(() => {
    if (updatedLogId) {
      const timer = setTimeout(() => {
        setUpdatedLogId(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [updatedLogId]);

  // --- Тема оформления ---
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  const queryClient = useQueryClient();

  // Сброс кэша пагинации при изменении фильтров
  useEffect(() => {
    queryClient.removeQueries({ queryKey: QUERY_KEYS.INFINITE_WORK_LOGS_BASE });
  }, [sortOrder, debouncedSearch, startDate, endDate, queryClient]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // --- Тост-уведомления ---
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setNotification({ type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setNotification(null);
      toastTimeoutRef.current = null;
    }, 1800);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Вывод тоста ошибки загрузки
  useEffect(() => {
    if (isLogsError || isTypesError) {
      showNotification('error', 'Не удалось загрузить данные. Проверьте интернет-соединение.');
    }
  }, [isLogsError, isTypesError]);

  // --- Обработчики кликов/действий ---
  const handleAddClick = () => {
    setIsFormSuccess(false);
    setEditingLog(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (log: WorkLog) => {
    setIsFormSuccess(false);
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData: {
    date: string;
    workTypeId: string;
    volume: number;
    executorName: string;
  }) => {
    try {
      if (editingLog) {
        const logId = editingLog.id;
        const updatedLog = await updateMutation.mutateAsync({ id: logId, ...formData });

        setIsFormSuccess(true);

        setTimeout(() => {
          setIsModalOpen(false);
          setIsFormSuccess(false);

          setTimeout(() => {
            setUpdatedLogId(updatedLog.id);
            showNotification('success', 'Запись успешно обновлена');
          }, 100);
        }, 600);
      } else {
        const newLog = await createMutation.mutateAsync(formData);

        setIsFormSuccess(true);

        setTimeout(() => {
          setIsModalOpen(false);
          setIsFormSuccess(false);

          setTimeout(() => {
            setNewLogId(newLog.id);
            showNotification('success', 'Запись успешно добавлена в журнал');
          }, 100);
        }, 600);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (err.request ? 'Не удалось сохранить изменения. Проверьте интернет-соединение.' : 'Ошибка сохранения записи');
      showNotification('error', Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        showNotification('success', 'Запись удалена из журнала');
      },
      onError: (err: any) => {
        const msg =
          err.response?.data?.message ||
          (err.request ? 'Не удалось удалить запись. Проверьте интернет-соединение.' : 'Ошибка удаления записи');
        showNotification('error', Array.isArray(msg) ? msg[0] : msg);
      },
    });
  };

  // --- Расчет метрик дашборда ---
  const totalEntries = totalLogsCount;
  const uniqueExecutors = new Set(workLogs.map((wl) => wl.executorName)).size;
  const todayEntries = workLogs.filter((wl) => {
    const logDate = new Date(wl.date).toDateString();
    const today = new Date().toDateString();
    return logDate === today;
  }).length;

  return (
    <div className={styles.appContainer}>
      {/* Тост-уведомление об успешных действиях или ошибках */}
      {notification && (
        <div className={`${styles.toast} ${styles[notification.type]}`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Шапка дашборда */}
      <header className={styles.header}>
        <div className={styles.headerBrand}>
          <div className={styles.logoBox}>
            <HardHat size={28} className={styles.logoIcon} />
          </div>
          <div>
            <h1>Журнал работ</h1>
            <p className={styles.subtitle}>Система учета и контроля строительных процессов</p>
          </div>
        </div>

        {/* Элементы управления оформлением и аналитикой */}
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.statsToggle}
            onClick={() => setIsStatsOpen(true)}
            aria-label="Показать статистику"
          >
            <BarChart3 size={18} />
          </button>
          <button
            type="button"
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Переключить тему"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Панель метрик / KPI строительной смены */}
      <section className={styles.metrics}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Всего записей</span>
            <BarChart3 className={styles.metricIconAccent} size={20} />
          </div>
          <span className={styles.metricValue}>{showMetricsLoader ? 0 : totalEntries}</span>
          <span className={styles.metricDesc}>за все время</span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Исполнителей</span>
            <Users className={styles.metricIconAccent} size={20} />
          </div>
          <span className={styles.metricValue}>{showMetricsLoader ? 0 : uniqueExecutors}</span>
          <span className={styles.metricDesc}>активных бригадиров</span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>За сегодня</span>
            <CalendarDays className={styles.metricIconAccent} size={20} />
          </div>
          <span className={styles.metricValue}>{showMetricsLoader ? 0 : todayEntries}</span>
          <span className={styles.metricDesc}>выполнено смен</span>
        </div>
      </section>

      {/* Основная рабочая область журнала */}
      <main className={styles.mainContent}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <h2>Выполненные работы</h2>
            <p className={styles.sectionSubtitle}>Список всех записанных смен и выполненных задач</p>
          </div>
          <Button onClick={handleAddClick} variant="primary" className={styles.addBtn}>
            <Plus size={18} />
            <span>Записать работу</span>
          </Button>
        </div>

        {/* Компонент фильтрации */}
        <WorkLogFilters
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          clearFilters={clearFilters}
        />

        {/* Таблица записей с бесконечной подгрузкой */}
        <WorkLogTable
          workLogs={workLogs}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          isDeleting={false} // Состояние удаления управляется плавным уходом строки локально
          isLoading={isLoadingLogs}
          isFetching={isFetching}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          newLogId={newLogId}
          updatedLogId={updatedLogId}
          onLoadMore={fetchNextPage}
          hasNextPage={!!hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          limit={limit}
          setLimit={setLimit}
          totalLogsCount={totalLogsCount}
        />
      </main>

      {/* Модальное окно редактирования/создания лога */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLog ? 'Изменить запись' : 'Внести выполненную работу'}
      >
        <WorkLogForm
          workTypes={workTypes}
          initialData={editingLog}
          onSubmit={handleFormSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          isSuccess={isFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Модальное окно расширенной статистики (для мобильных устройств) */}
      <Modal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        title="Статистика журнала"
      >
        <div className={styles.statsDrawerContent}>
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>Всего записей</span>
              <BarChart3 className={styles.metricIconAccent} size={20} />
            </div>
            <span className={styles.metricValue}>{showMetricsLoader ? 0 : totalEntries}</span>
            <span className={styles.metricDesc}>за все время</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>Исполнителей</span>
              <Users className={styles.metricIconAccent} size={20} />
            </div>
            <span className={styles.metricValue}>{showMetricsLoader ? 0 : uniqueExecutors}</span>
            <span className={styles.metricDesc}>активных бригадиров</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>За сегодня</span>
              <CalendarDays className={styles.metricIconAccent} size={20} />
            </div>
            <span className={styles.metricValue}>{showMetricsLoader ? 0 : todayEntries}</span>
            <span className={styles.metricDesc}>выполнено смен</span>
          </div>
        </div>
      </Modal>

      {/* Футер */}
      <footer className={styles.footer}>
        <div className={styles.footerInfo}>
          <span>&copy; {new Date().getFullYear()} ООО «СтройКонтроль». Все права защищены. &bull; Система мониторинга строительных процессов</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
