/** @jest-environment node */
'use strict';

var fs = require('fs');
var path = require('path');

var THEME_ROOT = path.resolve(__dirname, '..');
var ASSETS_DIR = path.join(THEME_ROOT, 'assets');
var MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

describe('Compiled assets', function() {
  it('assets/base.css exists and is non-empty', function() {
    var filePath = path.join(ASSETS_DIR, 'base.css');
    expect(fs.existsSync(filePath)).toBe(true);
    var stat = fs.statSync(filePath);
    expect(stat.size).toBeGreaterThan(0);
  });

  it('assets/global.js exists and is non-empty', function() {
    var filePath = path.join(ASSETS_DIR, 'global.js');
    expect(fs.existsSync(filePath)).toBe(true);
    var stat = fs.statSync(filePath);
    expect(stat.size).toBeGreaterThan(0);
  });
});

describe('Asset file size limits', function() {
  var allAssets = fs.readdirSync(ASSETS_DIR);

  it('finds asset files', function() {
    expect(allAssets.length).toBeGreaterThan(0);
  });

  it('no asset exceeds 10 MB', function() {
    var oversized = [];
    allAssets.forEach(function(file) {
      var filePath = path.join(ASSETS_DIR, file);
      var stat = fs.statSync(filePath);
      if (stat.size > MAX_FILE_SIZE) {
        var sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
        oversized.push(file + ' (' + sizeMB + ' MB)');
      }
    });
    expect(oversized).toEqual([]);
  });
});
