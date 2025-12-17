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

  // Generic Item 1: Title + Link
  browser.contextMenus.create({
    id: "ttlc-action-title-url",
    parentId: "ttlc-main-menu",
    title: "📝 Title + Link",
    contexts: ["page", "selection", "link"]
  });

  // Generic Item 2: Title Only
  browser.contextMenus.create({
    id: "ttlc-action-title-only",
    parentId: "ttlc-main-menu",
    title: "📋 Title only",
    contexts: ["page", "selection", "link"]
  });

  // Generic Item 3: Link Only
  browser.contextMenus.create({
    id: "ttlc-action-url-only",
    parentId: "ttlc-main-menu",
    title: "🔗 Link only",
    contexts: ["page", "selection", "link"]
  });

  // Generic Item 4: Hyperlink
  browser.contextMenus.create({
    id: "ttlc-action-hyperlink",
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

    // Smart Detection: Did we click a Link?
    const isLinkAction = !!info.linkUrl;

    if (isLinkAction) {
      // Context: Link
      title = info.linkText || info.selectionText || 'Link';
      url = info.linkUrl;
    } else {
      // Context: Page Background
      title = tab.title;
      url = tab.url;
    }

    switch (info.menuItemId) {
      case 'ttlc-action-title-url':
        copyToClipboard(formatCopyText({ title, url, selectedText }, options));
        break;

      case 'ttlc-action-title-only':
        copyToClipboard(formatCopyText({ title, selectedText }, options));
        break;

      case 'ttlc-action-url-only':
        copyToClipboard(formatCopyText({ url, selectedText }, options));
        break;

      case 'ttlc-action-hyperlink': {
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
        break;
      }
    }
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
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab) return;

  const options = await getOptions();

  // Get selection from the page for keyboard shortcuts
  const results = await browser.tabs.executeScript(tab.id, {
    code: 'window.getSelection().toString().trim()'
  });
  const selectedText = results[0] || '';

  switch (command) {
    case 'copy-title-link':
      const titleLinkText = formatCopyText({
        title: tab.title,
        url: tab.url,
        selectedText
      }, options);
      copyToClipboard(titleLinkText);
      break;

    case 'copy-title-only':
      const titleOnlyText = formatCopyText({
        title: tab.title,
        selectedText
      }, options);
      copyToClipboard(titleOnlyText);
      break;

    case 'copy-link-only':
      const linkOnlyText = formatCopyText({
        url: tab.url,
        selectedText
      }, options);
      copyToClipboard(linkOnlyText);
      break;

    case 'copy-hyperlink': {
      let title = tab.title;
      if (options.useApTitleCase) {
        title = apStyleTitleCase(title);
      }

      let html = `<a href="${tab.url}">${title}</a>`;
      let plain = `${title}\n${tab.url}`;

      if (selectedText && options.selectedTextPlacement !== 'none') {
        if (options.selectedTextPlacement === 'above') {
          html = `${escapeHtml(selectedText)}<br><a href="${tab.url}">${title}</a>`;
          plain = `${selectedText}\n${title}\n${tab.url}`;
        } else {
          html = `<a href="${tab.url}">${title}</a><br>${escapeHtml(selectedText)}`;
          plain = `${title}\n${tab.url}\n${selectedText}`;
        }
      }

      copyAsHyperlink(html, plain);
      break;
    }
  }
});