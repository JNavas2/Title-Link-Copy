/**
 * Title-Link Copy - Popup Script
 * Handles popup UI interactions + embedded options for Android
 * © John Navas 2025, All Rights Reserved
 */

function showStatus(message, duration = 2000) {
  const statusEl = document.getElementById('status-message');
  statusEl.textContent = message;
  statusEl.classList.add('show');
  setTimeout(() => statusEl.classList.remove('show'), duration);
}

// UNCHANGED: Copy handlers
document.getElementById('copy-title-link').addEventListener('click', async () => {
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
    showStatus('✓ Title + Link copied!');
  } catch (err) {
    showStatus('✗ Failed to copy');
    console.error(err);
  }
});

document.getElementById('copy-title-only').addEventListener('click', async () => {
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
    showStatus('✓ Title copied!');
  } catch (err) {
    showStatus('✗ Failed to copy');
    console.error(err);
  }
});

document.getElementById('copy-link-only').addEventListener('click', async () => {
  const tab = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab[0]) return;
  const options = await getOptions();
  const url = tab[0].url;
  const results = await browser.tabs.executeScript(tab[0].id, {
    code: 'window.getSelection().toString()'
  });
  const selectedText = results[0] || '';
  const copyText = formatCopyText({ url, selectedText }, options);
  try {
    await copyToClipboard(copyText);
    showStatus('✓ Link copied!');
  } catch (err) {
    showStatus('✗ Failed to copy');
    console.error(err);
  }
});

// NEW: Initialize embedded options on load
document.addEventListener('DOMContentLoaded', () => {
  if (typeof loadSettings === 'function') {
    loadSettings();
  }
});
