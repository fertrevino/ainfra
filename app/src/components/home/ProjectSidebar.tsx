import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Project, User } from "@/types";

interface ProjectSidebarProps {
  user: User;
  projects: Project[];
  selectedProject: Project | null;
  loadingProjects: boolean;
  editingProjectId: string | null;
  editedProjectName: string;
  updating: boolean;
  onProjectSelect: (project: Project) => void;
  onAddProject: () => void;
  onSignOut: () => void;
  onStartEditing: (project: Project) => void;
  onCancelEditing: () => void;
  onUpdateProject: (projectId: string) => void;
  onSetEditedProjectName: (name: string) => void;
  onDeleteProject: (project: Project) => void;
  onEditKeyDown: (e: React.KeyboardEvent, projectId: string) => void;
}

export function ProjectSidebar({
  user,
  projects,
  selectedProject,
  loadingProjects,
  editingProjectId,
  editedProjectName,
  updating,
  onProjectSelect,
  onAddProject,
  onSignOut,
  onStartEditing,
  onCancelEditing,
  onUpdateProject,
  onSetEditedProjectName,
  onDeleteProject,
  onEditKeyDown
}: ProjectSidebarProps) {
  return (
    <div className="w-72 border-r border-border bg-card overflow-auto flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projects</h2>
        <Button
          onClick={onAddProject}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Add project</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {loadingProjects ? (
          <div className="text-center py-4 text-sm text-muted-foreground">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <p className="text-sm text-muted-foreground mb-2">No projects found</p>
            <Button
              onClick={onAddProject}
              variant="outline"
              size="sm"
            >
              Create your first project
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {projects.map((project) => (
              <div key={project.id} className={`group rounded-md transition-colors ${
                selectedProject?.id === project.id
                  ? 'bg-accent hover:bg-accent/85'
                  : 'hover:bg-accent/50'
              }`}>
                {editingProjectId === project.id ? (
                  <div className="p-2">
                    <Input
                      value={editedProjectName}
                      onChange={e => onSetEditedProjectName(e.target.value)}
                      onKeyDown={e => onEditKeyDown(e, project.id)}
                      autoFocus
                      className="h-8 text-sm"
                    />
                    <div className="flex justify-end gap-1 mt-1">
                      <Button
                        onClick={() => onUpdateProject(project.id)}
                        disabled={updating}
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs px-2"
                      >
                        {updating ? '...' : 'Save'}
                      </Button>
                      <Button
                        onClick={onCancelEditing}
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs px-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-between p-2 cursor-pointer"
                    onClick={() => onProjectSelect(project)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium truncate">{project.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/30 rounded px-1">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartEditing(project);
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <span className="sr-only">Edit</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(project);
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-white hover:bg-destructive hover:border-destructive focus:ring-destructive"
                      >
                        <span className="sr-only">Delete</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
