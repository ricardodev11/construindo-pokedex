import {
  Component,
  booleanAttribute,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
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

  readonly isCapturing = signal(false);

  private readonly wasFavorite = signal(false);
  private captureTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    effect(() => {
      const favoriteNow = this.favorite();
      const wasAdded = favoriteNow && !this.wasFavorite();
      this.wasFavorite.set(favoriteNow);

      if (wasAdded) {
        this.isCapturing.set(true);
        window.clearTimeout(this.captureTimer);
        this.captureTimer = window.setTimeout(
          () => this.isCapturing.set(false),
          700,
        );
      }
    });
  }

  ngOnDestroy(): void {
    window.clearTimeout(this.captureTimer);
  }
}