/*global describe, it, before, beforeEach, after, afterEach, client */
/* jshint expr:true */

var chai = require('chai');
var expect = chai.expect;
var cssTester = require('../index');
var WebdriverioCSSTest = cssTester.Webdriverio(chai);

describe('CSSTester', function() {
  before(function(done) {
    browser.url('/ssc.html');
  });

  var css = function(selector) {
    return new WebdriverioCSSTest(browser, selector);
  };

  it('injects into some testing env', function() {
    var env = {};

    cssTester.inject(env, chai);

    expect(env.css).to.be.a('function');
  });

  it('can handle class selectors', function() {
    css('.panel').exists();
    css('.register').exists();

    expect(function() {
      css('.this-does-not-exist').exists();
    }).to.throw(chai.AssertionError);
  });

  it('can handle concatenated classes', function() {
    css('.panel.register').exists();

    css('.panel.without-register').count(0);

    expect(function() {
      css('.panel.without-register').exists();
    }).to.throw(chai.AssertionError);
  });

  it("can test the existance of nested elements", function() {
    var heading = css('.panel.register').exists()
      .css('.panel-heading').exists()

    expect(function() {
      heading.css('p').exists();
    }, 'there is no p in ".panel.register .panel-heading"').to.throw(chai.AssertionError);
  });

  it("returns the current element with get()", function() {
    var a = css('.panel.register').exists()
      .css('.panel-body').exists()
        .css('a').exists().get();

    expect(a.isExisting(), 'isExisting() from selected element').to.be.true;
  });

  it('can use jquery special selectors with get()', function() {
    var a = css('.panel.register .panel-body a:contains("teilnehmen"):first').get();
    
    expect(a.isExisting(), 'isExisting() from selected element').to.be.true;
  });

  var testSeveralMatchesException = function(testcode) {
    var assertion;

    expect(function() {
      try {
        testcode();
      } catch (ex) {
        assertion = ex;
        throw ex;
      }
    }).to.throw(chai.AssertionError);

    expect(assertion.toString()).to.have.string('matches several or none elements');
    expect(assertion.toString()).to.have.string('You need to adjust the selector to match only one element');
  };

  it("cannot test the attribute existance for more than one matching element", function() {
    testSeveralMatchesException(function() {
      css('a').hasAttribute('href');
    });
  });

  it("can test the attribute existance", function() {
    var a = css('.panel.register')
      .css('.panel-body')
        .css('a').exists();

    a.hasAttribute('href');

    expect(function() {
      a.hasAttribute('hrefffff');
    }).to.throw(chai.AssertionError);

  });


  it("can test the attribute value", function() {
    css('.panel.register')
      .css('.panel-body')
        .css('a').exists().hasAttribute('href', 'http://localhost:8000/teilnehmen').end();
  });

  it("can retrieve the attribute value", function() {
    var href = css('.panel.register')
      .css('.panel-body')
        .css('a').exists().getAttribute('href');

    expect(href).to.be.eql('http://localhost:8000/teilnehmen');
  });

  it("cannot test the complete text content from several elements", function() {
    testSeveralMatchesException(function() {
      css('p').text('does-not-matter');
    });
  });

  it("can test the complete text content of an element", function() {
    css('.hero')
      .css('h2').exists().text('Die Frankfurter Plattform zum Stromsparen.').end();

    expect(function() {
      css('.hero')
        .css('h2').exists().text('Die Frankfurter').end();
    }, 'partial text should fail').to.throw(chai.AssertionError);
  });

  it("can test partial text content of an element", function() {
    css('.hero')
      .css('h2').exists().containsText('Plattform').end();

    expect(function() {
      css('.hero')
        .css('h2').exists().containsText('not-existing').end();
    }).to.throw(chai.AssertionError);
  });

  it('can test with :contains for text in elements combined with classes before', function() {
    var panelId = css('.hero .panel-heading:contains("Plattform")').exists().getAttribute('id');
    expect(panelId).to.be.equal('hero-panel');
  });

  it('can retrieve the text from an match element', function() {
    var li = css('.hero .panel-body ul li:eq(0)').exists()

    expect(li.getText()).to.be.equal('Mitmachen und Austauschen');
  });

  it('can retrieve all text contents from a set of matched elementes', function() {
    var lis = css('.hero .panel-body ul').exists()
      .css('li').count(3);

    var texts = lis.getTexts();

    expect(texts, JSON.stringify(texts)).to.be.eql([
      'Mitmachen und Austauschen',
      'Stromsparen, aber richtig',
      'Prämien und Angebote nutzen'
    ]);
  });

  it('can retrieve all (jquery)-html contents from a set of matched elementes', function() {
    var lis = css('footer ul').exists()
      .css('li').count(3);

    var texts = lis.getHtmls();

    expect(texts).to.be.eql(['eins', 'zwei', 'drei']);
  });

  it('can waitForVisible for already visible and existing elements', function() {
    css('footer ul li:eq(0)').waitForVisible().isVisible();
  });

  it('cant waitForVisible for non visible elements', function() {
    expect(function() {
      css('footer ul li:eq(1)').waitForVisible();
    }).to.throw(Error, /jQuery\('footer ul li:eq\(1\)'\) is not visible \(waited for 1000ms\)/);
  });

  it('can waitForNotVisible for non visible elements', function() {
    css('footer ul li:eq(1)').waitForNotVisible();
  });

  it('can assert right value of inputs', function() {
    css('form input[name="xyz"]').exists().value('zwei drei vier');
  });

  it('can assert wrong value of inputs', function() {
    expect(function() {
      css('form input[name="xyz"]').value('not the right value');
    }).to.throw(chai.AssertionError, /zwei drei vier/);
  });

  it('can change the value of inputs', function() {
    var input = css('form input[name="xyz"]').setValue('new');
    input.value('new');
  });
});