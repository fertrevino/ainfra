import { Project } from "@/types";

interface ProjectHeaderProps {
  selectedProject: Project | null;
}

export function ProjectHeader({ selectedProject }: ProjectHeaderProps) {
  return (
    <div className="border-b border-border">
      <div className="flex h-14 items-center justify-between px-6">
        {selectedProject ? (
          <h1 className="text-lg font-semibold">{selectedProject.name}</h1>
        ) : (
          <h1 className="text-lg font-medium text-muted-foreground">Select a project</h1>
        )}
      </div>
    </div>
  );
}
