# UI Automation Framework POC

## Introduction

- This is the Cypress (https://www.cypress.io/) automation testing project for Sirius Binary.

## Configuration

### Node Config

Install node locally using `nvm`. You can follow the instructions
[here](https://heynode.com/tutorial/install-nodejs-locally-nvm) or (on MacOS or
Linux with Bash) you can run the following in a shell:

```bash
curl -sL https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.0/install.sh -o install_nvm.sh
bash install_nvm.sh
source ~/.bash_profile
nvm install 12.3.1
node --version
```

### Dependencies

- You need to have nodeJS installed
- You need this playground deployed locally (https://github.com/antonyfuentes/testing-playground)

### Clone the repository

Replace <username> with your github username

```
git clone https://<username>@github.com/euribes/ui_automation_framework.git
```

Install dependencies with the following command

```
npm install
```

### Install the following VSCODE extensions

- alexkrechik.cucumberautocomplete
- stevejpurves.cucumber
- aravindkumar.gherkin-indent
- dbaeumer.vscode-eslint
- esbenp.prettier-vscode

### Setup vscode

- Check if you see double check on the right down corner with Prettier
- Check if you have the following
  - Open a Feature file and check that you have "Ident using spaces" = 4
  - Open a javascript file and check that you have "Ident using spaces" = 2

### Run Cypress

Run cypress testing

- To open Cypress Runner

```
npx cypress open
```

- To run Cypress in console (general command)

```
npx cypress run
```

Make sure cypress configuration file has the correct baseUrl value. It should be the URL of the environment to test

## Contribution guidelines

- Writing tests
- Code review
- Other guidelines

## Steps to Write New Test Case in Cypress:

- Open the Code in IDE (`VSCode`, `Atom`, `Sublime Text`, etc...)
- Add a .js file under `/integration/` folder for the UI test case scenario
- If the JS file have methods that are already existing re-use them.
- If they are new method add the methods based on the page (if so add new folder for that page) under `/integration/<page_name>/` which are called `spec` files Eg: `/integration/products/products.spec.js`
- Add the page selectors (HTML DOM Elements) in there respective pages.
- Add common methods under the `/integration/common/<page_common.js>` Eg: `/integration/helper.js`
