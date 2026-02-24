'use strict';

/**
 * Format cents into a money string using Shopify's money_format pattern.
 * Extracted from init.js for testability — the original IIFE copy remains untouched.
 */
function formatMoney(cents, format) {
  if (typeof cents === 'string') cents = cents.replace('.', '');
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  format = format || '${{amount}}';

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = precision == null ? 2 : precision;
    thousands = thousands || ',';
    decimal = decimal || '.';
    if (isNaN(number) || number == null) return 0;
    number = (number / 100.0).toFixed(precision);
    var parts = number.split('.');
    var dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
    var cents_part = parts[1] ? decimal + parts[1] : '';
    return dollars + cents_part;
  }

  switch (format.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }
  return format.replace(placeholderRegex, value);
}

module.exports = { formatMoney };
