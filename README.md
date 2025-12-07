# Title-Link Copy: AP-style Casing & Hyperlink
Privacy-focused Firefox extension for Desktop and Android that creates perfect citations. Easily copy page titles, URLs, or **rich text hyperlinks** with advanced formatting options, including AP-Style smart capitalization and selected text citation.

## Browser Compatibility

✅ **Fully Compatible with Firefox for Android** and **Firefox Desktop**.
Unlike many clipboard extensions that only function on desktop, Title-Link Copy is optimized for the mobile experience. It features a responsive popup specifically designed for Android screens, allowing you to access advanced formatting options on the go.

## Features

### 🖱️ Smart Context Menu (Desktop)
Right-click anywhere to access a clean, context-aware submenu that adapts to what you clicked:

* **Smart Actions** (Works on Page Background OR Links):
    * 📝 **Title + URL** (Copies Page Title/URL or Link Text/URL)
    * 📋 **Title only**
    * 🔗 **URL only**
    * 🌐 **Hyperlink** (Copies as a clickable rich text link)

### 📱 Responsive Popup (Android)
A clean, button-based interface available via the browser toolbar:
* Quick-copy buttons for **Title+Link**, **Title Only**, **Link Only**, and **Hyperlink**.
* **Embedded Settings:** Configure AP-Style casing and text placement directly inside the popup without opening a separate tab.
* **Auto-Save:** Settings changes are saved instantly.

### ⌨️ Keyboard Shortcuts
Streamline your workflow with global shortcuts (customizable in Firefox Add-on settings):
* Commands available for all four copy modes, including `Copy Hyperlink`.

### 🧠 Advanced Formatting
* **AP-Style Title Casing:** Features a smart algorithm that formats titles according to AP Stylebook guidelines.
    * *Smart Logic:* Handles minor words (a, an, the, of), internal capitals (e.g., "iPhone", "YouTube"), and possessives correctly.
* **Selected Text Support:** If you highlight text before copying, it can be automatically included.
    * Options: Place text **Above** the link, **Below** the link, or **Ignore** it.

### 🔒 Privacy Focused
* **Zero Data Collection:** This extension does not track you, collect analytics, or transmit data.
* **Minimal Permissions:** Requires only `activeTab`, `contextMenus`, and `clipboardWrite`. It uses local storage for settings, meaning it does **not** require the broad `storage` permission.

## Permissions Explained
This extension requests the absolute minimum permissions required to function. Here is exactly what each permission allows:

* **`activeTab`**: This permission allows the extension to read the Title and URL of the *current* tab only when you explicitly interact with the extension (e.g., click the toolbar button or a context menu item). It does not run in the background on other tabs.
* **`contextMenus`**: This allows the extension to add the "Title-Link Copy" items to your right-click menu.
* **`clipboardWrite`**: This is required to programmatically write the formatted text (or rich text hyperlink) to your system clipboard.

## Usage Guide

### The Output Formats

#### 1. Standard Copy (Title + Link)
Formats the clipboard content on separate lines for easy pasting into plain text documents or chats:

```text
The Page Title (AP Styled if enabled)
https://www.example.com/article
This is the specific text you selected on the page.
```

#### 2. Hyperlink Copy (🌐)
Creates a dual-format clipboard entry suitable for any destination:
* **Rich Text Editors (Word, Google Docs, Email):** Pastes as a clickable, blue anchor link with the Title as the text.
    * *Example:* [The Page Title](https://example.com)
* **Plain Text Editors (Notepad, Code):** Falls back to the standard "Title \n URL" format automatically.

## Version History

* **v1.1.0**:
    * **New Feature:** Added "Hyperlink" (rich text) copy support.
    * **Improvement:** Smart Context Menu (Unifies Page and Link actions into a single, clean menu).

* **v1.0.0**:
    * Initial release with Title, URL, and AP-Style formatting support.
