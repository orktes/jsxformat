var rt = require('rocambole-token');
var _ = require('lodash');
var _s = require('underscore.string');
var utils = require('../util');

var _opts = {};

function newLine() {
  return {
    type: 'LineBreak',
    value: '\n' // TODO: load setting from options
  }
}

function textOnlyContainsWhiteSpacesAndNewLines(str) {
  return str.trim().length === 0;
}

function removeSpaces(str) {
  return str.replace(/\ /g, '');
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
    if (textOnlyContainsWhiteSpacesAndNewLines(value)) {
      return true;
    } else if (_s.startsWith(value, "\n")) {
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
    if (textOnlyContainsWhiteSpacesAndNewLines(value)) {
      return true;
    } else if (_s.endsWith(value, "\n")) {
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
    token.prev.type !== "LineBreak") {
    if (token.prev.type === "XJSText") {
      if (!_s.endsWith(removeSpaces(token.prev.value), '\n')) {
        token.prev.value += "\n";
      }
    } else {
      rt.before(token, tokenToAdd);
    }
  }
}

function after(token, tokenToAdd) {
  if (token &&
    token.next &&
    token.next.type !== "LineBreak") {
      if (token.next.type === "XJSText") {
        if (!_s.startsWith(removeSpaces(token.next.value), '\n')) {
          token.next.value = "\n" + token.next.value;
        }
      } else {
        rt.after(token, tokenToAdd);
      }
  }
}

function surroundedByText(node) {
  var openingElement = node.openingElement;
  var closingElement = node.closingElement || node.openingElement;

  var textBefore = openingElement.startToken.prev
  && openingElement.startToken.prev.type === "XJSText"
  && !textOnlyContainsWhiteSpacesAndNewLines(openingElement.startToken.prev.value);
  var textAfter = closingElement.endToken.next
  && closingElement.endToken.next.type === "XJSText"
  && !textOnlyContainsWhiteSpacesAndNewLines(closingElement.endToken.next.value);;

  return textBefore && textAfter;
}

function textAsSibling(node) {
  return _.find(node.parent.children, function (node) {
    return node.type === "XJSText";
  });
}

module.exports = {
  setOptions: function (opts) {
    _opts = opts;
  },
  nodeAfter: function(node) {
    if (node.type === "XJSElement" && !surroundedByText(node) && utils.isInRange(node, _opts.range)) {

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
