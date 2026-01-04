/**
 * Title-Link Copy - Background Service Worker (MV3 Chrome Version)
 * © John Navas 2025, All Rights Reserved
 */

importScripts('utils.js');

const browser = chrome;

// GATEKEEPER: Ensures permissions exist before running actions
async function checkAccessAndRun(tab, actionFn) {
  const hasAccess = await browser.permissions.contains({ origins: ["<all_urls>"] });
  if (!hasAccess) {
    browser.tabs.create({ url: browser.runtime.getURL("request.html") });
    return;
  }
  await actionFn();
}

/**
 * FIXED: Gathers selection FIRST so it can be used by ALL commands
 */
async function handleAction(tab, command, info = null) {
  const options = await getOptions();
  let items = { title: tab.title, url: tab.url, selectedText: null };

  // 1. Handle Link Context (right-click on a specific link)
  if (info && info.linkUrl) {
    items.url = info.linkUrl;
    items.title = info.selectionText || info.linkUrl;
  }

  // 2. GATHER SELECTION FIRST: Required for all commands if enabled
  if (options.selectedTextPlacement !== 'none') {
    try {
      const selection = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
      });
      if (selection[0] && selection[0].result) {
        items.selectedText = selection[0].result;
      }
    } catch (e) {
      console.warn("Could not read selection (likely a protected browser page)");
    }
  }

  // 3. COMMAND-SPECIFIC LOGIC

  // TITLE ONLY (Includes selection per placement)
  if (command === 'title-only') {
    let title = items.title;
    if (options.useApTitleCase) title = apStyleTitleCase(title);

    let output = title;
    if (items.selectedText) {
      output = (options.selectedTextPlacement === 'above')
        ? `${items.selectedText}\n${title}`
        : `${title}\n${items.selectedText}`;
    }

    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => { navigator.clipboard.writeText(text); },
      args: [output]
    });
    return;
  }

  // LINK ONLY (Includes selection per placement)
  if (command === 'url-only') {
    let output = items.url;
    if (items.selectedText) {
      output = (options.selectedTextPlacement === 'above')
        ? `${items.selectedText}\n${items.url}`
        : `${items.url}\n${items.selectedText}`;
    }

    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => { navigator.clipboard.writeText(text); },
      args: [output]
    });
    return;
  }

  // HYPERLINK (Rich Text)
  if (command === 'hyperlink') {
    let title = items.title;
    if (options.useApTitleCase) title = apStyleTitleCase(title);

    const escapedUrl = escapeHtml(items.url);
    const escapedTitle = escapeHtml(title);
    const linkTag = `<a href="${escapedUrl}">${escapedTitle}</a>`;

    let htmlContent = linkTag;
    if (items.selectedText) {
      const escapedSelection = escapeHtml(items.selectedText).replace(/\n/g, '<br>');
      if (options.selectedTextPlacement === 'above') {
        htmlContent = `${escapedSelection}<br>${linkTag}`;
      } else if (options.selectedTextPlacement === 'below') {
        htmlContent = `${linkTag}<br>${escapedSelection}`;
      }
    }

    const plainText = formatCopyText(items, options);

    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: (h, p) => {
        const item = new ClipboardItem({
          "text/html": new Blob([h], { type: "text/html" }),
          "text/plain": new Blob([p], { type: "text/plain" })
        });
        navigator.clipboard.write([item]);
      },
      args: [htmlContent, plainText]
    });
    return;
  }

  // DEFAULT: Title + Link command
  const plainText = formatCopyText(items, options);
  await browser.scripting.executeScript({
    target: { tabId: tab.id },
    func: (text) => { navigator.clipboard.writeText(text); },
    args: [plainText]
  });
}

function initializeContextMenus() {
  browser.contextMenus.removeAll();
  browser.contextMenus.create({ id: "ttlc-main-menu", title: "Title-Link Copy", contexts: ["page", "selection", "link"] });
  browser.contextMenus.create({ id: "ttlc-action-title-url", parentId: "ttlc-main-menu", title: "📝 Title + Link", contexts: ["page", "selection", "link"] });
  browser.contextMenus.create({ id: "ttlc-action-title-only", parentId: "ttlc-main-menu", title: "📋 Title only", contexts: ["page", "selection", "link"] });
  browser.contextMenus.create({ id: "ttlc-action-url-only", parentId: "ttlc-main-menu", title: "🔗 Link only", contexts: ["page", "selection", "link"] });
  browser.contextMenus.create({ id: "ttlc-action-hyperlink", parentId: "ttlc-main-menu", title: "🌐 Hyperlink", contexts: ["page", "selection", "link"] });
  browser.contextMenus.create({ id: "ttlc-separator", type: "separator", parentId: "ttlc-main-menu", contexts: ["page", "selection", "link"] });
  browser.contextMenus.create({ id: "ttlc-options", parentId: "ttlc-main-menu", title: "⚙️ Options...", contexts: ["all"] });
}

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'ttlc-options') { browser.runtime.openOptionsPage(); return; }
  let command;
  switch (info.menuItemId) {
    case 'ttlc-action-title-url': command = 'title-url'; break;
    case 'ttlc-action-title-only': command = 'title-only'; break;
    case 'ttlc-action-url-only': command = 'url-only'; break;
    case 'ttlc-action-hyperlink': command = 'hyperlink'; break;
    default: return;
  }
  checkAccessAndRun(tab, () => handleAction(tab, command, info));
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
  checkAccessAndRun(tab, () => handleAction(tab, internalCommand));
});

browser.runtime.onInstalled.addListener((details) => {
  // Logic opens options for both fresh installs and updates
  if (details.reason === 'install' || details.reason === 'update') {
    browser.tabs.create({ url: 'options.html' });
  }
  initializeContextMenus();
});

initializeContextMenus();