# Chatbot Farmácia Local 💊

O **Chatbot Farmácia Local** é uma aplicação Node.js desenvolvida para automatizar o processo de compra de medicamentos e pagamento na entrega. Gerencia fluxos de conversa, valida dados sensíveis, consulta endereços via API externa e processa pedidos com foco na experiência do usuário.

---

## 🚀 Funcionalidades

* **Fluxo de Conversação:** Um guia para compra de medicamento rápido, com pagamento na entrega.
* **Gestão de Pedidos:** Cadastro de medicamentos e geração de identificador único por pedido.
* **Validações Robustas:** Verificação rigorosa de CPF, Telefone e CEP.
* **Integração ViaCEP:** Consulta automática de endereço a partir do CEP (API externa).
* **UX Otimizada:** Delays controlados para simular uma interação humana natural.
* **Observabilidade:** Logs estruturados utilizando a biblioteca **Pino**.
* **Qualidade de Software:** Testes unitários com **Jest** e relatório de cobertura **V8**.

---

## 🛠️ Stack Utilizada

* **Runtime:** [Node.js](https://nodejs.org/) (v22+)
* **Linguagem:** JavaScript (ES Modules)
* **Comunicação:** Axios (Consumo de APIs)
* **Logs:** Pino
* **Testes:** Jest

---

## ⚙️ Instalação

Siga os passos abaixo para configurar o ambiente local:

1. **Pré-requisitos:** Certifique-se de ter o **Node.js (v22 ou superior)** instalado.
2. **Clonar/Baixar o projeto:** Acesse a pasta do projeto via terminal.
3. **Instalar dependências:**
   ```bash
   npm install

## 🚀 Executar o projeto
```bash
node index.js

## 🧪 Testes Unitários
```bash
npm test -- --coverage --verbose

```bash
npm test
---
## 📂 Estrutura do Projeto

```text
.
├── public/                # Arquivos estáticos e frontend
│   ├── assets/            # Imagens e logotipos (ex: logofarmacia.png)
│   └── index.html         # Interface do chat
├── src/                   # Código fonte
│   ├── api.js             # Integrações externas (ViaCEP)
│   ├── conversationEngine.js # Lógica central do chatbot
│   ├── input.js           # Tratamento de entradas do usuário
│   ├── logger.js          # Configuração de monitoramento (Pino)
│   ├── pricing.js         # Cálculos de valores e regras de negócio
│   ├── store.js           # Gerenciamento de estado/dados temporários
│   └── validators.js      # Funções de validação (CPF, Tel, CEP)
├── tests/                 # Suíte de testes unitários
│   ├── conversationEngine.test.js
│   └── validators.test.js
├── coverage/              # Relatórios de cobertura de testes
├── index.js               # Ponto de entrada da aplicação
├── jest.config.js         # Configurações do ambiente de testes
├── package.json           # Dependências e scripts do projeto
└── .env                   # Variáveis de ambiente
