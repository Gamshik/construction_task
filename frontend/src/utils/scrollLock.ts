/**
 * Блокирует прокрутку страницы (body), компенсируя ширину полосы прокрутки.
 * Предотвращает нежелательный сдвиг контента и прокрутку фона на iOS устройствах.
 * 
 * @param scrollY Текущая позиция прокрутки по оси Y
 */
export const lockBodyScroll = (scrollY: number): void => {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.overflow = 'hidden';

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
};

/**
 * Разблокирует прокрутку страницы (body) и восстанавливает позицию прокрутки.
 * 
 * @param scrollY Восстанавливаемая позиция прокрутки по оси Y
 */
export const unlockBodyScroll = (scrollY: number): void => {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  
  window.scrollTo(0, scrollY);
};
