/**
 * Title-Link Copy - Options Script (Auto-Save Version)
 * Handles options page logic with automatic saving on change
 * Works on both Desktop (Options) and Android (Popup)
 * © John Navas 2026, All Rights Reserved
 */

// Removed duplicate `const browser` declaration (already provided by utils.js)

function showAutoSaveStatus(message = '✓ Settings auto-saved') {
  const statusEl = document.getElementById('auto-save-status');
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.classList.add('show');

  setTimeout(() => {
    statusEl.classList.remove('show');
  }, 2000);
}

/**
 * Toggle visibility of placement settings
 */
function togglePlacementContainer() {
  const cont = document.getElementById('placement-container');
  const includeSelectedEl = document.getElementById('include-selected');
  if (!cont || !includeSelectedEl) return;

  cont.style.display = includeSelectedEl.checked ? 'block' : 'none';
}

/**
 * Auto-save current settings
 */
async function autoSaveSettings() {
  const existing = await getOptions().catch(() => ({}));

  const opts = Object.assign({}, existing, {
    useApTitleCase: !!document.getElementById('ap-title-case')?.checked,
    includeSelectedText: !!document.getElementById('include-selected')?.checked,
    placeAboveNormal: !!document.getElementById('placement-normal-above')?.checked,
    placeAboveHyperlink: !!document.getElementById('placement-hyperlink-above')?.checked,
    appendBlankLine: !!document.getElementById('append-blank-line')?.checked
  });

  const showContextEl = document.getElementById('show-context-menu');
  if (showContextEl) {
    opts.showContextMenu = !!showContextEl.checked;
  }

  await saveOptions(opts);
  showAutoSaveStatus();
}

/**
 * Load current settings with Migration Support
 */
async function loadSettings() {
  const o = await getOptions().catch(() => ({}));

  const options = {
    includeSelectedText: true,
    placeAboveNormal: true,
    placeAboveHyperlink: false,
    useApTitleCase: true,
    showContextMenu: true,
    appendBlankLine: false,
    ...o
  };

  if (o && o.selectedTextPlacement !== undefined) {
    options.includeSelectedText = o.selectedTextPlacement !== 'none';
    options.placeAboveNormal = o.selectedTextPlacement === 'above';
    options.placeAboveHyperlink = (o.selectedTextPlacement === 'above');
  }

  const apTitleEl = document.getElementById('ap-title-case');
  if (apTitleEl) apTitleEl.checked = !!options.useApTitleCase;

  const includeSelectedEl = document.getElementById('include-selected');
  if (includeSelectedEl) includeSelectedEl.checked = !!options.includeSelectedText;

  const placeNormalEl = document.getElementById('placement-normal-above');
  if (placeNormalEl) placeNormalEl.checked = !!options.placeAboveNormal;

  const placeHyperlinkEl = document.getElementById('placement-hyperlink-above');
  if (placeHyperlinkEl) placeHyperlinkEl.checked = !!options.placeAboveHyperlink;

  const showContextEl = document.getElementById('show-context-menu');
  if (showContextEl) showContextEl.checked = !!options.showContextMenu;

  const appendBlankEl = document.getElementById('append-blank-line');
  if (appendBlankEl) appendBlankEl.checked = !!options.appendBlankLine;

  togglePlacementContainer();

  // Modern, awaited platform check ensuring the dimming logic fires correctly
  try {
    const info = await chrome.runtime.getPlatformInfo();
    if (info.os !== 'android') {
      if (appendBlankEl) {
        appendBlankEl.checked = false;
        appendBlankEl.disabled = true;
        appendBlankEl.parentElement.style.opacity = '0.5';
      }
    }
  } catch (err) {
    console.error("Platform check failed:", err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();

  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.id === 'include-selected') togglePlacementContainer();
      autoSaveSettings();
    });
  });
});