/**
 * Generates a unique ID for new items.
 * @returns {string} A unique identifier.
 */
export const generateId = () => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
