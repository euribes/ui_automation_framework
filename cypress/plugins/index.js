/// <reference types="cypress" />
/// <reference types="@shelex/cypress-allure-plugin" />
/* eslint-disable */
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
const allureWriter = require('@shelex/cypress-allure-plugin/writer')
require('dotenv').config()
module.exports = (on, config) => {
  allureWriter(on, config)
  on('before:browser:launch', (browser = {}, launchOptions) => {
    if (browser.family === 'chromium' && browser.name !== 'electron') {
      launchOptions.args.push('--disable-gpu')
      launchOptions.args.push('--disable-dev-shm-usage')
    }
    return launchOptions
  })
  config.env.USERNAME = process.env.USERNAME
  config.env.PASSWORD = process.env.PASSWORD
  return config
}
