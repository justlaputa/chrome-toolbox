
chrome.commands.onCommand.addListener(function(command) {
    if (command != 'highlight-links') {
        console.debug('HighlightLinks received command: %s, not my command, skip', command);
        return;
    }

    console.debug('HighlightLinks received command: %s, my command, handling it', command);

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length === 0) return;

        let activeTab = tabs[0];
        if (activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('chrome-extension://')) {
            console.debug('active tab is chrome tab, skip');
            return;
        }

        console.debug('sending command to active tab:', activeTab);

        chrome.tabs.sendMessage(activeTab.id, {action: 'HIGHLIGHT_LINKS'}, function(response) {
            console.log('get response from content script', response);
        });
    });
});
