import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('segue o tema salvo no localStorage', () => {
    localStorage.setItem('pokedex:theme', 'dark');
    const service = new ThemeService();

    expect(service.theme()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('usa a preferência do sistema quando nada está salvo', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true }),
    );
    try {
      const service = new ThemeService();
      expect(service.theme()).toBe('dark');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('alterna o tema e salva no localStorage', () => {
    const service = new ThemeService();
    service.toggle();

    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem('pokedex:theme')).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('alterna apenas entre claro e escuro', () => {
    const service = new ThemeService();
    service.toggle();
    service.toggle();

    expect(service.theme()).toBe('light');
    expect(localStorage.getItem('pokedex:theme')).toBe('light');
  });
});