import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PokemonApiService } from '../../core/services/pokemon-api.service';
import { NamedApiResource } from '../../models/pokemon-api.models';
import { PokemonCard } from '../../models/pokemon.models';
import { toPokemonCard, toPokemonCardFromDetail } from '../../mappers/pokemon.mapper';
import { computeOffset, slicePage } from '../../utils/pagination';
import { PokemonCardComponent } from '../../components/pokemon-card/pokemon-card';

@Component({
  imports: [FormsModule, PokemonCardComponent],
  selector: 'app-pokedex',
  styleUrl: './pokedex.scss',
  templateUrl: './pokedex.html',
})
export class Pokedex implements OnInit {
  readonly pokemons = signal<PokemonCard[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly pageNumber = signal(1);
  readonly totalCount = signal(0);

  readonly searchQuery = signal('');
  readonly searchResult = signal<PokemonCard | null>(null);
  readonly searchError = signal<string | null>(null);
  readonly isSearching = signal(false);

  readonly types = signal<NamedApiResource[]>([]);
  readonly selectedType = signal('');
  readonly typePokemons = signal<PokemonCard[]>([]);
  readonly isFiltering = signal(false);
  readonly filterError = signal<string | null>(null);

  readonly pageSize = 12;

  readonly isFiltered = computed(() => this.selectedType() !== '');
  readonly isSearchMode = computed(
    () => this.searchResult() !== null || this.searchError() !== null,
  );

  readonly shownCards = computed(() => {
    if (this.isFiltered()) {
      return slicePage(this.typePokemons(), this.pageNumber(), this.pageSize);
    }
    return slicePage(this.pokemons(), this.pageNumber(), this.pageSize);
  });

  readonly shownTotalPages = computed(() =>
    this.isFiltered()
      ? Math.ceil(this.typePokemons().length / this.pageSize)
      : Math.ceil(this.totalCount() / this.pageSize),
  );
  readonly hasPrevious = computed(() => this.pageNumber() > 1);
  readonly hasNext = computed(
    () => this.pageNumber() < this.shownTotalPages() && this.shownTotalPages() > 0,
  );

  constructor(private readonly api: PokemonApiService) {}

  ngOnInit(): void {
    this.load();
    this.loadTypes();
  }

  load(): void {
    const offset = computeOffset(this.pageNumber(), this.pageSize);

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.api.getPokemonList(this.pageSize, offset).subscribe({
      next: (response) => {
        this.pokemons.set(response.results.map(toPokemonCard));
        this.totalCount.set(response.count);
        this.isLoading.set(false);
        window.scrollTo({ top: 0 });
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        this.errorMessage.set('Não foi possível carregar os dados agora.');
      },
    });
  }

  loadTypes(): void {
    this.api.getTypes().subscribe({
      next: (response) => this.types.set(response.results),
      error: (err) => {
        console.error(err);
        this.filterError.set('Não foi possível carregar a lista de tipos.');
      },
    });
  }

  previousPage(): void {
    if (this.hasPrevious()) {
      this.pageNumber.update((page) => page - 1);
      this.reloadCurrentView();
    }
  }

  nextPage(): void {
    if (this.hasNext()) {
      this.pageNumber.update((page) => page + 1);
      this.reloadCurrentView();
    }
  }

  onTypeChange(): void {
    this.pageNumber.set(1);
    const type = this.selectedType();

    if (!type) {
      this.typePokemons.set([]);
      this.filterError.set(null);
      this.load();
      return;
    }

    this.isFiltering.set(true);
    this.filterError.set(null);

    this.api.getPokemonByType(type).subscribe({
      next: (response) => {
        this.typePokemons.set(
          response.pokemon.map((entry) => toPokemonCard(entry.pokemon)),
        );
        this.isFiltering.set(false);
        window.scrollTo({ top: 0 });
      },
      error: (err) => {
        console.error(err);
        this.isFiltering.set(false);
        this.filterError.set('Não foi possível carregar os Pokémon desse tipo.');
      },
    });
  }

  onSearchSubmit(): void {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      this.clearSearch();
      return;
    }

    this.selectedType.set('');
    this.typePokemons.set([]);
    this.isSearching.set(true);
    this.searchError.set(null);
    this.searchResult.set(null);

    this.api.getPokemonByIdOrName(query).subscribe({
      next: (detail) => {
        this.searchResult.set(toPokemonCardFromDetail(detail));
        this.isSearching.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isSearching.set(false);
        if (err.status === 404) {
          this.searchError.set(
            'Não encontramos esse Pokémon. Confira o nome ou tente usar o número da Pokédex.',
          );
        } else {
          this.searchError.set('Não foi possível carregar os dados agora.');
        }
      },
    });
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResult.set(null);
    this.searchError.set(null);
    this.isSearching.set(false);
  }

  retryCurrentView(): void {
    if (this.isFiltered()) {
      this.onTypeChange();
    } else {
      this.load();
    }
  }

  private reloadCurrentView(): void {
    if (this.isFiltered()) {
      window.scrollTo({ top: 0 });
    } else {
      this.load();
    }
  }
}