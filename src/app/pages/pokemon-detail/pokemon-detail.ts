import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { DEFAULT_TYPE_COLOR, TYPE_COLORS } from '../../constants/pokemon-types';
import { PokemonApiService } from '../../core/services/pokemon-api.service';
import { FavoritesService } from '../../core/services/favorites.service';
import {
  toEvolutionPath,
  toPokemonBreeding,
  toPokemonDetailModel,
} from '../../mappers/pokemon.mapper';
import { EvolutionStep, PokemonBreeding } from '../../models/pokemon.models';

type DetailTab = 'sobre' | 'status' | 'evolucao';

@Component({
  imports: [RouterLink],
  selector: 'app-pokemon-detail',
  styleUrl: './pokemon-detail.scss',
  templateUrl: './pokemon-detail.html',
})
export class PokemonDetail {
  readonly id = input.required<string>();

  private readonly api = inject(PokemonApiService);
  protected readonly favorites = inject(FavoritesService);

  readonly pokemon = signal<ReturnType<typeof toPokemonDetailModel> | null>(null);
  readonly breeding = signal<PokemonBreeding | null>(null);
  readonly isLoading = signal(false);
  readonly isNotFound = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly activeTab = signal<DetailTab>('sobre');
  readonly evolution = signal<EvolutionStep[]>([]);
  readonly isEvolutionLoading = signal(false);

  readonly favorite = computed(
    () => this.pokemon() !== null && this.favorites.isFavorite(this.pokemon()!.id),
  );

  constructor() {
    effect(() => {
      const pokemon = this.pokemon();
      document.title = pokemon
        ? `${pokemon.name} · Pokédex`
        : 'Pokédex';
    });

    effect(() => {
      void this.id();
      this.load();
    });
  }

  load(): void {
    const idOrName = this.id();
    this.isLoading.set(true);
    this.isNotFound.set(false);
    this.errorMessage.set(null);
    this.evolution.set([]);

    forkJoin({
      detail: this.api.getPokemonByIdOrName(idOrName),
      species: this.api.getPokemonSpecies(idOrName),
    }).subscribe({
      next: ({ detail, species }) => {
        this.pokemon.set(toPokemonDetailModel(detail));
        this.breeding.set(toPokemonBreeding(species));
        this.isLoading.set(false);
        this.loadEvolution(detail.id);
      },
      error: (err) => this.handleError(err),
    });
  }

  private loadEvolution(pokemonId: number): void {
    this.isEvolutionLoading.set(true);
    this.api
      .getEvolutionChain(pokemonId)
      .pipe(
        map((chain) => toEvolutionPath(chain)),
        catchError(() => of([] as EvolutionStep[])),
      )
      .subscribe({
        next: (steps) => {
          this.evolution.set(steps);
          this.isEvolutionLoading.set(false);
        },
      });
  }

  private handleError(err: { status?: number }): void {
    console.error(err);
    this.isLoading.set(false);
    if (err.status === 404) {
      this.isNotFound.set(true);
    } else {
      this.errorMessage.set('Não foi possível carregar os dados agora.');
    }
  }

  toggleFavorite(): void {
    const pokemon = this.pokemon();
    if (!pokemon) {
      return;
    }
    this.favorites.toggle({
      id: pokemon.id,
      name: pokemon.name,
      imageUrl: pokemon.imageUrl,
      formattedId: pokemon.formattedId,
    });
  }

  typeColor(name: string): string {
    return TYPE_COLORS[name] ?? DEFAULT_TYPE_COLOR;
  }

  statColor(value: number): string {
    if (value <= 50) {
      return '#ef4444';
    }
    if (value <= 80) {
      return '#f59e0b';
    }
    if (value <= 100) {
      return '#84cc16';
    }
    return '#22c55e';
  }
}