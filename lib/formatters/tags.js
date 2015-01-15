var rt = require('rocambole-token');
var _ = require('lodash');
var _s = require('underscore.string');

function newLine() {
  return {
    type: 'LineBreak',
    value: '\n' // TODO: load setting from options
  }
}

function canAddAfter(token, node) {
  var nextToken = token.next;

  if (!nextToken) {
    return false;
  }

  if (nextToken.type === "Punctuator") {
    return true;
  } else if (nextToken.type === "XJSText") {
    var value = nextToken.value;
    if (_s.startsWith(value, "\n")) {
      return true;
    } else if (_s.startsWith(value, " ")) {
      return false;
    } else if (value.split(' ').length > 1) {
      return true;
    }
  } else if (nextToken.type === "LineBreak") {
    return true;
  }

  return false;
}

function canAddBefore(token, node) {
  var prevToken = token.prev;

  if (!prevToken) {
    return false;
  }

  if (prevToken.type === "Punctuator") {
    return true;
  } else if (prevToken.type === "XJSText") {
    var value = prevToken.value;
    if (_s.endsWith(value, "\n")) {
      return true;
    } else if (_s.endsWith(value, " ")) {
      return false;
    } else if (value.split(' ').length > 1) {
      return true;
    }
  } else if (prevToken.type === "LineBreak") {
    return true;
  }

  return false;
}

function before(token, tokenToAdd) {
  if (token &&
    token.prev &&
    !(token.prev.type === "LineBreak" || (token.prev.type === "XJSText" && token.prev.value.indexOf('\n') > -1))) {
    rt.before(token, tokenToAdd);
  }
}

function after(token, tokenToAdd) {
  if (token &&
    token.next &&
    !(token.next.type === "LineBreak" || (token.next.type === "XJSText" && token.next.value.indexOf('\n') > -1))) {
    rt.after(token, tokenToAdd);
  }
}

function surroundedByText(node) {
  var openingElement = node.openingElement;
  var closingElement = node.closingElement || node.openingElement;

  var textBefore = openingElement.startToken.prev && openingElement.startToken.prev.type === "XJSText";
  var textAfter = closingElement.endToken.next && closingElement.endToken.next.type === "XJSText";

  return textBefore && textAfter;
}

function textAsSibling(node) {
  return _.find(node.parent.children, function (node) {
    return node.type === "XJSText";
  });
}

var _opts;

module.exports = {
  setOptions: function (opts) {
    _opts = opts;
  },
  nodeAfter: function(node) {
    if (node.type === "XJSElement" && !surroundedByText(node)) {

      if (node.closingElement) {

        if (canAddAfter(node.openingElement.endToken) &&
          canAddBefore(node.closingElement.startToken)) {
          /*
          <div>|foo</div>
          */
          after(node.openingElement.endToken, newLine());

          /*
          <div>foo|</div>
          */
          before(node.closingElement.startToken, newLine());
        }


        if (canAddBefore(node.openingElement.startToken) &&
          canAddAfter(node.closingElement.endToken)) {
          /*
          |<div>foo</div>
          */
          before(node.openingElement.startToken, newLine());

          /*
          <div>foo</div>|
          */
          after(node.closingElement.endToken, newLine());
        }
      } else if (!textAsSibling(node)) {
        if (canAddBefore(node.openingElement.startToken) &&
          canAddAfter(node.openingElement.endToken)) {
          before(node.openingElement.startToken, newLine());
          after(node.openingElement.endToken, newLine());
        }
      }
    }
  }
};
