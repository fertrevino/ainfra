import { useEffect, useRef } from 'react';
import { Prompt } from '@/types';

interface TaskErrorNotifierProps {
  prompts: Prompt[];
}

export function TaskErrorNotifier({ prompts }: TaskErrorNotifierProps) {
  const lastErrorId = useRef<string | null>(null);

  useEffect(() => {
    // Find the most recent error message
    const errorMessages = prompts
      .filter(p => p.role === 'assistant' && p.content.includes('❌'))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (errorMessages.length > 0) {
      const latestError = errorMessages[0];

      // Only show notification if this is a new error
      if (latestError.id !== lastErrorId.current) {
        lastErrorId.current = latestError.id;

        const errorMessage = latestError.content.replace('❌', '').trim();
        const errorTitle = errorMessage.split(':')[0] || 'Task Failed';

        // Log error to console for development
        console.error('Task Error:', errorTitle, errorMessage);

        // Show browser notification if permission is granted
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(errorTitle, {
              body: errorMessage,
              icon: '/favicon.ico',
              tag: 'task-error', // Prevents duplicate notifications
            });
          } else if (Notification.permission !== 'denied') {
            // Request permission for future notifications
            Notification.requestPermission();
          }
        }
      }
    }
  }, [prompts]);

  return null; // This component doesn't render anything
}
