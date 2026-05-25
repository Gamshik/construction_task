import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './Modal.module.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  const overlayRef = React.useRef<HTMLDivElement>(null);

  const scrollPositionRef = React.useRef(0);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);

      // 1. Calculate scrollbar width BEFORE making body fixed (while scrollbar is still visible!)
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // 2. Capture current scroll position Y
      const scrollY = window.scrollY;
      scrollPositionRef.current = scrollY;

      // 3. Lock body scroll by making it fixed at current scroll Y position (prevents iOS keyboard page scroll)
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';

      // 4. Apply scrollbar compensation padding if needed
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else if (shouldRender) {
      setIsClosing(true);

      const scrollY = scrollPositionRef.current;

      // Restore original body styles
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      // Instantly restore original scroll position without visual jumps
      window.scrollTo(0, scrollY);

      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 380); // Wait for the transition to finish fully (specifically mobile drawer slide-down 350ms)
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const preventTouch = (e: TouchEvent) => {
      e.preventDefault();
    };

    const overlay = overlayRef.current;
    if (isOpen && overlay) {
      // Use active listener (passive: false) to allow blocking background scrolling on iOS Safari
      overlay.addEventListener('touchmove', preventTouch, { passive: false });
    }

    return () => {
      if (overlay) {
        overlay.removeEventListener('touchmove', preventTouch);
      }
    };
  }, [isOpen, shouldRender]);

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
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body
  );
};

