module.exports = function(chai) {
  var assert = chai.assert;
  var expect = chai.expect;

  var CSSTest = function CSSTest($, selector, context) {
    var that = this;

    this.context = context;
    this.selector = selector;
    this.debugSelector = undefined; // setter injection

    assert.isFunction($, 'the first argument passed new CSSTest() has to be the jQuery function');

    // the element

    var $element;
    this.element = function() {
      if (!$element) {
        var parent = that.context instanceof CSSTest ? that.context.element() : that.context;

        $element = $(selector, parent);

        // use chai inspect hook, todo magic things:
        // https://github.com/chaijs/chai/blob/master/lib/chai/utils/inspect.js#L63
        $element.inspect = function() {
          return "$('"+that.getDebugSelector()+"')";
        };
      }

      return $element;
    };

    this.getDebugSelector = function() {
      return that.debugSelector || that.selector;
    };

    // traversion

    this.css = function(childSelector, context) {
      var cssTest = new CSSTest($, childSelector, that);
      cssTest.debugSelector = selector+' '+childSelector;

      return cssTest;
    };

    this.end = function() {
      return that.context;
    };

    // expectations

    var expectElement = function(message) {
      return expect(that.element(), message);
    };

    this.count = function(expected, message) {
      assert.isNumber(expected);
      expectElement(message).to.have.length(expected);
      return this;
    };

    this.exists = function(message) {
      expectElement(message).to.have.length.of.at.least(1);
      return this;
    };

    this.atLeast = function(expected, message) {
      assert.isNumber(expected);
      expectElement(message).to.have.length.of.at.least(expected);
      return this;
    };

    this.containsText = function(expected, message) {
      expect(that.element().text(), message).to.contain(expected);
      return this;
    };
  };

  return CSSTest;
};