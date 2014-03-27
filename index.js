module.exports = function(chai) {
  var assert = chai.assert;
  var expect = chai.expect;

  var CSSTest = function CSSTest($, selector, context) {
    var that = this;

    this.context = context;
    this.selector = selector;


    // the element

    var $element;
    this.element = function() {
      if (!$element) {
        var parent = that.context instanceof CSSTest ? that.context.element() : that.context;

        $element = $(selector, parent);
      }

      return $element;
    };

    // traversion

    this.css = function(selector, context) {
      return new CSSTest($, selector, that);
    };

    this.end = function() {
      return that.context;
    };

    // expectations

    this.count = function(expected, message) {
      assert.isNumber(expected);
      expect(that.element(), message).to.have.length(expected);
    };

    this.exists = function(message) {
      expect(that.element(), message).to.have.length.of.at.least(1);
    };

    this.atLeast = function(expected, message) {
      assert.isNumber(expected);
      expect(that.element(), message).to.have.length.of.at.least(expected);
    };
  };

  return CSSTest;
};