import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Prompt, Project, TabType } from "@/types";
import { useUniquePrompts } from "@/hooks/useUniquePrompts";
import { useCloudCredentials } from "@/hooks/useCloudCredentials";
import { CloudCredentialsPrompt } from "./CloudCredentialsPrompt";
import { RefObject, useEffect, useRef, useState } from "react";

interface ChatInterfaceProps {
  prompts: Prompt[];
  selectedProject: Project;
  promptInput: string;
  isSendingPrompt: boolean;
  isAgentProcessing?: boolean;
  loadingPrompts: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null> | null;
  onPromptInputChange: (value: string) => void;
  onSendPrompt: (e: React.FormEvent) => void;
  onSwitchTab: (tab: TabType) => void;
  isPolling?: boolean; // Optional prop to show polling status
}

export function ChatInterface({
  prompts,
  selectedProject,
  promptInput,
  isSendingPrompt,
  isAgentProcessing = false,
  loadingPrompts,
  messagesEndRef,
  onPromptInputChange,
  onSendPrompt,
  onSwitchTab
}: ChatInterfaceProps) {
  // Filter out any duplicate prompts by ID
  const uniquePrompts = useUniquePrompts(prompts);

  // Check cloud credentials status
  const { hasCredentials, loading: credentialsLoading } = useCloudCredentials();

  // Show credentials prompt if no credentials are set up and there are no prompts yet
  const shouldShowCredentialsPrompt = !credentialsLoading && !hasCredentials && uniquePrompts.length === 0;

  // --- New logic for scroll-to-bottom arrow ---
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      // Allow a small threshold for floating point errors
      const threshold = 32;
      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
      setIsAtBottom(atBottom);
    };
    container.addEventListener('scroll', handleScroll);
    // Check on mount
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, [uniquePrompts.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAtBottom && messagesEndRef && messagesEndRef.current) {
      if (messagesEndRef && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [uniquePrompts.length, isAtBottom, messagesEndRef]);

  const handleScrollToBottom = () => {
    if (messagesEndRef && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  // --- End new logic ---

  return (
    <div className="h-full flex flex-col relative">
      {/* Down arrow button - position absolutely in the parent flex container, above the chat input */}
      {!isAtBottom && (
        <button
          onClick={handleScrollToBottom}
          className="absolute left-1/2 -translate-x-1/2 bottom-20 z-30 bg-primary/20 text-primary-700 dark:text-primary-200 rounded-full shadow-sm p-2 hover:bg-primary/40 transition-colors cursor-pointer"
          aria-label="Scroll to latest message"
          type="button"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
        </button>
      )}
      <div
        className="flex-1 bg-card/50 rounded-lg p-4 border border-border mb-4 overflow-y-auto flex flex-col relative"
        ref={chatContainerRef}
      >
        {loadingPrompts ? (
          <div className="text-center text-muted-foreground">
            Loading prompts...
          </div>
        ) : shouldShowCredentialsPrompt ? (
          <CloudCredentialsPrompt
            onSetupCredentials={() => onSwitchTab('cloud')}
            onSwitchTab={onSwitchTab}
          />
        ) : uniquePrompts.length === 0 ? (
          <div className="text-center text-muted-foreground space-y-4">
            <div>
              No messages yet. Start a conversation for project: {selectedProject.name}
            </div>
            {!hasCredentials && !credentialsLoading && (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  💡 <strong>Tip:</strong> Set up your cloud credentials first for better infrastructure generation
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSwitchTab('cloud')}
                  className="text-xs"
                >
                  Configure Cloud Credentials
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            {/* Use uniquePrompts to avoid duplicate keys */}
            {uniquePrompts.map((prompt, index) => {
              return (
                <div
                  key={`${prompt.id}-${index}`}
                  className={`p-3 rounded-lg ${
                    prompt.role === 'user'
                      ? 'bg-primary/10 ml-auto max-w-[80%]'
                      : 'bg-secondary/10 mr-auto max-w-[80%]'
                  }`}
                >
                  <div className="text-sm">
                    {prompt.content.includes('⏳') ? (
                      <div className="flex items-center">
                        <div className="animate-pulse text-amber-500 mr-2 flex-shrink-0 text-xl relative">
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
                          ⏳
                        </div>
                        <div>
                          <p className="font-medium text-amber-600 dark:text-amber-400 mb-1">
                            Working on it<span className="inline-block animate-bounce">.</span><span className="inline-block animate-bounce delay-100">.</span><span className="inline-block animate-bounce delay-200">.</span>
                          </p>
                          <p className="text-muted-foreground">{prompt.content.replace('⏳', '').trim()}</p>
                        </div>
                      </div>
                    ) : prompt.content.includes('❌') ? (
                      <div className="flex items-center">
                        <div className="text-red-500 mr-2 flex-shrink-0 text-xl">
                          ❌
                        </div>
                        <div>
                          <p className="font-medium text-red-600 dark:text-red-400 mb-1">
                            Task Failed
                          </p>
                          <p className="text-muted-foreground">{prompt.content.replace('❌', '').trim()}</p>
                        </div>
                      </div>
                    ) : (
                      <p>{prompt.content}</p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                    <span>{prompt.role}</span>
                    <span>{new Date(prompt.created_at).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}

            {/* Agent processing indicator */}
            {isAgentProcessing && (
              <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-lg border border-dashed">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">Agent is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat input */}
      <form onSubmit={onSendPrompt} className="flex items-center gap-2">
        <Input
          placeholder={
            !hasCredentials && !credentialsLoading
              ? "Configure cloud credentials first to generate infrastructure..."
              : "Type your message..."
          }
          value={promptInput}
          onChange={(e) => onPromptInputChange(e.target.value)}
          className="flex-1"
          disabled={isSendingPrompt || (!hasCredentials && !credentialsLoading)}
        />
        <Button
          type="submit"
          disabled={isSendingPrompt || !promptInput.trim() || (!hasCredentials && !credentialsLoading)}
        >
          {isSendingPrompt ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  );
}
