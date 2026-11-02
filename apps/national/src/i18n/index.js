// The interface dictionary (build brief 6). A missing key fails the build, so English can never leak into a Kiswahili
// page unnoticed. All Kiswahili here waits for a native speaker's review (decision #87).
import en from './en.json' with { type: 'json' };
import sw from './sw.json' with { type: 'json' };

export const dictionaries = { en, sw };

export function t(lang, key, vars = {}) {
  const text = dictionaries[lang]?.[key];
  if (text == null) throw new Error(`No ${lang} text for "${key}"`);
  return text.replace(/\{(\w+)\}/g, (whole, name) => {
    if (!(name in vars)) throw new Error(`"${key}" needs {${name}}`);
    return vars[name];
  });
}
