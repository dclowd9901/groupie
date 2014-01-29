var _ = require('lodash');
    
module.exports = {

  dateHeatMap: {},
  timeHeatMap: {},

  cachedSplitText: null,

  parseDates: function () {
    var datesRe = new RegExp('/');

    _.each(this.cachedSplitText, _.bind(function (value, key, all) {
      var result = this.testFor(value, key, all, datesRe, _.bind(this.testAroundSlash, this));
      
      if (result) {
        this.dateHeatMap[key] = result;
      }
    }, this));

    return this.dateHeatMap;
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

    if (result.start === result.end) {
      return false;
    } else {
      return result;
    }
  },

  testAroundColon: function (i, blobArr) {
    var result = this.testAround(i, 
                                 blobArr, 
                                 // Test for numbers preceding colons and other colons
                                 new RegExp('[0-9]', 'i'), 
                                 // test for numbers, spaces and a/p/m/.
                                 new RegExp('[0-9\\sap\\.m]', 'i'));

    if (result.start === result.end) {
      return false;
    } else {
      return result;
    }
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
        start,
        end,
        reForward = reForward ? reForward : reBackwardAndForward;

    while (found) {
      backward--;

      if (!reBackwardAndForward.test(blobArr[backward])) {
        start = backward + 1;
        found = false;
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
      }
    }

    if (end === i) {
      return {start: i, end: i};
    }

    return {start: start, end: end};
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