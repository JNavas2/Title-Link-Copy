/**
 * Title-Link Copy - Popup Script (Android)
 * Handles mobile UI interactions + auto-save options
 * © John Navas 2026, All Rights Reserved
 */

/**
 * Displays a toast message overlay and handles optional auto-closure[cite: 7, 8].
 */
function showStatus(message, duration = 1200, autoClose = false) {
  let statusEl = document.getElementById('status-message');

  // Dynamic DOM node creation fallback[cite: 7]
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.id = 'status-message';
    statusEl.style.cssText = `
      position: fixed;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.85);
      color: #fff;
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.25s ease;
      pointer-events: none;
    `;
    document.body.appendChild(statusEl);
  }

  statusEl.textContent = message;
  statusEl.style.opacity = '1';

  setTimeout(() => {
    statusEl.style.opacity = '0';
    if (autoClose) {
      setTimeout(() => window.close(), 250);
    }
  }, duration);
}

/**
 * Safely fetches selected text without throwing uncaught exceptions on unscriptable tabs[cite: 3, 8].
 */
async function safeGetSelection(tabId) {
  try {
    const results = await browser.tabs.executeScript(tabId, {
      code: 'window.getSelection().toString()'
    });
    return (results && results[0]) ? results[0].trim() : '';
  } catch (err) {
    console.warn('Selection script skipped on restricted context:', err);
    return '';
  }
}

/**
 * Binds tap and click handlers while filtering out scroll or swipe gestures using an 8px delta threshold[cite: 8].
 */
function bindScrollSafeTap(elementId, actionFn) {
  const element = document.getElementById(elementId);
  if (!element) return;

  let startX = 0;
  let startY = 0;
  let isSwiping = false;

  element.addEventListener('touchstart', (ev) => {
    isSwiping = false;
    if (ev.touches.length === 1) {
      startX = ev.touches[0].clientX;
      startY = ev.touches[0].clientY;
    }
  }, { passive: true });

  element.addEventListener('touchmove', (ev) => {
    if (ev.touches.length === 1) {
      const deltaX = Math.abs(ev.touches[0].clientX - startX);
      const deltaY = Math.abs(ev.touches[0].clientY - startY);
      if (deltaX > 8 || deltaY > 8) {
        isSwiping = true;
      }
    }
  }, { passive: true });

  element.addEventListener('touchend', async (ev) => {
    if (isSwiping) return;
    ev.preventDefault();
    try {
      await actionFn();
    } catch (err) {
      console.error(err);
      showStatus('✗ Copy failed', 1500);
    }
  }, { passive: false });

  element.addEventListener('click', async (ev) => {
    ev.preventDefault();
    try {
      await actionFn();
    } catch (err) {
      console.error(err);
      showStatus('✗ Copy failed', 1500);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindScrollSafeTap('copy-title-link', async () => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tabs[0]) return;

    const options = await getOptions();
    const selectedText = await safeGetSelection(tabs[0].id);

    const copyText = formatCopyText({
      title: tabs[0].title,
      url: tabs[0].url,
      selectedText
    }, options);

    await copyToClipboard(copyText);
    showStatus('✓ Title + Link copied!', 1200, true);
  });

  bindScrollSafeTap('copy-title-only', async () => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tabs[0]) return;

    const options = await getOptions();
    const selectedText = await safeGetSelection(tabs[0].id);

    const copyText = formatCopyText({
      title: tabs[0].title,
      selectedText
    }, options);

    await copyToClipboard(copyText);
    showStatus('✓ Title copied!', 1200, true);
  });

  bindScrollSafeTap('copy-link-only', async () => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tabs[0]) return;

    const options = await getOptions();
    const selectedText = await safeGetSelection(tabs[0].id);

    const copyText = formatCopyText({
      url: tabs[0].url,
      selectedText
    }, options);

    await copyToClipboard(copyText);
    showStatus('✓ Link copied!', 1200, true);
  });

  bindScrollSafeTap('copy-hyperlink', async () => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tabs[0]) return;

    const options = await getOptions();
    const selectedText = await safeGetSelection(tabs[0].id);

    let title = tabs[0].title;
    const url = tabs[0].url;

    if (options.useApTitleCase) {
      title = apStyleTitleCase(title);
    }

    let html = `<a href="${url}">${title}</a>`;
    let plain = `${title}\n${url}`;

    if (selectedText && options.includeSelectedText) {
      const selHtml = escapeHtml(selectedText).replace(/\n/g, '<br>');
      if (options.placeAboveHyperlink) {
        html = `${selHtml}<br>${html}`;
        plain = `${selectedText}\n${plain}`;
      } else {
        html = `${html}<br>${selHtml}`;
        plain = `${plain}\n${selectedText}`;
      }
    }

    await copyAsHyperlink(html, plain);
    showStatus('✓ Hyperlink copied!', 1200, true);
  });
});