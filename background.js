/**
 * Title-Link Copy - Background Script
 * © John Navas 2025, All Rights Reserved
 */

function initializeContextMenus() {
  browser.contextMenus.removeAll();

  browser.contextMenus.create({
    id: "ttlc-main-menu",
    title: "Title-Link Copy",
    contexts: ["page", "selection", "link"],
    documentUrlPatterns: ["<all_urls>"]
  });

  // Page menu items - correct (page + selection)
  browser.contextMenus.create({
    id: "ttlc-page-title-link",
    parentId: "ttlc-main-menu",
    title: "📄 Page Title + URL",
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

  // LINK MENU ITEMS
  browser.contextMenus.create({
    id: "ttlc-link-text-url",
    parentId: "ttlc-main-menu",
    title: "🔗 Link Text + URL",
    contexts: ["link"]
  });
  browser.contextMenus.create({
    id: "ttlc-link-text-only",
    parentId: "ttlc-main-menu",
    title: "🔗 Link Text only",
    contexts: ["link"]
  });
  browser.contextMenus.create({
    id: "ttlc-link-url-only",
    parentId: "ttlc-main-menu",
    title: "🔗 Link URL only",
    contexts: ["link"]
  });

  // Unified Hyperlink menu item
  browser.contextMenus.create({
    id: "ttlc-universal-hyperlink",
    parentId: "ttlc-main-menu",
    title: "🌐 Hyperlink",
    contexts: ["page", "selection", "link"]
  });

  browser.contextMenus.create({
    id: "ttlc-separator",
    type: "separator",
    parentId: "ttlc-main-menu",
    contexts: ["page", "selection", "link"]
  });

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
    // Priority: User selection -> Link Text -> Page Title
    let selectedText = info.selectionText || '';

    // If info.linkUrl exists, the user right-clicked a link. 
    // This applies to explicit link commands OR the generic hyperlink command.
    const isLinkAction = !!info.linkUrl;

    if (isLinkAction) {
      // User clicked a link
      title = info.linkText || info.selectionText || 'Link'; // Fallback logic
      url = info.linkUrl;
    } else {
      // User clicked the page background or generic selection
      title = tab.title;
      url = tab.url;
    }

    switch (info.menuItemId) {
      case 'ttlc-page-title-link':
      case 'ttlc-link-text-url':
        copyToClipboard(formatCopyText({ title, url, selectedText }, options));
        break;
      case 'ttlc-page-title-only':
      case 'ttlc-link-text-only':
        copyToClipboard(formatCopyText({ title, selectedText }, options));
        break;
      case 'ttlc-page-link-only':
      case 'ttlc-link-url-only':
        copyToClipboard(formatCopyText({ url }, options));
        break;
      case 'ttlc-universal-hyperlink': {
        let linkTitle = title;
        if (options.useApTitleCase) {
          linkTitle = apStyleTitleCase(linkTitle);
        }

        let html = `<a href="${url}">${linkTitle}</a>`;
        let plain = `${linkTitle}\n${url}`;

        // Handle selected text placement
        if (selectedText && options.selectedTextPlacement !== 'none') {
          if (options.selectedTextPlacement === 'above') {
            html = `${escapeHtml(selectedText)}<br><a href="${url}">${linkTitle}</a>`;
            plain = `${selectedText}\n${linkTitle}\n${url}`;
          } else {
            html = `<a href="${url}">${linkTitle}</a><br>${escapeHtml(selectedText)}`;
            plain = `${linkTitle}\n${url}\n${selectedText}`;
          }
        }

        copyAsHyperlink(html, plain);
        return;
      }
    }

    console.log('Title-Link Copy: Copied via context menu');
  }).catch(console.error);
});

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    browser.tabs.create({ url: 'options.html' });
  }
  initializeContextMenus();
});

initializeContextMenus();

browser.commands.onCommand.addListener(async (command) => {
  const tab = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab[0]) return;

  const options = await getOptions();

  switch (command) {
    case 'copy-title-link':
      const titleLinkText = formatCopyText({
        title: tab[0].title,
        url: tab[0].url
      }, options);
      copyToClipboard(titleLinkText);
      console.log('Title-Link Copy (shortcut): Title + Link copied');
      break;

    case 'copy-title-only':
      const titleOnlyText = formatCopyText({
        title: tab[0].title
      }, options);
      copyToClipboard(titleOnlyText);
      console.log('Title-Link Copy (shortcut): Title copied');
      break;

    case 'copy-link-only':
      copyToClipboard(tab[0].url);
      console.log('Title-Link Copy (shortcut): Link copied');
      break;

    case 'copy-hyperlink': {
      const results = await browser.tabs.executeScript(tab[0].id, {
        code: 'window.getSelection().toString().trim()'
      });
      const selectedText = results[0] || '';

      let title = tab[0].title;
      if (options.useApTitleCase) {
        title = apStyleTitleCase(title);
      }

      let html = `<a href="${tab[0].url}">${title}</a>`;
      let plain = `${title}\n${tab[0].url}`;

      if (selectedText && options.selectedTextPlacement !== 'none') {
        if (options.selectedTextPlacement === 'above') {
          html = `${escapeHtml(selectedText)}<br><a href="${tab[0].url}">${title}</a>`;
          plain = `${selectedText}\n${title}\n${tab[0].url}`;
        } else {
          html = `<a href="${tab[0].url}">${title}</a><br>${escapeHtml(selectedText)}`;
          plain = `${title}\n${tab[0].url}\n${selectedText}`;
        }
      }

      copyAsHyperlink(html, plain);
      console.log('Title-Link Copy (shortcut): Hyperlink copied');
      break;
    }
  }
});