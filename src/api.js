import axios from 'axios';
import { logger } from './logger.js';

export async function getAddressByCep(cep) {
  try {
    const response = await axios.get(
      `https://viacep.com.br/ws/${cep}/json/`,
      { timeout: 5000 }
    );

    if (response.data.erro) {
      logger.warn({ cep }, 'CEP não encontrado');
      throw new Error('CEP não encontrado');
    }

    return response.data;

  } catch (error) {
    logger.error({ err: error, cep }, 'Erro ao consultar o ViaCEP');
    throw new Error('Erro ao consultar o ViaCEP');
  }
}
