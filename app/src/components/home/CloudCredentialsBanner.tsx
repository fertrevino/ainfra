import { AlertTriangle, X, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabType } from '@/types';
import { useCloudCredentials } from '@/hooks/useCloudCredentials';

interface CloudCredentialsBannerProps {
  onDismiss: () => void;
  onSwitchTab: (tab: TabType) => void;
  isDismissed: boolean;
}

export function CloudCredentialsBanner({
  onDismiss,
  onSwitchTab,
  isDismissed
}: CloudCredentialsBannerProps) {
  const { hasCredentials, loading } = useCloudCredentials();

  // Don't show banner if dismissed, still loading, or credentials exist
  if (isDismissed || loading || hasCredentials) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="flex items-center justify-between p-3 px-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <Cloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="flex-1">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Cloud credentials required to generate infrastructure
            </h4>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
              Set up your AWS, Azure, or Google Cloud credentials to start building infrastructure with AI
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSwitchTab('cloud')}
            className="text-xs h-7 bg-white/80 dark:bg-gray-800/80 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
          >
            Configure Now
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-7 w-7 p-0 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
