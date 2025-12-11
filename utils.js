/**
 * Title-Link Copy - Utility Module
 * Utility functions for text processing, title formatting, and clipboard operations
 * Supports both desktop and Android
 * © John Navas 2025, All Rights Reserved
 */

// Common articles, conjunctions, prepositions ≤3 letters
const minorWords = new Set([
  "a", "an", "the",       // articles
  "and", "but", "for", "nor", "or", "so", "yet", // conjunctions
  "as", "at", "by", "in", "of", "off", "on", "per", "to", "up", "via" // prepositions
]);

/**
 * Checks if a word is all uppercase (ignores non-letters).
 */
function isAllUpperCase(word) {
  const letters = word.match(/\p{L}+/gu);
  if (!letters) return false;
  return letters.join('') === letters.join('').toUpperCase();
}

/**
 * Splits a word into base part and possessive suffix ('s or ’s, if any).
 */
function splitBaseAndSuffix(word) {
  const match = word.match(/^([\p{L}\d]+)(['’]s)$/u); // Fixed: handle straight & curly apostrophes
  if (match) {
    return { base: match[1], suffix: match[2] };
  }
  return { base: word, suffix: '' };
}

/**
 * Checks if the word has internal capitals, e.g. "iPhone" or "McDonald's".
 */
function hasInternalCapitals(str) {
  return /\p{Lu}/u.test(str.slice(1));
}

/**
 * Parses the input text into words and separators.
 * Handles curly and straight apostrophes in contractions and possessives.
 */
function parseText(text) {
  const wordRegex = /(?:\d+\p{L}+|[\p{L}]+(?:['’][\p{L}]+)?|\d+)/gu; // Fixed: curly + straight
  const words = text.match(wordRegex) || [];
  const separators = text.split(wordRegex);
  return { words, separators };
}

/**
 * Reassembles text from words and separators.
 */
function reassembleText({ words, separators }) {
  let result = '';
  const maxLen = Math.max(words.length, separators.length);
  for (let i = 0; i < maxLen; i++) {
    if (separators[i] !== undefined) result += separators[i];
    if (words[i] !== undefined) result += words[i];
  }
  return result;
}

/**
 * Converts text to AP-style title case.
 * Follows common headline capitalization rules similar to Associated Press style:
 * - Capitalizes first and last words regardless of length.
 * - Capitalizes all words of four or more letters.
 * - Lowercases short conjunctions, prepositions, and articles (≤3 letters).
 * - Preserves acronyms (ALL CAPS) and internal capitals in brands (e.g. iPhone).
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

    if (isAllUpperCase(base)) {
      result.push(base + suffix.toLowerCase());
      continue;
    }

    if (hasInternalCapitals(base)) {
      result.push(base + suffix);
      continue;
    }

    if (/^\d/.test(base)) {
      result.push(base + suffix);
      continue;
    }

    const lowerBase = base.toLowerCase();
    const lowerSuffix = suffix.toLowerCase();

    if (i === 0 || i === len - 1) {
      result.push(lowerBase.charAt(0).toUpperCase() + lowerBase.slice(1) + lowerSuffix);
      continue;
    }

    if (lowerBase === "to" && i + 1 < len) {
      result.push("To");
      continue;
    }

    if (base.length >= 4) {
      result.push(lowerBase.charAt(0).toUpperCase() + lowerBase.slice(1) + lowerSuffix);
      continue;
    }

    if (minorWords.has(lowerBase)) {
      result.push(lowerBase + lowerSuffix);
      continue;
    }

    result.push(lowerBase.charAt(0).toUpperCase() + lowerBase.slice(1) + lowerSuffix);
  }

  return reassembleText({ words: result, separators: parsed.separators });
}

/**
 * Escape HTML special characters for safe clipboard copying.
 */
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m =>
    ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]
  );
}

/**
 * Formats the copied text lines (e.g., title, link, selection).
 */
function formatCopyText(items, options) {
  const lines = [];

  if (items.title) {
    let title = items.title;
    if (options.useApTitleCase) {
      title = apStyleTitleCase(title);
    }
    lines.push(title);
  }

  if (items.selectedText && options.selectedTextPlacement === 'above') {
    lines.push(items.selectedText);
  }

  if (items.url) {
    lines.push(items.url);
  }

  if (items.selectedText && options.selectedTextPlacement === 'below') {
    lines.push(items.selectedText);
  }

  return lines.join('\n');
}

/**
 * Fallback copy using a hidden textarea.
 */
function fallbackCopy(text) {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined' || !document.body) {
      return reject(new Error('No DOM available for fallback copy'));
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);

    try {
      textArea.focus();
      textArea.select();
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
 * Copies plain text to clipboard using the most compatible API available.
 */
function copyToClipboard(text) {
  if (typeof browser !== 'undefined' && browser.clipboard && browser.clipboard.setString) {
    return browser.clipboard.setString(text).catch(err => {
      console.warn('browser.clipboard failed:', err);
      return Promise.resolve(); // Don't fallback to DOM in background
    });
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof window !== 'undefined' && window.isSecureContext) {
    return navigator.clipboard.writeText(text).catch(err => {
      console.warn('Clipboard API failed:', err);
      return fallbackCopy(text);
    });
  }

  return fallbackCopy(text);
}

/**
 * Copies as both HTML and plain text hyperlink (when supported).
 */
async function copyAsHyperlink(html, plain) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.ClipboardItem) {
    try {
      const item = new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plain], { type: "text/plain" })
      });
      await navigator.clipboard.write([item]);
      return;
    } catch (e) {
      console.warn('HTML clipboard copy failed, using fallback', e);
    }
  }
  await copyToClipboard(plain);
}

/**
 * Loads user options from browser.storage or localStorage.
 */
function getOptions() {
  const defaults = { selectedTextPlacement: 'below', useApTitleCase: false };

  if (typeof browser !== 'undefined' && browser.storage && browser.storage.local && browser.storage.local.get) {
    return browser.storage.local.get(defaults).then(result => {
      const opts = {
        selectedTextPlacement: result.selectedTextPlacement || 'below',
        useApTitleCase: !!result.useApTitleCase
      };

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('ttlcOptions', JSON.stringify(opts));
        }
      } catch (e) { }

      return opts;
    }).catch(() => defaults);
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem('ttlcOptions');
      if (raw) {
        const parsed = JSON.parse(raw);
        return Promise.resolve({
          selectedTextPlacement: parsed.selectedTextPlacement || 'below',
          useApTitleCase: !!parsed.useApTitleCase
        });
      }
    } catch (e) { }
  }

  return Promise.resolve(defaults);
}

/**
 * Saves user options to browser.storage or localStorage.
 */
function saveOptions(options) {
  const opts = {
    selectedTextPlacement: options.selectedTextPlacement || 'below',
    useApTitleCase: !!options.useApTitleCase
  };

  const promises = [];

  if (typeof browser !== 'undefined' && browser.storage && browser.storage.local && browser.storage.local.set) {
    promises.push(browser.storage.local.set(opts));
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('ttlcOptions', JSON.stringify(opts));
    } catch (e) { }
  }

  return Promise.all(promises).then(() => { });
}
