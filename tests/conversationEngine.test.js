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

jest.unstable_mockModule('../src/pricing.js', () => ({
    getMedicinePrice: jest.fn(() => 25.00)
}));

const { handleConversation, conversationPharma } = await import('../src/conversationEngine.js');
const { getAddressByCep } = await import('../src/api.js');
const { getMedicinePrice } = await import('../src/pricing.js');

function createSession(state = conversationPharma.INIT) {
    return {
        id: 'session-test',
        conversation: state,
        order: {
            address: {}
        }
    };
}

describe('ConversationEngine', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });


    it('INIT deve perguntar o nome do medicamento', async () => {
        const session = createSession();
        const response = await handleConversation(session);

        expect(response).toContain('Qual o nome do medicamento');
        expect(session.conversation).toBe(conversationPharma.ASK_MEDICINE);
    });

    it('ASK_MEDICINE deve registrar medicamento e pedir nome', async () => {
        const session = createSession(conversationPharma.ASK_MEDICINE);
        getMedicinePrice.mockReturnValue(50.0);

        const response = await handleConversation(session, 'Dipirona');

        expect(session.order.medicine).toBe('Dipirona');
        expect(session.order.price).toBe(50.0);
        expect(response).toContain('Digite seu nome completo');
        expect(session.conversation).toBe(conversationPharma.ASK_NAME);
    });


    it('ASK_CPF deve validar e rejeitar CPF inválido', async () => {
        const session = createSession(conversationPharma.ASK_CPF);
        const response = await handleConversation(session, '123');

        expect(response).toContain('CPF inválido');
        expect(session.conversation).toBe(conversationPharma.ASK_CPF);
    });

    it('ASK_PHONE deve validar e rejeitar telefone inválido', async () => {
        const session = createSession(conversationPharma.ASK_PHONE);
        const response = await handleConversation(session, '999');

        expect(response).toContain('Telefone inválido');
        expect(session.conversation).toBe(conversationPharma.ASK_PHONE);
    });

    it('ASK_CEP deve validar e rejeitar CEP curto', async () => {
        const session = createSession(conversationPharma.ASK_CEP);
        const response = await handleConversation(session, '123');

        expect(response).toContain('CEP inválido');
    });


    it('FETCH_CEP_INFO deve processar endereço da API com sucesso', async () => {
        const session = createSession(conversationPharma.FETCH_CEP_INFO);
        session.order.cep = '30110001';

        getAddressByCep.mockResolvedValue({
            localidade: 'Belo Horizonte',
            uf: 'MG',
            bairro: 'Centro'
        });

        const response = await handleConversation(session);

        expect(response).toContain('Belo Horizonte/MG');
        expect(session.conversation).toBe(conversationPharma.CONFIRM_CITY_CEP);
    });

    it('FETCH_CEP_INFO deve tratar falha na API e pedir CEP novamente', async () => {
        const session = createSession(conversationPharma.FETCH_CEP_INFO);
        getAddressByCep.mockRejectedValue(new Error('Erro de conexão'));

        const response = await handleConversation(session);

        expect(response).toContain('Erro ao consultar o CEP');
        expect(session.conversation).toBe(conversationPharma.ASK_CEP);
    });

    // --- TESTES DE CASOS DE BORDA E ERROS ---

    it('Deve tratar inputs vazios ou apenas espaços no ASK_MEDICINE', async () => {
        const session = createSession(conversationPharma.ASK_MEDICINE);
        const response = await handleConversation(session, '   ');

        // Se o seu código lançar erro no catch, o teste pegará aqui
        expect(response).not.toContain('Ocorreu um erro inesperado');
    });

    it('CONFIRM_CITY_CEP com "não" deve resetar para ASK_CEP', async () => {
        const session = createSession(conversationPharma.CONFIRM_CITY_CEP);
        const response = await handleConversation(session, 'não');

        expect(response).toContain('Digite o CEP novamente');
        expect(session.conversation).toBe(conversationPharma.ASK_CEP);
    });

    it('ASK_NUMBER deve pular ASK_DISTRICT se o bairro já veio na API', async () => {
        const session = createSession(conversationPharma.ASK_NUMBER);
        session.order = {
            cep: '12345678',
            address: { bairro: 'Bairro Existente', localidade: 'Cidade', uf: 'UF' }
        };

        const response = await handleConversation(session, '100');

        expect(session.conversation).toBe(conversationPharma.CONFIRM_ADDRESS);
        expect(response).toContain('Confira o endereço completo');
    });


    it('CONFIRM_ADDRESS com "sim" deve gerar pedido e finalizar', async () => {
        const session = createSession(conversationPharma.CONFIRM_ADDRESS);
        session.order = {
            name: 'Maria Betânia',
            cpf: '12345678901',
            phone: '31999999999',
            medicine: 'Vitamina C',
            price: 29.90,
            cep: '39655000',
            number: '10',
            address: {
                logradouro: 'Rua Principal',
                bairro: 'Centro',
                localidade: 'Leme do Prado',
                uf: 'MG'
            }
        };

        const response = await handleConversation(session, 'sim');

        expect(response).toContain('✅ Pedido');
        expect(response).toContain('PED');
        expect(session.conversation).toBe(conversationPharma.END);
    });

    it('Estado desconhecido deve reiniciar para o INIT', async () => {
        const session = createSession('ESTADO_QUE_NAO_EXISTE');
        const response = await handleConversation(session);

        expect(response).toContain('Qual o nome do medicamento');
        expect(session.conversation).toBe(conversationPharma.INIT);
    });
});