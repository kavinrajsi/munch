/** @jest-environment node */
'use strict';

var fs = require('fs');
var path = require('path');

var THEME_ROOT = path.resolve(__dirname, '..');
var LOCALE_PATH = path.join(THEME_ROOT, 'locales', 'en.default.json');

var raw = fs.readFileSync(LOCALE_PATH, 'utf8');
var locale = JSON.parse(raw);

describe('Locale file validity', function() {
  it('en.default.json is valid JSON', function() {
    expect(function() { JSON.parse(raw); }).not.toThrow();
  });
});

describe('Required top-level locale keys', function() {
  var requiredKeys = ['general', 'products', 'cart', 'customer', 'accessibility'];

  requiredKeys.forEach(function(key) {
    it('has top-level key "' + key + '"', function() {
      expect(locale).toHaveProperty(key);
    });
  });

  it('has collection-related strings (collections OR templates/sections)', function() {
    var hasCollections = locale.hasOwnProperty('collections');
    var hasTemplatesOrSections = locale.hasOwnProperty('templates') || locale.hasOwnProperty('sections');
    expect(hasCollections || hasTemplatesOrSections).toBe(true);
  });
});

describe('Required nested locale keys', function() {
  it('has general.search', function() {
    expect(locale.general).toHaveProperty('search');
  });

  it('has customer.login', function() {
    expect(locale.customer).toHaveProperty('login');
  });

  it('has customer.register', function() {
    expect(locale.customer).toHaveProperty('register');
  });

  it('has customer.addresses', function() {
    expect(locale.customer).toHaveProperty('addresses');
  });

  it('has cart.general', function() {
    expect(locale.cart).toHaveProperty('general');
  });

  it('has accessibility.skip_to_content', function() {
    expect(locale.accessibility).toHaveProperty('skip_to_content');
  });
});
