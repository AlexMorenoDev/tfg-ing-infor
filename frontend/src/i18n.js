import i18n from "i18next";
import { reactI18nextModule } from "react-i18next";

import translationES from './locales/es/translations.json';
import translationEN from './locales/en/translations.json';
import translationEU from './locales/eu/translations.json';

// the translations
const resources = {
  es: {
    translation: translationES
  },
  en: {
    translation: translationEN
  },
  eu: {
    translation: translationEU
  }
};

i18n
  .use(reactI18nextModule) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "es",

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;