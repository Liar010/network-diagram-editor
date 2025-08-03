/**
 * Generates a unique ID for diagram elements
 * Uses crypto.randomUUID() when available, falls back to timestamp + random
 */
export const generateId = (prefix: string = ''): string => {
  let id: string;
  
  // Use crypto.randomUUID() if available (more secure)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    id = crypto.randomUUID();
  } else {
    // Fallback for older browsers
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 11);
    const randomPart2 = Math.random().toString(36).substring(2, 11);
    id = `${timestamp}-${randomPart}-${randomPart2}`;
  }
  
  return prefix ? `${prefix}-${id}` : id;
};

/**
 * Validates if an ID is unique within a collection
 */
export const isUniqueId = (id: string, existingIds: string[]): boolean => {
  return !existingIds.includes(id);
};

/**
 * Generates a unique ID that doesn't exist in the collection
 */
export const generateUniqueId = (prefix: string, existingIds: string[]): string => {
  let id: string;
  let attempts = 0;
  const maxAttempts = 100;
  
  do {
    id = generateId(prefix);
    attempts++;
    if (attempts > maxAttempts) {
      throw new Error('Failed to generate unique ID after maximum attempts');
    }
  } while (!isUniqueId(id, existingIds));
  
  return id;
};