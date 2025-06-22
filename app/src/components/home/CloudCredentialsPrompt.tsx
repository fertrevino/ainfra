import { Cloud, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabType } from '@/types';

interface CloudCredentialsPromptProps {
  onSetupCredentials: () => void;
  onSwitchTab: (tab: TabType) => void;
}

export function CloudCredentialsPrompt({ onSetupCredentials, onSwitchTab }: CloudCredentialsPromptProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <Cloud className="h-16 w-16 text-blue-500" />
            <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Cloud Credentials Required
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Before you can start generating infrastructure code, you&apos;ll need to set up your cloud provider credentials.
            This allows our AI to create resources in your preferred cloud environment.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 text-sm">
            Supported Cloud Providers:
          </h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-1 bg-orange-100 dark:bg-orange-900/20 rounded flex items-center justify-center">
                <span className="text-orange-600 dark:text-orange-400 font-bold">AWS</span>
              </div>
              <span className="text-muted-foreground">Amazon Web Services</span>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-1 bg-blue-100 dark:bg-blue-900/20 rounded flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-bold">Az</span>
              </div>
              <span className="text-muted-foreground">Microsoft Azure</span>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-1 bg-red-100 dark:bg-red-900/20 rounded flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 font-bold">GCP</span>
              </div>
              <span className="text-muted-foreground">Google Cloud</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onSetupCredentials}
            className="w-full"
            size="lg"
          >
            Set Up Cloud Credentials
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() => onSwitchTab('cloud')}
            className="w-full"
          >
            Go to Cloud Settings
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>🔒 Your credentials are securely encrypted and stored</p>
          <p>👤 Only you can access your credential information</p>
        </div>
      </div>
    </div>
  );
}
