'use client';

import { FC } from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { X } from 'lucide-react';

export const Toaster: FC = () => {
  return (
    <ToastPrimitives.Provider swipeDirection="right">
      <ToastPrimitives.Viewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-3 w-full max-w-sm z-50" />
    </ToastPrimitives.Provider>
  );
};

export const Toast: FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
}> = ({ open, onOpenChange, title, description, variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-surface-800 border-surface-700',
    success: 'bg-success-500/10 border-success-500/30',
    error: 'bg-error-500/10 border-error-500/30',
  };

  return (
    <ToastPrimitives.Root
      open={open}
      onOpenChange={onOpenChange}
      className={`${variantStyles[variant]} p-4 rounded-xl border shadow-lg backdrop-blur-xl`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <ToastPrimitives.Title className="font-medium">
            {title}
          </ToastPrimitives.Title>
          {description && (
            <ToastPrimitives.Description className="text-sm text-surface-400 mt-1">
              {description}
            </ToastPrimitives.Description>
          )}
        </div>
        <ToastPrimitives.Close className="p-1 rounded-lg hover:bg-surface-700 transition-colors">
          <X className="h-4 w-4" />
        </ToastPrimitives.Close>
      </div>
    </ToastPrimitives.Root>
  );
};

