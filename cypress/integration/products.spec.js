import { productsSelectors } from '../support/selectors/products.selectors'

describe('Product tests', () => {
  before(() => {
    cy.createNewProductFromJSONFile()
  })

  after(() => {
    cy.deleteProduct(Cypress.env('PRODUCT_ID'))
  })

  beforeEach(() => {
    cy.fixture('product.json').then((product) => {
      cy.visit(`/product/${product.name}`)
    })
  })

  it('should see product title displayed', () => {
    cy.fixture('product.json').then((product) => {
      cy.get(productsSelectors.productTitle).should('be.visible').and('have.text', product.name)
    })
  })

  it('should see product price displayed', () => {
    cy.fixture('product.json').then((product) => {
      cy.get(productsSelectors.productPrice).should('be.visible').and('include.text', product.regular_price)
    })
  })

  it('should see product short description displayed', () => {
    cy.fixture('product.json').then((product) => {
      cy.get(productsSelectors.productShortDescription)
        .should('be.visible')
        .then((element) => {
          expect(element[0].textContent).includes(product.short_description)
        })
    })
  })
})
