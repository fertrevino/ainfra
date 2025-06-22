import { Project } from "@/types";

interface DiagramTabProps {
  selectedProject: Project;
}

export function DiagramTab({ selectedProject }: DiagramTabProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-card/50 rounded-lg p-4 border border-border">
        <div className="text-muted-foreground text-center">
          Diagram tools for project: {selectedProject.name}
        </div>
      </div>
    </div>
  );
}
