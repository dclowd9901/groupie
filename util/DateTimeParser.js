var _ = require('lodash');
    
module.exports = {

  dateHeatMap: [],
  timeHeatMap: {},

  monthRe: /\bjanuary\b|\bfebruary\b|\bmarch\b|\bapril\b|\bmay\b|\bjune\b|\bjuly\b|\baugust\b|\bseptember\b|\boctober\b|\bnovember|\bdecember\b/gi,
  abbrMonthRe: '[\\bjan\\b|\\bfeb\\b|\\bmar\\b|\\bapr\\b|\\bmay\\b|\\bjun\\b|\\bjul\\b|\\baug\\b|\\bsep\\b|\\boct\\b|\\bnov\\b|\\bdec\\b]',

  cachedSplitText: null,

  initialize: function () {
    this.cachedSplitText = this.text.split('');
    this.parseSpelledDates();
    this.parseDates();
    this.parseTimes();
    console.log(this.dateHeatMap);
  },

  set: function (text) {
    this.text = text;
  },

  matches: function (needle, haystack) {
    var matches = [];

    while (found = needle.exec(haystack)) {
      matches.push({
        word: found[0],
        start: found.index,
        end: found.index + found[0].length
      });
    }

    return matches;
  },

  // re match lookup
  lookahead: function (arr, re, haystack) {
    _.each(arr, function (wordProps, i) {
      var result;

      re.lastIndex = wordProps.end;
      result = re.exec(haystack);

      if (result) {
        arr[i].word += result[0];
        arr[i].end += result[0].length;
      }
    });

    return arr;
  },

  // one character at a time lookup
  lookbehind: function (arr, re) {
    var i, len = arr.length, j,
        foundMatch, stored = '';

    for (i = 0; i < len; i++) {  
      j = arr[i].start - 1;
      foundMatch = true;

      while (re.test(this.cachedSplitText[j])) {
        stored += this.cachedSplitText[j];
        j--;
        arr[i].start--;
      }

      arr[i].word = stored + arr[i].word;
      stored = '';
    }

    return arr;
  },

  parseDates: function () {
    var datesRe = new RegExp('/');

    _.each(this.cachedSplitText, _.bind(function (value, key, all) {
      var result = this.testFor(value, key, all, datesRe, _.bind(this.testAroundSlash, this));
      
      if (result) {
        this.dateHeatMap.push(result);
      }
    }, this));

    return this.dateHeatMap;
  },

  wholeWordize: function (arr) {
    return _.map(arr, function (word) {
      return '\\b' + word + '\\b';
    });
  },

  parseSpelledDates: function () {
    var matches = this.matches(this.monthRe, this.text),
        spelledDates = [];

    matches = this.lookahead(matches, /[ 0-9]+/g, this.text);
    matches = this.lookbehind(matches, /[ 0-9]/, this.text);

    console.log(matches);
  },

  

  parseTimes: function () {
    var datesRe = new RegExp('\:');

    _.each(this.cachedSplitText, _.bind(function (value, key, all) {
      var result = this.testFor(value, key, all, datesRe, _.bind(this.testAroundColon, this));

      if (result) {
        this.timeHeatMap[key] = result;
      }
    }, this));

    return this.timeHeatMap;
  },

  testFor: function (character, key, all, re, testAroundFunc) {
    var result;

    if (re.test(character)) {
      return testAroundFunc(key, all);
    }
  },



  /**
   * Will return as long as any characters 0-9 or / are found
   */
  testAroundSlash: function (i, blobArr) {
    var result = this.testAround(i, blobArr, new RegExp('[0-9\\/]{1}', 'i'));

    return !(result.start === result.end);
  },

  testAroundColon: function (i, blobArr) {
    var result = this.testAround(i, 
                                 blobArr, 
                                 // Test for numbers preceding colons and other colons
                                 new RegExp('[0-9]', 'i'), 
                                 // test for numbers, spaces and a/p/m/.
                                 new RegExp('[0-9\\sap\\.m]', 'i'));

    return !(result.start === result.end);
  },

  testAroundMonth: function (i, blobArr) {
    var result = this.testAround(i,
                                 blobArr, 
                                 new RegExp('[0-9 ]'));

    return !(result.start === result.end);
  },

  /**
   * Returns range through object
   * {
   *   "start" : <range's starting index>
   *   "end" : <range's ending index>
   * }
   */
  testAround: function (i, blobArr, reBackwardAndForward, reForward) {
    var backward = forward = i = parseInt(i,10),
        found = true,
        word = blobArr[i],
        start,
        end,
        reForward = reForward ? reForward : reBackwardAndForward;

    while (found) {
      backward--;

      if (!reBackwardAndForward.test(blobArr[backward])) {
        start = backward + 1;
        found = false;
      } else {
        word = blobArr[backward] + word;
      }
    }

    if (start === i) {
      return {start: i, end: i};
    }

    found = true;

    while (found) {
      forward++;

      if (!reForward.test(blobArr[forward])) {
        end = forward - 1;
        found = false;
      } else {
        word += blobArr[forward];
      }
    }

    if (end === i) {
      return {start: i, end: i};
    }

    return {start: start, end: end, word: word};
  },

  getStringFromPortionOfArray: function (s, e, arr) {
    copy = '';

    for (; s <= e; s++) {
      copy += arr[s];
    }

    return copy;
  }
};

// possible dates
// - this year's digits will be correlated with it ('14 or 2014)
// - will have at least a day and a month
// - 100% - if over 12, that number is the day
// - 99% - if indeterminate, number is first and in america, it's the month (thanks mm/dd/yyyy)
// - 99% - if indeterminate, number is second and in america, it's the day
// if it has one or two forward slashes, it's probably a date
// 
// times
// if it has a colon surrounded by two numbers, it's almost certainly a time
// if it has a N {followed by} some derivative of a/pm
// if it is proximity to the phrase "doors open" or is preceded by "at"

// other rules
// times are useless without dates,
// times will almost certainly be within {10} characters of a date