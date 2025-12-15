# Title-Link Copy: AP-style Casing & Hyperlink
Privacy-focused browser extension for **Chrome**, **Edge**, and **Firefox** (Desktop & Android). Easily copy page titles, URLs, or **rich text hyperlinks** with advanced formatting options, including AP-Style smart capitalization and selected text citation.

## Browser Compatibility

Title-Link Copy is built to work wherever you do:

| Platform | Browser | Support |
| :--- | :--- | :--- |
| **Desktop** | **[Google Chrome](https://chromewebstore.google.com/detail/title-link-copy-ap-style/kpdbnfaebcenjihjapmdmccnmehfcngh)** | ✅ Fully Supported (Manifest V3) |
| **Desktop** | **Microsoft Edge** | ✅ Fully Supported (Manifest V3) |
| **Desktop** | **[Mozilla Firefox](https://addons.mozilla.org/en-US/firefox/addon/title-link-copy/)** | ✅ Fully Supported |
| **Mobile** | **[Firefox for Android](https://addons.mozilla.org/en-US/firefox/addon/title-link-copy/)** | ✅ Optimized Mobile Experience |

> **Note for Mobile Users:** Unlike many clipboard extensions, this tool is optimized for Firefox for Android, featuring a responsive popup specifically designed for touch screens.

## Features

### 🖱️ Smart Context Menu (All Desktop Browsers)
Right-click anywhere to access a clean, context-aware submenu that adapts to what you clicked:

* **Smart Actions** (Works on Page Background OR Links):
    * 📝 **Title + URL** (Copies Page Title/URL or Link Text/URL)
    * 📋 **Title only**
    * 🔗 **URL only**
    * 🌐 **Hyperlink** (Copies as a clickable rich text link)

### 📱 Responsive Popup (Firefox for Android)
A clean, button-based interface available via the browser toolbar on mobile:
* Quick-copy buttons for **Title+Link**, **Title Only**, **Link Only**, and **Hyperlink**.
* **Embedded Settings:** Configure AP-Style casing and text placement directly inside the popup.
* **Auto-Save:** Settings changes are saved instantly.

### ⌨️ Keyboard Shortcuts
Streamline your workflow with global shortcuts.
* **Chrome/Edge:** Go to `chrome://extensions/shortcuts` to configure.
* **Firefox:** Go to `about:addons` -> Gear Icon -> "Manage Extension Shortcuts".

### 🧠 Advanced Formatting
* **AP-Style Title Casing:** Features a smart algorithm that formats titles according to AP Stylebook guidelines.
    * *Smart Logic:* Handles minor words (a, an, the, of), internal capitals (e.g., "iPhone", "YouTube"), and possessives correctly.
* **Selected Text Support:** If you highlight text before copying, it can be automatically included.
    * Options: Place text **Above** the link, **Below** the link, or **Ignore** it.

### 🔒 Privacy Focused
* **Zero Data Collection:** This extension does not track you, collect analytics, or transmit data.
* **Offline Functionality:** All formatting logic happens locally on your device.

## Permissions Explained
This extension requests the absolute minimum permissions required to function. Permissions may vary slightly depending on your browser (Manifest V2 vs V3), but the intent remains the same:

* **`activeTab`**: Allows the extension to read the Title and URL of the *current* tab only when you explicitly interact with it (click the menu or shortcut). It does not run in the background.
* **`contextMenus`**: Allows the extension to add "Title-Link Copy" to your right-click menu.
* **`storage`**: Used to save your preferences (like AP Casing or Text Placement options).
* **`scripting` (Chrome/Edge)**: Required by modern browsers to execute the copy command and read selected text safely.
* **`clipboardWrite` (Firefox)**: Required to programmatically write text to your system clipboard.

## Usage Guide

### The Output Formats

#### 1. Standard Copy (Title + Link)
Formats the clipboard content on separate lines for easy pasting into plain text documents or chats:

```text
The Page Title (AP Styled if enabled)
[https://www.example.com/article](https://www.example.com/article)
This is the specific text you selected on the page.
```

#### 2. Hyperlink Copy (🌐)
Creates a dual-format clipboard entry suitable for any destination:

* **Rich Text Editors (Word, Google Docs, Email):** Pastes as a clickable, blue anchor link with the Title as the text.
    * *Example:* [The Page Title](https://example.com)
* **Plain Text Editors (Notepad, Code):** Falls back to the standard "Title \n URL" format automatically.
