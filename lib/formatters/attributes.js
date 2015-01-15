function newLine() {
  return {
    type: 'LineBreak',
    value: '\n' // TODO: load setting from options
  }
}

var _opts;

module.exports = {
  setOptions: function (opts) {
    _opts = opts;
  },
  nodeAfter: function(node) {
    if (node.type === "XJSOpeningElement") {
      // Split attributes into multiple lines
      if (node.attributes.length > 1) { // TODO make this a variable and check length as well
        if (node.name.endToken.next.type === "WhiteSpace") {
          node.name.endToken.next.type = "NewLine";
          node.name.endToken.next.value = "\n";
        }

        node.attributes.map(function (attribute) {
          var next = attribute.endToken.next;

          if (next.type === "WhiteSpace") {
            if (!(next.next && next.next.type === "Punctuator")) {
              next.type = "NewLine";
              next.value = "\n";
              //TODO add indent before
            }
          } else if (next.type === "XJSIdentifier") {
            before(next, newLine());
          }
        });
      }
    }
  }
};
