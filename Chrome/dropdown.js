/*
    dropdown.js - Title-Link Copy Dropdown Logic
    Updated for Chrome MV3: Direct Popup Copy to preserve focus & selection
    © 2026 John Navas, All Rights Reserved
*/

const ext = typeof chrome !== 'undefined' ? chrome : browser;

document.addEventListener('DOMContentLoaded', () => {
    async function performAction(type) {
        let tab;
        try {
            const tabs = await ext.tabs.query({ active: true, currentWindow: true });
            tab = tabs[0];
        } catch (e) {
            console.error('tabs.query failed', e);
        }

        if (!tab) {
            window.close();
            return;
        }

        const options = await getOptions();
        let selectedText = '';

        // Safely fetch highlighted text and strictly trim phantom spaces
        if (options.includeSelectedText) {
            try {
                const results = await ext.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => window.getSelection().toString()
                });
                if (results && results[0] && typeof results[0].result === 'string') {
                    selectedText = results[0].result.trim();
                }
            } catch (e) {
                console.warn('executeScript for selection failed (likely restricted page)', e);
            }
        }

        let items = { title: tab.title, url: tab.url, selectedText: selectedText };

        switch (type) {
            case 'title-url':
                await copyToClipboard(formatCopyText(items, options));
                break;
            case 'title-only':
                items.url = null;
                await copyToClipboard(formatCopyText(items, options));
                break;
            case 'url-only':
                items.title = null;
                await copyToClipboard(formatCopyText(items, options));
                break;
            case 'hyperlink': {
                let title = items.title || tab.title;
                if (options.useApTitleCase) {
                    title = apStyleTitleCase(title);
                }
                const escapedUrl = escapeHtml(items.url);
                const escapedTitle = escapeHtml(title);
                let html = `<a href="${escapedUrl}">${escapedTitle}</a>`;
                let plain = `${title}\n${items.url}`;

                if (selectedText && options.includeSelectedText) {
                    const selHtml = escapeHtml(selectedText).replace(/\r?\n|\r/g, '<br>');
                    if (options.placeAboveHyperlink) {
                        html = `${selHtml}<br>${html}`;
                        plain = `${selectedText}\n${plain}`;
                    } else {
                        html = `${html}<br>${selHtml}`;
                        plain = `${plain}\n${selectedText}`;
                    }
                }

                if (options.appendBlankLine) {
                    plain += '\n ';
                }

                await copyAsHyperlink(html, plain);
                break;
            }
        }

        setTimeout(() => window.close(), 50);
    }

    document.getElementById('mTitleLink').addEventListener('click', () => performAction('title-url'));
    document.getElementById('mTitleOnly').addEventListener('click', () => performAction('title-only'));
    document.getElementById('mLinkOnly').addEventListener('click', () => performAction('url-only'));
    document.getElementById('mHyperlink').addEventListener('click', () => performAction('hyperlink'));

    document.getElementById('mOptions').addEventListener('click', () => {
        if (ext.runtime.openOptionsPage) {
            ext.runtime.openOptionsPage();
        }
        window.close();
    });
});