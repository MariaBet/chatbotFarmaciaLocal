import { getAddressByCep } from './api.js';
import { logger } from './logger.js';

export const conversationPharma = {
  INIT: 'INIT',
  ASK_MEDICINE: 'ASK_MEDICINE',
  ASK_NAME: 'ASK_NAME',
  ASK_CPF: 'ASK_CPF',
  ASK_CEP: 'ASK_CEP',
  FETCH_ADDRESS: 'FETCH_ADDRESS',
  ASK_STREET: 'ASK_STREET',
  ASK_DISTRICT: 'ASK_DISTRICT',
  CONFIRM_ADDRESS: 'CONFIRM_ADDRESS',
  ASK_NUMBER: 'ASK_NUMBER',
  END: 'END'
};

export async function handleConversation(session, userInput = '') {
  logger.info(
    { conversation: session.conversation, input: userInput },
    'Processando conversa Farmácia Local'
  );

  switch (session.conversation) {

    case conversationPharma.INIT:
      session.conversation = conversationPharma.ASK_MEDICINE;
      return 'Qual o nome do medicamento?';

    case conversationPharma.ASK_MEDICINE:
      session.order.medicine = userInput;
      session.conversation = conversationPharma.ASK_NAME;
      return 'Digite seu nome completo';

    case conversationPharma.ASK_NAME:
      session.order.name = userInput;
      session.conversation = conversationPharma.ASK_CPF;
      return 'Digite seu CPF (apenas números)';

    case conversationPharma.ASK_CPF:
      session.order.cpf = userInput.replace(/\D/g, '');

      if (session.order.cpf.length !== 11) {
        return 'CPF inválido. Digite novamente';
      }

      session.conversation = conversationPharma.ASK_CEP;
      return 'Informe o CEP para entrega';

    case conversationPharma.ASK_CEP:
      session.order.cep = userInput.replace(/\D/g, '');

      if (session.order.cep.length !== 8) {
        return 'CEP inválido. Informe novamente';
      }

      session.conversation = conversationPharma.FETCH_ADDRESS;
      return 'Consultando endereço...';

    case conversationPharma.FETCH_ADDRESS:
      try {
        const address = await getAddressByCep(session.order.cep);
        session.order.address = address;

        if (!address.logradouro) {
          session.conversation = conversationPharma.ASK_STREET;
          return 'Não encontrei o nome da rua. Pode informar o nome da rua?';
        }

        if (!address.bairro) {
          session.conversation = conversationPharma.ASK_DISTRICT;
          return 'Não encontrei o bairro. Pode informar o nome do bairro?';
        }

        session.conversation = conversationPharma.CONFIRM_ADDRESS;

        return `Encontrei este endereço:

${address.logradouro},
${address.bairro} - ${address.localidade}/${address.uf}

Está correto? (sim ou não)`;

      } catch (error) {
        logger.error({ err: error }, 'Erro ao consultar ViaCEP');
        session.conversation = conversationPharma.ASK_CEP;
        return 'Erro ao consultar o CEP. Informe novamente';
      }

    case conversationPharma.ASK_STREET:
      session.order.address.logradouro = userInput;

      if (!session.order.address.bairro) {
        session.conversation = conversationPharma.ASK_DISTRICT;
        return 'Agora, informe o nome do bairro';
      }

      session.conversation = conversationPharma.CONFIRM_ADDRESS;

      return `Endereço atualizado:

${session.order.address.logradouro},
${session.order.address.bairro} - ${session.order.address.localidade}/${session.order.address.uf}

Está correto? (sim ou não)`;

    case conversationPharma.ASK_DISTRICT:
      session.order.address.bairro = userInput;
      session.conversation = conversationPharma.CONFIRM_ADDRESS;

      return `Endereço atualizado:

${session.order.address.logradouro},
${session.order.address.bairro} - ${session.order.address.localidade}/${session.order.address.uf}

Está correto? (sim ou não)`;

    case conversationPharma.CONFIRM_ADDRESS:
      if (userInput.toLowerCase() !== 'sim') {
        session.conversation = conversationPharma.ASK_CEP;
        return 'Sem problemas. Informe o CEP novamente';
      }

      session.conversation = conversationPharma.ASK_NUMBER;
      return 'Informe o número da residência';

    case conversationPharma.ASK_NUMBER:
      session.order.number = userInput;
      session.conversation = conversationPharma.END;

      return `✅ Pedido confirmado com sucesso!

👤 Cliente: ${session.order.name}
🪪 CPF: ${session.order.cpf}
💊 Medicamento: ${session.order.medicine}
📍 Endereço: ${session.order.address.logradouro}, ${session.order.number}
${session.order.address.bairro} - ${session.order.address.localidade}/${session.order.address.uf}
Obrigado por comprar na Farmácia Local!`;

    default:
      return 'Conversa finalizada';
  }
}
