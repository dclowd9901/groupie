var http = require('http'),
    url  = require('url'),
    q    = require('q'),
    _    = require('lodash'),
    cheerio = require('cheerio');

module.exports = {

  page: function (pageUrl) {
    return this.sendRequest(url.parse(pageUrl));    
  },

  sendRequest: function (options) {
    var result = q.defer(),
        blob = '';

    http.request(options, function (res) {
      
      res.setEncoding('utf8');
      
      res.on('data', function (chunk) {
        blob += chunk;
      });
      
      res.on('end', function () {
        result.resolve(blob);
      });
    
    }).on('error', function (e) {
      console.log("Got error: " + e.message);
    }).end();

    return result.promise;
  },

  bodyOnly: function (html) {
    var $ = cheerio.load(html);
    $('script').remove();

    return $('body').html();
  },

  stripHTML: function (string) {
    return string.replace(/<(?:.|\n)*?>/gm, ' ');
  }
};


