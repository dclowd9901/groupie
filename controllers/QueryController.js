var scrape = require('../util/ScrapingUtils'),
    _      = require('lodash'),
    events = require('../util/EventsAnalyzer');

module.exports = {
  
  set: function (app) {

    app.get('/query/page/', _.bind(function (req, res) {
      var url = req.query.url;

      scrape.page(url)
        .done(_.bind(function (rawScrape) {

          this.handleRawScrape(rawScrape, res);
        }, this));
    }, this));
  },

  handleRawScrape: function (rawScrape, res) {
    var rawText = scrape.stripHTML(scrape.bodyOnly(rawScrape));
        //res.send(rawText);

    res.send(events.parseEvents(rawText));
  }
};

//page->query->get page->scrape page->separate events->get show time->get show title->get bands->compile into a collection->store

/*
{
  venueName: 'Rickshaw Stop',
  events: [{
    title: 'Event Title',
    bands: [{
      name: 'Band1'
    }],
    date: 89258925872
  }]
}
*/