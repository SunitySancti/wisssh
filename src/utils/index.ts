import { __API_URL__ } from 'environment'

import type { DateArray, 
              Wishlist } from 'typings'

const __DEV_MODE__ = import.meta.env.DEV


export function delay(duration: number) {  // duration in milliseconds
    return new Promise((resolve) => setTimeout(resolve, duration));
}

export function checkStatus(res: Response) {
    if(res.status >= 200 && res.status < 300) {
        return Promise.resolve(res)
    } else {
        return Promise.reject(new Error(res.statusText))
    }
}

export const json = (res: Response) => res.json()

export const generateId = <IdType>(length = 6) => {
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let id = '';
    for (var i = 0; i < length; i++) {
        id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return id as IdType
}
        
export async function generateUniqueId<IdType>(length = 6) {
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const allIds = await fetch(__API_URL__ + '/ids/all')
                        .then(checkStatus)
                        .then(json)
                        .catch(err => {
                            if(__DEV_MODE__) {
                                console.error(err)
                        }});
    let uniqueId;
    while (!uniqueId || allIds.includes(uniqueId)) {
        uniqueId = ''
        for (var i = 0; i < length; i++) {
            uniqueId += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        }
    }
    return uniqueId as IdType
}

// takes string or number, returns digits array. 'ff' => [15, 15] ; 10 => [1, 0]
export function stringOrNumberToDecimalDigitsArray(
    input: string | number,
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
    digitsArray: number[],
    outputAlphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
) {
    if(digitsArray instanceof Array && digitsArray.length) {
        const output = digitsArray.map(digit => outputAlphabet[digit]).join('');
        return output
    } else return ''
}

// as input takes array of input value's digits in decimal notation: [15, 15], 16 => 255
export function decimalDigitsArrayToDecimalNumber(
    digitsArray: number[],
    radix: number
) {
    if(!(digitsArray instanceof Array && digitsArray.length) || typeof(radix) !== 'number') return NaN

    let reminder = [...digitsArray];
    let accumulator = 0;
    for(let i = 0, current: number | undefined; i < digitsArray.length; i++) {
        current = reminder.pop();
        if(current === undefined || current >= radix) return NaN
        accumulator += current * radix ** i
    }
    return accumulator
}

// takes string or number as input, numbers as radices
// optional parameter "keyString" sets the correspondence between the index of the digit and the chatacter
export function numberSystemConverter(
    input: string | number,
    inputRadix: number,
    outputRadix: number,
    inputAlphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    outputAlphabet = inputAlphabet
) {
    if((typeof input !== 'number' && typeof input !== 'string') || typeof inputRadix !== 'number' || typeof outputRadix !== 'number' || (inputAlphabet && typeof inputAlphabet !== 'string') || (outputAlphabet && typeof outputAlphabet !== 'string')) {
        return { error: 'Wrong types!' }
    }
    if(inputRadix > inputAlphabet.length || outputRadix > outputAlphabet.length) {
        return { error: 'Radix must to be less or equal to alphabet length' }
    }
    let reminder = Number(input);
    if(inputRadix !== 10) {
        reminder = decimalDigitsArrayToDecimalNumber(
            stringOrNumberToDecimalDigitsArray(reminder, inputAlphabet),
            inputRadix
        )
    }
    if(outputRadix === 10) {
        return reminder + ''
    }

    let accumulator: number[] = [];
    while(reminder !== 0) {
        accumulator.unshift(reminder % outputRadix);
        reminder = Math.floor(reminder / outputRadix)
    }
    return decimalDigitsArrayToAlphabetString(accumulator, outputAlphabet || inputAlphabet)
}

// takes string as input and number as partLength, return array of strings
export function separateString(
    input: string,
    partLength: number
) {
    if(typeof(input) !== 'string' || typeof(partLength) !== 'number') {
        return { error: 'Wrong types!' }
    }
    let reminder = input;
    let accumulator: string[] = [];
    let part;
    while(reminder.length) {
        part = reminder.slice(0, partLength);
        accumulator.push(part);
        reminder = reminder.replace(part, '')
    }
    return accumulator
}

export function decodeEmail(encodedEmail: string) {
    if(encodedEmail.length < 6) return ''
    const emailChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ?^_~.,:;@!#$%&*+-={}()[]<>'`\"/|\\";
    // check chars
    return encodedEmail
        .split('+')
        .map((part: string) => numberSystemConverter(part, 62, 95, emailChars))
        .join('')
}

export function mergeArrays(arrays: any[][]) {
    if(!arrays || !arrays.length) return null;
    
    let mergedArrays: any[] = [];
    arrays.forEach(arr => mergedArrays.push(...arr));
    return mergedArrays
}

export const getDaysToEvent = ( wishlist: Wishlist ) => {
    const eventTS = new Date( wishlist.date[2], wishlist.date[1] - 1, wishlist.date[0]).getTime();
    const nowTS = Date.now();
    return Math.ceil((eventTS - nowTS)/86400000);
}

export const sortByDateAscend = (a: Wishlist, b: Wishlist) => {
    const aTS = new Date( a.date[2], a.date[1] - 1, a.date[0]).getTime();
    const bTS = new Date( b.date[2], b.date[1] - 1, b.date[0]).getTime();
    return aTS - bTS;
}

export const sortByDateDescend = (a: Wishlist, b: Wishlist) => {
    const aTS = new Date( a.date[2], a.date[1] - 1, a.date[0]).getTime();
    const bTS = new Date( b.date[2], b.date[1] - 1, b.date[0]).getTime();
    return bTS - aTS;
}

export const formatDateToArray = (date: Date | undefined = new Date()) => {
    return [
        date.getDate(),
        date.getMonth() + 1,
        date.getFullYear()
    ] as DateArray
}

export function splitIntoParts(array: any[], partLength: number) {
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

export function equalizeWidthsByClass(className: string) {
    const elements = document.querySelectorAll<HTMLElement>('.' + className);
    const widths = [...elements].map(elem => elem.offsetWidth);
    const maxWidth = Math.ceil(Math.max(...widths));
    elements.forEach(elem => elem.style.width = maxWidth + 'px')
}
