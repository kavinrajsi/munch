'use strict';

var utils = require('../dev/scripts/utils');
var formatMoney = utils.formatMoney;

describe('formatMoney', function() {
  // --- {{amount}} (default) ---
  describe('{{amount}} format', function() {
    it('formats whole-dollar cents', function() {
      expect(formatMoney(1000, '${{amount}}')).toBe('$10.00');
    });

    it('formats cents with decimals', function() {
      expect(formatMoney(1999, '${{amount}}')).toBe('$19.99');
    });

    it('formats zero cents', function() {
      expect(formatMoney(0, '${{amount}}')).toBe('$0.00');
    });

    it('adds comma for thousands', function() {
      expect(formatMoney(123456, '${{amount}}')).toBe('$1,234.56');
    });

    it('handles large amounts', function() {
      expect(formatMoney(1000000, '${{amount}}')).toBe('$10,000.00');
    });
  });

  // --- {{amount_no_decimals}} ---
  describe('{{amount_no_decimals}} format', function() {
    it('rounds and strips decimals', function() {
      expect(formatMoney(1000, '${{amount_no_decimals}}')).toBe('$10');
    });

    it('rounds up at .5', function() {
      expect(formatMoney(1050, '${{amount_no_decimals}}')).toBe('$11');
    });
  });

  // --- {{amount_with_comma_separator}} ---
  describe('{{amount_with_comma_separator}} format', function() {
    it('uses dot for thousands and comma for decimal', function() {
      expect(formatMoney(123456, '${{amount_with_comma_separator}}')).toBe('$1.234,56');
    });
  });

  // --- {{amount_no_decimals_with_comma_separator}} ---
  describe('{{amount_no_decimals_with_comma_separator}} format', function() {
    it('uses dot for thousands and no decimal', function() {
      expect(formatMoney(123456, '${{amount_no_decimals_with_comma_separator}}')).toBe('$1.235');
    });
  });

  // --- default format ---
  describe('default format', function() {
    it('uses ${{amount}} when no format is given', function() {
      expect(formatMoney(500)).toBe('$5.00');
    });
  });

  // --- string input ---
  describe('string cents input', function() {
    it('strips decimal point from string cents', function() {
      expect(formatMoney('10.00', '${{amount}}')).toBe('$10.00');
    });

    it('handles string whole number', function() {
      expect(formatMoney('1999', '${{amount}}')).toBe('$19.99');
    });
  });

  // --- edge cases ---
  describe('edge cases', function() {
    it('returns 0 for NaN input', function() {
      expect(formatMoney(NaN, '${{amount}}')).toBe('$0');
    });

    it('returns 0 for null input', function() {
      expect(formatMoney(null, '${{amount}}')).toBe('$0');
    });

    it('works with custom format wrapper', function() {
      expect(formatMoney(500, '{{amount}} USD')).toBe('5.00 USD');
    });

    it('works with spaces in placeholder', function() {
      expect(formatMoney(500, '${{ amount }}')).toBe('$5.00');
    });
  });
});
