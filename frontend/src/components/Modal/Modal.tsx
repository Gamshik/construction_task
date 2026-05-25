import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { lockBodyScroll, unlockBodyScroll } from '@/utils';
import styles from './Modal.module.scss';

/**
 * Свойства компонента модального окна Modal.
 */
interface ModalProps {
  /** Флаг открытого состояния модального окна */
  isOpen: boolean;
  /** Функция обратного вызова для закрытия модального окна */
  onClose: () => void;
  /** Заголовок модального окна */
  title: string;
  /** Содержимое (тело) модального окна */
  children: React.ReactNode;
}

/**
 * Компонент модального окна с анимацией открытия/закрытия, оверлеем и порталом в body.
 * Управляет фокусом, закрытием по Escape/клику на оверлей, а также полностью блокирует скролл фона.
 * 
 * @param props Свойства модального окна
 * @returns React-компонент Modal
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  // Эффект для управления жизненным циклом модального окна и блокировки скролла
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);

      const scrollY = window.scrollY;
      scrollPositionRef.current = scrollY;
      lockBodyScroll(scrollY);
    } else if (shouldRender) {
      setIsClosing(true);

      const scrollY = scrollPositionRef.current;
      unlockBodyScroll(scrollY);

      // Время ожидания совпадает с длительностью анимации закрытия (380мс)
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 380);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Эффект для предотвращения свайпов фона (touchmove) на iOS Safari
  useEffect(() => {
    const preventTouch = (e: TouchEvent) => {
      e.preventDefault();
    };

    const overlay = overlayRef.current;
    if (isOpen && overlay) {
      overlay.addEventListener('touchmove', preventTouch, { passive: false });
    }

    return () => {
      if (overlay) {
        overlay.removeEventListener('touchmove', preventTouch);
      }
    };
  }, [isOpen, shouldRender]);

  // Эффект для закрытия модального окна по клавише Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className={`${styles.overlay} ${isClosing ? styles.closing : ''}`}
      onClick={onClose}
    >
      <div
        className={`${styles.modal} ${isClosing ? styles.closing : ''}`}
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            <X size={20} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body
  );
};
