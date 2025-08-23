const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:5500/js', // <-- ajuste conforme sua estrutura
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
