var natural = require('natural'),
    _       = require('lodash');

module.exports = {
  
  text: '',
  tokenizedText: [],
  wordFrequencyMap: {},

  tokenizer: new natural.WordTokenizer(),

  set: function (text) {
    this.text = text;
  },

  initialize: function () {
    this.tokenize(this.text);
    this.analyzeWordFrequency(this.tokenizedText);
    this.calculateSaturation(this.wordFrequencyMap);
    this.calculateMinMaxAvgRange(this.wordFrequencyMap);
    this.getFrequencyMedianMode(this.wordFrequencyMap);
  },

  heatMap: function (map) {
    var alreadyHighlighted = false,
        i, len = this.tokenizedText.length,
        start = -1,
        heatMap = [];

    for (i = 0; i < len; i++) {
      var word = this.tokenizedText[i].word;

      if (this.wordFrequencyMap[word].count < this.avg) {
        if (!alreadyHighlighted) {
          start = this.tokenizedText[i].start;
          alreadyHighlighted = true;
        }
      } else {
        if (alreadyHighlighted) {
          heatMap.push({
            start : start,
            end : this.tokenizedText[i].end
          });
          start = -1;
          alreadyHighlighted = false;
        }
      }
    }

    return heatMap;
  },

  // Words can be made up of characters and punctuation, such as
  // [a-zA-Z]+
  tokenize: function (text) {
    text = text || this.text;

    var splitText = text.split(''),
        i = 0, len = splitText.length,
        tokenizedText = [],
        memo,
        start = end = -1,
        re = /[\w\']+/;

    while (i < len) {

      // If it's a letter
      if (re.test(splitText[i])) {

        // and if we don't have a word yet,
        // start one
        if (start === -1) {
          start = i;
          memo = splitText[i];
        } else {
          // if we do, add to it
          memo += splitText[i];
        }
      // If it's not
      } else {

        // and we have a word
        if (start !== -1) {
          // mark its ending position
          end = i-1;

          // record its information
          tokenizedText.push({
            word: memo,
            start: start,
            end: end
          });

          // and reset
          memo = '';
          start = -1;
          end = -1
        }
      }

      i++;
    }

    return this.tokenizedText = tokenizedText;
  },

  analyzeWordFrequency: function (tokenizedText) {
    
    tokenizedText = tokenizedText || this.tokenizedText;

    _.each(tokenizedText, _.bind(function (wordProps) {
      var word = wordProps.word;

      if (!this.wordFrequencyMap[word]) {
        this.wordFrequencyMap[word] = {
          locations : [{
            start: wordProps.start,
            end: wordProps.end
          }],
          count : 1,
          word : word
        }
      } else {
        this.wordFrequencyMap[word].locations.push({
          start: wordProps.start,
          end: wordProps.end
        });
        this.wordFrequencyMap[word].count++;
      }
    }, this));

    return this.wordFrequencyMap;
  },

  calculateSaturation: function (wordFrequencyMap) {
    var numOfWords = _.size(wordFrequencyMap);

    wordFrequencyMap = wordFrequencyMap || this.wordFrequencyMap;
    this.calculateMinMaxAvgRange(wordFrequencyMap);
  },

  calculateMinMaxAvgRange: function (wordFrequencyMap) {
    
    var max = min = 1,
        sum = 0;

    _.each(wordFrequencyMap, _.bind(function (wordProps, key, all) {
      var ct = wordProps.count;

      if (ct < min) {
        min = ct;
      }

      if (ct > max) {
        max = ct;
      }

      sum += ct
    }, this));

    this.min = min;
    this.max = max;
    this.range = this.max - this.min;
    this.avg = sum / _.size(wordFrequencyMap);
  },

  getFrequencyMedianMode: function (wordFrequencyMap) {
    wordFrequencyMap = wordFrequencyMap || this.wordFrequencyMap;

    var sortedByCount = _.sortBy(wordFrequencyMap, 'count'),
        halfLen = _.size(sortedByCount)/2;

    //this.median = _.at(sortedByCount, halfLen)[0].count;
    this.mode = this.calculateMode(wordFrequencyMap);
  },

  calculateMode: function (wordFrequencyMap) {
    var countOfCounts = {},
        groupedWFM,
        sortedGroupedWFM;

    wordFrequencyMap = wordFrequencyMap || this.wordFrequencyMap;

    groupedWFM = _.groupBy(wordFrequencyMap, function (wordProps) {
      return wordProps.count;
    });

    sortedGroupedWFM = _.sortBy(groupedWFM, function (group) {
      return _.size(group);
    });

    return _.last(sortedGroupedWFM)[0].count;
  },

  toString: function () {
    return 'min: ' + this.min + 
           '; max: ' + this.max +
           '; avg: ' + this.avg + 
           '; median: ' + this.median +
           '; mode: ' + this.mode + 
           '; range: ' + this.range;
  },

  toObj: function () {
    return {
      min: this.min,
      max: this.max,
      avg: this.avg,
      median: this.median,
      mode: this.mode,
      range: this.range
    }
  }
};

// Word saturation?
// it's a histogram, but a bit brainier
