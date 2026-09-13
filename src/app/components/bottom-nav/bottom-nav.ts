import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav" aria-label="Navegação principal">
      <a class="bottom-nav__item" routerLink="/" routerLinkActive="bottom-nav__item--active" [routerLinkActiveOptions]="{ exact: true }">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
        </svg>
        <span>Pokédex</span>
      </a>
      <a class="bottom-nav__item" routerLink="/compare" routerLinkActive="bottom-nav__item--active">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/>
          <path d="m15 9 6-6"/>
        </svg>
        <span>Comparar</span>
      </a>
      <a class="bottom-nav__item" routerLink="/favorites" routerLinkActive="bottom-nav__item--active">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
        <span>Favoritos</span>
      </a>
    </nav>
  `,
  styles: `
    :host { display: block; }

    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 16px;
      padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
      background: color-mix(in srgb, var(--color-bg, #fff) 92%, transparent);
      backdrop-filter: blur(8px);
      border-top: 1px solid var(--color-border, #e5e5e5);
      z-index: 100;
    }

    .bottom-nav__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 4px 12px;
      color: var(--color-muted, #737373);
      text-decoration: none;
      font-size: 12px;
      font-weight: 600;
      border-radius: 8px;
      transition: color 0.2s, background 0.2s;
    }

    .bottom-nav__item:hover {
      color: var(--color-text, #171717);
    }

    .bottom-nav__item--active {
      color: #e3350d;
    }

    @media (prefers-reduced-motion: no-preference) {
      .bottom-nav__item { transition: color 0.2s, background 0.2s; }
    }
  `,
})
export class BottomNavComponent {}