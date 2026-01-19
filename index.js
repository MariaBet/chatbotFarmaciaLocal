import express from 'express';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

import { handleConversation } from './src/conversationEngine.js';
import { createSession, getSession } from './src/store.js';
import { logger } from './src/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve HTML de teste
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia conversa
app.post('/start', (req, res) => {
  const sessionId = uuid();
  createSession(sessionId);

  logger.info({ sessionId }, 'Sessão iniciada');

  res.json({
    sessionId,
    message: 'Bem-vindo à Farmácia Local! 👋'
  });
});

// Continua conversa
app.post('/conversation', async (req, res) => {
  const { sessionId, message } = req.body;

  const session = getSession(sessionId);
  if (!session) {
    logger.warn({ sessionId }, 'Sessão não encontrada');
    return res.status(404).json({ error: 'Sessão não encontrada' });
  }

  const reply = await handleConversation(session, message);

  res.json({
    conversation: session.conversation,
    reply
  });
});

// Start server
app.listen(3000, () => {
  logger.info('Servidor rodando em http://localhost:3000');
});
