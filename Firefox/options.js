/**
 * Title-Link Copy - Options Script (Auto-Save Version)
 * Handles options page logic with automatic saving on change
 * Works on both Desktop (Options) and Android (Popup)
 * © John Navas 2025, All Rights Reserved
 */

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
  // Guard: Popup might not have these if they are hidden/removed
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
    placeAboveHyperlink: !!document.getElementById('placement-hyperlink-above')?.checked
  });

  // Guard: Only update showContextMenu if the element exists (Desktop only)
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

  // Establish modern defaults
  const options = {
    includeSelectedText: true,
    placeAboveNormal: true,
    placeAboveHyperlink: false,
    useApTitleCase: true,
    showContextMenu: true,
    ...o
  };

  // MIGRATION LOGIC: Legacy support
  if (o && o.selectedTextPlacement !== undefined) {
    options.includeSelectedText = o.selectedTextPlacement !== 'none';
    options.placeAboveNormal = o.selectedTextPlacement === 'above';
    options.placeAboveHyperlink = (o.selectedTextPlacement === 'above');
  }

  // UI Assignment with safety guards for platform compatibility
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

  togglePlacementContainer();
}

// Initialization handler
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();

  // Attach listeners only to checkboxes that actually exist in the current DOM
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.id === 'include-selected') togglePlacementContainer();
      autoSaveSettings();
    });
  });
});