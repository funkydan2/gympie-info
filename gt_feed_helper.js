"use strict";
var parseFeed = require("feed-read-parser");
var _ = require("lodash");

const URL = "https://www.gympietimes.com.au/feeds/rss/homepage/";
const vURL = "gympie times dot com dot a u";

function getFeed() {
  return new Promise(function(resolve, reject) {
    parseFeed(URL, (err, articles) => {
      if (err) {
        console.error("Parsing error", err);
        reject(err);
      }

      console.log("Feed Retrieved!");
      resolve(articles);
    });
  });
}

function GympieTimesHelper() {}

GympieTimesHelper.prototype.getArticles = function(number) {
  //Returns an SSML formatted string with the text of the 'number' of articles.
  return getFeed()
    .then(function(articles) {
      if (_.isUndefined(number)) {
        number = 1;
      }

      var prompt =
        "Latest articles from the Gympie Times.<break strength='x-strong'/>";

      for (var i = 0; i < number; i++) {
        prompt +=
          "<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_bell_short_chime_03.mp3'/>";
        prompt += articles[i].title + "<break strength='strong'/>";
        prompt += articles[i].content + "<break strength='x-strong'/>";
      }
      prompt +=
        "<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_bell_short_chime_03.mp3'/>";
      prompt +=
        "For more information, grab a copy of the Gympie Times, or visit " +
        vURL;

      return prompt;
    })
    .catch(function(error) {
      console.log("Failed", error);
      return error;
    });
};

GympieTimesHelper.prototype.getHeadlines = function(number) {
  //Returns an SSML formatted string with the text of the 'number' of headlines.
  return getFeed()
    .then(function(articles) {
      if (_.isUndefined(number)) {
        number = 1;
      }

      var prompt =
        "Latest headlines from the Gympie Times.<break strength='x-strong'/>";

      for (var i = 0; i < number; i++) {
        prompt +=
          "<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_bell_short_chime_03.mp3'/>";
        prompt += articles[i].title + "<break strength='x-strong'/>";
      }
      prompt +=
        "<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_bell_short_chime_03.mp3'/>";
      prompt +=
        "For more information, grab a copy of the Gympie Times, or visit " +
        vURL;

      console.log(prompt);
      return prompt;
    })
    .catch(function(error) {
      console.log("Failed", error);
      return error;
    });
};

module.exports = GympieTimesHelper;
