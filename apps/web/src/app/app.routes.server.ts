import { RenderMode, ServerRoute } from '@angular/ssr';
import { LEARN_UNITS } from './features/learn/data/learn-catalog';

/** Prerender public Learn routes; Lab stays client-rendered (localStorage, canvas). */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'learn/:moduleSlug/:unitSlug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return LEARN_UNITS.map((u) => ({
        moduleSlug: u.moduleSlug,
        unitSlug: u.unitSlug
      }));
    }
  },
  {
    path: 'learn',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'lab',
    renderMode: RenderMode.Client
  },
  {
    path: 'account',
    renderMode: RenderMode.Client
  },
  {
    path: '',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
