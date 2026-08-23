/**
 * Title-Link Copy - Popup Script (Android)
 * Handles mobile UI interactions + auto-save options
 * © John Navas 2025, All Rights Reserved
 */

const LOADING_ERR_MSG = '! Page not fully loaded';
const COPY_ERR_MSG = '✗ Failed to copy';
const SUCCESS_PAUSE = 1200;
const ERROR_PAUSE = 3000;
const SELECTION_SCRIPT = 'window.getSelection().toString()';

async function getActiveTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0] || null;
}

function showStatus(message, duration = 2000, autoClose = false, isError = false) {
  const statusEl = document.getElementById('status-message');
  if (!statusEl) return;
  statusEl.textContent = message;
  if (isError) {
    statusEl.style.color = '#c62828';
    statusEl.style.backgroundColor = '#ffebee';
  } else {
    statusEl.style.color = '';
    statusEl.style.backgroundColor = '';
  }
  statusEl.classList.add('show');

  setTimeout(() => {
    statusEl.classList.remove('show');
    if (autoClose) {
      window.close();
    }
  }, duration);
}

document.addEventListener('DOMContentLoaded', async () => {
  const handlers = {
    async 'copy-title-link'() {
      const tab = await getActiveTab();
      if (!tab) return;

      if (tab.status === 'loading') {
        showStatus(LOADING_ERR_MSG, ERROR_PAUSE, true, true);
        return;
      }

      const options = await getOptions();
      const title = tab.title;
      const url = tab.url;

      const results = await browser.tabs.executeScript(tab.id, {
        code: SELECTION_SCRIPT
      });
      const selectedText = results[0] || '';

      const copyText = formatCopyText({ title, url, selectedText }, options);
      try {
        await copyToClipboard(copyText);
        showStatus('✓ Title + Link copied', SUCCESS_PAUSE, true);
      } catch (err) {
        showStatus(COPY_ERR_MSG, ERROR_PAUSE, false, true);
        console.error(err);
      }
    },

    async 'copy-title-only'() {
      const tab = await getActiveTab();
      if (!tab) return;

      if (tab.status === 'loading') {
        showStatus(LOADING_ERR_MSG, ERROR_PAUSE, true, true);
        return;
      }

      const options = await getOptions();
      const title = tab.title;

      const results = await browser.tabs.executeScript(tab.id, {
        code: SELECTION_SCRIPT
      });
      const selectedText = results[0] || '';

      const copyText = formatCopyText({ title, selectedText }, options);
      try {
        await copyToClipboard(copyText);
        showStatus('✓ Title copied', SUCCESS_PAUSE, true);
      } catch (err) {
        showStatus(COPY_ERR_MSG, ERROR_PAUSE, false, true);
        console.error(err);
      }
    },

    async 'copy-link-only'() {
      const tab = await getActiveTab();
      if (!tab) return;

      if (tab.status === 'loading') {
        showStatus(LOADING_ERR_MSG, ERROR_PAUSE, true, true);
        return;
      }

      const options = await getOptions();
      const url = tab.url;

      const results = await browser.tabs.executeScript(tab.id, {
        code: SELECTION_SCRIPT
      });
      const selectedText = results[0] || '';

      const copyText = formatCopyText({ url, selectedText }, options);
      try {
        await copyToClipboard(copyText);
        showStatus('✓ Link copied', SUCCESS_PAUSE, true);
      } catch (err) {
        showStatus(COPY_ERR_MSG, ERROR_PAUSE, false, true);
        console.error(err);
      }
    },

    async 'copy-hyperlink'() {
      const tab = await getActiveTab();
      if (!tab) return;

      if (tab.status === 'loading') {
        showStatus(LOADING_ERR_MSG, ERROR_PAUSE, true, true);
        return;
      }

      const options = await getOptions();
      const results = await browser.tabs.executeScript(tab.id, {
        code: SELECTION_SCRIPT
      });
      const selectedText = results[0] ? results[0].trim() : '';

      let title = tab.title;
      const url = tab.url;

      if (options.useApTitleCase) {
        title = apStyleTitleCase(title);
      }

      let html = `<a href="${url}">${title}</a>`;
      let plain = `${title}\n${url}`;

      if (selectedText && options.includeSelectedText) {
        // Fix: Multi-line support and honoring placement preference
        const selHtml = escapeHtml(selectedText).replace(/\n/g, '<br>');
        if (options.placeAboveHyperlink) {
          html = `${selHtml}<br>${html}`;
          plain = `${selectedText}\n${plain}`;
        } else {
          html = `${html}<br>${selHtml}`;
          plain = `${plain}\n${selectedText}`;
        }
      }

      try {
        await copyAsHyperlink(html, plain);
        showStatus('✓ Hyperlink copied', SUCCESS_PAUSE, true);
      } catch (err) {
        showStatus(COPY_ERR_MSG, ERROR_PAUSE, false, true);
        console.error(err);
      }
    }
  };

  Object.entries(handlers).forEach(([id, handler]) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('click', handler);
    }
  });
});