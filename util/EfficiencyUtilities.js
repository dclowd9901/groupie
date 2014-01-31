var _ = require('lodash');

module.exports = {
  HashSet: function () {
    return {
      values : {},

      setHashFunc : function (hashFunc) {
        this.hashFunc = hashFunc;
      },

      add : function (value) {
        this.values[this.hashFunc(value)] = value;
      },

      remove : function (hash) {
        delete this.values[hash];
      },

      contains : function (hash) {
        return (this.values[hash] !== undefined);
      },

      get : function (hash) {
        return this.values[hash];
      }
    };
  },

  intersection: function (hashFunc) {
    var hashSets = this.createHashSets(hashFunc, arguments),
        i, len = hashSets.length,
        matches = [];

    // Loop through each hashSet
    for (i = 0; i < len; i++) {

      // Go through each item in the hashset and see if you can find
      // it among the other hashsets in the array, then return the 
      // deduped array
      matches = _.filter(hashSets[i].values, _.bind(function (v, k) {
        return this.checkRight(hashSets, function (a, b) {
          return b.contains(k);
        });
      }, this));
    }

    return matches;
  },

  /**
   * @method checkRight
   * 
   * If a value tests truthy across all collections,
   * checkRight returns true.
   *
   * @param arr {array} - Array of collections to test
   * @param index {integer} - memo

   */
  checkRight: function (arr, func, index) {
    index = index || 0;

    // If function returns truthy
    if (func(arr[index], arr[index+1])) {

      // If 'right' array exists
      if (arr[index+2]) {

        // continue dive
        return this.checkRight(arr, index+1, func);
      } else {

        // if this is the last one, stop here and return
        return true;
      }
    } else {
      // If it doesn't return truthy, return false
      return false;
    }
  },

  createHashSets: function (hashFunc, arraysObj) {
    var hashsets = [];

    _.each(arraysObj, _.bind(function (thisArray, k) {
      var i, len = thisArray.length,
          hashset = new this.HashSet();

      hashset.setHashFunc(function (value) {
        return value.word + value.start;
      });

      for (i = 0; i < len; i++) {
        hashset.add(thisArray[i]);
      }

      hashsets.push(hashset);
    }, this));

    return hashsets
  }  
};