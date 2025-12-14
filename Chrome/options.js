/**
 * Title-Link Copy - Options Script (MV3 Chrome Version)
 * Handles options page logic with automatic saving on change
 * © John Navas 2025, All Rights Reserved
 */

// Alias browser to chrome if not defined (standard for Chrome MV3)
const browser = chrome;

// Include external utilities (apStyleTitleCase, getOptions, saveOptions) which must be loaded
// This file will need to be loaded *after* utils.js in options.html

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
 * Update preview based on current settings
 */
function updatePreview() {
  const titleEl = document.getElementById('preview-title');
  const selectedEl = document.getElementById('preview-selected');
  const apCheckbox = document.getElementById('ap-title-case');
  const placementInput = document.querySelector('input[name="text-placement"]:checked');

  if (!titleEl || !selectedEl || !apCheckbox || !placementInput) return;

  const useApTitleCase = apCheckbox.checked;
  let title = 'example title here';
  // apStyleTitleCase is defined in utils.js
  if (useApTitleCase && typeof apStyleTitleCase === 'function') {
    title = apStyleTitleCase(title);
  }
  titleEl.textContent = title;

  const placement = placementInput.value;
  if (placement === 'none') {
    selectedEl.classList.add('hidden');
  } else {
    selectedEl.classList.remove('hidden');
    const previewBox = document.querySelector('.preview-box');
    if (!previewBox) return;
    if (placement === 'above') {
      previewBox.insertBefore(selectedEl, previewBox.children[0]);
    } else {
      previewBox.appendChild(selectedEl);
    }
  }
}

/**
 * Auto-save current settings and show confirmation
 */
async function autoSaveSettings() {
  const selectedTextPlacement = document.querySelector(
    'input[name="text-placement"]:checked'
  )?.value || 'below';
  const useApTitleCase = document.getElementById('ap-title-case')?.checked || false;

  const options = {
    selectedTextPlacement,
    useApTitleCase
  };

  // saveOptions is defined in utils.js
  if (typeof saveOptions === 'function') {
    await saveOptions(options);
    showAutoSaveStatus();
  } else {
    console.error("saveOptions utility function not found.");
  }
}

/**
 * Load current settings
 */
async function loadSettings() {
  // getOptions is defined in utils.js
  const options = typeof getOptions === 'function' ? await getOptions() : { selectedTextPlacement: 'below', useApTitleCase: false };

  // Set text placement radio button
  const placementRadio = document.querySelector(
    `input[name="text-placement"][value="${options.selectedTextPlacement}"]`
  );
  if (placementRadio) {
    placementRadio.checked = true;
  } else {
    // Default to 'below' if not found
    const defaultRadio = document.getElementById('placement-below');
    if (defaultRadio) defaultRadio.checked = true;
  }

  // Set AP title case checkbox
  const apCheckbox = document.getElementById('ap-title-case');
  if (apCheckbox) {
    apCheckbox.checked = options.useApTitleCase;
  }

  updatePreview();
}

// SINGLE DOMContentLoaded handler for ALL initialization
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();

  document.querySelectorAll('input[name="text-placement"]').forEach(radio => {
    radio.addEventListener('change', () => {
      updatePreview();
      autoSaveSettings();
    });
  });

  const apCheckbox = document.getElementById('ap-title-case');
  if (apCheckbox) {
    apCheckbox.addEventListener('change', () => {
      updatePreview();
      autoSaveSettings();
    });
  }
});