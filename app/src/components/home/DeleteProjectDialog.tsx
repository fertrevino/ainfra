import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Project } from "@/types";

interface DeleteProjectDialogProps {
  open: boolean;
  projectToDelete: Project | null;
  deleting: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteProject: () => void;
}

export function DeleteProjectDialog({
  open,
  projectToDelete,
  deleting,
  onOpenChange,
  onDeleteProject
}: DeleteProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{projectToDelete?.name}&rdquo;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onDeleteProject}
            disabled={deleting}
            variant="destructive"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
