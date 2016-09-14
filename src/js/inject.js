module.exports = function(prototype, chai) {

  var WebdriverioCSSTest = require('../../index').Webdriverio(chai);

  prototype.css = function(selector) {
    return new WebdriverioCSSTest(browser, selector);
  };

};