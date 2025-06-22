import { Project } from "@/types";

interface SettingsTabProps {
  selectedProject: Project;
}

export function SettingsTab({ selectedProject }: SettingsTabProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-card/50 rounded-lg p-4 border border-border">
        <div className="text-muted-foreground text-center">
          Settings for project: {selectedProject.name}
        </div>
      </div>
    </div>
  );
}
