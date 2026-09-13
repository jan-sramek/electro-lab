import { EN_FALLBACK } from '../apps/web/src/app/core/i18n/en-fallback.ts';
import { CS_MESSAGES } from '../apps/web/src/app/core/i18n/cs.ts';
process.stdout.write(JSON.stringify({ en: EN_FALLBACK, cs: CS_MESSAGES }));
