module.exports = {

  tokenizeExp: /.*/i, // /[\$0-9\.]/i,

  set: function (text) {
    this.text = text;
  },

  // Words can be made up of characters and punctuation, such as
  // [a-zA-Z]+
  tokenize: function (text) {}
};