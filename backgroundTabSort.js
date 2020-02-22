/**
 * background scripts for sorting tabs
 */

chrome.tabs.onUpdated.addListener(updateTab);

/**
 * tab update callback function
 * function(integer tabId, object changeInfo, Tab tab) {...};
 */
function updateTab(tabId, changeInfo, tab) {
    console.debug('tab updated: ', {
        id: tabId,
        index: tab.index,
        title: tab.title,
        url: tab.url,
    });
    console.debug(changeInfo);

    if (!tab.pinned && changeInfo.url) {
        sortTab(tab);
    }
}

function sortTab(tab) {
    chrome.tabs.query({}, tabs => {
        if (!tabs || tabs.length <= 0) {
            console.error('no tabs found');
            return
        }

        console.log('query all tabs');
        printTabs(tabs);

        unpinnedTabs = tabs.filter(t => !t.pinned);
        diff = tabs.length - unpinnedTabs.length;

        unpinnedTabs.sort((first, second) => {
            firstUrl = getUrl(first.url)
            secondUrl = getUrl(second.url)
            if (firstUrl.host == "www.google.com") {
                return -1;
            }
            if (secondUrl.host == "www.google.com") {
                return 1;
            }
            return firstUrl.href.localeCompare(secondUrl.href);
        });

        console.log('sort unpinned tabs:');
        printTabs(unpinnedTabs);

        moveTabs(unpinnedTabs, diff);
    })
}

function moveTabs(sortedTabs, startIndex) {
    for(let i = 0; i < sortedTabs.length; i++) {
        const tab = sortedTabs[i];
        const destIndex = i + startIndex;
        console.log('move tab %s: %s from %d -> %d', tab.id, tab.url, tab.index, destIndex);
        chrome.tabs.move(tab.id, {index: destIndex});
    }
}

function getUrl(urlString) {
    const url = new URL(decodeURI(urlString));
    if (url && url.href.startsWith('https://workona.com/redirect/')) {
        const params = new URLSearchParams(url.hash);
        const actualUrlString = params.get('url');
        return new URL(actualUrlString);
    }

    return url;
}

function printTabs(tabs) {
    for (tab of tabs) {
        console.log('%d: %s %s, pined: %s', tab.index, tab.url, tab.title, tab.pinned);
    }
}