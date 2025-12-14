/**
 * Title-Link Copy - Popup Script
 * Handles popup UI interactions + embedded options for Android
 * © John Navas 2025, All Rights Reserved
 */

// Updated to include autoClose parameter
function showStatus(message, duration = 2000, autoClose = false) {
  const statusEl = document.getElementById('status-message');
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.add('show');

  setTimeout(() => {
    statusEl.classList.remove('show');
    if (autoClose) {
      window.close();
    }
  }, duration);
}

document.addEventListener('DOMContentLoaded', async () => {
  // Simplified handlers - no redundant element checks
  const handlers = {
    async 'copy-title-link'() {
      const tab = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab[0]) return;

      const options = await getOptions();
      const title = tab[0].title;
      const url = tab[0].url;

      const results = await browser.tabs.executeScript(tab[0].id, {
        code: 'window.getSelection().toString()'
      });
      const selectedText = results[0] || '';

      const copyText = formatCopyText({ title, url, selectedText }, options);
      try {
        await copyToClipboard(copyText);
        // Show success and close after 1.2 seconds
        showStatus('✓ Title + Link copied!', 1200, true);
      } catch (err) {
        showStatus('✗ Failed to copy');
        console.error(err);
      }
    },

    async 'copy-title-only'() {
      const tab = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab[0]) return;

      const options = await getOptions();
      const title = tab[0].title;

      const results = await browser.tabs.executeScript(tab[0].id, {
        code: 'window.getSelection().toString()'
      });
      const selectedText = results[0] || '';

      const copyText = formatCopyText({ title, selectedText }, options);
      try {
        await copyToClipboard(copyText);
        showStatus('✓ Title copied!', 1200, true);
      } catch (err) {
        showStatus('✗ Failed to copy');
        console.error(err);
      }
    },

    async 'copy-link-only'() {
      const tab = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab[0]) return;

      try {
        await copyToClipboard(tab[0].url);
        showStatus('✓ Link copied!', 1200, true);
      } catch (err) {
        showStatus('✗ Failed to copy');
        console.error(err);
      }
    },

    async 'copy-hyperlink'() {
      const tab = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab[0]) return;

      const options = await getOptions();
      const results = await browser.tabs.executeScript(tab[0].id, {
        code: 'window.getSelection().toString().trim()'
      });
      const selectedText = results[0] || '';

      let title = tab[0].title;
      const url = tab[0].url;

      if (options.useApTitleCase) {
        title = apStyleTitleCase(title);
      }

      let html = `<a href="${url}">${title}</a>`;
      let plain = `${title}\n${url}`;

      if (selectedText && options.selectedTextPlacement !== 'none') {
        if (options.selectedTextPlacement === 'above') {
          html = `${escapeHtml(selectedText)}<br><a href="${url}">${title}</a>`;
          plain = `${selectedText}\n${title}\n${url}`;
        } else {
          html = `<a href="${url}">${title}</a><br>${escapeHtml(selectedText)}`;
          plain = `${title}\n${url}\n${selectedText}`;
        }
      }

      try {
        await copyAsHyperlink(html, plain);
        showStatus('✓ Hyperlink copied!', 1200, true);
      } catch (err) {
        showStatus('✗ Failed to copy');
        console.error(err);
      }
    }
  };

  // Attach handlers safely (already verified elements exist)
  Object.entries(handlers).forEach(([id, handler]) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('click', handler);
    }
  });
});