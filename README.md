# Chatbot Farmácia Local

Um Chatbot para compra de medicamento e pagamento na entrega, com validações de dados, consulta de CEP via API externa.

---

## Funcionalidades

- Fluxo de conversação
- Cadastro de medicamento
- Validação de CPF, telefone e CEP
- Consulta automática de endereço por CEP API VIACEP
- Confirmação de endereço
- Geração de pedido com identificador único
- Delays controlados para melhor experiência do usuário
- Logs estruturados com Pino
- Testes unitários com Jest
- Coverage com V8

---

## Stack Utilizada

- Node.js >= 22
- JavaScript (ES Modules)
- Express
- Axios
- Pino (logs)
- Jest (testes unitários)

---

## Estrutura do Projeto

```text
.
├── src
│   ├── api.js
│   ├── conversationEngine.js
│   ├── validators.js
│   ├── logger.js
│   └── store.js
├── tests
│   ├── conversationEngine.test.js
│   └── validators.test.js
├── coverage
├── index.js
├── jest.config.js
├── package.json
└── README.md

## Pré-requisitos

Node.js versão 22 ou superior

## Instalação

npm install

## Executar o projeto

node index.js

## Executar os tests unitários

npm test -- --coverage --verbose


