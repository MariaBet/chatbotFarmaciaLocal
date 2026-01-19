// index.js
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

import { handleConversation } from './src/conversationEngine.js';
import { createSession, getSession } from './src/store.js';
import { logger } from './src/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal
app.get('/', (req, res) => {
  logger.info({ path: '/', ip: req.ip }, 'Página principal acessada');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar nova sessão
app.post('/start', (req, res) => {
  const sessionId = uuidv4();
  createSession(sessionId);
  
  logger.info({ 
    sessionId, 
    ip: req.ip,
    userAgent: req.get('User-Agent')
  }, 'Nova sessão iniciada');
  
  res.json({
    sessionId,
    message: "Bem-vindo à Farmácia Local! 💊 Quer pedir seu medicamento sem complicações? Estamos prontos para te atender. \nComo podemos ajudar hoje?",
    success: true
  });
});

// Processar mensagem
app.post('/conversation', async (req, res) => {
  const { sessionId, message } = req.body;
  
  // Validação básica
  if (!sessionId || message === undefined) {
    logger.warn({ 
      body: req.body,
      ip: req.ip 
    }, 'Requisição inválida - campos faltando');
    
    return res.status(400).json({ 
      error: 'sessionId e message são obrigatórios' 
    });
  }
  
  // Buscar sessão
  const session = getSession(sessionId);
  if (!session) {
    logger.warn({ 
      sessionId,
      ip: req.ip 
    }, 'Sessão não encontrada');
    
    return res.status(404).json({ 
      error: 'Sessão não encontrada',
      suggestion: 'Inicie uma nova sessão em /start'
    });
  }
  
  try {
    logger.info({
      sessionId,
      state: session.conversation,
      messageLength: message.length,
      messagePreview: message.substring(0, 100)
    }, 'Processando mensagem do usuário');
    
    // Processar mensagem usando o bot
    const reply = await handleConversation(session, message);
    
    logger.info({
      sessionId,
      oldState: session.conversation,
      newState: session.conversation, // atualizado pelo handleConversation
      replyLength: reply.length
    }, 'Mensagem processada com sucesso');
    
    // Responder ao cliente
    res.json({
      sessionId,
      conversation: session.conversation,
      reply,
      isFinished: session.conversation === 'END'
    });
    
  } catch (error) {
    logger.error({
      sessionId,
      error: error.message,
      stack: error.stack,
      message: message
    }, 'Erro no processamento da mensagem');
    
    res.status(500).json({
      error: 'Erro interno no servidor',
      message: 'Ocorreu um erro ao processar sua mensagem.'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  const health = { 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
  
  logger.debug(health, 'Health check');
  res.json(health);
});

// Rota 404
app.use((req, res) => {
  logger.warn({
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  }, 'Rota não encontrada');
  
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  }, 'Erro interno do servidor');
  
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Tente novamente mais tarde'
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Servidor iniciado na porta ${PORT}`);
  logger.info(`Acesse: http://localhost:${PORT}`);
});