/*
  content.js

  injected inside google search tab, help the extension to pass instructions to google tab,
  it implements features like:

  - auto select the search text when user jump to google tab

*/

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (sender.tab) {
      console.debug('get message from content script: %s, ignore it', sender.tab.url);
      sendResponse({success: true});
    } else {
      console.debug('get message from extension', message);
      if (!message.type) {
        console.warn('no message type found in message');
        sendResponse({success: false});
        return;
      }
      switch (message.type) {
      case 'JUMP_TO_SEARCH':
        highlightAndSelectSearchText();
        sendResponse({success: true});
        break;

      default:
        sendResponse({success: false});
      }
    }
  }
);

function highlightAndSelectSearchText() {
  var inputBox = document.getElementById('lst-ib');
  inputBox.focus();
  inputBox.select();
}
