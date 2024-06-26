// Copyright (c) 2012 Ecma International.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
es5id: 15.2.3.7-5-b-142
description: >
    Object.defineProperties - 'writable' property of 'descObj' is own
    data property that overrides an inherited data property (8.10.5
    step 6.a)
includes: [propertyHelper.js]
---*/

var obj = {};

var proto = {
  writable: true
};

var Con = function() {};
Con.prototype = proto;

var descObj = new Con();

descObj.writable = false;

Object.defineProperties(obj, {
  property: descObj
});

verifyProperty(obj, "property", {
  writable: false,
});

reportCompare(0, 0);
