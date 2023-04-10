var dictionaryInput = document.getElementById("dictionary");
var maxWordCountInput = document.getElementById("word-count");
var maxWordCountIncButton = document.getElementById("word-count-up");
var maxWordCountDecButton = document.getElementById("word-count-down");
var checkboxVarCaps = document.getElementById("var-caps");
var checkboxVarNums = document.getElementById("var-nums");
var checkboxVarDate = document.getElementById("var-date");
var minMaxWordCount = 1;
var maxMaxWordCount = 10;
var datePattern = /^(\d{1,2})([\.-/])(\d{1,2})\2(\d{1,4})$/;

var numsDict = {
    "a": "4",
    "b": "8",
    "e": "3",
    "g": "6",
    "i": "1",
    "o": "0",
    "q": "9",
    "s": "5",
    "t": "7",
    "z": "2"
}

function SplitWords(words) {
    let dictionary = words.replace(/\s+/g, ",")
        .replace(/;+/g, ",")
        .replace(/,+/g, ",")
        .split(",")
        .filter(w => w != "");
    return Array.from(new Set(dictionary));
}

function GetDictionary() {
    return SplitWords(dictionaryInput.value);
}

function GetSeparatedDates(d, m, y) {
    let separators = [".", "-", "/", ""];
    return separators.map(s => [d, m, y].join(s)).concat(separators.map(s => [y, m, d].join(s)));
}

function GetDateVariations(date) {
    let matchedDate = date.match(datePattern);
    let dayVars = [matchedDate[1]];
    if (dayVars[0].length == 1) dayVars.push("0" + dayVars[0]);
    let monthVars = [matchedDate[3]];
    if (monthVars[0].length == 1) monthVars.push("0" + monthVars[0]);
    let yearVars = [matchedDate[4]];
    if (yearVars[0].length == 4) yearVars.push(yearVars[0].substring(2, 4));
    else if (yearVars[0].length == 2) {
        yearVars.push("19" + yearVars[0]);
        yearVars.push("20" + yearVars[0]);
    }
    let variations = [];
    dayVars.forEach(d => {
        monthVars.forEach(m => {
            yearVars.forEach(y => {
                variations = variations.concat(GetSeparatedDates(d, m, y));
            })
        })
    });
    return variations;
}

function IsCapsableChar(char) {
    let cCode = char.charCodeAt();
    return (cCode >= "a".charCodeAt() && cCode <= "z".charCodeAt())
        || (cCode >= "A".charCodeAt() && cCode <= "Z".charCodeAt())
        || Array.from("äöüÄÖÜ").map(c => c.charCodeAt()).includes(cCode);
}

function IsNumsableChar(char) {
    return Object.keys(numsDict)
        .concat(Object.keys(numsDict).map(c => c.toUpperCase()))
        .includes(char);
}

function CalcNumberOfVariations(word, critCallback) {
    let numOfCapsableChars = Array.from(word)
        .map(c => critCallback(c) ? 1 : 0)
        .reduce((sum, x) => sum + x, 0);
    return Math.pow(2, numOfCapsableChars);
}

function IsDate(word) {
    return Boolean(word.match(datePattern));
}

function CalcNumberDateVariations(word) {
    return IsDate(word) ? GetDateVariations(word).length - 1 : 0;
}

function CalcNumberOfPasswords() {
    let words = GetDictionary();
    let letterVariations = words.map(w => Array.from(w).map(() => 1));
    for (let i = 0; i < words.length; i++) {
        for (let c = 0; c < words[i].length; c++) {
            if (checkboxVarCaps.checked && IsCapsableChar(words[i][c])) letterVariations[i][c]++;
            if (checkboxVarNums.checked && IsNumsableChar(words[i][c])) letterVariations[i][c]++;
        }
    }
    let numberOfDifferentPasswordsPerWord = [];
    for (let i = 0; i < letterVariations.length; i++) {
        if (IsDate(words[i])){
            numberOfDifferentPasswordsPerWord.push(checkboxVarDate.checked ? GetDateVariations(words[i]).length : 1);
        }
        else {
            numberOfDifferentPasswordsPerWord.push(letterVariations[i].reduce((product, x) => product * x, 1));
        }
    }
    let indexPerms = GetPowerSetPermutations(words.length, maxWordCountInput.innerHTML);
    return indexPerms.map(p => p
        .map(i => numberOfDifferentPasswordsPerWord[i]).reduce((product, x) => product * x, 1))
        .reduce((sum, x) => sum + x, 0);
}

function* DateVarGenerator(word) {
    if (!checkboxVarDate.checked) yield word;
    else {
        for (let dateVar of GetDateVariations(word)) {
            yield dateVar;
        }
    }
}

