// A2A Protocol Types

export type A2APart =
  | {
      kind: 'data';
      data: Record<string, unknown>;
    }
  | {
      kind: 'text';
      text: string;
    }
  | {
      kind: 'file';
      file: {
        name: string;
        url: string;
        mimeType?: string;
      };
    };

export interface A2AMessage {
  role: 'user' | 'agent';
  parts: A2APart[];
  messageId: string;
  kind: 'message';
  taskId?: string;
  contextId?: string;
  referenceTaskIds?: string[];
  metadata?: Record<string, unknown>;
}
