import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PokemonCardComponent } from './pokemon-card';
import { PokemonCard } from '../../models/pokemon.models';

describe('PokemonCardComponent', () => {
  let component: PokemonCardComponent;
  let fixture: ComponentFixture<PokemonCardComponent>;

  const pokemon: PokemonCard = {
    id: 25,
    name: 'pikachu',
    imageUrl: 'https://example.com/pikachu.png',
    formattedId: '0025',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pokemon', pokemon);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renderiza o card com link para a rota de detalhe', () => {
    fixture.detectChanges();

    const link: HTMLAnchorElement | null =
      fixture.nativeElement.querySelector('a');

    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('/pokemon/25');
    expect(link?.textContent).toContain('pikachu');
    expect(link?.textContent).toContain('#0025');
  });

  it('botão de favoritar emite o Pokémon e alterna o estado ativo', () => {
    fixture.detectChanges();

    const button: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.pokemon-card__fav');

    expect(button).not.toBeNull();
    expect(button?.getAttribute('aria-label')).toBe('Favoritar pikachu');

    let emitted: PokemonCard | undefined;
    component.toggleFavorite.subscribe((value) => (emitted = value));

    button?.click();

    expect(emitted).toEqual(pokemon);

    fixture.componentRef.setInput('favorite', true);
    fixture.detectChanges();

    const activeButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.pokemon-card__fav--active',
    );

    expect(activeButton).not.toBeNull();
    expect(activeButton.getAttribute('aria-label')).toBe(
      'Remover pikachu dos favoritos',
    );
  });
});