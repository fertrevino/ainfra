import { Button } from "@/components/ui/button";
import { Project } from "@/types";

interface EmptyProjectStateProps {
  projects: Project[];
  onCreateProject: () => void;
}

export function EmptyProjectState({ projects, onCreateProject }: EmptyProjectStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="max-w-md text-center">
        <h2 className="text-xl font-semibold mb-2">No Project Selected</h2>
        <p className="text-muted-foreground mb-4">
          Select a project from the sidebar to view its details and work with it.
        </p>
        {projects.length === 0 && (
          <Button
            onClick={onCreateProject}
            variant="outline"
          >
            Create your first project
          </Button>
        )}
      </div>
    </div>
  );
}
