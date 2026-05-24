import React from 'react';
import styles from './Button.module.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${isLoading ? styles.loading : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className={styles.spinner}></span>}
      <span className={styles.content}>{children}</span>
    </button>
  );
};
