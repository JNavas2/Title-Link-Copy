/**
 * Title-Link Copy - Utility Module
 * Utility functions for text processing and formatting
 * Supports both desktop and Android
 * © John Navas 2025, All Rights Reserved
 */

// Common articles, conjunctions, prepositions ≤3 letters
const minorWords = new Set([
  "a", "an", "the",      // articles
  "and", "but", "for", "nor", "or", "so", "yet", // conjunctions
  "as", "at", "by", "in", "of", "off", "on", "per", "to", "up", "via" // prepositions
]);

/**
 * Checks if a word is all uppercase (ignores non-letter characters).
 * @param {string} word
 * @returns {boolean}
 */
function isAllUpperCase(word) {
  // Only consider letters for the uppercase check
  const letters = word.match(/\p{L}+/gu);
  if (!letters) return false;
  return letters.join('') === letters.join('').toUpperCase();
}

/**
 * Splits a word into its base part and possessive suffix (if any).
 * @param {string} word - The input word to split.
 * @returns {{ base: string, suffix: string }} - The base word and suffix.
 */
function splitBaseAndSuffix(word) {
  const match = word.match(/^([\p{L}\d]+)(['']s)$/u);
  if (match) {
    return {
      base: match[1],
      suffix: match[2],
    };
  }
  return {
    base: word,
    suffix: '',
  };
}

/**
 * Checks if a string has internal capitals (e.g., "iPhone", "DeLorean"). 
 * @param {string} str - The input string to check.     
 * @return {boolean} - True if the string has internal capitals, false otherwise.
 */
function hasInternalCapitals(str) {
  return /\p{Lu}/u.test(str.slice(1));
}

/**
 * Parses the input text into words and separators.
 * @param {string} text - The text to parse.
 * @returns {{words: string[], separators: string[]}}
 */
function parseText(text) {
  const wordRegex = /(?:\d+\p{L}+|[\p{L}]+(?:[''][\p{L}]+)?|\d+)/gu;
  const words = text.match(wordRegex) || [];
  const separators = text.split(wordRegex);
  return {
    words,
    separators,
  };
}

/**
 * Reassembles text from words and separators arrays.
 * @param {{words: string[], separators: string[]}} param0
 * @returns {string}
 */
function reassembleText({ words, separators }) {
  let result = '';
  const maxLen = Math.max(words.length, separators.length);
  for (let i = 0; i < maxLen; i += 1) {
    if (separators[i] !== undefined) result += separators[i];
    if (words[i] !== undefined) result += words[i];
  }
  return result;
}

/**
 * Converts text to AP-style title case
 * Follows AP Stylebook rules for title casing
 * @param {string} text - The text to convert to title case
 * @returns {string} - The text in AP-style title case
 */
function apStyleTitleCase(text) {
  if (!text) return '';

  const parsed = parseText(text);
  const { words } = parsed;
  const len = words.length;
  const result = [];

  for (let i = 0; i < len; i++) {
    const word = words[i];
    const { base, suffix } = splitBaseAndSuffix(word);

    // 1. Preserve ALL-UPPERCASE words (acronyms, etc.), but lowercase suffix
    if (isAllUpperCase(base)) {
      result.push(base + suffix.toLowerCase());
      continue;
    }

    // 2. Preserve words with internal capitals (proper names, brands)
    if (hasInternalCapitals(base)) {
      result.push(base + suffix);
      continue;
    }

    // 3. Preserve words starting with a digit (ordinals, etc.)
    if (/^\d/.test(base)) {
      result.push(base + suffix);
      continue;
    }

    const lowerBase = base.toLowerCase();
    const lowerSuffix = suffix.toLowerCase();

    // 4. Always capitalize first and last word
    if (i === 0 || i === len - 1) {
      result.push(
        lowerBase.charAt(0).toUpperCase() +
        lowerBase.slice(1) +
        lowerSuffix
      );
      continue;
    }

    // 5. Capitalize "to" in infinitives (optional rule)
    if (lowerBase === "to" && i + 1 < len) {
      result.push("To");
      continue;
    }

    // 6. Capitalize all words of 4+ letters
    if (base.length >= 4) {
      result.push(
        lowerBase.charAt(0).toUpperCase() +
        lowerBase.slice(1) +
        lowerSuffix
      );
      continue;
    }

    // 7. Do not capitalize minor words (if 3 letters or fewer)
    if (minorWords.has(lowerBase)) {
      result.push(lowerBase + lowerSuffix);
      continue;
    }

    // 8. Otherwise, capitalize principal words
    result.push(
      lowerBase.charAt(0).toUpperCase() +
      lowerBase.slice(1) +
      lowerSuffix
    );
  }

  return reassembleText({ words: result, separators: parsed.separators });
}

