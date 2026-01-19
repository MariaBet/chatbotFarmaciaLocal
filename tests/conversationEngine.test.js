import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../src/api.js', () => ({
    getAddressByCep: jest.fn()
}));

jest.unstable_mockModule('../src/logger.js', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn()
    }
}));

const { handleConversation, conversationPharma } =
    await import('../src/conversationEngine.js');

const { getAddressByCep } =
    await import('../src/api.js');

function createSession(state = conversationPharma.INIT) {
    return {
        id: 'session-test',
        conversation: state,
        order: {}
    };
}

describe('ConversationEngine', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('INIT deve perguntar o medicamento', async () => {
        const session = createSession();

        const response = await handleConversation(session);

        expect(response).toBe('Qual o nome do medicamento?');
        expect(session.conversation).toBe(conversationPharma.ASK_MEDICINE);
    });

    it('CPF inválido deve ser rejeitado', async () => {
        const session = createSession(conversationPharma.ASK_CPF);

        const response = await handleConversation(session, '123');

        expect(response).toContain('CPF inválido');
        expect(session.conversation).toBe(conversationPharma.ASK_CPF);
    });

    it('Telefone inválido deve ser rejeitado', async () => {
        const session = createSession(conversationPharma.ASK_PHONE);

        const response = await handleConversation(session, '999');

        expect(response).toContain('Telefone inválido');
        expect(session.conversation).toBe(conversationPharma.ASK_PHONE);
    });

    it('CEP inválido deve ser rejeitado', async () => {
        const session = createSession(conversationPharma.ASK_CEP);

        const response = await handleConversation(session, '123');

        expect(response).toContain('CEP inválido');
        expect(session.conversation).toBe(conversationPharma.ASK_CEP);
    });

    it('FETCH_CEP_INFO deve retornar endereço (sucesso)', async () => {
        const session = createSession(conversationPharma.FETCH_CEP_INFO);
        session.order.cep = '01001000';

        getAddressByCep.mockResolvedValue({
            logradouro: 'Praça da Sé',
            bairro: 'Sé',
            localidade: 'São Paulo',
            uf: 'SP'
        });

        const response = await handleConversation(session);

        expect(response).toContain('São Paulo/SP');
        expect(session.conversation).toBe(conversationPharma.CONFIRM_CITY_CEP);
    });

    it('FETCH_CEP_INFO deve tratar erro do ViaCEP', async () => {
        const session = createSession(conversationPharma.FETCH_CEP_INFO);
        session.order.cep = '01001000';

        getAddressByCep.mockRejectedValue(new Error('timeout'));

        const response = await handleConversation(session);

        expect(response).toContain('Erro ao consultar o CEP');
        expect(session.conversation).toBe(conversationPharma.ASK_CEP);
    });
    it('ASK_MEDICINE com input vazio', async () => {
        const session = createSession(conversationPharma.ASK_MEDICINE);
        const res = await handleConversation(session, '');
        expect(res).toContain('Digite');
    });
    it('ASK_MEDICINE com input vazio', async () => {
        const session = createSession(conversationPharma.ASK_MEDICINE);
        const res = await handleConversation(session, '');
        expect(res).toContain('Digite');
    });
    it('ASK_CPF com letras deve ser inválido', async () => {
        const session = createSession(conversationPharma.ASK_CPF);
        const res = await handleConversation(session, 'abc');
        expect(res).toContain('CPF inválido');
    });
    it('ASK_CEP com letras deve ser inválido', async () => {
        const session = createSession(conversationPharma.ASK_CEP);
        const res = await handleConversation(session, 'abc');
        expect(res).toContain('CEP inválido');
    });
    it('CONFIRM_CITY_CEP com input inesperado', async () => {
        const session = createSession(conversationPharma.CONFIRM_CITY_CEP);
        const res = await handleConversation(session, 'talvez');
        expect(res).toContain('Digite o CEP');
    });
    it('ASK_NUMBER vazio', async () => {
        const session = createSession(conversationPharma.ASK_NUMBER);
        session.order = { address: {} };
        const res = await handleConversation(session, '');
        expect(res).toContain('Digite');
    });
    it('ASK_DISTRICT vazio', async () => {
        const session = createSession(conversationPharma.ASK_DISTRICT);
        session.order = { address: {} };
        const res = await handleConversation(session, '');
        expect(res).toContain('Digite');
    });
    it('CONFIRM_ADDRESS com input inválido', async () => {
        const session = createSession(conversationPharma.CONFIRM_ADDRESS);
        session.order = { address: {} };
        const res = await handleConversation(session, 'talvez');
        expect(res).toContain('Digite o CEP');
    });
    it('END com input deve ignorar', async () => {
        const session = createSession(conversationPharma.END);
        const res = await handleConversation(session, 'oi');
        expect(res).toContain('Conversa finalizada');
    });
    it('CONFIRM_CITY_CEP com não deve voltar para ASK_CEP', async () => {
        const session = createSession(conversationPharma.CONFIRM_CITY_CEP);
        session.order.cep = '01001000';

        const response = await handleConversation(session, 'não');

        expect(response).toContain('Digite o CEP novamente');
        expect(session.conversation).toBe(conversationPharma.ASK_CEP);
    });
    it('CONFIRM_ADDRESS com não deve reiniciar CEP', async () => {
        const session = createSession(conversationPharma.CONFIRM_ADDRESS);
        session.order = {
            cep: '01001000',
            number: '10',
            address: {
                logradouro: 'Rua X',
                bairro: 'Centro',
                localidade: 'SP',
                uf: 'SP'
            }
        };

        const response = await handleConversation(session, 'não');

        expect(response).toContain('Digite o CEP novamente');
        expect(session.conversation).toBe(conversationPharma.ASK_CEP);
    });
    it('END deve retornar mensagem padrão', async () => {
        const session = createSession(conversationPharma.END);

        const response = await handleConversation(session);

        expect(response).toContain('Conversa finalizada');
    });
    it('END deve retornar mensagem padrão', async () => {
        const session = createSession(conversationPharma.END);

        const response = await handleConversation(session);

        expect(response).toContain('Conversa finalizada');
    });

    it('Estado desconhecido deve reiniciar conversa', async () => {
        const session = createSession('INVALID_STATE');

        const response = await handleConversation(session);

        expect(response).toContain('Qual o nome do medicamento');
        expect(session.conversation).toBe(conversationPharma.INIT);
    });
  
    it('CONFIRM_ADDRESS com sim deve finalizar pedido', async () => {
        const session = createSession(conversationPharma.CONFIRM_ADDRESS);
        session.order = {
            name: 'Maria',
            cpf: '12345678909',
            phone: '11999999999',
            medicine: 'Dipirona',
            cep: '01001000',
            number: '100',
            address: {
                logradouro: 'Rua X',
                bairro: 'Centro',
                localidade: 'São Paulo',
                uf: 'SP'
            }
        };

        const response = await handleConversation(session, 'sim');

        expect(response).toContain('Pedido');
        expect(session.conversation).toBe(conversationPharma.END);
        expect(session.order.id).toBeDefined();
    });

});
