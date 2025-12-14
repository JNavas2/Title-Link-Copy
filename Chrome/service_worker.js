/**
 * Title-Link Copy - Background Service Worker (MV3 Chrome Version)
 * © John Navas 2025, All Rights Reserved
 */

// Import utility functions (apStyleTitleCase, getOptions, etc.)
importScripts('utils.js');

const browser = chrome;

function initializeContextMenus() {
  browser.contextMenus.removeAll();

  browser.contextMenus.create({
    id: "ttlc-main-menu",
    title: "Title-Link Copy",
    contexts: ["page", "selection", "link"]
  });

  browser.contextMenus.create({ id: "ttlc-action-title-url", parentId: "ttlc-main-menu", title: "📝 Title + URL", contexts: ["page", "selection", "link"] });
  browser.contextMenus.create({ id: "ttlc-action-title-only", parentId: "ttlc-main-menu", title: "📋 Title only", contexts: ["page", "selection", "link"] });
  browser.contextMenus.create({ id: "ttlc-action-url-only", parentId: "ttlc-main-menu", title: "🔗 URL only", contexts: ["page", "selection", "link"] });
  browser.contextMenus.create({ id: "ttlc-action-hyperlink", parentId: "ttlc-main-menu", title: "🌐 Hyperlink", contexts: ["page", "selection", "link"] });
  browser.contextMenus.create({ id: "ttlc-separator", type: "separator", parentId: "ttlc-main-menu", contexts: ["page", "selection", "link"] });
  browser.contextMenus.create({ id: "ttlc-options", parentId: "ttlc-main-menu", title: "⚙️ Options...", contexts: ["all"] });
}

// Helper: Get selected text from the page
async function getSelectedText(tabId) {
  try {
    const results = await browser.scripting.executeScript({
      target: { tabId: tabId },
      func: () => window.getSelection().toString().trim(),
      world: "ISOLATED"
    });
    return results && results[0] && results[0].result || '';
  } catch (error) {
    console.error("Error getting selection:", error);
    return '';
  }
}

// Helper: Inject a script to write text to the clipboard
async function injectClipboardWrite(tabId, plainText, htmlText) {
  try {
    await browser.scripting.executeScript({
      target: { tabId: tabId },
      args: [plainText, htmlText],
      world: "ISOLATED",
      func: (plain, html) => {
        // Internal helper for fallback copy inside the content script
        const fallbackCopy = (text) => {
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
            document.execCommand('copy');
          } catch (err) {
            console.error('Fallback copy failed', err);
          } finally {
            document.body.removeChild(textArea);
          }
        };

        // 1. Try Clipboard API with HTML (if provided)
        if (html && navigator.clipboard && window.ClipboardItem) {
          try {
            const item = new ClipboardItem({
              "text/html": new Blob([html], { type: "text/html" }),
              "text/plain": new Blob([plain], { type: "text/plain" })
            });
            navigator.clipboard.write([item]);
            return;
          } catch (e) {
            console.warn('HTML copy failed, falling back to plain', e);
          }
        }

        // 2. Try Clipboard API Plain Text
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(plain).catch(() => fallbackCopy(plain));
        } else {
          // 3. Fallback
          fallbackCopy(plain);
        }
      }
    });
  } catch (error) {
    console.error("Failed to inject clipboard script:", error);
  }
}

// Logic: Determine items and perform formatting
async function handleAction(tab, command, info = {}) {
  const tabId = tab.id;
  if (!tabId) return;

  // 1. Gather Data
  let title = '';
  let url = '';
  let selectedText = info.selectionText || '';

  // Smart Detection: Did we click a Link?
  if (info.linkUrl) {
    title = info.linkText || info.selectionText || 'Link';
    url = info.linkUrl;
  } else {
    // Page Context
    title = tab.title;
    url = tab.url;
    // For page context/commands, get accurate selection
    if (!selectedText) {
      selectedText = await getSelectedText(tabId);
    }
  }

  // 2. Load Options
  const options = await getOptions(); // from utils.js (imported in SW)

  const items = { title, url, selectedText };
  let plainResult = '';
  let htmlResult = null;

  // 3. Process Formatting (Logic moved to SW to avoid injection bugs)
  switch (command) {
    case 'title-url':
      plainResult = formatCopyText(items, options);
      break;
    case 'title-only':
      items.url = undefined;
      plainResult = formatCopyText(items, options);
      break;
    case 'url-only':
      items.title = undefined;
      plainResult = formatCopyText(items, options);
      break;
    case 'hyperlink': {
      let linkTitle = items.title;
      if (options.useApTitleCase) {
        linkTitle = apStyleTitleCase(linkTitle);
      }

      let html = `<a href="${items.url}">${linkTitle}</a>`;
      let plain = `${linkTitle}\n${items.url}`;

      if (items.selectedText && options.selectedTextPlacement !== 'none') {
        if (options.selectedTextPlacement === 'above') {
          html = `${escapeHtml(items.selectedText)}<br><a href="${items.url}">${linkTitle}</a>`;
          plain = `${items.selectedText}\n${linkTitle}\n${items.url}`;
        } else {
          html = `<a href="${items.url}">${linkTitle}</a><br>${escapeHtml(items.selectedText)}`;
          plain = `${linkTitle}\n${items.url}\n${items.selectedText}`;
        }
      }
      htmlResult = html;
      plainResult = plain;
      break;
    }
  }

  // 4. Inject Result into Page
  await injectClipboardWrite(tabId, plainResult, htmlResult);
}

// --- Listeners ---

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'ttlc-options') {
    browser.runtime.openOptionsPage();
    return;
  }

  let command;
  switch (info.menuItemId) {
    case 'ttlc-action-title-url': command = 'title-url'; break;
    case 'ttlc-action-title-only': command = 'title-only'; break;
    case 'ttlc-action-url-only': command = 'url-only'; break;
    case 'ttlc-action-hyperlink': command = 'hyperlink'; break;
    default: return;
  }

  handleAction(tab, command, info);
});

browser.commands.onCommand.addListener(async (command) => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab) return;

  let internalCommand;
  switch (command) {
    case 'copy-title-link': internalCommand = 'title-url'; break;
    case 'copy-title-only': internalCommand = 'title-only'; break;
    case 'copy-link-only': internalCommand = 'url-only'; break;
    case 'copy-hyperlink': internalCommand = 'hyperlink'; break;
    default: return;
  }

  handleAction(tab, internalCommand);
});

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    browser.tabs.create({ url: 'options.html' });
  }
  initializeContextMenus();
});

initializeContextMenus();