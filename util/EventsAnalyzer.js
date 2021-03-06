var _ = require('lodash'),
    datetime = require('./DateTimeParser'),
    noise    = require('./NoiseFilter'),
    ticketCost = require('./CostParser');
    
module.exports = {

  dateHeatMap: {},
  timeHeatMap: {},

  cachedSplitText: null,

  parseEvents: function (rawText) {

    this.cachedSplitText = rawText.split('');
    datetime.set(rawText);
    datetime.initialize();
    this.colorize(datetime.dateHeatMap, 'red');
    this.colorize(datetime.timeHeatMap, 'red');

    noise.set(rawText);
    noise.initialize();
    console.log(noise.toString());
    this.colorize(noise.heatMap(), 'blue');

    ticketCost.set(rawText);
    ticketCost.initialize();
    this.colorize(ticketCost.heatMap(), 'green');

    return this.cachedSplitText.join('');
  },

  colorize: function (heatMap, color) {
    _.each(heatMap, _.bind(function (v, k) {
      this.cachedSplitText[v.start] = '<span style="color:' + color + '">' + this.cachedSplitText[v.start];
      this.cachedSplitText[v.end] = this.cachedSplitText[v.end] + '</span>';
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
// times are useless without dates, but a date can have two (or more) times
// times will almost certainly be within {10} characters of a date