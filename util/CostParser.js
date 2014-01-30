module.exports = {

  tokenizedMoneyMap: [],

  currency: '\\$',
  punctuation: '\\$\\.\\-\\s',

  set: function (text) {
    this.text = text;
  },

  initialize: function () {
    this.tokenize(this.text);
  },

  eliminateWhiteSpacesAfterCurrency: function (text) {
    text = text || this.text;
    return text.replace(/\$\s*/g, '$');
  },

  // Should return an array of this object
  // {
  //   word: 'sample',
  //   start: 1234
  //   end : 1239
  // }
  tokenize: function (text) {
    text = text || this.text;
    this.cachedSplitText = text.split('');

    var i, len = this.cachedSplitText.length,
      st = this.cachedSplitText,
      capturingMoney = false,
      currencyRe = new RegExp(this.currency),
      numberRe = new RegExp('[0-9' + this.punctuation + ']'),
      start, end,
      wordMemo;

    for (i = 0; i < len; i++) {
      if (!capturingMoney) {
        if (currencyRe.test(st[i])) {
          capturingMoney = true;
          start = i;
          wordMemo = st[i];
        }
      } else {
        if (!numberRe.test(st[i])) {
          capturingMoney = false;

          this.tokenizedMoneyMap.push({
            start : start,
            end : i-1,
            word : wordMemo
          });

          wordMemo = null;
        } else {
          wordMemo += st[i];
        }   
      }   
    }
  },

  heatMap: function () {
    return this.tokenizedMoneyMap;
  }
};