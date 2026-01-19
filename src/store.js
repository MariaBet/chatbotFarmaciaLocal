import { logger } from './logger.js';

const sessions = new Map();

// Criar nova sessão
export function createSession(sessionId) {
  const session = {
    id: sessionId,
    conversation: 'INIT',
    order: {
      medicine: '',
      name: '',
      cpf: '',
      cep: '',
      number: '',
      address: {}
    }
  };
  
  sessions.set(sessionId, session);
  
  logger.info({ sessionId }, 'Sessão criada');
  
  return session;
}

// Buscar sessão
export function getSession(sessionId) {
  const session = sessions.get(sessionId);
  
  if (!session) {
    logger.warn({ sessionId }, 'Sessão não encontrada');
  }
  
  return session;
}