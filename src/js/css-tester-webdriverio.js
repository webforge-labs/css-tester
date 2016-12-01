module.exports = function(chai) {
  var assert = chai.assert;
  var expect = chai.expect;

  var CSSTest = function CSSTest(client, selector, context) {
    var that = this;

    this.context = context;
    this.selector = selector;

    this._elementsSelectorChain = that.context ? that.context._elementsSelectorChain.concat([that.selector]) : [that.selector];

    var message = function(part) {
      var chain = that._elementsSelectorChain;

      var expression = "jQuery('"+chain[0]+"')";

      chain.slice(1).forEach(function(selector) {
        expression = expression + ".find('"+selector+"')";
      });

      return expression+" "+part;
    };

    this.css = function(selector) {
      return new CSSTest(client, selector, that);
    };


    var jqueryHack = function(selectorsChain, single) {
      var res = browser.executeAsync(
        function(selectorsChain, single, done) {
          var loadjQuery = function(window, callback) {
            if (!window.jQuery) {
              var headID = window.document.getElementsByTagName("head")[0];
              var newScript = window.document.createElement('script');
              newScript.type = 'text/javascript';
              newScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min.js';
              headID.appendChild(newScript);

              window.setTimeout(function() {
                callback(window.jQuery);
              }, 2000);
            } else {
              callback(window.jQuery);
            }
          };

          loadjQuery(window, function($) {
            var $elements, max = selectorsChain.length;

            for (var i = 0; i < max; i++) {
              $elements = $(selectorsChain[i], $elements);
            }

            if (single) {
              done($elements.get(0));
            } else {
              done($elements.toArray())
            }
          });
        },
        selectorsChain, single
      );

      return res;
    };

    var elementsCache = undefined, elementCache = undefined;
    var elements = this.elements = function() {
      if (elementsCache) return elementsCache;

      return elementsCache = jqueryHack(that._elementsSelectorChain, false);
    };

    var invalidateCache = function() {
      elementsCache = elementCache = undefined;
    };

    var element = function() {
      if (elementCache) return elementCache;

      return elementCache = jqueryHack(that._elementsSelectorChain, true);
    };

    var elementsValue = function() {
      return elements().value || [];
    };

    var elementId = function(caller) {
      var match = elements().value;

      expect(match, message('matches several or none elements in the dom. You cannot cast '+caller+' on them. You need to adjust the selector to match only one element')).to.have.lengthOf(1);

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

    this.isNotVisible = function() {
      expect(element().isVisible(), message('->isVisible()')).to.be.false;

      return that;
    };

    this.waitForVisible = function(ms) {
      ms = ms || 1000;
      client.waitUntil(
        function () {
          invalidateCache();
          if (!elementsValue().length) {
            return false;
          }

          var result = client.elementIdDisplayed(elementId('waitForVisible'));

          return result.value;
        },
        ms,
        message('is not visible (waited for '+ms+'ms)'),
        ms/5
      );

      return that;
    };

    this.waitForNotVisible = function(ms) {
      element().waitForVisible(undefined, ms || 1000, true);

      return that;
    };

    this.waitForExist = function(ms) {
      ms = ms || 1000;
      client.waitUntil(
        function () {
          invalidateCache();
          return elementsValue().length > 0;
        },
        ms,
        message('is not existing (waited for '+ms+'ms)'),
        ms/5
      );

      return that;
    };

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


    this.getText = function() {
      var res = client.elementIdText(elementId('text/containsText()'));

      return res.value;
    };

    this.getTexts = function() {
      var texts = [];
      elementsValue().forEach(function(elem) {
        var res = client.elementIdText(elem.ELEMENT);
        texts.push(res.value);
      });
        
      return texts;
    };

    this.getHtmls = function() {
      var res = client.execute(function(selectorsChain) {
        var html = [];

        var $elements, max = selectorsChain.length;
        for (var i = 0; i < max; i++) {
          $elements = $(selectorsChain[i], $elements);
        }

        $elements.each(function() {
          html.push($(this).html());
        });

        return html;
      }, that._elementsSelectorChain);

      return res.value;
    };

    this.text = function(value) {
      expect(that.getText(), message(':text')).to.be.equal(value);

      return that;
    };

    this.containsText = function(value) {
      expect(that.getText(), message(':text')).to.have.string(value);

      return that;
    };

    this.end = function() {
      return that.context;
    };

    this.get = function() {
      return element();
    };

    this.setValue = function(value) {
      var id = elementId('setValue');
      client.elementIdClear(id);
      client.elementIdValue(id, value);

      return that;
    }

    this.getValue = function() {
      var res = client.elementIdAttribute(elementId('getValue'), 'value');

      return res.value;
    }

    this.value = function(value) {
      expect(that.getValue(), message(':value')).to.be.equal(value);

      return that;
    };

    this.click = function() {
      client.elementIdClick(elementId('click'));
      return this;
    };
  };

  return CSSTest;
}