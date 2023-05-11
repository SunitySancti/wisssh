export function checkStatus(res) {
    if(res.status >= 200 && res.status < 300) {
        return Promise.resolve(res)
    } else {
        return Promise.reject(new Error(res.statusText))
    }
}

export const json = res => res.json()

export const generateId = () => {
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const idLength = 6;

    let id = '';
    for (var i = 0; i < idLength; i++) {
        id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return id
}

export const generateUniqueId = async () => {
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const idLength = 6;
    const idList = await fetch('/api/ids/all')
        .then(checkStatus)
        .then(json)
        .then(list => list.map(obj => obj.key));

    let uniqueId;
    while (!uniqueId || idList.includes(uniqueId)) {
        uniqueId = '';
        for (var i = 0; i < idLength; i++) {
            uniqueId += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        }
    }
    return uniqueId;
}

export function mergeArrays(arrays) {
    if(!arrays || !arrays.length) return null;
    
    let mergedArrays = [];
    arrays.forEach(arr => mergedArrays.push(...arr));
    return mergedArrays
}

export const getDaysToEvent = ( wishlist ) => {
    if(!wishlist.date) return null;
    const eventTS = new Date( wishlist.date[2], wishlist.date[1] - 1, wishlist.date[0]).getTime();
    const nowTS = Date.now();
    return Math.ceil((eventTS - nowTS)/86400000);
}

export const sortByDateAscend = (a, b) => {
    const aTS = new Date( a.date[2], a.date[1] - 1, a.date[0]).getTime();
    const bTS = new Date( b.date[2], b.date[1] - 1, b.date[0]).getTime();
    return aTS - bTS;
}

export const sortByDateDescend = (a, b) => {
    const aTS = new Date( a.date[2], a.date[1] - 1, a.date[0]).getTime();
    const bTS = new Date( b.date[2], b.date[1] - 1, b.date[0]).getTime();
    return bTS - aTS;
}

export const formatDateToArray = (date) => {
    const d = date?.getDate() + '';
    let m = date?.getMonth() + 1;
    if(m < 10) m = '0' + m;
    const y = date?.getFullYear() + '';
    return [d, m, y];
}

export function splitIntoParts(array, partLength) {
    const nParts = Math.ceil(array.length / partLength);
    if(nParts < 2) return [array];

    let parts = [];
    let rest = array;
    for(let i = 0; i < nParts; i++) {
        const part = rest.slice(0, partLength);
        if(!part.length) return;
        parts.push(part);
        rest.splice(0, partLength);
    };
    return parts
}