import { getAddressByCep } from './api.js';
import { logger } from './logger.js';
import { validators } from './validators.js';
import { getMedicinePrice } from './pricing.js';


export const conversationPharma = {
  INIT: 'INIT',
  ASK_MEDICINE: 'ASK_MEDICINE',
  ASK_NAME: 'ASK_NAME',
  ASK_CPF: 'ASK_CPF',
  ASK_PHONE: 'ASK_PHONE',
  ASK_CEP: 'ASK_CEP',
  FETCH_CEP_INFO: 'FETCH_CEP_INFO',
  CONFIRM_CITY_CEP: 'CONFIRM_CITY_CEP',
  ASK_STREET: 'ASK_STREET',
  ASK_NUMBER: 'ASK_NUMBER',
  ASK_DISTRICT: 'ASK_DISTRICT',
  CONFIRM_ADDRESS: 'CONFIRM_ADDRESS',
  END: 'END'
};


const handlers = {
  INIT: handleInit,
  ASK_MEDICINE: handleAskMedicine,
  ASK_NAME: handleAskName,
  ASK_CPF: handleAskCpf,
  ASK_PHONE: handleAskPhone,
  ASK_CEP: handleAskCep,
  FETCH_CEP_INFO: handleFetchCep,
  CONFIRM_CITY_CEP: handleConfirmCityCep,
  ASK_STREET: handleAskStreet,
  ASK_NUMBER: handleAskNumber,
  ASK_DISTRICT: handleAskDistrict,
  CONFIRM_ADDRESS: handleConfirmAddress,
  END: handleEnd
};

export async function handleConversation(session, userInput = '') {
  try {
    logger.info({
      sessionId: session.id,
      state: session.conversation
    }, 'Processando conversa');

    const handler = handlers[session.conversation];

    if (!handler) {
      session.conversation = conversationPharma.INIT;
      return 'Vamos começar! Qual o nome do medicamento?';
    }

    return await handler(session, userInput);

  } catch (error) {
    logger.error({ error }, 'Erro não tratado');
    session.conversation = conversationPharma.INIT;
    return 'Ocorreu um erro inesperado. Vamos começar novamente.';
  }
}



async function handleInit(session) {
  session.conversation = conversationPharma.ASK_MEDICINE;
   await delay(2000); 
  return 'Qual o nome do medicamento?'; 
}

function handleAskMedicine(session, input) {
  const medicine = input.trim();
  if (!medicine) return 'Por favor, digite o nome do medicamento.';

  session.order.medicine = medicine;
  session.order.price = getMedicinePrice(medicine);

  session.conversation = conversationPharma.ASK_NAME;
  return `Medicamento: ${medicine}

Valor: R$ ${session.order.price.toFixed(2)}

Agora Digite seu nome completo`;
}

function handleAskName(session, input) {
  session.order.name = input.trim();
  session.conversation = conversationPharma.ASK_CPF;
  return 'Digite seu CPF (apenas números)';
}

function handleAskCpf(session, input) {
  const cpf = input.replace(/\D/g, '');

  if (!validators.cpf(cpf)) {
    return 'CPF inválido. Digite novamente (11 números válidos)';
  }

  session.order.cpf = cpf;
  session.conversation = conversationPharma.ASK_PHONE;
  return 'Digite seu telefone com DDD (apenas números)';
}

function handleAskPhone(session, input) {
  const phone = input.replace(/\D/g, '');

  if (!validators.phone(phone)) {
    return 'Telefone inválido. Digite com DDD (10 ou 11 dígitos)';
  }

  session.order.phone = phone;
  session.conversation = conversationPharma.ASK_CEP;
  return 'Digite o CEP para entrega';
}

function handleAskCep(session, input) {
  const cep = input.replace(/\D/g, '');

  if (!validators.cep(cep)) {
    return 'CEP inválido. Digite 8 números';
  }

  session.order.cep = cep;
  session.conversation = conversationPharma.FETCH_CEP_INFO;
  return 'Consultando endereço...';
}

async function handleFetchCep(session) {
  try {
    const address = await getAddressByCep(session.order.cep);
    session.order.address = address;
    session.conversation = conversationPharma.CONFIRM_CITY_CEP;

    return `Encontrei as seguintes informações:

CEP: ${session.order.cep}
Cidade: ${address.localidade}/${address.uf}
Bairro: ${address.bairro || 'Não informado'}

A cidade e o CEP estão corretos? Sim ou não?`;

  } catch {
    session.conversation = conversationPharma.ASK_CEP;
    return 'Erro ao consultar o CEP. Digite novamente';
  }
}

function handleConfirmCityCep(session, input) {
  const confirm = input.toLowerCase().trim();

  if (!['sim', 's'].includes(confirm)) {
    session.conversation = conversationPharma.ASK_CEP;
    return 'Sem problemas. Digite o CEP novamente';
  }

  session.conversation = conversationPharma.ASK_STREET;
  return 'Digite o nome da rua';
}

function handleAskStreet(session, input) {
  session.order.address.logradouro = input.trim();
  session.conversation = conversationPharma.ASK_NUMBER;
  return 'Digite o número da residência';
}

function handleAskNumber(session, input) {
  session.order.number = input.trim();

  if (!session.order.address.bairro) {
    session.conversation = conversationPharma.ASK_DISTRICT;
    return 'Digite o nome do bairro';
  }

  session.conversation = conversationPharma.CONFIRM_ADDRESS;
  return buildAddressConfirmation(session);
}

function handleAskDistrict(session, input) {
  const district = input.trim();
  if (!district) return 'Por favor, digite o nome do bairro';

  session.order.address.bairro = district;
  session.conversation = conversationPharma.CONFIRM_ADDRESS;
  return buildAddressConfirmation(session);
}

async function handleConfirmAddress(session, input) {
  const confirm = input.toLowerCase().trim();

  if (!['sim', 's'].includes(confirm)) {
    session.conversation = conversationPharma.ASK_CEP;
    return 'Vamos corrigir. Digite o CEP novamente';
  }

  session.conversation = conversationPharma.END;

  const orderId = `PED${Date.now()}${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

  session.order.id = orderId;
  session.order.createdAt = new Date().toISOString();

  await delay(2000);

  const { order } = session;
  return `✅ Pedido #${orderId} confirmado com sucesso!

👤 Cliente: ${session.order.name}
🪪 CPF: ${session.order.cpf}
📞 Telefone: ${formatPhone(session.order.phone)}
💊 Medicamento: ${session.order.medicine}
💰 Valor do medicamento: R$ ${order.price.toFixed(2)}

📍 Endereço:
CEP: ${session.order.cep}
Logradouro: ${session.order.address.logradouro}, ${session.order.number}
Bairro: ${session.order.address.bairro}
Cidade: ${session.order.address.localidade}/${session.order.address.uf}

📅 Data: ${new Date().toLocaleDateString('pt-BR')}
⏰ Horário: ${new Date().toLocaleTimeString('pt-BR')}

Obrigado por comprar na Farmácia Local!`;
}

function handleEnd() {
  return 'Conversa finalizada. Para um novo pedido, inicie uma nova sessão.';
}


function buildAddressConfirmation(session) {
  const a = session.order.address;

  return `Confira o endereço completo:

CEP: ${session.order.cep}
Logradouro: ${a.logradouro}, ${session.order.number}
Bairro: ${a.bairro}
Cidade: ${a.localidade}/${a.uf}

Está tudo correto? Sim ou não`;
}

 function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function formatPhone(phone) {
  if (phone.length === 11) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  }
  return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
}
