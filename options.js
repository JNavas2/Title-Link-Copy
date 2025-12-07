/**
 * Title-Link Copy - Options Script (Auto-Save Version)
 * Handles options page logic with automatic saving on change
 * © John Navas 2025, All Rights Reserved
 */

function showAutoSaveStatus(message = '✓ Settings auto-saved') {
  const statusEl = document.getElementById('auto-save-status');
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
  const useApTitleCase = document.getElementById('ap-title-case').checked;

  let title = 'example title here';
  if (useApTitleCase) {
    title = apStyleTitleCase(title);
  }
  titleEl.textContent = title;

  // Show/hide selected text preview
  const placement = document.querySelector('input[name="text-placement"]:checked').value;
  if (placement === 'none') {
    selectedEl.classList.add('hidden');
  } else {
    selectedEl.classList.remove('hidden');
    // Reorder preview if needed
    const previewBox = document.querySelector('.preview-box');
    const linkEl = document.getElementById('preview-link');

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
  ).value;
  const useApTitleCase = document.getElementById('ap-title-case').checked;

  const options = {
    selectedTextPlacement,
    useApTitleCase
  };

  await saveOptions(options);
  showAutoSaveStatus();
}

/**
 * Load current settings
 */
async function loadSettings() {
  const options = await getOptions();

  // Set text placement radio button
  const placementRadio = document.querySelector(
    `input[name="text-placement"][value="${options.selectedTextPlacement}"]`
  );
  if (placementRadio) {
    placementRadio.checked = true;
  } else {
    // Default to 'below' if not found
    document.getElementById('placement-below').checked = true;
  }

  // Set AP title case checkbox
  document.getElementById('ap-title-case').checked = options.useApTitleCase;

  updatePreview();
}

// Event listeners - Auto-save on ALL changes
document.addEventListener('DOMContentLoaded', loadSettings);

document.querySelectorAll('input[name="text-placement"]').forEach(radio => {
  radio.addEventListener('change', () => {
    updatePreview();
    autoSaveSettings();
  });
});

document.getElementById('ap-title-case').addEventListener('change', () => {
  updatePreview();
  autoSaveSettings();
});
