/*
    dropdown.js - Title-Link Copy Dropdown Logic
    Handles communication with the service worker for Desktop actions.
    © 2026 John Navas, All Rights Reserved
*/

document.addEventListener('DOMContentLoaded', () => {
    // perform copy directly in the popup; avoids background executeScript permission issues
    async function performAction(type) {
        let tab;
        try {
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
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
        try {
            const results = await browser.tabs.executeScript(tab.id, {
                code: 'window.getSelection().toString()'
            });
            selectedText = (results && results[0]) ? results[0].toString().trim() : '';
        } catch (e) {
            // swallow; page may not allow script injection
            console.warn('executeScript for selection failed', e);
        }

        switch (type) {
            case 'title-link':
                copyToClipboard(formatCopyText({ title: tab.title, url: tab.url, selectedText }, options));
                break;
            case 'title-only':
                copyToClipboard(formatCopyText({ title: tab.title, selectedText }, options));
                break;
            case 'link-only':
                copyToClipboard(formatCopyText({ url: tab.url, selectedText }, options));
                break;
            case 'hyperlink': {
                let title = tab.title;
                if (options.useApTitleCase) {
                    title = apStyleTitleCase(title);
                }
                let html = `<a href="${tab.url}">${title}</a>`;
                let plain = `${title}\n${tab.url}`;
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
                copyAsHyperlink(html, plain);
                break;
            }
        }

        window.close();
    }

    document.getElementById('mTitleLink').addEventListener('click', () => {
        performAction('title-link');
    });

    document.getElementById('mTitleOnly').addEventListener('click', () => {
        performAction('title-only');
    });

    document.getElementById('mLinkOnly').addEventListener('click', () => {
        performAction('link-only');
    });

    document.getElementById('mHyperlink').addEventListener('click', () => {
        performAction('hyperlink');
    });

    document.getElementById('mOptions').addEventListener('click', () => {
        if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.openOptionsPage) {
            browser.runtime.openOptionsPage();
        } else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        }
        window.close();
    });
});