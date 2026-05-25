/**
 * Форматирует строку даты ISO в формат YYYY-MM-DD для работы с HTML input type="date".
 * 
 * @param dateStr Строка даты в формате ISO или пустая/невалидная строка
 * @returns Строка в формате YYYY-MM-DD
 */
export const formatDateToInputValue = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Получает сегодняшнюю дату в формате YYYY-MM-DD.
 * 
 * @returns Строка сегодняшней даты YYYY-MM-DD
 */
export const getTodayInputValue = (): string => {
  return formatDateToInputValue(new Date().toISOString());
};

/**
 * Форматирует дату ISO в локализованную русскую строку (например, "25 мая 2026 г.").
 * 
 * @param dateStr ISO строка даты
 * @returns Отформатированная строка даты
 */
export const formatDateRussian = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};