/**
 * Format copy text with multiple items on separate lines
 * @param {Object} items - Object with title, url, and selectedText properties
 * @param {Object} options - Copy options including text placement and title casing
 * @returns {string} - Formatted text for clipboard
 */
function formatCopyText(items, options) {
  const lines = [];

  // Add title if applicable
  if (items.title) {
    let title = items.title;
    if (options.useApTitleCase) {
      title = apStyleTitleCase(title);
    }
    lines.push(title);
  }

  // Add selected text based on placement option
  if (items.selectedText && options.selectedTextPlacement === 'above') {
    lines.push(items.selectedText);
  }

  // Add URL if applicable
  if (items.url) {
    lines.push(items.url);
  }

  // Add selected text if placement is 'below'
  if (items.selectedText && options.selectedTextPlacement === 'below') {
    lines.push(items.selectedText);
  }

  return lines.join('\n');
}

/**
 * Copy text to clipboard - Firefox WebExtension optimized
 * Primary: browser.clipboard.setString() → navigator.clipboard → execCommand fallback
 * @param {string} text - Text to copy to clipboard
 * @returns {Promise<void>}
 */
function copyToClipboard(text) {
  // 1. Firefox WebExtension API (works in background/popup scripts)
  if (typeof browser !== 'undefined' && browser.clipboard && browser.clipboard.setString) {
    return browser.clipboard.setString(text).catch(err => {
      console.warn('browser.clipboard failed, trying fallback:', err);
      return fallbackCopy(text);
    });
  }

  // 2. Modern Clipboard API (popup/options pages, secure contexts)
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).catch(err => {
      console.warn('Clipboard API failed, trying fallback:', err);
      return fallbackCopy(text);
    });
  }

  // 3. Enhanced execCommand fallback
  return fallbackCopy(text);
}

/**
 * Fallback using document.execCommand with Firefox compatibility fixes
 * @param {string} text
 * @returns {Promise<void>}
 */
function fallbackCopy(text) {
  return new Promise((resolve, reject) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', ''); // Firefox security fix

    document.body.appendChild(textArea);

    try {
      textArea.focus();
      textArea.select();

      // Firefox requires user gesture context for execCommand
      const successful = document.execCommand('copy');

      document.body.removeChild(textArea);

      if (successful) {
        resolve();
      } else {
        reject(new Error('execCommand copy failed'));
      }
    } catch (err) {
      document.body.removeChild(textArea);
      reject(err);
    }
  });
}

/**
 * Get default options from storage or return defaults
 * @returns {Promise<Object>} - Options object
 */
function getOptions() {
  // Use localStorage to avoid requiring the `storage` permission.
  // Return a Promise for compatibility with existing callers.
  return new Promise((resolve) => {
    try {
      const raw = localStorage.getItem('ttlcOptions');
      if (raw) {
        const parsed = JSON.parse(raw);
        resolve({
          selectedTextPlacement: parsed.selectedTextPlacement || 'below',
          useApTitleCase: parsed.useApTitleCase || false
        });
        return;
      }
    } catch (e) {
      // Fall through to defaults/migration
    }

    // Attempt migration from browser.storage.local if available (best-effort)
    try {
      if (window.browser && browser.storage && browser.storage.local && browser.storage.local.get) {
        // Use Promise form if available
        const maybePromise = browser.storage.local.get({ selectedTextPlacement: 'below', useApTitleCase: false });
        if (maybePromise && typeof maybePromise.then === 'function') {
          maybePromise.then((result) => {
            const opts = {
              selectedTextPlacement: result.selectedTextPlacement || 'below',
              useApTitleCase: result.useApTitleCase || false
            };
            try { localStorage.setItem('ttlcOptions', JSON.stringify(opts)); } catch (e) { }
            resolve(opts);
          }).catch(() => resolve({ selectedTextPlacement: 'below', useApTitleCase: false }));
          return;
        }
      }
    } catch (e) {
      // ignore migration errors
    }

    // Default options
    resolve({ selectedTextPlacement: 'below', useApTitleCase: false });
  });
}

/**
 * Save options to storage
 * @param {Object} options - Options to save
 * @returns {Promise<void>}
 */
function saveOptions(options) {
  return new Promise((resolve) => {
    try {
      localStorage.setItem('ttlcOptions', JSON.stringify(options));
    } catch (e) {
      // ignore write errors
    }
    resolve();
  });
}
