import { useState, useEffect } from 'react';
import { Plus, HardHat, CheckCircle, AlertCircle, BarChart3, Users, CalendarDays, Sun, Moon } from 'lucide-react';
import {
  useInfiniteWorkLogs,
  useWorkTypes,
  useCreateWorkLog,
  useUpdateWorkLog,
  useDeleteWorkLog,
  WorkLog,
} from '@/api/workLogsApi';
import { useWorkLogFilters } from '@/features/work-logs/hooks/useWorkLogFilters';
import { WorkLogFilters } from '@/features/work-logs/components/WorkLogFilters/WorkLogFilters';
import { WorkLogTable } from '@/features/work-logs/components/WorkLogTable/WorkLogTable';
import { Modal } from '@/components/Modal/Modal';
import { WorkLogForm } from '@/features/work-logs/components/WorkLogForm/WorkLogForm';
import { Button } from '@/components/Button/Button';

import styles from './App.module.scss';

function App() {
  const [limit, setLimit] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLimit = Number(params.get('limit'));
    return urlLimit && urlLimit > 0 ? urlLimit : 5;
  });

  // Reactively synchronize page limit state with browser URL query variables
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

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  // Accumulate flat array representation of paginated data rows, filtering out any duplicate IDs that can arise from shifting database offsets during refetches or boundary shifts.
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

  const filteredAndSortedLogs = workLogs;

  const [showMetricsLoader, setShowMetricsLoader] = useState(false);

  useEffect(() => {
    if (!isLoadingLogs) {
      setShowMetricsLoader(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowMetricsLoader(true);
    }, 200); // 200ms delay to prevent metrics flickering on extremely fast queries

    return () => clearTimeout(timer);
  }, [isLoadingLogs]);

  const createMutation = useCreateWorkLog();
  const updateMutation = useUpdateWorkLog();
  const deleteMutation = useDeleteWorkLog();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isFormSuccess, setIsFormSuccess] = useState(false);
  const [newLogId, setNewLogId] = useState<string | null>(null);
  const [updatedLogId, setUpdatedLogId] = useState<string | null>(null);
  const [pendingNewLogId, setPendingNewLogId] = useState<string | null>(null);
  const [pendingUpdatedLogId, setPendingUpdatedLogId] = useState<string | null>(null);

  useEffect(() => {
    if (!isModalOpen) {
      // Clear editing log only after the modal's close animation completes (380ms)
      const timer = setTimeout(() => {
        setEditingLog(null);
      }, 380);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (!isFetching && !isModalOpen) {
      if (pendingNewLogId) {
        setNewLogId(pendingNewLogId);
        setPendingNewLogId(null);
      }
      if (pendingUpdatedLogId) {
        setUpdatedLogId(pendingUpdatedLogId);
        setPendingUpdatedLogId(null);
      }
    }
  }, [pendingNewLogId, pendingUpdatedLogId, isFetching, isModalOpen]);

  useEffect(() => {
    if (newLogId) {
      const timer = setTimeout(() => {
        setNewLogId(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [newLogId]);

  useEffect(() => {
    if (updatedLogId) {
      const timer = setTimeout(() => {
        setUpdatedLogId(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [updatedLogId]);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };


  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [toastTimeout, setToastTimeout] = useState<any>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    setNotification({ type, message });
    const id = setTimeout(() => {
      setNotification(null);
      setToastTimeout(null);
    }, 1800);
    setToastTimeout(id);
  };

  useEffect(() => {
    return () => {
      if (toastTimeout) clearTimeout(toastTimeout);
    };
  }, [toastTimeout]);

  useEffect(() => {
    if (isLogsError || isTypesError) {
      showNotification('error', 'Не удалось загрузить данные. Проверьте интернет-соединение.');
    }
  }, [isLogsError, isTypesError]);

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
    if (editingLog) {
      const logId = editingLog.id;
      updateMutation.mutate(
        { id: logId, ...formData },
        {
          onSuccess: (updatedLog) => {
            setIsFormSuccess(true);
            setPendingUpdatedLogId(updatedLog.id);
            setTimeout(() => {
              setIsModalOpen(false);
              setIsFormSuccess(false);
              showNotification('success', 'Запись успешно обновлена');
            }, 600);
          },
          onError: (err: any) => {
            const msg = err.response?.data?.message || (err.request ? 'Не удалось сохранить изменения. Проверьте интернет-соединение.' : 'Ошибка обновления записи');
            showNotification('error', Array.isArray(msg) ? msg[0] : msg);
          },
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: (newLog) => {
          setIsFormSuccess(true);
          setPendingNewLogId(newLog.id);
          setTimeout(() => {
            setIsModalOpen(false);
            setIsFormSuccess(false);
            showNotification('success', 'Запись успешно добавлена в журнал');
          }, 600);
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || (err.request ? 'Не удалось добавить запись. Проверьте интернет-соединение.' : 'Ошибка добавления записи');
          showNotification('error', Array.isArray(msg) ? msg[0] : msg);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        showNotification('success', 'Запись удалена из журнала');
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || (err.request ? 'Не удалось удалить запись. Проверьте интернет-соединение.' : 'Ошибка удаления записи');
        showNotification('error', Array.isArray(msg) ? msg[0] : msg);
      },
    });
  };

  const totalEntries = totalLogsCount;
  const uniqueExecutors = new Set(workLogs.map((wl) => wl.executorName)).size;
  const todayEntries = workLogs.filter((wl) => {
    const logDate = new Date(wl.date).toDateString();
    const today = new Date().toDateString();
    return logDate === today;
  }).length;

  return (
    <div className={styles.appContainer}>
      {notification && (
        <div className={`${styles.toast} ${styles[notification.type]}`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

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

      <section className={styles.metrics}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Всего записей</span>
            <BarChart3 className={styles.metricIconAccent} size={20} />
          </div>
          <span className={styles.metricValue}>{showMetricsLoader ? '...' : totalEntries}</span>
          <span className={styles.metricDesc}>за все время</span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Исполнителей</span>
            <Users className={styles.metricIconAccent} size={20} />
          </div>
          <span className={styles.metricValue}>{showMetricsLoader ? '...' : uniqueExecutors}</span>
          <span className={styles.metricDesc}>активных бригадиров</span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>За сегодня</span>
            <CalendarDays className={styles.metricIconAccent} size={20} />
          </div>
          <span className={styles.metricValue}>{showMetricsLoader ? '...' : todayEntries}</span>
          <span className={styles.metricDesc}>выполнено смен</span>
        </div>
      </section>

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

        <WorkLogFilters
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          clearFilters={clearFilters}
        />

        <WorkLogTable
          workLogs={filteredAndSortedLogs}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          isDeleting={deleteMutation.isPending}
          isLoading={isLoadingLogs}
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
            <span className={styles.metricValue}>{showMetricsLoader ? '...' : totalEntries}</span>
            <span className={styles.metricDesc}>за все время</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>Исполнителей</span>
              <Users className={styles.metricIconAccent} size={20} />
            </div>
            <span className={styles.metricValue}>{showMetricsLoader ? '...' : uniqueExecutors}</span>
            <span className={styles.metricDesc}>активных бригадиров</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricTitle}>За сегодня</span>
              <CalendarDays className={styles.metricIconAccent} size={20} />
            </div>
            <span className={styles.metricValue}>{showMetricsLoader ? '...' : todayEntries}</span>
            <span className={styles.metricDesc}>выполнено смен</span>
          </div>
        </div>
      </Modal>

      <footer className={styles.footer}>
        <div className={styles.footerInfo}>
          <span>&copy; {new Date().getFullYear()} ООО «СтройКонтроль». Все права защищены. &bull; Система мониторинга строительных процессов</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
