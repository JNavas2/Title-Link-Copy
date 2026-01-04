/**
 * Title-Link Copy - Options Script
 * © John Navas 2025, All Rights Reserved
 */
const browser = chrome;

function showAutoSaveStatus() {
  const el = document.getElementById('auto-save-status');
  if (el) {
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2000);
  }
}

function updatePreview() {
  const titleEl = document.getElementById('preview-title');
  const selectedEl = document.getElementById('preview-selected');
  const apCheckbox = document.getElementById('ap-title-case');
  const placementInput = document.querySelector('input[name="text-placement"]:checked');

  if (!titleEl || !selectedEl || !apCheckbox || !placementInput) return;

  const useApTitleCase = apCheckbox.checked;
  let title = 'example title here';
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
    if (placement === 'above') previewBox.prepend(selectedEl);
    else previewBox.append(selectedEl);
  }
}

async function autoSaveSettings() {
  const selectedTextPlacement = document.querySelector('input[name="text-placement"]:checked')?.value || 'below';
  const useApTitleCase = document.getElementById('ap-title-case')?.checked || false;
  if (typeof saveOptions === 'function') {
    await saveOptions({ selectedTextPlacement, useApTitleCase });
    showAutoSaveStatus();
  }
}

async function loadSettings() {
  const options = typeof getOptions === 'function' ? await getOptions() : { selectedTextPlacement: 'below', useApTitleCase: false };
  const placementRadio = document.querySelector(`input[name="text-placement"][value="${options.selectedTextPlacement}"]`);
  if (placementRadio) placementRadio.checked = true;
  const apCheckbox = document.getElementById('ap-title-case');
  if (apCheckbox) apCheckbox.checked = options.useApTitleCase;
  updatePreview();
}

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', () => {
      updatePreview();
      autoSaveSettings();
    });
  });

  // Safe Closure for centered button
  const closeBtn = document.getElementById('close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      browser.tabs.getCurrent(tab => {
        if (tab) browser.tabs.remove(tab.id);
        else window.close();
      });
    });
  }
});