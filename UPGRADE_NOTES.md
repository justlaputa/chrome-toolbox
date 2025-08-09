# Chrome Extension Upgrade to Manifest V3

This Chrome extension has been successfully upgraded from Manifest V2 to Manifest V3 to comply with Google's latest extension standards.

## Changes Made

### 1. Manifest Updates
- Updated `manifest_version` from 2 to 3
- Changed `browser_action` to `action`
- Replaced `background.scripts` with `background.service_worker`
- Moved host permissions from `permissions` to `host_permissions`
- Added `activeTab` permission for better security

### 2. Background Scripts Consolidation
- Combined three separate background scripts into a single `background.js` service worker:
  - `backgroundGoogleTab.js`
  - `backgroundTabSort.js` 
  - `backgroundHighlightLinks.js`
- Updated code to be compatible with service worker environment

### 3. Functionality Preserved
All original features remain intact:
- **Ctrl+I**: Jump to Google search tab (or create new one)
- **Ctrl+U**: Sort tabs by URL
- **Ctrl+J**: Move current tab to head
- **Ctrl+K**: Highlight links on current page

## Installation
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this folder
4. The extension should now be active with all keyboard shortcuts working

## Compatibility
- Chrome 88+ (Manifest V3 support)
- All original functionality maintained
- Improved security with updated permissions model