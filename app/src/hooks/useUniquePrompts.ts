import { useEffect, useState } from 'react';
import { Prompt } from '@/types';

/**
 * Custom hook to filter out duplicate prompts by ID
 * This solves the React warning about duplicate keys and provides better UX
 * when temporary and real messages with the same ID exist
 */
export function useUniquePrompts(prompts: Prompt[]): Prompt[] {
  const [uniquePrompts, setUniquePrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    // Use a Map to store the latest prompt for each ID
    const idMap = new Map<string, Prompt>();

    // Process prompts in chronological order with a bias for non-temporary messages
    // This ensures if there are duplicates, we prefer the server-generated ones
    [...prompts]
      .sort((a, b) => {
        // First compare by whether they're temporary messages (non-temp messages first)
        const aIsTemp = a.id.startsWith('temp-');
        const bIsTemp = b.id.startsWith('temp-');
        if (aIsTemp !== bIsTemp) {
          return aIsTemp ? 1 : -1; // Non-temporary messages come first
        }

        // Then sort by creation time (newer messages have priority)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .forEach(prompt => {
        // Only add the prompt if we haven't seen its ID yet or if this is a non-temporary message
        // replacing a temporary one with the same base ID
        const tempIdWithoutPrefix = prompt.id.replace('temp-', '');

        if (!idMap.has(prompt.id) &&
            !(prompt.id.startsWith('temp-') && idMap.has(tempIdWithoutPrefix))) {
          idMap.set(prompt.id, prompt);
        }
      });

    // Convert back to array, preserving the original order
    const result: Prompt[] = [];
    const seenIds = new Set<string>();

    // Go through the original array to maintain order
    prompts.forEach(prompt => {
      if (!seenIds.has(prompt.id)) {
        result.push(idMap.get(prompt.id)!);
        seenIds.add(prompt.id);
      }
    });

    setUniquePrompts(result);
  }, [prompts]);

  return uniquePrompts;
}
