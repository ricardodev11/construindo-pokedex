import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, map, of } from 'rxjs';
import {
  DEFAULT_TYPE_COLOR,
  TYPE_COLORS,
} from '../../constants/pokemon-types';
import { PokemonApiService } from '../../core/services/pokemon-api.service';
import { toPokemonDetailModel } from '../../mappers/pokemon.mapper';
import { PokemonDetailModel } from '../../models/pokemon.models';

export interface CompareSlotState {
  query: string;
  pokemon: PokemonDetailModel | null;
  loading: boolean;
  notFound: boolean;
  error: boolean;
}

const emptySlot = (): CompareSlotState => ({
  query: '',
  pokemon: null,
  loading: false,
  notFound: false,
  error: false,
});

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'At. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidade',
};

@Component({
  imports: [FormsModule],
  selector: 'app-compare',
  styleUrl: './compare.scss',
  templateUrl: './compare.html',
})
export class Compare implements OnInit {
  private readonly api = inject(PokemonApiService);

  readonly slotA = signal<CompareSlotState>(emptySlot());
  readonly slotB = signal<CompareSlotState>(emptySlot());

  private readonly catalog = signal<{ name: string }[]>([]);

  readonly suggestionsA = computed(() => this.suggestFor(this.slotA().query));
  readonly suggestionsB = computed(() => this.suggestFor(this.slotB().query));

  readonly comparison = computed(() => {
    const a = this.slotA().pokemon;
    const b = this.slotB().pokemon;
    return a && b ? { a, b } : null;
  });

  ngOnInit(): void {
    document.title = 'Pokédex · Comparar';
    this.api.getPokemonList(2000, 0).subscribe({
      next: (response) => this.catalog.set(response.results),
      error: () => this.catalog.set([]),
    });
  }

  updateQuery(slot: 'A' | 'B', query: string): void {
    this.props(slot, { query });
  }

  search(slot: 'A' | 'B'): void {
    const state = slot === 'A' ? this.slotA() : this.slotB();
    const query = state.query.trim().toLowerCase();
    if (!query) {
      return;
    }
    this.props(slot, { loading: true, error: false, notFound: false });
    this.api
      .getPokemonByIdOrName(query)
      .pipe(
        map((detail) => toPokemonDetailModel(detail)),
        catchError((err: { status?: number }) => {
          this.props(slot, {
            loading: false,
            notFound: err?.status === 404,
            error: err?.status !== 404,
          });
          return of(null);
        }),
      )
      .subscribe((pokemon) => {
        if (pokemon) {
          this.props(slot, { loading: false, pokemon });
        }
      });
  }

  pickSuggestion(slot: 'A' | 'B', name: string): void {
    this.updateQuery(slot, name);
    this.search(slot);
  }

  clear(slot: 'A' | 'B'): void {
    this.props(slot, emptySlot());
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

  labelFor(statName: string): string {
    return STAT_LABELS[statName] ?? statName;
  }

  private suggestFor(query: string): string[] {
    const normalized = query.trim().toLowerCase();
    if (normalized.length < 3) {
      return [];
    }
    return this.catalog()
      .map((item) => item.name)
      .filter((name) => name.includes(normalized))
      .slice(0, 6);
  }

  private props(slot: 'A' | 'B', patch: Partial<CompareSlotState>): void {
    const set = slot === 'A' ? this.slotA : this.slotB;
    set.update((state) => ({ ...state, ...patch }));
  }
}