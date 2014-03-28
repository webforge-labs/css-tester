/*global describe, it, before, beforeEach, after, afterEach */
/* jshint expr:true */

var chai = require('chai');
var expect = chai.expect;
var jsdom = require('jsdom');
var fs = require('fs');
var CSSTest = require('../index')(chai);

describe('CSSTester', function() {
  var $;

  beforeEach(function(done) {
    jsdom.env({
      file: 'test/files/ssc.html',
      src: [fs.readFileSync("test/files/jquery.js", "utf-8")],
      done: function(errors, window) {
        $ = window.jQuery;
        done();
      }
    });
  });

  var css = function(selector) {
    return new CSSTest($, selector);
  };

  it("can test the existance of an jquery element", function() {
    css('.panel.register').exists();
  });


  describe('traversing', function() {
    it("can test the existance of an nested jquery element", function() {
      css('.panel.register').exists()
        .css('.panel-heading').exists();
    });

    it("returns the last jquery object with get()", function() {
      var $a = css('.panel.register').exists()
        .css('.panel-body').exists()
          .css('a').exists().get();

      expect($a.jquery).to.be.ok;
      expect($a.attr('href')).to.be.equal('/teilnehmen');
    });
  });

  it("can test the attribute existance", function() {
    css('.panel.register')
      .css('.panel-body')
        .css('a').exists().hasAttribute('href');
  });

  it("can test the attribute value", function() {
    css('.panel.register')
      .css('.panel-body')
        .css('a').exists().hasAttribute('href', '/teilnehmen').end();
  });

  it("can test the the comparison of two strings", function() {
    css('.hero')
      .css('h2').exists().text('Die Frankfurter Platttform zum Stromsparen.');
  });

});
