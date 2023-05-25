export function checkStatus(res) {
    if(res.status >= 200 && res.status < 300) {
        return Promise.resolve(res)
    } else {
        return Promise.reject(new Error(res.statusText))
    }
}

export const json = res => res.json()

// takes string or number, returns digits array. 'ff' => [15, 15] ; 10 => [1, 0]
export function stringOrNumberToDecimalDigitsArray(
    input,
    inputAlphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
) {
    if(typeof(input) !== 'number' && typeof(input) !== 'string') return []

    let string = input + '';
    const output = [];
    for(let i = 0; i < string.length; i++) {
        output.push(inputAlphabet.indexOf(string[i]))
    }
    return output
}

export function decimalDigitsArrayToAlphabetString(
    digitsArray,
    outputAlphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
) {
    if(typeof(digitsArray) === 'object' || digitsArray?.length) {
        const output = digitsArray.map(digit => outputAlphabet[digit]).join('');
        return output
    } else return ''
}

// as input takes array of input value's digits in decimal notation: [15, 15], 16 => 255
export function decimalDigitsArrayToDecimalNumber(digitsArray, radix) {
    if(!(typeof(digitsArray) === 'object' && digitsArray?.length) || typeof(radix) !== 'number') return NaN

    let reminder = [...digitsArray];
    let accumulator = 0;
    for(let i = 0, current; i < digitsArray.length; i++) {
        current = reminder.pop();
        if(current >= radix) return NaN
        accumulator += current * radix ** i
    }
    return accumulator
}

// takes string or number as input, numbers as radices
// optional parameter "keyString" sets the correspondence between the index of the digit and the symbol
export function numberSystemConverter(
    input,
    inputRadix,
    outputRadix,
    inputAlphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    outputAlphabet = inputAlphabet
) {
    if(typeof(input) !== 'number' && typeof(input) !== 'string' || typeof(inputRadix) !== 'number' || typeof(outputRadix) !== 'number' || (inputAlphabet && typeof(inputAlphabet) !== 'string') || (outputAlphabet && typeof(outputAlphabet) !== 'string')){
         return { error: 'Wrong types!' }
    }
    if(inputRadix > inputAlphabet || outputRadix > outputAlphabet) {
        return { error: 'Radix must to be less or equal to alphabet length' }
    }
    let reminder = input;
    if(inputRadix !== 10) {
        reminder = stringOrNumberToDecimalDigitsArray(reminder, inputAlphabet);
        reminder = decimalDigitsArrayToDecimalNumber(reminder, inputRadix)
    }
    if(outputRadix === 10) {
        return reminder + ''
    }

    let accumulator = [];
    while(reminder !== 0) {
        accumulator.unshift(reminder % outputRadix);
        reminder = Math.floor(reminder / outputRadix)
    }
    return decimalDigitsArrayToAlphabetString(accumulator, outputAlphabet || inputAlphabet)
}

// takes string as input and number as partLength, return array of strings
export function separateString(input, partLength) {
    if(typeof(input) !== 'string' || typeof(partLength) !== 'number') {
        return { error: 'Wrong types!' }
    }
    let reminder = input;
    let accumulator = [];
    let part;
    while(reminder.length) {
        part = reminder.slice(0, partLength);
        accumulator.push(part);
        reminder = reminder.replace(part, '')
    }
    return accumulator
}

export function encodeEmail(email) {
    if(email.length < 6) return ''
    const emailChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ?^_~.,:;@!#$%&*+-={}()[]<>'`\"/|\\";
    // check chars
    return separateString(email, 7)
        .map(part => numberSystemConverter(part, 95, 62, emailChars))
        .join('+');
}

export function decodeEmail(encodedEmail) {
    if(encodedEmail.length < 6) return ''
    const emailChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ?^_~.,:;@!#$%&*+-={}()[]<>'`\"/|\\";
    // check chars
    return encodedEmail
        .split('+')
        .map(part => numberSystemConverter(part, 62, 95, emailChars))
        .join('')
}

export const generateId = (keyString, length) => {
    const alphabet = keyString || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const idLength = length || 6;

    let id = '';
    for (var i = 0; i < idLength; i++) {
        id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return id
}

export const generateUniqueId = async (keyString, length) => {
    const alphabet = keyString || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const idLength = length || 6;
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
