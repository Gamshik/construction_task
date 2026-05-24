import { useState, useEffect } from 'react';
import { Plus, HardHat, CheckCircle, AlertCircle, BarChart3, Users, CalendarDays, Sun, Moon } from 'lucide-react';
import {
  useWorkLogs,
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
  const { data: workLogs = [], isLoading: isLoadingLogs } = useWorkLogs();
  const { data: workTypes = [] } = useWorkTypes();

  const createMutation = useCreateWorkLog();
  const updateMutation = useUpdateWorkLog();
  const deleteMutation = useDeleteWorkLog();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);

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

  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    filteredAndSortedLogs,
    clearFilters,
  } = useWorkLogFilters(workLogs);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddClick = () => {
    setEditingLog(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (log: WorkLog) => {
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
      updateMutation.mutate(
        { id: editingLog.id, ...formData },
        {
          onSuccess: () => {
            showNotification('success', 'Запись успешно обновлена');
            setIsModalOpen(false);
          },
          onError: (err: any) => {
            const msg = err.response?.data?.message || 'Ошибка обновления записи';
            showNotification('error', Array.isArray(msg) ? msg[0] : msg);
          },
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          showNotification('success', 'Запись успешно добавлена в журнал');
          setIsModalOpen(false);
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || 'Ошибка добавления записи';
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
      onError: () => {
        showNotification('error', 'Ошибка удаления записи');
      },
    });
  };

  const totalEntries = workLogs.length;
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
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Переключить тему"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Button onClick={handleAddClick} variant="primary" className={styles.addBtn}>
            <Plus size={18} />
            <span>Добавить запись</span>
          </Button>
        </div>
      </header>

      <section className={styles.metrics}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Всего записей</span>
            <BarChart3 className={styles.metricIconAccent} size={20} />
          </div>
          <span className={styles.metricValue}>{isLoadingLogs ? '...' : totalEntries}</span>
          <span className={styles.metricDesc}>за все время</span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Исполнителей</span>
            <Users className={styles.metricIconAccent} size={20} />
          </div>
          <span className={styles.metricValue}>{isLoadingLogs ? '...' : uniqueExecutors}</span>
          <span className={styles.metricDesc}>активных бригадиров</span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>За сегодня</span>
            <CalendarDays className={styles.metricIconAccent} size={20} />
          </div>
          <span className={styles.metricValue}>{isLoadingLogs ? '...' : todayEntries}</span>
          <span className={styles.metricDesc}>выполнено смен</span>
        </div>
      </section>

      <main className={styles.mainContent}>
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
        />
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLog ? 'Редактировать запись' : 'Добавить запись в журнал'}
      >
        <WorkLogForm
          workTypes={workTypes}
          initialData={editingLog}
          onSubmit={handleFormSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onCancel={() => setIsModalOpen(false)}
        />
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
