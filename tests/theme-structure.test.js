/** @jest-environment node */
'use strict';

var fs = require('fs');
var path = require('path');

var THEME_ROOT = path.resolve(__dirname, '..');

function themeFile() {
  var segments = Array.prototype.slice.call(arguments);
  return path.join.apply(path, [THEME_ROOT].concat(segments));
}

function fileExists(filePath) {
  return fs.existsSync(themeFile(filePath));
}

// ── Required files ──────────────────────────────────────────

describe('Required theme files', function() {
  it('has layout/theme.liquid', function() {
    expect(fileExists('layout/theme.liquid')).toBe(true);
  });

  var coreTemplates = [
    'index.json',
    'product.json',
    'collection.json',
    'cart.json',
    'blog.json',
    'article.json',
    'page.json',
    'search.json',
    '404.json',
    'gift_card.liquid',
    'robots.txt.liquid'
  ];

  coreTemplates.forEach(function(tpl) {
    it('has templates/' + tpl, function() {
      expect(fileExists('templates/' + tpl)).toBe(true);
    });
  });

  var customerTemplates = [
    'account.json',
    'activate_account.json',
    'addresses.json',
    'login.json',
    'order.json',
    'register.json',
    'reset_password.json'
  ];

  customerTemplates.forEach(function(tpl) {
    it('has templates/customers/' + tpl, function() {
      expect(fileExists('templates/customers/' + tpl)).toBe(true);
    });
  });

  it('has config/settings_schema.json', function() {
    expect(fileExists('config/settings_schema.json')).toBe(true);
  });

  it('has config/settings_data.json', function() {
    expect(fileExists('config/settings_data.json')).toBe(true);
  });

  it('has locales/en.default.json', function() {
    expect(fileExists('locales/en.default.json')).toBe(true);
  });

  it('has a non-empty snippets/ directory', function() {
    var dir = themeFile('snippets');
    expect(fs.existsSync(dir)).toBe(true);
    var files = fs.readdirSync(dir).filter(function(f) {
      return f.endsWith('.liquid');
    });
    expect(files.length).toBeGreaterThan(0);
  });

  it('has a non-empty sections/ directory', function() {
    var dir = themeFile('sections');
    expect(fs.existsSync(dir)).toBe(true);
    var files = fs.readdirSync(dir).filter(function(f) {
      return f.endsWith('.liquid') || f.endsWith('.json');
    });
    expect(files.length).toBeGreaterThan(0);
  });
});

// ── theme.liquid validation ─────────────────────────────────

describe('layout/theme.liquid content', function() {
  var content = fs.readFileSync(themeFile('layout/theme.liquid'), 'utf8');

  it('contains {{ content_for_header }}', function() {
    expect(content).toMatch(/\{\{[\s-]*content_for_header[\s-]*\}\}/);
  });

  it('contains {{ content_for_layout }}', function() {
    expect(content).toMatch(/\{\{[\s-]*content_for_layout[\s-]*\}\}/);
  });

  it('contains <!doctype html>', function() {
    expect(content.toLowerCase()).toMatch(/<!doctype\s+html>/);
  });

  it('contains a <title> tag', function() {
    expect(content).toMatch(/<title>/i);
  });
});

// ── JSON validity ───────────────────────────────────────────

describe('JSON template validity', function() {
  var templateDir = themeFile('templates');
  var jsonTemplates = fs.readdirSync(templateDir).filter(function(f) {
    return f.endsWith('.json');
  });
  var customerDir = themeFile('templates', 'customers');
  var customerJsonTemplates = fs.readdirSync(customerDir).filter(function(f) {
    return f.endsWith('.json');
  });

  it('all root .json templates parse as valid JSON', function() {
    var failures = [];
    jsonTemplates.forEach(function(file) {
      try {
        var raw = fs.readFileSync(path.join(templateDir, file), 'utf8');
        var stripped = raw.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
        JSON.parse(stripped);
      } catch (e) {
        failures.push(file + ': ' + e.message);
      }
    });
    expect(failures).toEqual([]);
  });

  it('all customer .json templates parse as valid JSON', function() {
    var failures = [];
    customerJsonTemplates.forEach(function(file) {
      try {
        var raw = fs.readFileSync(path.join(customerDir, file), 'utf8');
        var stripped = raw.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
        JSON.parse(stripped);
      } catch (e) {
        failures.push(file + ': ' + e.message);
      }
    });
    expect(failures).toEqual([]);
  });

  it('config/settings_schema.json is valid JSON', function() {
    var raw = fs.readFileSync(themeFile('config', 'settings_schema.json'), 'utf8');
    expect(function() { JSON.parse(raw); }).not.toThrow();
  });

  it('config/settings_data.json is valid JSON (after stripping comment block)', function() {
    var raw = fs.readFileSync(themeFile('config', 'settings_data.json'), 'utf8');
    // Strip leading /* */ comment block (lines 1-9)
    var stripped = raw.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
    expect(function() { JSON.parse(stripped); }).not.toThrow();
  });
});
