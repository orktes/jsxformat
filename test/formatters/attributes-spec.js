var should = require('chai').should()
var fs = require('fs');

var formatter = require('../../lib/index');

describe('Formatters - Attributes', function() {
  it('should split multiple attributes in to own lines in self closing tag', function () {
    var test = '<div foo="foo" bar="bar" baz="baz" />';

    var result = formatter.format(test);
    var lines = result.split('\n');

    lines[0].trim().should.equal('<div');
    lines[1].trim().should.equal('foo="foo"');
    lines[2].trim().should.equal('bar="bar"');
    lines[3].trim().should.equal('baz="baz" />');

  });

  it('should split multiple attributes in to own lines in opening tag', function () {
    var test = '<div foo="foo" bar="bar" baz="baz"></div>';

    var result = formatter.format(test);
    var lines = result.split('\n');

    lines[0].trim().should.equal('<div');
    lines[1].trim().should.equal('foo="foo"');
    lines[2].trim().should.equal('bar="bar"');
    lines[3].trim().indexOf('baz="baz">').should.equal(0);
  });
});