function GetNumsVariation(word, numsableIndices, varNum) {
    let newWord = Array.from(word);
    for (let i = 0; i < numsableIndices.length; i++) {
        if ((varNum % 2) == 0) newWord[numsableIndices[i]] = numsDict[newWord[numsableIndices[i]]];
        varNum >>= 1;
    }
    return newWord.join("");
}

function IsLowerCase(char) {
    return char == char.toLowerCase();
}

function GetCapsVariation(word, capsableIndices, varNum) {
    let newWord = Array.from(word);
    for (let i = 0; i < capsableIndices.length; i++) {
        if ((varNum % 2) == 0) {
            newWord[capsableIndices[i]] = IsLowerCase(newWord[capsableIndices[i]])
                ? newWord[capsableIndices[i]].toUpperCase()
                : newWord[capsableIndices[i]].toLowerCase();
        }
        varNum >>= 1;
    }
    return newWord.join("");
}

function* VarGenerator(word, checkbox, charCrit, varGetter) {
    if (!checkbox.checked) yield word;
    else {
        let indices = [];
        for (let i = 0; i < word.length; i++) {
            if (charCrit(word[i])) indices.push(i);
        }
        if (indices.length == 0) yield word;
        else {
            let numberOfVars = Math.pow(2, indices.length);
            for (let i = 0; i < numberOfVars; i++) {
                yield varGetter(word, indices, i);
            }
        }
    }
}

function* WordVarGenerator(word) {
    if (IsDate(word)) {
        for (let dateVar of DateVarGenerator(word)) {
            yield dateVar;
        }
    }
    else {
        for (let numsVar of VarGenerator(word, checkboxVarNums, IsNumsableChar, GetNumsVariation)) {
            for (let capsVar of VarGenerator(numsVar, checkboxVarCaps, IsCapsableChar, GetCapsVariation)) {
                yield capsVar;
            }
        }
    }
}

function GetPermutations(set) {
    let perms = [];
    for (let i = 0; i < set.length; i++) {
        let rest = GetPermutations(set.slice(0, i).concat(set.slice(i + 1)));
        if(!rest.length) {
            perms.push([set[i]])
        } else {
            for(let j = 0; j < rest.length; j++) {
                perms.push([set[i]].concat(rest[j]))
            }
        }
    }
    return perms;
}

function GetPowerSetPermutations(setLen, maxNumPicked) {
    let indices = Array.from(Array(setLen).keys());
    let wordPerms = [[]];
    for (let index of indices) {
        let wordPermsLen = wordPerms.length;
        for (let i = 0; i < wordPermsLen; i++) {
            wordPerms.push(wordPerms[i].concat(index));
        }
    }
    return wordPerms.filter(p => p.length >= 1 && p.length <= maxNumPicked)
        .map(p => GetPermutations(p)).flat();
}

function* PasswordGenerator() {
    let words = GetDictionary();
    let wordPerms = GetPowerSetPermutations(words.length, maxWordCountInput.innerHTML);
    for (let wordPerm of wordPerms)
    {
        let generators = [];
        for (let i = 0; i < wordPerm.length; i++) {
            generators.push(WordVarGenerator(words[wordPerm[i]]));
        }
        let currentWords = generators.map(g => g.next().value);
        yield currentWords.join("");
        let currentGen = 0;
        while (currentGen < wordPerm.length) {
            let next = generators[currentGen].next();
            if (next.done) {
                generators[currentGen] = WordVarGenerator(words[wordPerm[currentGen]]);
                currentGen += 1;
                continue;
            }
            currentWords[currentGen] = next.value;
            if (currentGen != 0) {
                currentGen -= 1;
                continue;
            }
            yield currentWords.join("");
        }
    }
}

function IsEnoughInputForTesting() {
    if (GetDictionary().length === 0) {
        successMessageField.innerHTML = "> Bitte Wörter zum Generieren der Passwörter im Wörterbuch-Feld einfügen."
        successMessageField.style.color = "red";
        return false;
    }
    return true;
}

function IncMaxWordCount() {
    let len = parseInt(maxWordCountInput.innerHTML);
    if (len >= maxMaxWordCount) return;
    maxWordCountInput.innerHTML = len + 1;
    DisplayPasswords(true);
}

function DecMaxDictLen() {
    let len = parseInt(maxWordCountInput.innerHTML);
    if (len <= minMaxWordCount) return;
    maxWordCountInput.innerHTML = len - 1;
    DisplayPasswords(true);
}

function AddSpecificEventListeners() {
    dictionaryInput.addEventListener("input", () => DisplayPasswords(true));
    checkboxVarCaps.addEventListener("input", () => DisplayPasswords(true));
    checkboxVarNums.addEventListener("input", () => DisplayPasswords(true));
    checkboxVarDate.addEventListener("input", () => DisplayPasswords(true));
    maxWordCountIncButton.addEventListener("click", IncMaxWordCount);
    maxWordCountDecButton.addEventListener("click", DecMaxDictLen);
}