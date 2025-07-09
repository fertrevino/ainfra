"use client";
import { useEffect, useState, useCallback, useRef } from 'react';
import { Project, Prompt, TabType, User } from '@/types';
import {
  ProjectSidebar,
  TabNavigation,
  ChatInterface,
  DiagramTab,
  SettingsTab,
  CloudTab,
  ProjectDialog,
  DeleteProjectDialog,
  EmptyProjectState,
  ProjectHeader,
  CloudCredentialsBanner
} from '@/components/home';

// This will be replaced with actual user authentication logic
const user: User = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'dummyuser@example.com',
  full_name: 'Dummy User',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-06-01T00:00:00.000Z',
  is_active: true,
  is_admin: false,
  last_login: '2025-06-19T00:00:00.000Z',
  profile_picture_url: 'https://example.com/avatar.png',
}

const session = {
  data: {
    session: {
      access_token: ''
    }
  }
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch projects function (can be called after creating a new project)
  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoadingProjects(true);
    const accessToken = session?.data?.session?.access_token;
    const res = await fetch(`/api/project?owner_id=${user.id}`, {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      }
    });
    const data = await res.json();
    setProjects(data.projects || []);
    if (data.projects?.length > 0 && !selectedProject) {
      setSelectedProject(data.projects[0]);
    }
    setLoadingProjects(false);
  }, [user, session, selectedProject]);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editedProjectName, setEditedProjectName] = useState('');
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [promptInput, setPromptInput] = useState('');
  const [isSendingPrompt, setIsSendingPrompt] = useState(false);
  const [isAgentProcessing, setIsAgentProcessing] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Handler for switching tabs
  const handleSwitchTab = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Handler for dismissing the banner
  const handleDismissBanner = () => {
    setIsBannerDismissed(true);
  };

  // Define fetchPrompts as a useCallback to manage dependencies properly
  const fetchPrompts = useCallback(async (projectId: string, initialLoad = false) => {
    if (!user) return;

    // Only show loading state on initial load
    if (initialLoad) {
      setLoadingPrompts(true);
    }

    try {
      const accessToken = session?.data?.session?.access_token;
      const res = await fetch(`/api/prompt?project_id=${projectId}`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        }
      });

      if (res.ok) {
        const data = await res.json();
        // Sort prompts from oldest to newest for display
        const sortedPrompts = [...(data.prompts || [])].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        // When not initial load, merge with existing messages intelligently to avoid flickering
        if (!initialLoad && prompts.length > 0) {
          // Get a set of all existing prompt IDs that aren't temporary
          const existingIds = new Set(prompts.filter(p => !p.id.startsWith('temp-')).map(p => p.id));

          // Find only new messages that aren't already in our list
          const newMessages = sortedPrompts.filter(p => !existingIds.has(p.id));

          if (newMessages.length > 0) {
            // Add only new messages, preserving existing ones
            setPrompts(prevPrompts => {
              // Remove any temporary messages first
              const withoutTemp = prevPrompts.filter(p => !p.id.startsWith('temp-'));

              // Create a map of IDs we already have to avoid duplicates
              const existingMessageIds = new Set(withoutTemp.map(p => p.id));

              // Filter out any messages that would create duplicates
              const uniqueNewMessages = newMessages.filter(msg => !existingMessageIds.has(msg.id));

              return [...withoutTemp, ...uniqueNewMessages];
            });
          }
        } else {
          // On initial load, just set all prompts
          setPrompts(sortedPrompts);
        }
      } else {
        console.error('Failed to fetch prompts');
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      if (initialLoad) {
        setLoadingPrompts(false);
      }
    }
  }, [user, prompts]); // Include prompts to prevent infinite loop

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [prompts]);

  // Fetch prompts whenever selected project changes
  useEffect(() => {
    if (selectedProject) {
      fetchPrompts(selectedProject.id, true); // true indicates initial load
    }
  }, [selectedProject]); // Remove prompts from dependency array

  // This function is implemented once user authentication is set up
  const handleSignOut = async () => {
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setCreating(true);
    const res = await fetch('/api/project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session.data.session.access_token ? { Authorization: `Bearer ${session.data.session.access_token}` } : {})
      },
      body: JSON.stringify({ name: newProjectName, owner_id: user?.id }),
    });
    setCreating(false);
    setShowDialog(false);
    setNewProjectName('');
    if (res.ok) {
      const responseData = await res.json();
      if (responseData.project) {
        setSelectedProject(responseData.project);
      }
      await fetchProjects(); // Update the projects list after creation
    } else {
      alert('Failed to create project');
    }
  };

  const handleUpdateProjectName = async (projectId: string) => {
    if (!editedProjectName.trim() || !projectId) return;
    setUpdating(true);

    const accessToken = session.data.session?.access_token;
    const res = await fetch('/api/project', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      },
      body: JSON.stringify({ id: projectId, name: editedProjectName }),
    });

    setUpdating(false);
    setEditingProjectId(null);

    if (res.ok) {
      fetchProjects();
    } else {
      alert('Failed to update project name');
    }
  };

  const confirmDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteDialog(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    setDeleting(true);
    const accessToken = session.data.session?.access_token;

    const res = await fetch(`/api/project?id=${projectToDelete.id}`, {
      method: 'DELETE',
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      }
    });

    setDeleting(false);
    setShowDeleteDialog(false);
    setProjectToDelete(null);

    if (res.ok) {
      // If we're deleting the currently selected project, reset selection
      if (selectedProject?.id === projectToDelete.id) {
        setSelectedProject(null);
      }
      fetchProjects();
    } else {
      alert('Failed to delete project');
    }
  };

  const startEditing = (project: Project) => {
    setEditingProjectId(project.id);
    setEditedProjectName(project.name);
  };

  const cancelEditing = () => {
    setEditingProjectId(null);
    setEditedProjectName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !creating && newProjectName.trim()) {
      handleCreateProject();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, projectId: string) => {
    if (e.key === 'Enter' && !updating && editedProjectName.trim()) {
      // handleUpdateProjectName(projectId);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    // Reset editing state if we're selecting a different project
    if (editingProjectId && editingProjectId !== project.id) {
      cancelEditing();
    }
    // No need to call fetchPrompts here - the useEffect will handle it
  };

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!promptInput.trim() || !selectedProject || !user) return;

    setIsSendingPrompt(true);

    // Create a temporary message object to display immediately
    const tempMessage: Prompt = {
      id: `temp-${Date.now()}`, // Temporary ID until we get the real one
      project_id: selectedProject.id,
      user_id: user.id,
      role: 'user',
      content: promptInput,
      created_at: new Date().toISOString()
    };

    // Add both temporary messages to the UI immediately for instant feedback
    setPrompts(prevPrompts => [...prevPrompts, tempMessage]);

    // Store the message text and clear the input right away for better UX
    const messageText = promptInput;
    setPromptInput('');

    try {
      const accessToken = session.data.session?.access_token;

      const requestData = {
        project_id: selectedProject.id,
        user_id: user.id,
        role: 'user',
        content: messageText
      };

      const res = await fetch('/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify(requestData),
      });

      if (res.ok) {
        // If the API returns the created message, we could update our temporary message
        // with the real ID and creation time
        const responseData = await res.json();

        setPrompts(prevPrompts => {
          // Create a new array for the updated prompts
          const updatedPrompts = [...prevPrompts];

          // Find indexes of our temporary messages
          const tempUserMsgIndex = updatedPrompts.findIndex(p => p.id === tempMessage.id);

          // Replace the temporary user message with the real one
          if (tempUserMsgIndex !== -1 && responseData.prompt) {
            updatedPrompts[tempUserMsgIndex] = responseData.prompt;
          }

          return updatedPrompts;
        });

        // Trigger agent processing after successfully storing the user prompt
        try {
          setIsAgentProcessing(true);

          const agentRes = await fetch('/api/agent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
            },
            body: JSON.stringify({
              project_id: selectedProject.id
            }),
          });

          if (agentRes.ok) {
            const agentResponseData = await agentRes.json();

            // Add the agent's response to the conversation
            if (agentResponseData.prompt) {
              setPrompts(prevPrompts => [...prevPrompts, agentResponseData.prompt]);
            }
          } else {
            const agentErrorData = await agentRes.json();
            console.error('Failed to process agent:', agentErrorData);
            // You might want to show a user-friendly error message here
          }
        } catch (agentError) {
          console.error('Error processing agent:', agentError);
          // You might want to show a user-friendly error message here
        } finally {
          setIsAgentProcessing(false);
        }

        // We don't need to fetch all prompts here - we've already updated our local state
      } else {
        const errorData = await res.json();
        console.error('Failed to send prompt:', errorData);

        // Remove temporary message on failure
        setPrompts(prevPrompts => prevPrompts.filter(p =>
          p.id !== tempMessage.id
        ));
      }
    } catch (error) {
      console.error('Error sending prompt:', error);

      // Remove temporary message on error
      setPrompts(prevPrompts => prevPrompts.filter(p =>
        p.id !== tempMessage.id
      ));
    } finally {
      setIsSendingPrompt(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex h-screen w-full">
      {/* Left Sidebar - Projects */}
      <ProjectSidebar
        user={user}
        projects={projects}
        selectedProject={selectedProject}
        loadingProjects={loadingProjects}
        editingProjectId={editingProjectId}
        editedProjectName={editedProjectName}
        updating={updating}
        onProjectSelect={handleSelectProject}
        onAddProject={() => setShowDialog(true)}
        onSignOut={handleSignOut}
        onStartEditing={startEditing}
        onCancelEditing={cancelEditing}
        onUpdateProject={handleUpdateProjectName}
        onSetEditedProjectName={setEditedProjectName}
        onDeleteProject={confirmDeleteProject}
        onEditKeyDown={handleEditKeyDown}
      />

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header with selected project info */}
        <ProjectHeader selectedProject={selectedProject} />

        {selectedProject ? (
          <>
            {/* Tab navigation */}
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Cloud credentials banner */}
            {user && (
              <CloudCredentialsBanner
                onSwitchTab={handleSwitchTab}
                onDismiss={handleDismissBanner}
                isDismissed={isBannerDismissed}
              />
            )}

            {/* Content based on selected tab */}
            <div className="flex-1 p-6 overflow-auto">
              {activeTab === 'chat' && (
                <>
                  <ChatInterface
                    prompts={prompts}
                    selectedProject={selectedProject}
                    promptInput={promptInput}
                    isSendingPrompt={isSendingPrompt}
                    isAgentProcessing={isAgentProcessing}
                    loadingPrompts={loadingPrompts}
                    messagesEndRef={messagesEndRef}
                    onPromptInputChange={setPromptInput}
                    onSendPrompt={handleSendPrompt}
                    isPolling={isPolling}
                    onSwitchTab={handleSwitchTab}
                  />
                </>
              )}

              {activeTab === 'diagrams' && (
                <DiagramTab selectedProject={selectedProject} />
              )}

              {activeTab === 'cloud' && user && (
                <CloudTab user={user} />
              )}

              {activeTab === 'settings' && (
                <SettingsTab selectedProject={selectedProject} />
              )}
            </div>
          </>
        ) : (
          <EmptyProjectState
            projects={projects}
            onCreateProject={() => setShowDialog(true)}
          />
        )}
      </div>

      {/* Create Project Dialog */}
      <ProjectDialog
        open={showDialog}
        newProjectName={newProjectName}
        creating={creating}
        onOpenChange={setShowDialog}
        onNewProjectNameChange={setNewProjectName}
        onCreateProject={handleCreateProject}
        onKeyDown={handleKeyDown}
      />

      {/* Delete Project Confirmation Dialog */}
      <DeleteProjectDialog
        open={showDeleteDialog}
        projectToDelete={projectToDelete}
        deleting={deleting}
        onOpenChange={setShowDeleteDialog}
        onDeleteProject={handleDeleteProject}
      />
    </div>
  );
}
