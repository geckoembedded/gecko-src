/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Weave } from "resource://services-sync/main.sys.mjs";
import { RawCryptoWrapper } from "resource://services-sync/record.sys.mjs";
import { Utils } from "resource://services-sync/util.sys.mjs";

export function FakeFilesystemService(contents) {
  this.fakeContents = contents;
  let self = this;

  // Save away the unmocked versions of the functions we replace here for tests
  // that really want the originals. As this may be called many times per test,
  // we must be careful to not replace them with ones we previously replaced.
  // (And why are we bothering with these mocks in the first place? Is the
  // performance of the filesystem *really* such that it outweighs the downside
  // of not running our real JSON functions in the tests? Eg, these mocks don't
  // always throw exceptions when the real ones do. Anyway...)
  for (let name of ["jsonSave", "jsonLoad", "jsonMove", "jsonRemove"]) {
    let origName = "_real_" + name;
    if (!Utils[origName]) {
      Utils[origName] = Utils[name];
    }
  }

  Utils.jsonSave = async function jsonSave(filePath, that, obj) {
    let json = typeof obj == "function" ? obj.call(that) : obj;
    self.fakeContents["weave/" + filePath + ".json"] = JSON.stringify(json);
  };

  Utils.jsonLoad = async function jsonLoad(filePath) {
    let obj;
    let json = self.fakeContents["weave/" + filePath + ".json"];
    if (json) {
      obj = JSON.parse(json);
    }
    return obj;
  };

  Utils.jsonMove = function jsonMove(aFrom, aTo) {
    const fromPath = "weave/" + aFrom + ".json";
    self.fakeContents["weave/" + aTo + ".json"] = self.fakeContents[fromPath];
    delete self.fakeContents[fromPath];
    return Promise.resolve();
  };

  Utils.jsonRemove = function jsonRemove(filePath) {
    delete self.fakeContents["weave/" + filePath + ".json"];
    return Promise.resolve();
  };
}

export function fakeSHA256HMAC(message) {
  message = message.substr(0, 64);
  while (message.length < 64) {
    message += " ";
  }
  return message;
}

export function FakeGUIDService() {
  let latestGUID = 0;

  Utils.makeGUID = function makeGUID() {
    // ensure that this always returns a unique 12 character string
    let nextGUID = "fake-guid-" + String(latestGUID++).padStart(2, "0");
    return nextGUID.slice(nextGUID.length - 12, nextGUID.length);
  };
}

/*
 * Mock implementation of WeaveCrypto. It does not encrypt or
 * decrypt, merely returning the input verbatim.
 */
export function FakeCryptoService() {
  this.counter = 0;

  delete Weave.Crypto; // get rid of the getter first
  Weave.Crypto = this;

  RawCryptoWrapper.prototype.ciphertextHMAC = function ciphertextHMAC() {
    return fakeSHA256HMAC(this.ciphertext);
  };
}

FakeCryptoService.prototype = {
  async encrypt(clearText) {
    return clearText;
  },

  async decrypt(cipherText) {
    return cipherText;
  },

  async generateRandomKey() {
    return btoa("fake-symmetric-key-" + this.counter++);
  },

  generateRandomIV: function generateRandomIV() {
    // A base64-encoded IV is 24 characters long
    return btoa("fake-fake-fake-random-iv");
  },

  expandData: function expandData(data) {
    return data;
  },

  generateRandomBytes: function generateRandomBytes(byteCount) {
    return "not-so-random-now-are-we-HA-HA-HA! >:)".slice(byteCount);
  },
};
