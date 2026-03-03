/**
 * Title-Link Copy - Utility Module
 * Utility functions for text processing, title formatting, and clipboard operations
 * Supports both desktop and Android
 * © John Navas 2025, All Rights Reserved
 */

// Common articles, conjunctions, and prepositions ≤3 letters
const minorWords = new Set([
  "a", "an", "the", // articles
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
  // Fixed: supports both straight and curly apostrophes
  const match = word.match(/^([\p{L}\d]+)(['’]s)$/u);
  if (match) {
    return { base: match[1], suffix: match[2] };
  }
  return { base: word, suffix: '' };
}

/**
 * Checks if the word has internal capitals, e.g., "iPhone" or "McDonald's".
 */
function hasInternalCapitals(str) {
  return /\p{Lu}/u.test(str.slice(1));
}

/**
 * Parses the input text into words and separators.
 * Handles both straight and curly apostrophes in contractions and possessives.
 */
function parseText(text) {
  const wordRegex = /(?:\d+\p{L}+|[\p{L}]+(?:['’][\p{L}]+)?|\d+)/gu;
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
 * Converts text to AP-style title case (Modified for CMOS "to" treatment).
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

    // Capitalize first and last word
    if (i === 0 || i === len - 1) {
      result.push(lowerBase.charAt(0).toUpperCase() + lowerBase.slice(1) + lowerSuffix);
      continue;
    }

    // Capitalize words 4+ letters long
    if (base.length >= 4) {
      result.push(lowerBase.charAt(0).toUpperCase() + lowerBase.slice(1) + lowerSuffix);
      continue;
    }

    // Lowercase minor words <= 3 letters (including "to")
    if (minorWords.has(lowerBase)) {
      result.push(lowerBase + lowerSuffix);
      continue;
    }

    result.push(lowerBase.charAt(0).toUpperCase() + lowerBase.slice(1) + lowerSuffix);
  }

  return reassembleText({ words: result, separators: parsed.separators });
}

/**
 * Escapes HTML special characters for safe clipboard copying.
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
 * Synchronized with the checkbox boolean model.
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

  if (items.selectedText && options.includeSelectedText && options.placeAboveNormal) {
    lines.push(items.selectedText);
  }

  if (items.url) {
    lines.push(items.url);
  }

  if (items.selectedText && options.includeSelectedText && !options.placeAboveNormal) {
    lines.push(items.selectedText);
  }

  return lines.join('\n');
}

/**
 * Fallback: copies text using a hidden textarea element.
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
      successful ? resolve() : reject(new Error('execCommand copy failed'));
    } catch (err) {
      document.body.removeChild(textArea);
      reject(err);
    }
  });
}

/**
 * Copies plain text to the clipboard using the best available API.
 */
async function copyToClipboard(text) {
  if (typeof document === 'undefined') {
    console.warn('Clipboard access not available (no DOM).');
    return;
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof window !== 'undefined' && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed:', err);
    }
  }

  try {
    await fallbackCopy(text);
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }
}

/**
 * Copies both HTML and plain-text hyperlink formats when supported.
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
 * Loads user options from browser.storage.local or localStorage.
 * Includes migration logic for legacy radio-button settings.
 */
function getOptions() {
  const defaults = {
    includeSelectedText: true,
    placeAboveNormal: true,
    placeAboveHyperlink: false,
    useApTitleCase: true,
    showContextMenu: true
  };

  if (typeof browser !== 'undefined' && browser.storage && browser.storage.local && browser.storage.local.get) {
    return browser.storage.local.get(defaults).then(result => {
      const opts = Object.assign({}, defaults, result);
      // Support upgrade path from radio buttons to checkboxes
      if (result.selectedTextPlacement !== undefined) {
        opts.includeSelectedText = result.selectedTextPlacement !== 'none';
        opts.placeAboveNormal = result.selectedTextPlacement === 'above';
        opts.placeAboveHyperlink = result.selectedTextPlacement === 'above';
      }
      return opts;
    }).catch(() => defaults);
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem('ttlcOptions');
      if (raw) {
        return Promise.resolve(Object.assign({}, defaults, JSON.parse(raw)));
      }
    } catch { }
  }

  return Promise.resolve(defaults);
}

/**
 * Saves user options to browser.storage.local and localStorage.
 */
function saveOptions(options) {
  const opts = {
    includeSelectedText: !!options.includeSelectedText,
    placeAboveNormal: options.placeAboveNormal !== false,
    placeAboveHyperlink: !!options.placeAboveHyperlink,
    useApTitleCase: !!options.useApTitleCase,
    showContextMenu: options.showContextMenu !== false
  };

  const promises = [];

  if (typeof browser !== 'undefined' && browser.storage && browser.storage.local && browser.storage.local.set) {
    promises.push(browser.storage.local.set(opts));
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('ttlcOptions', JSON.stringify(opts));
    } catch { }
  }

  return Promise.all(promises).then(() => { });
}