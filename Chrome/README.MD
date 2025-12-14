# Title-Link Copy: AP-style Casing & Hyperlink
Privacy-focused Chrome extension for Desktop that creates perfect citations. Easily copy page titles, URLs, or **rich text hyperlinks** with advanced formatting options, including AP-Style smart capitalization and selected text citation.

## Browser Compatibility

✅ **Fully Compatible with Chrome Desktop and Microsoft Edge Desktop (Chromium).**

## Features

### 🖱️ Smart Context Menu (Desktop)
Right-click anywhere to access a clean, context-aware submenu that adapts to what you clicked:

* **Smart Actions** (Works on Page Background OR Links):
    * 📝 **Title + URL** (Copies Page Title/URL or Link Text/URL)
    * 📋 **Title only**
    * 🔗 **URL only**
    * 🌐 **Hyperlink** (Copies as a clickable rich text link)

### ⌨️ Keyboard Shortcuts
Streamline your workflow with global shortcuts (customizable in your browser's extension settings):
* Commands available for all four copy modes, including `Copy Hyperlink`.

### 🧠 Advanced Formatting
* **AP-Style Title Casing:** Features a smart algorithm that formats titles according to AP Stylebook guidelines.
    * *Smart Logic:* Handles minor words (a, an, the, of), internal capitals (e.g., "iPhone", "YouTube"), and possessives correctly.
* **Selected Text Support:** If you highlight text before copying, it can be automatically included.
    * Options: Place text **Above** the link, **Below** the link, or **Ignore** it.

### 🔒 Privacy Focused
* **Zero Data Collection:** This extension does not track you, collect analytics, or transmit data.
* **Minimal Permissions:** Requires only `activeTab`, `contextMenus`, `scripting`, and `host_permissions` for core functionality.

## Permissions Explained
This extension requests the absolute minimum permissions required to function. Here is exactly what each permission allows:

* **`activeTab`**: This permission allows the extension to read the Title and URL of the *current* tab only when you explicitly interact with the extension (e.g., click the toolbar button or a context menu item). It does not run in the background on other tabs.
* **`contextMenus`**: This allows the extension to add the "Title-Link Copy" items to your right-click menu.
* **`scripting`**: Required in Manifest V3 to execute code inside the web page (e.g., to read the selected text and execute the `navigator.clipboard` command).
* **`host_permissions`**: `<all_urls>` is needed to allow the `scripting` API to operate on any page, a necessary step for an extension that works on all web pages.

## Usage Guide

### The Output Formats

#### 1. Standard Copy (Title + Link)
Formats the clipboard content on separate lines for easy pasting into plain text documents or chats:

```text
The Page Title (AP Styled if enabled)
[https://www.example.com/article](https://www.example.com/article)
This is the specific text you selected on the page.