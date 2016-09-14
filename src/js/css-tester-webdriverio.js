module.exports = function(chai) {
  var assert = chai.assert;
  var expect = chai.expect;

  var wdioSelector = function(selector) {
    return selector;
  };

  var CSSTest = function CSSTest(client, selector, context) {
    var that = this;

    this.context = context;
    //this.debugSelector = (context && context.debugSelector ? context.debugSelector+' ' : '')+selector;
    this.selector = wdioSelector(selector);

    var elementsSelector = this._elementsSelector = function() {
      return (that.context ? that.context._elementsSelector()+' ' : '')+that.selector;
    };

    var message = function(part) {
      return "element('"+elementsSelector()+"') "+part;
    };

    this.css = function(selector) {
      return  new CSSTest(client, selector, that);
    };


    var elements = function() {
      var res = client.elements(elementsSelector());

      return res.value || [];
    };

    this.exists = function() {
      expect(elements(), message('does not exist')).to.have.length.above(0);

      return that;
    };

    this.count = function(number) {
      assert.isNumber(number, 'argument #1 to count');
      expect(elements(), message('')).to.have.lengthOf(number);

      return that;
    };

    this.hasAttribute = function(name, value) {
      var attribute = client.getAttribute(elementsSelector(), name);

      expect(attribute, message('matches several elements in the dom. You cannot cast hasAttribute() on them. You need to adjust the selector to match only one element')).to.not.be.a('array');

      if (arguments.length == 1) {
        expect(attribute, message('attribute: '+name)).to.be.ok;
      } else {
        expect(attribute, message('value from attribute: '+name)).to.be.equal(value);
      }

      return that;
    };

    var elementText = function() {
      var text = client.getText(elementsSelector());

      expect(text, message('matches several elements in the dom. You cannot cast text() on them. You need to adjust the selector to match only one element')).to.not.be.a('array');
      return text;
    }

    this.text = function(value) {
      expect(elementText(), message(':text')).to.be.equal(value);

      return that;
    };

    this.containsText = function(value) {
      expect(elementText(), message(':text')).to.have.string(value);

      return that;
    };

    this.end = function() {
      return that.context;
    };

    this.get = function() {
      return client.element(elementsSelector());
    }
  };

  return CSSTest;
}