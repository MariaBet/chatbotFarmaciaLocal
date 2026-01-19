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

---
## 🚀 Executar o projeto

```bash
node index.js

---
## 🧪 Testes Unitários

```bash
npm test -- --coverage --verbose

---
```bash
npm test

---
## 📂 Estrutura do Projeto

```text
.
├── public/                
│   ├── assets/            
│   └── index.html         
├── src/                  
│   ├── api.js             
│   ├── conversationEngine.js 
│   ├── input.js           
│   ├── logger.js          
│   ├── pricing.js         
│   ├── store.js           
│   └── validators.js      
├── tests/                 
│   ├── conversationEngine.test.js
│   └── validators.test.js
├── coverage/             
├── index.js               
├── jest.config.js         
├── package.json           
└── .env                   
