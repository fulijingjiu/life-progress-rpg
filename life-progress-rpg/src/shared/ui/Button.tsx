import { ButtonHTMLAttributes } from 'react';
import { cx } from '@/shared/lib/classnames';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
};

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cx('btn', `btn--${variant}`, className)}
      {...props}
    />
  );
}
