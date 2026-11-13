/**
 * Title-Link Copy - Popup Menu Script
 * © John Navas 2026, All Rights Reserved
 */
const ext = typeof browser !== "undefined" ? browser : chrome;

document.addEventListener('DOMContentLoaded', () => {
    async function performAction(command) {
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

        switch (command) {
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

    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const command = btn.getAttribute('data-cmd');

            if (command === 'options') {
                ext.runtime.openOptionsPage();
                window.close();
            } else {
                performAction(command);
            }
        });
    });
});