module.exports = function(chai) {
  var assert = chai.assert;
  var expect = chai.expect;

  var CSSTest = function CSSTest(client, selector, context) {
    var that = this;

    this.context = context;
    this.selector = selector;

    var elementsSelector = this._elementsSelector = function() {
      return (that.context ? that.context._elementsSelector()+' ' : '')+that.selector;
    };

    var message = function(part) {
      return "jQuery('"+elementsSelector()+"') "+part;
    };

    this.css = function(selector) {
      return new CSSTest(client, selector, that);
    };

    var jqueryHack = function(selector, single) {
      var res = browser.executeAsync(
        function(selector, single, done) {
          var onjQuery = single ? function(selector, done) {
            done(window.jQuery(selector).get(0));
          } : function(selector, done) {
            done(window.jQuery(selector).toArray());
          };

          if (!window.jQuery) {
            var headID = document.getElementsByTagName("head")[0];
            var newScript = document.createElement('script');
            newScript.type = 'text/javascript';
            newScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min.js';
            headID.appendChild(newScript);

            window.setTimeout(function() {
              onjQuery(selector, done);
            }, 2000);
          } else {
            onjQuery(selector, done);
          }
        },
        selector, single
      );

      return res;
    }

    var elementsCache = undefined, elementCache = undefined;
    var elements = function() {
      if (elementsCache) return elementsCache;

      return elementsCache = jqueryHack(elementsSelector(), false);
    };

    var element = function() {
      if (elementCache) return elementCache;

      return elementCache = jqueryHack(elementsSelector(), true);
    };

    var elementsValue = function() {
      return elements().value || [];
    };

    var elementId = function(caller) {
      var match = elements().value;

      expect(match, message('matches several elements in the dom. You cannot cast '+caller+' on them. You need to adjust the selector to match only one element')).to.have.lengthOf(1);

      var json = match[0];

      return json.ELEMENT;
    };

    this.exists = function() {
      expect(elementsValue(), message('does not exist')).to.have.length.above(0);

      return that;
    };

    this.count = function(number) {
      assert.isNumber(number, 'argument #1 to count');
      expect(elementsValue(), message('')).to.have.lengthOf(number);

      return that;
    };

    this.atLeast = function(number) {
      assert.isNumber(number, 'argument #1 to atLeast');
      expect(elementsValue(), message('')).to.have.length.above(number);

      return that;
    };

    this.isVisible = function() {
      expect(element().isVisible(), message('->isVisible()')).to.be.true;

      return that;
    };

    this.waitForVisible = function(ms) {
      element().waitForVisible(undefined, ms || 1000);

      return that;
    }

    this.getAttribute = function(name) {
      var res = client.elementIdAttribute(elementId('getAttribute/hasAttribute'), name);

      return res.value;
    };

    this.hasAttribute = function(name, value) {
      var attribute = that.getAttribute(name);

      if (arguments.length == 1) {
        expect(attribute, message('attribute: '+name)).to.be.ok;
      } else {
        expect(attribute, message('value from attribute: '+name)).to.be.equal(value);
      }

      return that;
    };


    var elementText = function() {
      var res = client.elementIdText(elementId('text/containsText()'));

      return res.value;
    };

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
      return element();
    }

    this.click = function() {
      client.elementIdClick(elementId('click'));
      return this;
    };
  };

  return CSSTest;
}