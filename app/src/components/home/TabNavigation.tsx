import { TabType } from "@/types";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-border">
      <div className="flex h-10 items-center px-4">
        <button
          onClick={() => onTabChange('chat')}
          className={`px-3 py-1.5 text-sm font-medium transition-colors relative ${
            activeTab === 'chat'
              ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => onTabChange('diagrams')}
          className={`px-3 py-1.5 text-sm font-medium transition-colors relative ${
            activeTab === 'diagrams'
              ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Diagrams
        </button>
        <button
          onClick={() => onTabChange('cloud')}
          className={`px-3 py-1.5 text-sm font-medium transition-colors relative ${
            activeTab === 'cloud'
              ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Cloud
        </button>
        <button
          onClick={() => onTabChange('settings')}
          className={`px-3 py-1.5 text-sm font-medium transition-colors relative ${
            activeTab === 'settings'
              ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Settings
        </button>
      </div>
    </div>
  );
}
