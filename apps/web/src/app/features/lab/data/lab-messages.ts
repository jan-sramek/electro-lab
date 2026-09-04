/**
 * English fallbacks for Lab status messages whose keys are not (yet) in the core dictionary.
 * `core/i18n` is owned elsewhere — once these keys land there (and in TranslationSeeder),
 * the translated text wins automatically because `labMessage` only falls back on a bare key.
 */
export const LAB_LOCAL_MESSAGES: Record<string, string> = {
  'lab.storage.saveFailed':
    'Could not save to browser storage (full or disabled). Your work stays in this tab, but will be lost on reload until space is freed.',
  'lab.import.invalid': 'Import failed — the file is not a valid Electro Lab schematic.',
  'lab.challenge.locked':
    'This Learn challenge is locked — complete the previous unit first. The example circuit was opened instead.',
  'lab.challenge.quizRequired':
    'Pass the unit quiz before starting its Lab challenge. The example circuit was opened instead.'
};

export function labMessage(
  i18n: { t(key: string, params?: Record<string, string | number>): string },
  key: string
): string {
  const text = i18n.t(key);
  return text !== key ? text : (LAB_LOCAL_MESSAGES[key] ?? key);
}
