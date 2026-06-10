import { trigger, transition, style, animate } from '@angular/animations';

/**
 * Slide-down enter / fade-out leave — used for alert banners.
 * Easing: ease-out-expo  cubic-bezier(0.22, 1, 0.36, 1)
 */
export const slideDown = trigger('slideDown', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-8px)' }),
    animate(
      '240ms cubic-bezier(0.22, 1, 0.36, 1)',
      style({ opacity: 1, transform: 'translateY(0)' }),
    ),
  ]),
  transition(':leave', [
    animate(
      '160ms ease-in',
      style({ opacity: 0, transform: 'translateY(-4px)' }),
    ),
  ]),
]);
