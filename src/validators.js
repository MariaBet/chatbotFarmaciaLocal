import { logger } from './logger.js';

export const validators = {
  cpf: (cpf) => {
    const clean = cpf.replace(/\D/g, '');
    
    if (clean.length !== 11) {
      logger.debug({ cpf: clean, reason: 'tamanho inválido' }, 'Validação de CPF falhou');
      return false;
    }
    
    // Verifica dígitos repetidos
    if (/^(\d)\1{10}$/.test(clean)) {
      logger.debug({ cpf: clean, reason: 'dígitos repetidos' }, 'Validação de CPF falhou');
      return false;
    }
    
    // Valida primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(clean.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    
    if (remainder !== parseInt(clean.charAt(9))) {
      logger.debug({ cpf: clean, reason: 'primeiro dígito verificador inválido' }, 'Validação de CPF falhou');
      return false;
    }
    
    // Valida segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(clean.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    
    const isValid = remainder === parseInt(clean.charAt(10));
    
    if (!isValid) {
      logger.debug({ cpf: clean, reason: 'segundo dígito verificador inválido' }, 'Validação de CPF falhou');
    } else {
      logger.debug({ cpf: '***' + clean.slice(-3) }, 'CPF validado com sucesso');
    }
    
    return isValid;
  },
  
  cep: (cep) => {
    const clean = cep.replace(/\D/g, '');
    const isValid = /^\d{8}$/.test(clean);
    
    if (!isValid) {
      logger.debug({ cep: clean }, 'Validação de CEP falhou');
    } else {
      logger.debug({ cep: clean }, 'CEP validado com sucesso');
    }
    
    return isValid;
  },
  
  phone: (phone) => {
    const clean = phone.replace(/\D/g, '');
    const isValid = /^\d{10,11}$/.test(clean);
    
    if (!isValid) {
      logger.debug({ phone: clean }, 'Validação de telefone falhou');
    }
    
    return isValid;
  }
};

export const sanitizers = {
  cpf: (cpf) => {
    const clean = cpf.replace(/\D/g, '');
    logger.debug({ original: cpf, cleaned: clean }, 'Sanitização de CPF');
    return clean;
  },
  
  cep: (cep) => {
    const clean = cep.replace(/\D/g, '');
    logger.debug({ original: cep, cleaned: clean }, 'Sanitização de CEP');
    return clean;
  },
  
  phone: (phone) => {
    const clean = phone.replace(/\D/g, '');
    logger.debug({ original: phone, cleaned: clean }, 'Sanitização de telefone');
    return clean;
  },
  
  text: (text) => {
    const trimmed = text.trim();
    logger.debug({ originalLength: text.length, trimmedLength: trimmed.length }, 'Sanitização de texto');
    return trimmed;
  }
};