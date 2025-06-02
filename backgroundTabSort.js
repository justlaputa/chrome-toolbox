/**
 * background scripts for sorting tabs
 */

const SortBy = Object.freeze({
    URL: Symbol('url'),
    LAST_ACCESS_TIME: Symbol('last-access-time'),
})

const sortFunctions = Object.freeze({
    [SortBy.URL]: sortByUrl,
    [SortBy.LAST_ACCESS_TIME]: sortByAccessTime,
})

const myCommands = [
    'sort-tabs-by-url',
    'sort-tabs-by-access-time',
    'move-to-head',
]

chrome.commands.onCommand.addListener(function(command) {
    if (!myCommands.includes(command)) {
        console.debug('TabSort received command: %s, not my command, skip', command);
        return;
    }

    console.debug('TabSort received command: %s, my command, handling it', command);

    if (command == 'sort-tabs-by-url') {
        sortTab(SortBy.URL);
    } else if (command == 'sort-tabs-by-access-time') {
        sortTab(SortBy.LAST_ACCESS_TIME)
    } else if (command == 'move-to-head') {
        moveCurrentTabToHead();
    }
});

function moveCurrentTabToHead() {
    function move(tab) {
        chrome.tabs.move(tab.id, { index: 0 }, () => {
            if (chrome.runtime.lastError) {
              const error = chrome.runtime.lastError;
              if (error == 'Error: Tabs cannot be edited right now (user may be dragging a tab).') {
                setTimeout(() => move(tab), 50);
              } else {
                console.error(error);
              }
            } else {
              console.log('Success.');
            }
          });
    }

    function activatePrevious(tab) {
        let index = tab.index;
        if (index > 0) {
            chrome.tabs.update(tab.id, {active: true})
        }
    }

    getCurrentTab(t => {
        activatePrevious(t);
        move(t);
    });
}

/**
 * get the current active tab, and pass it to callback function
 * @param {function(tab)} callback
 */
function getCurrentTab(callback) {
  let queryOptions = { active: true, lastFocusedWindow: true };
  chrome.tabs.query(queryOptions, ([tab]) => {
    if (chrome.runtime.lastError) console.error(chrome.runtime.lastError);
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    callback(tab);
  });
}

/**
 * sort all tabs by their url
 * "www.google.com" always comes to the head, just my personal preference
 */
function sortTab(by) {
    chrome.tabs.query({}, tabs => {
        if (!tabs || tabs.length <= 0) {
            console.error('no tabs found');
            return
        }

        console.debug('query all tabs');
        printTabs(tabs);

        unpinnedTabs = tabs.filter(t => !t.pinned);
        diff = tabs.length - unpinnedTabs.length;

        unpinnedTabs.sort(sortFunctions[by]);

        console.debug('sort unpinned tabs:');
        printTabs(unpinnedTabs);

        moveTabs(unpinnedTabs, diff);
    })
}

function sortByUrl(left, right) {
    leftUrl = getUrl(left.url)
    rightUrl = getUrl(right.url)
    if (leftUrl.host == "www.google.com") {
        return -1;
    }
    if (rightUrl.host == "www.google.com") {
        return 1;
    }
    return compareUrl(leftUrl, rightUrl);
}

function sortByAccessTime(left, right) {
    leftUrl = getUrl(left.url)
    rightUrl = getUrl(right.url)
    if (leftUrl.host == "www.google.com") {
        return -1;
    }
    if (rightUrl.host == "www.google.com") {
        return 1;
    }

    if (!left.lastAccessed) {
        return -1;
    } else if (!right.lastAccessed) {
        return 1;
    } else if (left.lastAccessed == right.lastAccessed) {
        return 0;
    }

    return left.lastAccessed < right.lastAccessed ? -1 : 1;
}

/**
 * tabs are only sorted in the array, they are still in the original position in Chrome window
 * this function makes the actual movement
 * @param {array} sortedTabs array of tabs sorted by url
 * @param {int} startIndex the first tab index after skipping all pinned tabs
 */
function moveTabs(sortedTabs, startIndex) {
    for(let i = 0; i < sortedTabs.length; i++) {
        const tab = sortedTabs[i];
        const destIndex = i + startIndex;
        console.debug('move tab %s: %s from %d -> %d', tab.id, tab.url, tab.index, destIndex);
        chrome.tabs.move(tab.id, {index: destIndex});
    }
}

function getUrl(urlString) {
    const url = new URL(decodeURI(urlString));

    //special handling for workona extension, it suspends tab and changes the orginal url to it's own url, e.g.:
    // www.google.com => https://workona.com/redirect/#url=www.google.com
    if (url && url.href.startsWith('https://workona.com/redirect/')) {
        const params = new URLSearchParams(url.hash);
        const actualUrlString = params.get('url');
        return new URL(actualUrlString);
    }

    return url;
}

function compareUrl(leftUrl, rightUrl) {
    const reverseHost = (h) => h.split('.').reverse().join('.');

    //reverse host component before sorting, this makes subdomains of the same host sorted in the same place
    //e.g. blog.google.com, map.google.com => these two will be sorted close to each other
    const leftHost = reverseHost(leftUrl.hostname);
    const rightHost = reverseHost(rightUrl.hostname);
    const hostOrder = leftHost.localeCompare(rightHost, 'en', {sensitivity: 'base'});
    if (hostOrder !== 0) {
        return hostOrder
    }

    return leftUrl.href.localeCompare(rightUrl.href, 'en', {sensitivity: 'base'});
}

/**
 * for debugging
 * @param {array} tabs 
 */
function printTabs(tabs) {
    for (tab of tabs) {
        console.debug('%d: %s %s, pined: %s', tab.index, tab.url, tab.title, tab.pinned);
    }
}