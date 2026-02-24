/** @jest-environment node */
'use strict';

var fs = require('fs');
var path = require('path');

var THEME_ROOT = path.resolve(__dirname, '..');
var SECTIONS_DIR = path.join(THEME_ROOT, 'sections');
var SCHEMA_RE = /{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/;

var liquidSections = fs.readdirSync(SECTIONS_DIR).filter(function(f) {
  return f.endsWith('.liquid');
});

describe('Section schema blocks', function() {
  it('finds .liquid section files', function() {
    expect(liquidSections.length).toBeGreaterThan(0);
  });

  it('every section has a {% schema %} block', function() {
    var missing = [];
    liquidSections.forEach(function(file) {
      var content = fs.readFileSync(path.join(SECTIONS_DIR, file), 'utf8');
      if (!SCHEMA_RE.test(content)) {
        missing.push(file);
      }
    });
    expect(missing).toEqual([]);
  });

  it('all schema blocks contain valid JSON', function() {
    var failures = [];
    liquidSections.forEach(function(file) {
      var content = fs.readFileSync(path.join(SECTIONS_DIR, file), 'utf8');
      var match = content.match(SCHEMA_RE);
      if (match) {
        try {
          JSON.parse(match[1]);
        } catch (e) {
          failures.push(file + ': ' + e.message);
        }
      }
    });
    expect(failures).toEqual([]);
  });

  it('all schemas have a "name" string', function() {
    var failures = [];
    liquidSections.forEach(function(file) {
      var content = fs.readFileSync(path.join(SECTIONS_DIR, file), 'utf8');
      var match = content.match(SCHEMA_RE);
      if (match) {
        try {
          var schema = JSON.parse(match[1]);
          if (typeof schema.name !== 'string') {
            failures.push(file + ': missing or non-string "name"');
          }
        } catch (e) { /* caught by JSON validity test */ }
      }
    });
    expect(failures).toEqual([]);
  });

  it('all schemas have a "settings" array or "blocks" array', function() {
    var failures = [];
    liquidSections.forEach(function(file) {
      var content = fs.readFileSync(path.join(SECTIONS_DIR, file), 'utf8');
      var match = content.match(SCHEMA_RE);
      if (match) {
        try {
          var schema = JSON.parse(match[1]);
          var hasSettings = Array.isArray(schema.settings);
          var hasBlocks = Array.isArray(schema.blocks);
          if (!hasSettings && !hasBlocks) {
            failures.push(file + ': missing both "settings" and "blocks" arrays');
          }
        } catch (e) { /* caught by JSON validity test */ }
      }
    });
    expect(failures).toEqual([]);
  });
});

describe('Section group JSON files', function() {
  it('header-group.json is valid JSON', function() {
    var filePath = path.join(SECTIONS_DIR, 'header-group.json');
    expect(fs.existsSync(filePath)).toBe(true);
    var raw = fs.readFileSync(filePath, 'utf8');
    expect(function() { JSON.parse(raw); }).not.toThrow();
  });

  it('footer-group.json is valid JSON', function() {
    var filePath = path.join(SECTIONS_DIR, 'footer-group.json');
    expect(fs.existsSync(filePath)).toBe(true);
    var raw = fs.readFileSync(filePath, 'utf8');
    expect(function() { JSON.parse(raw); }).not.toThrow();
  });
});
