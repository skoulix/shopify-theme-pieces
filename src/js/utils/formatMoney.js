/**
 * Format money according to Shopify shop settings
 * Handles all Shopify money format placeholders
 * @param {number|string} cents - Amount in cents or a string to parse
 * @returns {string} Formatted money string
 */
export function formatMoney(cents) {
  // Handle string input - remove any non-numeric chars except decimal
  if (typeof cents === 'string') {
    cents = cents.replace(/[^\d.-]/g, '');
    if (cents.includes('.')) {
      cents = Math.round(parseFloat(cents) * 100);
    } else {
      cents = parseInt(cents, 10);
    }
  }
  cents = cents || 0;

  const moneyFormat = window.themeSettings?.moneyFormat || '${{amount}}';
  const value = cents / 100;
  const amountNoDecimals = Math.floor(value);

  // Format with thousand separators using locale
  const amountFormatted = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const amountWithComma = value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const amountNoDecimalsWithComma = amountNoDecimals.toLocaleString('de-DE');
  const amountWithApostrophe = value.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const amountWithSpace = value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const amountNoDecimalsWithSpace = amountNoDecimals.toLocaleString('fr-FR');

  return moneyFormat
    .replace('{{amount_with_comma_separator}}', amountWithComma)
    .replace('{{amount_no_decimals_with_comma_separator}}', amountNoDecimalsWithComma)
    .replace('{{amount_with_apostrophe_separator}}', amountWithApostrophe)
    .replace('{{amount_no_decimals_with_space_separator}}', amountNoDecimalsWithSpace)
    .replace('{{amount_with_space_separator}}', amountWithSpace)
    .replace('{{amount_no_decimals}}', amountNoDecimals.toLocaleString('en-US'))
    .replace('{{amount}}', amountFormatted);
}

// Export for window access in inline scripts
if (typeof window !== 'undefined') {
  window.pieces = window.pieces || {};
  window.pieces.formatMoney = formatMoney;
}
