var _ = require('lodash'),
    HashSet = require('./EfficiencyUtilities').HashSet,
    eu = require('./EfficiencyUtilities');
    
module.exports = {

  dateHeatMap: [],
  timeHeatMap: {},

  monthRe: /\bjanuary\b|\bfebruary\b|\bmarch\b|\bapril\b|\bmay\b|\bjune\b|\bjuly\b|\baugust\b|\bseptember\b|\boctober\b|\bnovember|\bdecember\b/gi,
  abbrMonthRe: /[\bjan\b|\bfeb\b|\bmar\b|\bapr\b|\bmay\b|\bjun\b|\bjul\b|\baug\b|\bsep\b|\boct\b|\bnov\b|\bdec\b]/gi,
  dateRe: /\s[0-9]{1,2}[\.\/-][0-9]{1,2}[\.\/-]*[0-9]{0,4}/g,
  amPmDes: /[0-9] *[ap]\.*m\.*/gi,
  timeRe: /^\s*[0-9]{1,2}\:*[0-9]{0,2} *[a|pm\.]{1,4}\s*$/i,

  cachedSplitText: null,

  initialize: function () {
    this.cachedSplitText = this.text.split('');
    var spelledDates = this.parseSpelledDates(),
        parsedDates = this.parseDates(),
        parsedTimes = this.parseTimesByColon(),
        parsedTimesByAmPm = this.parseTimesByAmPm();

    this.dateHeatMap = parsedDates.concat(spelledDates);
    this.timeHeatMap = eu.intersection(parsedTimes, parsedTimesByAmPm);
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
      } else {
        return;
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

      while (foundMatch) {

        if (re.test(this.cachedSplitText[j])) {
          stored = this.cachedSplitText[j] + stored;
          j--;
          arr[i].start--;
        } else {
          foundMatch = false;
        }
      }

      arr[i].word = stored + arr[i].word;
      stored = '';
    }

    return arr;
  },

  parseDates: function () {
    return this.matches(this.dateRe, this.text);
  },

  parseSpelledDates: function () {
    var matches = this.matches(this.monthRe, this.text),
        spelledDates = [];

    matches = this.lookahead(matches, /[ 0-9]+/g, this.text);
    matches = this.lookbehind(matches, /[ 0-9]/, this.text);

    return matches;
  },

  parseTimesByColon: function () {
    var matches = this.matches(/\:/g, this.text);

    matches = this.lookahead(matches, /[0-9]+ *[ap]\.*m*\.*/gi, this.text);
    matches = this.lookbehind(matches, /[0-9]/, this.text);

    return this.filterTimes(matches);
  },

  parseTimesByAmPm: function () {
    var matches = this.matches(this.amPmDes, this.text);

    matches = this.lookbehind(matches, /[0-9\:]/, this.text);
    
    return this.filterTimes(matches);
  },

  filterTimes: function (timesArr) {
    return _.filter(timesArr, _.bind(function (wordProps) {
      return this.timeRe.test(wordProps.word);
    }, this));
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