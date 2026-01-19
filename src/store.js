import { conversationPharma } from './conversationEngine.js';

const sessions = new Map();

export function createSession(sessionId) {
  sessions.set(sessionId, {
    conversation: conversationPharma.INIT,
    order: {}
  });
}

export function getSession(sessionId) {
  return sessions.get(sessionId);
}
