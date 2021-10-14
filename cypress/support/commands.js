/* eslint-disable camelcase */

import { woocommerceAPI } from '../../cypress.json'

Cypress.Commands.add('createNewProductFromJSONFile', () => {
  cy.fixture('product.json').then((product) => {
    return cy
      .request({
        method: 'POST',
        url: woocommerceAPI,
        auth: {
          username: Cypress.env('USERNAME'),
          password: Cypress.env('PASSWORD')
        },
        body: {
          name: product.name,
          type: product.type,
          regular_price: product.regular_price,
          description: product.description,
          short_description: product.short_description
        }
      })
      .then((response) => {
        expect(response.status).eq(201)
        Cypress.env('PRODUCT_ID', response.body.id)
        return response.body
      })
  })
})

Cypress.Commands.add('deleteProduct', (product) => {
  return cy
    .request({
      method: 'DELETE',
      url: `${woocommerceAPI}${product}`,
      auth: {
        username: Cypress.env('USERNAME'),
        password: Cypress.env('PASSWORD')
      }
    })
    .then((response) => {
      expect(response.status === 200)
    })
})
