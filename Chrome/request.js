/*
    request.js - Title-Link Copy Extension (Chrome MV3)
    Permission bridge for optional_host_permissions
    © 2025 John Navas, All Rights Reserved
*/

document.getElementById('bGrant').addEventListener('click', () => {
    // Permissions must be requested via a user gesture
    chrome.permissions.request({
        origins: ["<all_urls>"]
    }, (granted) => {
        if (granted) {
            // Toggle UI visibility upon successful grant
            document.getElementById('request-state').style.display = 'none';
            document.getElementById('success-state').style.display = 'block';
        }
    });
});

document.getElementById('bClose').addEventListener('click', () => {
    // Safe closure: Attempts tab removal first, falls back to window.close
    chrome.tabs.getCurrent(tab => {
        if (tab) {
            chrome.tabs.remove(tab.id);
        } else {
            window.close();
        }
    });
});