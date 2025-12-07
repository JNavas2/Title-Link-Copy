/**
 * Title-Link Copy - Background Script (FINAL: Full Selection + Link Support)
 * © John Navas 2025, All Rights Reserved
 */

function initializeContextMenus() {
  browser.contextMenus.removeAll();

  // MAIN MENU - appears on page, selection, OR links
  browser.contextMenus.create({
    id: "ttlc-main-menu",
    title: "Title-Link Copy",
    contexts: ["page", "selection", "link"],
    documentUrlPatterns: ["<all_urls>"]
  });

  // PAGE ACTIONS (right-click page background OR selected text)
  browser.contextMenus.create({
    id: "ttlc-page-title-link",
    parentId: "ttlc-main-menu",
    title: "📄 Title + Page URL",
    contexts: ["page", "selection"]
  });
  browser.contextMenus.create({
    id: "ttlc-page-title-only",
    parentId: "ttlc-main-menu",
    title: "📄 Page Title only",
    contexts: ["page", "selection"]
  });
  browser.contextMenus.create({
    id: "ttlc-page-link-only",
    parentId: "ttlc-main-menu",
    title: "🔗 Page URL only",
    contexts: ["page", "selection"]
  });

  // LINK ACTIONS (right-click links + selection support)
  browser.contextMenus.create({
    id: "ttlc-link-text-url",
    parentId: "ttlc-main-menu",
    title: "🔗 Link Text + URL",
    contexts: ["link", "selection"]
  });
  browser.contextMenus.create({
    id: "ttlc-link-text-only",
    parentId: "ttlc-main-menu",
    title: "🔗 Link Text only",
    contexts: ["link", "selection"]
  });
  browser.contextMenus.create({
    id: "ttlc-link-url-only",
    parentId: "ttlc-main-menu",
    title: "🔗 Link URL only",
    contexts: ["link", "selection"]
  });

  // SEPARATOR
  browser.contextMenus.create({
    id: "ttlc-separator",
    type: "separator",
    parentId: "ttlc-main-menu",
    contexts: ["page", "selection", "link"]
  });

  // OPTIONS (all contexts)
  browser.contextMenus.create({
    id: "ttlc-options",
    parentId: "ttlc-main-menu",
    title: "⚙️ Options...",
    contexts: ["all"]
  });
}

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'ttlc-options') {
    browser.runtime.openOptionsPage();
    return;
  }

  getOptions().then((options) => {
    let title = '';
    let url = '';
    let selectedText = info.selectionText || '';  // ALWAYS capture selection

    // PAGE MENU ITEMS (page/selection context) - use tab info
    if (info.menuItemId.startsWith('ttlc-page-')) {
      title = tab.title;
      url = tab.url;
    }
    // LINK MENU ITEMS (link/selection context) - use link info OR fallback to tab
    else if (info.menuItemId.startsWith('ttlc-link-')) {
      if (info.linkUrl) {
        // Actual link clicked
        title = info.linkText || 'Link';
        url = info.linkUrl;
      } else {
        // Selection context on non-link (fallback to page)
        title = tab.title;
        url = tab.url;
      }
    } else {
      return;
    }

    // Format based on menu item + options
    let copyText = '';
    switch (info.menuItemId) {
      case 'ttlc-page-title-link':
      case 'ttlc-link-text-url':
        copyText = formatCopyText({ title, url, selectedText }, options);
        break;
      case 'ttlc-page-title-only':
      case 'ttlc-link-text-only':
        copyText = formatCopyText({ title, selectedText }, options);
        break;
      case 'ttlc-page-link-only':
      case 'ttlc-link-url-only':
        copyText = formatCopyText({ url }, options);
        break;
      default:
        return;
    }

    copyToClipboard(copyText).then(() => {
      console.log('Title-Link Copy: Copied:', copyText);
    }).catch((err) => {
      console.error('Failed to copy:', err);
    });
  });
});

// Initialize on extension install/update
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    browser.tabs.create({ url: 'options.html' });
  }
  initializeContextMenus();
});

// Initialize menus on startup
initializeContextMenus();

// Keyboard shortcuts (popup-style - no selection)
browser.commands.onCommand.addListener(async (command) => {
  const tab = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab[0]) return;

  const options = await getOptions();
  let copyText = '';

  switch (command) {
    case 'copy-title-link':
      copyText = formatCopyText({ title: tab[0].title, url: tab[0].url }, options);
      break;
    case 'copy-title-only':
      copyText = formatCopyText({ title: tab[0].title }, options);
      break;
    case 'copy-link-only':
      copyText = formatCopyText({ url: tab[0].url }, options);
      break;
  }

  if (copyText) {
    try {
      await copyToClipboard(copyText);
      console.log('Title-Link Copy (keyboard): Copied:', copyText);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
});
