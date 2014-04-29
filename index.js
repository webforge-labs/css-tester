module.exports = function(chai) {
  var assert = chai.assert;
  var expect = chai.expect;

  // disable truncating to "shorter" messages for objects, to always use inspect() for our element
  chai.config.truncateThreshold = 0;

  var CSSTest = function CSSTest($, selector, context) {
    var that = this;

    this._isCSSTester = true;

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
          return that.inspectMessage();
        };
      }

      return $element;
    };

    this.getDebugSelector = function() {
      return that.debugSelector || that.selector;
    };

    // traversion

    this.css = function(childSelector) {
      var cssTest = new CSSTest($, childSelector, that);
      cssTest.debugSelector = selector+' '+childSelector;

      return cssTest;
    };

    this.end = function() {
      return that.context;
    };

    this.get = function() {
      return that.element();
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

    this.text = function(expected, message) {
      expect(that.element().text(), message).to.equal(expected);
      return this;
    };

    this.matches = function(regexp, message) {
      expect(that.element().text(), message).to.match(regexp);
      return this;
    };

    this.hasAttribute = function(attributeName, expected) {
      // @TODO build a chai assertion for attr here
      var attributeValue = that.element().attr(attributeName);
      var attribute = new String(attributeValue);  // jshint ignore:line

      attribute.inspect = function() {
        return that.inspectMessage('["'+attributeName+'"]');
      };

      if (arguments.length === 1) {
        expect(attribute).to.be.not.undefined;
      } else {
        expect(attribute, "expected attr value '"+attributeValue+"' to be equal '"+expected+"'")
          .to.satisfy(function () { return attributeValue === expected; });
      }

      return this;
    };

    this.is = function(constraint, expected) {

      var is = expect(that.element().is(constraint), that.element().inspect()+'.is("'+constraint+'")');
      if (arguments.length === 1 || expected) {
        is.to.be.true;
      } else {
        is.to.be.false;
      }
      
      return this;
    };

    this.inspectMessage = function(append) {
      var msg = "$('"+that.getDebugSelector();
      if (append) {
        msg += append;
      }
      msg += "')";
      return msg;
    };

    this.toString = function() {
      return 'CSSTest';
    };

    this.inspect = function() {
      return 'CSSTest: '+this.inspectMessage();
    };
  };

  return CSSTest;
};
