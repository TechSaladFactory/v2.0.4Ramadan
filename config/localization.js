const i18n = require('i18n');

// Configure i18n for language support
i18n.configure({
  locales: ['en', 'ar'], // Supported languages
  directory: __dirname + '/locales', // Path to translation files
  defaultLocale: 'en', // Default language
  objectNotation: true, // Allows nested keys in translation
});

const setLanguage = (req, lang = 'en') => {
  req.setLocale(lang); // Set the language for the request
};

module.exports = { i18n, setLanguage };
