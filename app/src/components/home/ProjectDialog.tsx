import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ProjectDialogProps {
  open: boolean;
  newProjectName: string;
  creating: boolean;
  onOpenChange: (open: boolean) => void;
  onNewProjectNameChange: (name: string) => void;
  onCreateProject: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function ProjectDialog({
  open,
  newProjectName,
  creating,
  onOpenChange,
  onNewProjectNameChange,
  onCreateProject,
  onKeyDown
}: ProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Project name"
          value={newProjectName}
          onChange={e => onNewProjectNameChange(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onCreateProject}
            disabled={creating}
            variant="accent"
          >
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
