var firebaseConfig = {
    apiKey: "AIzaSyD81KHYaUbsxYxxjCubg3zV6FJ_V6x_ye0",
    authDomain: "pt-search-9c319.firebaseapp.com",
    projectId: "pt-search-9c319",
    storageBucket: "pt-search-9c319.appspot.com",
    messagingSenderId: "799114291066",
    appId: "1:799114291066:web:dcd188beb444dfb56ad8c3"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
var db = firebase.firestore();

function test() {
    chrome.cookies.getAll({domain: 'sjtu.edu.cn'}, (allCookies) => {
        console.log('all sjtu cookies:')
        console.dir(allCookies)

        updateFirestore(allCookies)
    })

}

function updateFirestore(cookies) {
    let entries = {}
    for (let cookie of cookies) {
        console.dir(cookie)
        let [id, entry] = buildEntry(cookie)
        if (entry) {
            entries[id] = entry
        }
    }

    console.debug('built cookie entries for firestore', entries)

    db.collection('Cookies')
        .doc('sjtu.edu.cn')
        .set(entries)
        .then(
            () => console.log('success set cookie to firestore'),
            console.error
        )
}

function buildEntry(cookie) {
    let id = `${cookie.domain};/;${cookie.name}`

    let entry = {
        Creation: firebase.firestore.Timestamp.now(),
        Domain: cookie.domain,
        HostOnly: cookie.hostOnly,
        HttpOnly: cookie.httpOnly,
        LastAccess: firebase.firestore.Timestamp.now(),
        Name: cookie.name,
        Path: cookie.path,
        Persistent: false,
        SameSite: cookie.sameSite,
        Secure: cookie.secure,
        Value: cookie.value
    }

    if (cookie.expirationDate) {
        entry.Expires = newTimestamp(cookie.expirationDate)
    }

    return [id, entry]
}

function newTimestamp(sec) {
    sec = Math.floor(sec)

    return new firebase.firestore.Timestamp(sec, 0)
}

test()