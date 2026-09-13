import { Component, OnInit, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PokemonApiService } from '../../core/services/pokemon-api.service';
import { toPokemonDetailModel } from '../../mappers/pokemon.mapper';
import { PokemonDetailModel } from '../../models/pokemon.models';

@Component({
  imports: [RouterLink],
  selector: 'app-pokemon-detail',
  styleUrl: './pokemon-detail.scss',
  templateUrl: './pokemon-detail.html',
})
export class PokemonDetail implements OnInit {
  readonly id = input.required<string>();

  readonly pokemon = signal<PokemonDetailModel | null>(null);
  readonly isLoading = signal(false);
  readonly isNotFound = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor(private readonly api: PokemonApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.isNotFound.set(false);
    this.errorMessage.set(null);

    this.api.getPokemonByIdOrName(this.id()).subscribe({
      next: (detail) => {
        this.pokemon.set(toPokemonDetailModel(detail));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        if (err.status === 404) {
          this.isNotFound.set(true);
        } else {
          this.errorMessage.set('Não foi possível carregar os dados agora.');
        }
      },
    });
  }
}