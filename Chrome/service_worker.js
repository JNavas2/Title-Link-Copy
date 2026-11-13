/**
 * Title-Link Copy - Background Service Worker (MV3 Chrome Version)
 * Upgraded for v1.2.7: Uses activeTab + clipboardWrite & updated boolean logic
 * Includes stability patches for restricted pages and menu race conditions
 * © John Navas 2026, All Rights Reserved
 */

importScripts('utils.js');

async function handleAction(tab, command, info = null) {
  const options = await getOptions();
  let items = { title: tab.title, url: tab.url, selectedText: null };

  if (info && info.linkUrl) {
    items.url = info.linkUrl;
    const rawLinkTitle = info.selectionText || info.linkText || info.linkUrl;
    items.title = typeof rawLinkTitle === 'string' ? rawLinkTitle.trim() : rawLinkTitle;
  }

  // Safely fetch highlighted text and strictly trim phantom spaces
  if (options.includeSelectedText) {
    try {
      const selection = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
      });
      if (selection[0] && typeof selection[0].result === 'string') {
        const trimmed = selection[0].result.trim();
        if (trimmed && trimmed !== items.title) {
          items.selectedText = trimmed;
        }
      }
    } catch (e) {
      console.warn("Could not read selection (likely a protected browser page).");
    }
  }

  if (command === 'title-only') {
    items.url = null;
    const output = formatCopyText(items, options);
    await executeCopy(tab.id, output);
    return;
  }

  if (command === 'url-only') {
    items.title = null;
    const output = formatCopyText(items, options);
    await executeCopy(tab.id, output);
    return;
  }

  if (command === 'hyperlink') {
    let title = items.title || tab.title;
    if (options.useApTitleCase) title = apStyleTitleCase(title);

    const escapedUrl = escapeHtml(items.url);
    const escapedTitle = escapeHtml(title);
    let htmlContent = `<a href="${escapedUrl}">${escapedTitle}</a>`;
    let plainText = `${title}\n${items.url}`;

    if (items.selectedText && options.includeSelectedText) {
      const escapedSelection = escapeHtml(items.selectedText).replace(/\r?\n|\r/g, '<br>');
      if (options.placeAboveHyperlink) {
        htmlContent = `${escapedSelection}<br>${htmlContent}`;
        plainText = `${items.selectedText}\n${plainText}`;
      } else {
        htmlContent = `${htmlContent}<br>${escapedSelection}`;
        plainText = `${plainText}\n${items.selectedText}`;
      }
    }

    if (options.appendBlankLine) {
      plainText += '\n ';
    }

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (h, p) => {
          function fallback(str) {
            const textArea = document.createElement('textarea');
            textArea.value = str;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
          }

          if (typeof ClipboardItem !== "undefined" && navigator.clipboard && navigator.clipboard.write) {
            const item = new ClipboardItem({
              "text/html": new Blob([h], { type: "text/html" }),
              "text/plain": new Blob([p], { type: "text/plain" })
            });
            navigator.clipboard.write([item]).catch(() => fallback(p));
          } else {
            fallback(p);
          }
        },
        args: [htmlContent, plainText]
      });
    } catch (e) {
      console.warn("Clipboard injection denied on this page (likely a restricted URL).");
    }
    return;
  }

  const output = formatCopyText(items, options);
  await executeCopy(tab.id, output);
}

async function executeCopy(tabId, text) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (t) => {
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(t).catch(() => fallback(t));
        } else {
          fallback(t);
        }
        function fallback(str) {
          const textArea = document.createElement('textarea');
          textArea.value = str;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
      },
      args: [text]
    });
  } catch (err) {
    console.warn("Clipboard injection denied on this page (likely a restricted URL).");
  }
}

async function initializeContextMenus() {
  await new Promise(resolve => chrome.contextMenus.removeAll(resolve));

  const options = await getOptions();

  if (options.showContextMenu !== false) {
    const createMenu = (props) => {
      chrome.contextMenus.create(props, () => {
        if (chrome.runtime.lastError) { }
      });
    };

    createMenu({ id: "ttlc-main-menu", title: "Title-Link Copy", contexts: ["page", "selection", "link"] });
    createMenu({ id: "ttlc-action-title-url", parentId: "ttlc-main-menu", title: "📝 Title + Link", contexts: ["page", "selection", "link"] });
    createMenu({ id: "ttlc-action-title-only", parentId: "ttlc-main-menu", title: "📋 Title only", contexts: ["page", "selection", "link"] });
    createMenu({ id: "ttlc-action-url-only", parentId: "ttlc-main-menu", title: "🔗 Link only", contexts: ["page", "selection", "link"] });
    createMenu({ id: "ttlc-action-hyperlink", parentId: "ttlc-main-menu", title: "🌐 Hyperlink", contexts: ["page", "selection", "link"] });
    createMenu({ id: "ttlc-separator", type: "separator", parentId: "ttlc-main-menu", contexts: ["page", "selection", "link"] });
    createMenu({ id: "ttlc-options", parentId: "ttlc-main-menu", title: "⚙️ Options...", contexts: ["all"] });
  }
}

function configurePlatformPopup() {
  chrome.runtime.getPlatformInfo((info) => {
    if (info && info.os === 'android') {
      chrome.action.setPopup({ popup: 'popup.html' });
    }
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'ttlc-options') { chrome.runtime.openOptionsPage(); return; }
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

chrome.commands.onCommand.addListener(async (command) => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'trigger-action' && message.command) {
    chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      const tab = tabs[0];
      if (tab) {
        handleAction(tab, message.command);
      }
    });
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    chrome.tabs.create({ url: 'options.html' });
  }
  initializeContextMenus();
  configurePlatformPopup();
});

chrome.runtime.onStartup.addListener(() => {
  configurePlatformPopup();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.showContextMenu) {
    initializeContextMenus();
  }
});

configurePlatformPopup();