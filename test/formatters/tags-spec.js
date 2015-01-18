var should = require('chai').should()
var fs = require('fs');

var formatter = require('../../lib/index');

describe('Formatters - Tags', function() {
  it('should split tags into multiple rows', function () {
    var test = '<div><div></div></div>';

    formatter.setOptions({});
    var result = formatter.format(test);
    var lines = result.split('\n');

    lines[0].trim().should.equal('<div>');
    lines[1].trim().should.equal('<div>');
    lines[2].trim().should.equal('</div>');
    lines[3].trim().should.equal('</div>');
  });

  it('should split self closing tags into multiple rows', function () {
    var test = '<div><div><div /><div /></div></div>';

    formatter.setOptions({});
    var result = formatter.format(test);

    var lines = result.split('\n');

    lines[0].trim().should.equal('<div>');
    lines[1].trim().should.equal('<div>');
    lines[2].trim().should.equal('<div />');
    lines[3].trim().should.equal('<div />');
    lines[4].trim().should.equal('</div>');
    lines[5].trim().should.equal('</div>');
  });

  it('should split tags with long text', function () {
    var test = '<div><div>Here comes the test</div></div>';

    formatter.setOptions({});
    var result = formatter.format(test);

    var lines = result.split('\n');

    lines[0].trim().should.equal('<div>');
    lines[1].trim().should.equal('<div>');
    lines[2].trim().should.equal('Here comes the test');
    lines[3].trim().should.equal('</div>');
    lines[4].trim().should.equal('</div>');
  });

  it('should not split tags with long text whitespace in the end', function () {
    var test = '<div><div>Here comes the test </div></div>';

    formatter.setOptions({});
    var result = formatter.format(test);

    var lines = result.split('\n');

    lines[0].trim().should.equal('<div>');
    lines[1].trim().should.equal('<div>Here comes the test </div>');
    lines[2].trim().should.equal('</div>');

    test = '<div><div> Here comes the test</div></div>';

    formatter.setOptions({});
    result = formatter.format(test);

    lines = result.split('\n');

    lines[0].trim().should.equal('<div>');
    lines[1].trim().should.equal('<div> Here comes the test</div>');
    lines[2].trim().should.equal('</div>');
  });

  it('should not split tags with short text', function () {
    var test = '<div>        <div>Here</div></div>';

    formatter.setOptions({});
    var result = formatter.format(test);
    var lines = result.split('\n');

    lines[0].trim().should.equal('<div>');
    lines[1].trim().should.equal('<div>Here</div>');
    lines[2].trim().should.equal('</div>');
  });

  it('should not split tags with text with whitespaces', function () {
    var test = '<div> <div>Here <strong>comes</strong> the sun</div> </div>';

    formatter.setOptions({});
    var result = formatter.format(test);
    var lines = result.split('\n');

    lines[0].trim().should.equal('<div>');
    lines[1].trim().should.equal('<div>');
    lines[2].trim().should.equal('Here <strong>comes</strong> the sun');
    lines[3].trim().should.equal('</div>');
    lines[4].trim().should.equal('</div>');

    test = '<div><div>Here <strong>long long string long long</strong> the sun</div></div>';

    formatter.setOptions({});
    result = formatter.format(test);
    lines = result.split('\n');

    lines[0].trim().should.equal('<div>');
    lines[1].trim().should.equal('<div>');
    lines[2].trim().should.equal('Here <strong>long long string long long</strong> the sun');
    lines[3].trim().should.equal('</div>');
    lines[4].trim().should.equal('</div>');
  });

  it('should not split self closing tags in the middle of string', function () {
    var test = '<div> <div>Here comes the one self closing tag <string /> hello how</div></div>';

    formatter.setOptions({});
    var result = formatter.format(test);
    var lines = result.split('\n');

    lines[0].trim().should.equal('<div>');
    lines[1].trim().should.equal('<div>');
    lines[2].trim().should.equal('Here comes the one self closing tag <string /> hello how');
    lines[3].trim().should.equal('</div>');
    lines[4].trim().should.equal('</div>');

    test = '<div> <div>Here comes the one self closing tag <avatar /> <avatar /> hello how</div></div>';

    result = formatter.format(test);
    lines = result.split('\n');

    lines[0].trim().should.equal('<div>');
    lines[1].trim().should.equal('<div>');
    lines[2].trim().should.equal('Here comes the one self closing tag <avatar /> <avatar /> hello how');
    lines[3].trim().should.equal('</div>');
    lines[4].trim().should.equal('</div>');
  });

  it('should add new lines if tag is an argument to a function', function () {
    var test = '<div>{this.fooBar(<div />)}</div>';

    formatter.setOptions({});
    var result = formatter.format(test);
    var lines = result.split('\n');

    lines[0].trim().should.equal('<div>');
    lines[1].trim().should.equal('{this.fooBar(');
    lines[2].trim().should.equal('<div />');
    lines[3].trim().should.equal(')}');
    lines[4].trim().should.equal('</div>');
  });

  it('should not add line break after return', function () {
    var test = 'function foo() {\nreturn <div><span /></div>;\n}';

    formatter.setOptions({});
    var result = formatter.format(test);
    var lines = result.split('\n');

    lines[0].trim().should.equal('function foo() {');
    lines[1].trim().should.equal('return <div>');
    lines[2].trim().should.equal('<span />');
    lines[3].trim().should.equal('</div>;');
    lines[4].trim().should.equal('}');
  });

  it('should add line breaks to ternary operations', function () {
    var test = '<div>{true ? <div /> : <div />}</div>';

    formatter.setOptions({});
    var result = formatter.format(test);
    var lines = result.split('\n');

    lines[0].trim().should.equal('<div>');
    lines[1].trim().should.equal('{true ?');
    lines[2].trim().should.equal('<div />');
    lines[3].trim().should.equal(':');
    lines[4].trim().should.equal('<div />');
    lines[5].trim().should.equal('}');
    lines[6].trim().should.equal('</div>');
  })

  it('should only format tags within range if range is specified', function () {
    var test = '<div><div><p><div /></p></div></div>';
    formatter.setOptions({
      range: [[1,10],[1,24]]
    });

    var result = formatter.format(test);
    var lines = result.split('\n');

    lines[0].trim().should.equal('<div><div>');
    lines[1].trim().should.equal('<p>');
    lines[2].trim().should.equal('<div />');
    lines[3].trim().should.equal('</p>');
    lines[4].trim().should.equal('</div></div>');

  });
});
