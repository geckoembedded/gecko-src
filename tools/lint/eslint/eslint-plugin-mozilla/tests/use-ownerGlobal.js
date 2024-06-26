/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

var rule = require("../lib/rules/use-ownerGlobal");
var RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: "latest" } });

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

function invalidCode(code) {
  return {
    code,
    errors: [{ messageId: "useOwnerGlobal", type: "MemberExpression" }],
  };
}

ruleTester.run("use-ownerGlobal", rule, {
  valid: [
    "aEvent.target.ownerGlobal;",
    "this.DOMPointNode.ownerGlobal.getSelection();",
    "windowToMessageManager(node.ownerGlobal);",
  ],
  invalid: [
    invalidCode("aEvent.target.ownerDocument.defaultView;"),
    invalidCode("this.DOMPointNode.ownerDocument.defaultView.getSelection();"),
    invalidCode("windowToMessageManager(node.ownerDocument.defaultView);"),
  ],
});
