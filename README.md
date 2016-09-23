css-tester [![Build Status](https://travis-ci.org/webforge-labs/css-tester.svg?branch=master)](https://travis-ci.org/webforge-labs/css-tester)
==========

chained testing with (chai) expect and jquery

```js
// cucumber step definition integration example
  this.Then(/^I should see the register countdown$/, function(callback, $) {
    this.css('.panel.register').exists()
      .css('.panel-heading').exists()
        .css('h3').containsText('Anmelden').end()
      .end()
      .css('.panel-body').exists().containsText('Es sind noch 2 Plätze frei.').end();

    callback();
  });
```
