import { describe, it, expect } from '@jest/globals';
import { validators } from '../src/validators.js';

describe('Validators', () => {

  it('CPF válido', () => {
    expect(validators.cpf('52998224725')).toBe(true);
  });

  it('CPF inválido (dígitos repetidos)', () => {
    expect(validators.cpf('11111111111')).toBe(false);
  });

  it('CPF inválido (curto)', () => {
    expect(validators.cpf('123')).toBe(false);
  });

  it('CEP válido', () => {
    expect(validators.cep('01001000')).toBe(true);
  });

  it('CEP inválido', () => {
    expect(validators.cep('123')).toBe(false);
  });

  it('Telefone válido 11 dígitos', () => {
    expect(validators.phone('11999999999')).toBe(true);
  });

  it('Telefone inválido', () => {
    expect(validators.phone('999')).toBe(false);
  });
  it('CPF inválido dígito errado', () => {
  expect(validators.cpf('52998224724')).toBe(false);
});

it('CPF inválido segundo dígito', () => {
  expect(validators.cpf('52998224726')).toBe(false);
});

it('Telefone com 10 dígitos válido', () => {
  expect(validators.phone('1133334444')).toBe(true);
});


});
