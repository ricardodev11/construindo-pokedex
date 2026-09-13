import { computeOffset, slicePage } from './pagination';

describe('paginação', () => {
  it('Dado page=4 e pageSize=12, offset deve ser 36', () => {
    expect(computeOffset(4, 12)).toBe(36);
  });

  it('Dado page=1 e pageSize=12, offset deve ser 0', () => {
    expect(computeOffset(1, 12)).toBe(0);
  });

  it('slicePage devolve os itens da página pedida', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

    expect(slicePage(items, 1, 12)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(slicePage(items, 2, 12)).toEqual([13, 14]);
  });
});