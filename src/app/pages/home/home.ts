import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';

import { PokemonCardComponent } from '../../components/pokemon-card/pokemon-card';
import { DEFAULT_TYPE_COLOR, TYPE_COLORS } from '../../constants/pokemon-types';
import { FavoritesService } from '../../core/services/favorites.service';
import { ThemeService } from '../../core/services/theme.service';
import { PokemonApiService } from '../../core/services/pokemon-api.service';
import { toPokemonCard, toPokemonCardFromDetail } from '../../mappers/pokemon.mapper';
import { PokemonCard } from '../../models/pokemon.models';

@Component({
  imports: [FormsModule, PokemonCardComponent],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private readonly api = inject(PokemonApiService);
  protected readonly favorites = inject(FavoritesService);
  protected readonly theme = inject(ThemeService);

  private readonly PAGE_SIZE = 20;
  private readonly EXCLUDED_TYPES = new Set(['unknown', 'shadow']);

  private readonly offset = signal(0);
  private readonly typeMembers = signal<Record<string, PokemonCard[]>>({});

  readonly allPokemons = signal<PokemonCard[]>([]);
  readonly totalCount = signal(0);
  readonly isLoading = signal(true);
  readonly isLoadMore = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly typeLoading = signal<string | null>(null);
  readonly typeError = signal<string | null>(null);
  readonly searchQuery = signal('');
  readonly searchStatus = signal<
    'idle' | 'loading' | 'found' | 'not-found' | 'error'
  >('idle');
  readonly searchResultCard = signal<PokemonCard | null>(null);
  readonly selectedTypes = signal<string[]>([]);
  readonly types = signal<{ name: string }[]>([]);
  readonly visibleCount = signal(this.PAGE_SIZE);

  readonly skeletonCards = Array.from({ length: 8 }, (_, i) => i);

  private readonly searchSync = toObservable(this.searchQuery)
    .pipe(
      debounceTime(300),
      map((query) => query.trim()),
      distinctUntilChanged(),
      switchMap((query) => {
        this.searchResultCard.set(null);
        if (!query) {
          this.searchStatus.set('idle');
          return of(null);
        }
        this.searchStatus.set('loading');
        return this.api.getPokemonByIdOrName(query).pipe(
          map((detail) => toPokemonCardFromDetail(detail)),
        );
      }),
      takeUntilDestroyed(),
    )
    .subscribe({
      next: (card) => {
        if (!card) {
          return;
        }
        this.searchResultCard.set(card);
        this.searchStatus.set('found');
        this.allPokemons.update((list) =>
          list.some((item) => item.id === card.id) ? list : [card, ...list],
        );
      },
      error: (err: { status?: number }) => {
        this.searchResultCard.set(null);
        this.searchStatus.set(err?.status === 404 ? 'not-found' : 'error');
      },
    });

  private readonly typeCards = computed<PokemonCard[] | null>(() => {
    const selected = this.selectedTypes();
    const members = this.typeMembers();

    if (!selected.length) {
      return null;
    }

    const lists = selected.map((type) => members[type]);
    if (lists.some((list) => !list)) {
      return null;
    }

    const [first, ...rest] = lists as PokemonCard[][];
    return first.filter((card) =>
      rest.every((list) => list.some((item) => item.id === card.id)),
    );
  });

  private readonly trimmedQuery = computed(() => this.searchQuery().trim());
  readonly hasActiveQuery = computed(() => this.trimmedQuery().length > 0);

  readonly baseCards = computed<PokemonCard[]>(() => {
    const base = this.typeCards() ?? this.allPokemons();
    return this.typeCards() ? base.slice(0, this.visibleCount()) : base;
  });

  readonly filteredCards = computed<PokemonCard[]>(() => {
    if (this.hasActiveQuery()) {
      const card = this.searchResultCard();
      if (!card) {
        return [];
      }
      const members = this.typeCards();
      if (members && !members.some((item) => item.id === card.id)) {
        return [];
      }
      return [card];
    }
    return this.baseCards();
  });

  readonly hasMore = computed(() => {
    if (this.hasActiveQuery()) {
      return false;
    }
    if (this.typeCards()) {
      return this.typeCards()!.length > this.visibleCount();
    }
    return this.offset() < this.totalCount();
  });

  constructor() {
    effect(() => {
      const query = this.searchQuery().trim();
      document.title = query ? `Buscando "${query}" · Pokédex` : 'Pokédex';
    });
  }

  ngOnInit(): void {
    this.loadTypes();
    void this.load();
  }

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set(null);
    await this.fetchPage();
  }

  loadMore(): void {
    if (!this.hasMore()) {
      return;
    }
    if (this.typeCards()) {
      this.visibleCount.update((count) => count + this.PAGE_SIZE);
      return;
    }
    if (this.isLoadMore()) {
      return;
    }
    this.isLoadMore.set(true);
    void this.fetchPage();
  }

  private fetchPage(): Promise<void> {
    return new Promise((resolve) => {
      this.api.getPokemonList(this.PAGE_SIZE, this.offset()).subscribe({
        next: (response) => {
          const cards = response.results.map((resource) =>
            toPokemonCard(resource),
          );
          this.allPokemons.update((list) => {
            const existing = new Set(list.map((card) => card.id));
            return [...list, ...cards.filter((card) => !existing.has(card.id))];
          });
          this.offset.update((current) => current + response.results.length);
          this.totalCount.set(response.count);
          this.isLoading.set(false);
          this.isLoadMore.set(false);
          this.loadError.set(null);
          resolve();
        },
        error: () => {
          this.handleLoadError();
          resolve();
        },
      });
    });
  }

  private handleLoadError(): void {
    this.loadError.set('Não foi possível carregar os Pokémon. Verifique sua conexão.');
    this.isLoading.set(false);
    this.isLoadMore.set(false);
  }

  private loadTypes(): void {
    this.api.getTypes().subscribe({
      next: (response) => {
        this.types.set(
          response.results.filter((type) => !this.EXCLUDED_TYPES.has(type.name)),
        );
        this.isLoading.set(false);
      },
      error: () => this.handleLoadError(),
    });
  }

  toggleType(name: string): void {
    const current = this.selectedTypes();

    if (current.includes(name)) {
      this.selectedTypes.set(current.filter((type) => type !== name));
      this.visibleCount.set(this.PAGE_SIZE);
      return;
    }

    this.selectedTypes.update((types) => [...types, name]);
    this.visibleCount.set(this.PAGE_SIZE);

    if (this.typeMembers()[name]) {
      return;
    }

    this.typeLoading.set(name);
    this.typeError.set(null);

    this.api.getPokemonByType(name).subscribe({
      next: (response) => {
        const cards = response.pokemon.map((entry) =>
          toPokemonCard(entry.pokemon),
        );
        this.typeMembers.update((members) => ({ ...members, [name]: cards }));
        this.typeLoading.set(null);
      },
      error: () => {
        this.selectedTypes.update((types) => types.filter((type) => type !== name));
        this.typeLoading.set(null);
        this.typeError.set(`Não foi possível filtrar por "${name}".`);
      },
    });
  }

  toggleFavorite(card: PokemonCard): void {
    this.favorites.toggle(card);
  }

  clearEverything(): void {
    this.searchQuery.set('');
    this.selectedTypes.set([]);
    this.visibleCount.set(this.PAGE_SIZE);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  typeColor(name: string): string {
    return TYPE_COLORS[name] ?? DEFAULT_TYPE_COLOR;
  }
}