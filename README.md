# Cypress Visual Regression with Resemble.JS

[![npm](https://img.shields.io/npm/v/cypress-visual-regression-resemble-js)](https://www.npmjs.com/package/cypress-visual-regression-resemble-js)

A module for adding visual regression testing to [Cypress](https://www.cypress.io/), based on [Cypress Visual Regression](https://github.com/cypress-visual-regression/cypress-visual-regression) plugin and [Resemble.JS](https://github.com/rsmbl/Resemble.js) library.

The main difference between "Cypress Visual Regression" plugin and this one is that the present plugin [mitigates the anti-aliasing problem](#mitigating-the-anti-aliasing-effect). The problem appears when comparing the base and actual screenshots generated on different environments (e.g. Windows vs Linux).

## Getting Started

Install:

```sh
$ npm install cypress-visual-regression-resemble-js
```

Add the following config to your *cypress.config.js* file:

```javascript
const { defineConfig } = require("cypress");
const getCompareSnapshotsPlugin = require('cypress-visual-regression-resemble-js/dist/plugin');

module.exports = defineConfig({
  env: {
    screenshotsFolder: './cypress/snapshots/actual',
    trashAssetsBeforeRuns: true,
    video: false
  },
  e2e: {
    setupNodeEvents(on, config) {
      getCompareSnapshotsPlugin(on, config);
    },
  },
});
```

Add the command to *cypress/support/commands.js*:

```javascript
const compareSnapshotCommand = require('cypress-visual-regression-resemble-js/dist/command');

compareSnapshotCommand();
```

> Make sure you import *commands.js* in *cypress/support/e2e.js*:
>
> ```javascript
> import './commands'
> ```

### TypeScript

If you're using TypeScript, use files with a `.ts` extension, as follows:

*cypress/cypress.config.ts*

```ts
import { defineConfig } from 'cypress';
import getCompareSnapshotsPlugin from 'cypress-visual-regression-resemble-js/dist/plugin';

export default defineConfig({
  env: {
    screenshotsFolder: './cypress/snapshots/actual',
    trashAssetsBeforeRuns: true,
    video: false
  },
  e2e: {
    setupNodeEvents(on, config) {
      getCompareSnapshotsPlugin(on, config);
    },
  },
});
```

*cypress/support/commands.ts*

```ts
import compareSnapshotCommand from 'cypress-visual-regression-resemble-js/dist/command';

compareSnapshotCommand();
```

*cypress/tsconfig.json*

```json:
{
  "compilerOptions": {
    "types": [
      "cypress",
      "cypress-visual-regression-resemble-js"
    ]
  }
}
```

For more info on how to use TypeScript with Cypress, please refer to [this document](https://docs.cypress.io/guides/tooling/typescript-support#Set-up-your-dev-environment).


### Options

`failSilently` is enabled by default. Add the following config to your *cypress.config.js* file to see the errors:

```javascript
{
  env: {
    failSilently: false
  }
}
```

You can also pass default [arguments](https://docs.cypress.io/api/cypress-api/screenshot-api.html#Arguments) to `compareSnapshotCommand()`:

```javascript
const compareSnapshotCommand = require('cypress-visual-regression-resemble-js/dist/command');

compareSnapshotCommand({
  capture: 'fullPage'
});
```

These will be used by default when no parameters are passed to the `compareSnapshot` command.

**Configure snapshot paths**

You can control where snapshots should be located by setting two environment variables:

| Variable | Description |
|----------|-------------|
| SNAPSHOT_BASE_DIRECTORY | Directory of the base snapshots |
| SNAPSHOT_DIFF_DIRECTORY | Directory for the snapshot diff |

The `actual` directory always points to the configured screenshot directory.


**Configure snapshot generation**

In order to control the creation of diff images you may want to use the following environment variables which are
typically set by using the field `env` in configuration in `cypress.config.json`.

| Variable                        | Description                |
|---------------------------------|----------------------------|
| ALWAYS_GENERATE_DIFF            | Boolean, defaults to true  |


`ALWAYS_GENERATE_DIFF` specifies if diff images are generated for successful tests.  

If you want to see all diff images which are different (based on your thresholds), use the following in your `cypress.config.json`:
```json
{
  "env": {
    "ALWAYS_GENERATE_DIFF": false
  }
}
```

## To Use

Add `cy.compareSnapshot('home');` in your tests specs whenever you want to test for visual regressions, making sure to replace `home` with a relevant name. You can also add an optional error threshold: Value can range from 0.00 (no difference) to 1.00 (every pixel is different). So, if you enter an error threshold of 0.51, the test would fail only if > 51% of pixels are different.

More examples:

| Threshold | Fails when |
|-----------|------------|
| .25 | > 25%  |
| .30 | > 30% |
| .50 | > 50% |
| .75 | > 75% |

Sample:

```js
it('should display the login page correctly', () => {
  cy.visit('/03.html');
  cy.get('H1').contains('Login');
  cy.compareSnapshot('login', 0.0);
  cy.compareSnapshot('login', 0.1);
});
```

You can target a single HTML element as well:

```js
cy.get('#my-header').compareSnapshot('just-header')
```

You can pass arguments as an object to `cy.compareSnapshot()`, rather than just an error threshold, as well:

```js
it('should display the login page correctly', () => {
  cy.visit('/03.html');
  cy.compareSnapshot('login', {
    capture: 'fullPage',
    errorThreshold: 0.1
  });
});
```
> Looking for more examples? Review [docker/sample_application](https://github.com/Andremoniy/cypress-visual-regression-resemble-js/tree/main/docker/sample_application).


Take the base images:

```sh
$ ./node_modules/.bin/cypress run --env type=base --config screenshotsFolder=cypress/snapshots/base,testFiles=\"**/*regression-tests.js\"

# use comma separated format for multiple config commands
$ ./node_modules/.bin/cypress run \
  --env type=base \
  --config screenshotsFolder=cypress/snapshots/base,testFiles=\"**/*regression-tests.js\"
```

Find regressions:

```sh
$ ./node_modules/.bin/cypress run --env type=actual
```

## Mitigating the anti-aliasing effect

Different [font rasterization](https://en.wikipedia.org/wiki/Font_rasterization) algorithms on Windows and Linux operating systems lead to slight pixel differences in the same page rendering, mainly due to the anti-aliasing filter (known as "AA"). To the human eye these differences are not noticeable (see the pictures below, one taken on Windows on the left and the other on Linux):

<img src="img/test-base.png" width=50% height=50%><img src="img/test-actual.png" width=50% height=50%>

However, when performing a pixel-by-pixel comparison the difference is clearly seen:

<img src="img/test-diff-no-aa.png" width=50% height=50%>

This particular diff was obtained via **cypress-visual-regression** plugin, which does not contain any built-in anti-aliasing detection algorithm. The average difference in pixels for this image is approximately 29%. This is far above any meaningful threshold that one would want to put in a visual regression test. Our objective is to minimise this threshold and make it as little as possible. It is noteworthy that we are considering here a nearly worse-case scenario, where the page consists of text elements only.

We tested different plugins (see the table below) to see how they coped with the described problem. An important caveat here is that we do not want to use any paid subscription solution; we want to avoid sending any data to 3rd party servers and ideally we would like to have a lightweight solution that does not require any supplementary docker container to be running. From this comparison the best result was seen with the **micoocypress** plugin: about 8.9% of detected difference between the example images. However, when taking into account the preferences outlined above, we must ask ourselves "can we do better?".

For our experiment we decided to marry together **cypress-visual-regression** plugin with **Resemble.JS** library. The result is a lightweight plugin, one that does not require any interaction with additional servers, and we managed to squeeze a 6.2% difference for the same sample page that we used for different tests:

<img src="img/test-diff.png" width=50% height=50%>

The result of this work is the present plugin called **cypress-visual-regression-resemble-js**.

## Comparison with existing [Visual Testing plugins](https://docs.cypress.io/plugins/directory#Visual%20Testing)

| Library  | Difference | Detect anti-aliasing effect | Lightweight | In-test configuration | Free | Remark |
| ------------- | ------------- | ------------- | ------------- | ------------- |------------- |------------- |
| Argos  | ? | ? | :x: | :x: |  :white_check_mark: (limited) | Requires API access to the Argos server |
| Applitools  | ? | ? | :x: | :x: |  :white_check_mark: (limited) | Requires API access to the Applitools server |
| Percy  | ? | ? | :x: | :x: |  :white_check_mark: (limited) | Requires API access to the Percy server |
| happo  | ? | ? | :x: |  :x: |  :x:  | Requires API access to the happo server |
| cypress-plugin-snapshots  | ? | ? | :white_check_mark:  | :white_check_mark:|  :white_check_mark:| Not possible to install (bound to an outdated version of Cypress) |
| cypress-image-snapshot  | ? | ? | :white_check_mark:  | :white_check_mark:|  :white_check_mark:| Not possible to install (bound to an outdated version of Cypress) |
| cypress-visual-regression  | 29.63%  | :x: | :white_check_mark:  | :white_check_mark:| :white_check_mark:| |
| **cypress-visual-regression-resemble-js**  | **6.2%**  | :white_check_mark: | :white_check_mark:  | :white_check_mark:| :white_check_mark:| |
| cypress-blink-test  | ? | ? | :white_check_mark:  | :white_check_mark:|  :white_check_mark:|Not possible to install (bound to an outdated version of Cypress) |
| Visual Regression Tracker | ? | ? | :x:  | :white_check_mark:|  :white_check_mark:|The client library is not working, requires Docker |
| cypress-image-diff | 30.1% | :x: | :white_check_mark:  | :white_check_mark:| :white_check_mark:| |
| micoocypress | 8.8518% | :white_check_mark: | :x: | :x: | :white_check_mark:| Requires Docker |
| cypress-visual-regression-diff | 14.7% |:white_check_mark: | ✅| ✅| :white_check_mark:| Requires a manual installation of "sharp" library on Linux |
