let idb;
const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function(e) {
    const db = e.target.result;
    db.createObjectStore('new_fund', { autoIncrement: true });
}

request.onsuccess = function(e) {
    db = e.target.result;

    if (navigator.onLine) {
        uploadFund();
    }
}

request.onerror = function(e) {
    console.log(e.target.errorCode);
}

function saveRecord(record) {
    const transaction = db.transaction(['new_fund'], 'readwrite');
    const fundObjectStore = transaction.objectStore('new_fund');

    fundObjectStore.add(record);
}

function uploadFund() {
    const transaction = db.transaction(['new_fund'], 'readwrite');
    const fundObjectStore = transaction.objectStore('new_fund');

    const getAll = fundObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(res => res.json())
                .then(serverRes => {
                    if (serverRes.message) {
                        throw new Error(serverRes);
                    }

                    const transaction = db.transaction(['new_fund'], 'readwrite');
                    const fundObjectStore = transaction.objectStore('new_fund');

                    fundObjectStore.clear();

                    alert('All saved funds have been submitted');
                })
                .catch(err => {
                    console.log(err);
                })
        }
    }
}

window.addEventListener('online', uploadFund);