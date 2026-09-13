import { Component, booleanAttribute, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PokemonCard } from '../../models/pokemon.models';

@Component({
  imports: [RouterLink],
  selector: 'app-pokemon-card',
  styleUrl: './pokemon-card.scss',
  templateUrl: './pokemon-card.html',
})
export class PokemonCardComponent {
  readonly pokemon = input.required<PokemonCard>();
  readonly imageFailed = signal(false);
  readonly favorite = input(false, { transform: booleanAttribute });
  readonly toggleFavorite = output<PokemonCard>();
}