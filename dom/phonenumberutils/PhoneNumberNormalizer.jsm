/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

// Don't modify this code. Please use:
// https://github.com/andreasgal/PhoneNumber.js

"use strict";

this.EXPORTED_SYMBOLS = ["PhoneNumberNormalizer"];

this.PhoneNumberNormalizer = (function() {
  const UNICODE_DIGITS = /[\uFF10-\uFF19\u0660-\u0669\u06F0-\u06F9]/g;
  const VALID_ALPHA_PATTERN = /[a-zA-Z]/g;
  const LEADING_PLUS_CHARS_PATTERN = /^[+\uFF0B]+/g;
  const NON_DIALABLE_CHARS = /[^,#+\*\d]/g;

  // Map letters to numbers according to the ITU E.161 standard
  var E161 = {
    'a': 2, 'b': 2, 'c': 2,
    'd': 3, 'e': 3, 'f': 3,
    'g': 4, 'h': 4, 'i': 4,
    'j': 5, 'k': 5, 'l': 5,
    'm': 6, 'n': 6, 'o': 6,
    'p': 7, 'q': 7, 'r': 7, 's': 7,
    't': 8, 'u': 8, 'v': 8,
    'w': 9, 'x': 9, 'y': 9, 'z': 9
  };

  // Normalize a number by converting unicode numbers and symbols to their
  // ASCII equivalents and removing all non-dialable characters.
  function NormalizeNumber(number, numbersOnly) {
    if (typeof number !== 'string') {
      return '';
    }

    number = number.replace(UNICODE_DIGITS,
                            function (ch) {
                              return String.fromCharCode(48 + (ch.charCodeAt(0) & 0xf));
                            });
    if (!numbersOnly) {
      number = number.replace(VALID_ALPHA_PATTERN,
                              function (ch) {
                                return String(E161[ch.toLowerCase()] || 0);
                              });
    }
    number = number.replace(LEADING_PLUS_CHARS_PATTERN, "+");
    number = number.replace(NON_DIALABLE_CHARS, "");
    return number;
  };


  return {
    Normalize: NormalizeNumber
  };
})();