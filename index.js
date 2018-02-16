'use strict';
module.change_code = 1;
var _ = require('lodash');
var express = require('express');
var alexa = require('alexa-app');
var app = express();
    // Setup the alexa app and attach it to express before anything else.
    //alexaApp = new alexa.app("");
var alexaApp = new alexa.app('');

//My Helper Objects
var MSHelper = require('./ministryspot_helper');

const PORT = process.env.PORT || 3000;
const ccrStream = "https://cdn.glitch.com/1fc8b6f7-74b9-4809-8bc3-886916bfcf80%2Flisten.aac.m3u?1518817626288";


// POST calls to / in express will be handled by the app.request() function
alexaApp.express({
  expressApp: app,
  checkCert: true,
  // sets up a GET route when set to true. This is handy for testing in
  // development, but not recommended for production.
  debug: true
});

app.set("view engine", "ejs");

alexaApp.launch(function(req, res) {
  var prompt = 'Welcome to the Gympie Information and News Skill. You can say something like <emphasis level="moderate">what\'s the news,</emphasis> or <emphasis level="moderate">play radio</emphasis>.';
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});


alexaApp.intent('ministryspot', {
    'slots': {},
    'utterances': ['{play|listen to} {ministry spot}']
  },
  function(req, res) {
    // retrieve the podcast Mpeg enclosure from the RSS feed
    var podcast = new MSHelper();

    //Since this is the first request for a sermon, get the latest episode '0'
    return podcast.getEpisodeURL(0).then(function(URL) {
      var stream = {
        url: URL,
        token: "ministryspot:" + 0,
        offsetInMilliseconds: 0
      }
            
      res.audioPlayerPlayStream('REPLACE_ALL', stream).send();
    });
  }
);

alexaApp.intent('ccr', {
    'slots': {},
    'utterances': ['{play|listen to} {|cooloola christian} {radio}']
  },
  function(req, res) {
    console.log("Playing Radio");
    var stream = {
        //url: "https://www.cooloolachristianradio.com.au/listen.aac.m3u",
        url: ccrStream,
        token: "ccr",
        offsetInMilliseconds: 0
    }
            
    res.audioPlayerPlayStream('REPLACE_ALL', stream).send();
    return;
  }
);


alexaApp.intent('AMAZON.NextIntent', {},
  function(req, res) {
    // retrieve the podcast Mpeg enclosure from the RSS feed
    var podcast = new MSHelper();
console.log("Token: ", req.context.AudioPlayer.token);
    if ( _.isUndefined(req.context.AudioPlayer.token) ) {
      res.say("Something has gone wrong skipping to the next spot!").send();
      return;
    }
    else {
          var token = req.context.AudioPlayer.token.split(":");
          var stream = token[0];
          var episode = Number(token[1]);
    }
  
    if (stream != 'ministryspot') {
      res.say("<emphasis level='moderate'>Next</emphasis> is not support for this audio.").send();
      return;
    }
    
    if ( episode < 9 ) {
      var nextEp = episode + 1;
    }
    else {
      res.say("No more ministry spots here. For more ministry spots, visit Cooloola Christian Radio\'s website.").send();
      return;
    }
  
    return podcast.getEpisodeURL(nextEp).then(function(URL) {
      var stream = {
        url: URL,
        token: "ministryspot:" + nextEp,
        offsetInMilliseconds: 0
      }      
      res.audioPlayerPlayStream('REPLACE_ALL', stream).send();
    });
});

alexaApp.intent('AMAZON.PreviousIntent', {},
  function(req, res) {
    // retrieve the podcast Mpeg enclosure from the RSS feed
var podcast = new MSHelper();
                  
    if ( _.isUndefined(req.context.AudioPlayer.token) ) {
      res.say("Something has gone wrong skipping to the previous spot!").send();
      return;
    }
    else {
          var token = req.context.AudioPlayer.token.split(":");
          var stream = token[0];
          var episode = Number(token[1]);
    }
  
    if (stream != 'ministryspot') {
      res.say("<emphasis level='moderate'>Previous</emphasis> is not support for this audio.").send();
      return;
    }
    
    if ( episode > 0 ) {
      var prevEp = episode - 1;
    }
    else {
      res.say("No more ministry spots here. For more ministry spots, visit Cooloola Christian Radio\'s website.").send();
      return;
    }
  
    return podcast.getEpisodeURL(prevEp).then(function(URL) {
      var stream = {
        url: URL,
        token: "ministryspot:" + prevEp,
        offsetInMilliseconds: 0
      }      
      res.audioPlayerPlayStream('REPLACE_ALL', stream).send();
    });
});


alexaApp.intent('AMAZON.PauseIntent', {},
  function(req, res) {
    console.log('app.AMAZON.PauseIntent');
    res.audioPlayerStop().shouldEndSession(false).send();
  }
);

alexaApp.intent('AMAZON.ResumeIntent', {},
  function(req, res) {
    console.log('app.AMAZON.ResumeIntent');  
    if (req.context.AudioPlayer.offsetInMilliseconds > 0 &&
      req.context.AudioPlayer.playerActivity === 'STOPPED') {
      
        var token = req.context.AudioPlayer.token.split(":");
        if (token[0] == "ministryspot") {
          var episode = token[1];
          var podcast = new MSHelper();
      
          return podcast.getEpisodeURL(episode).then(function(URL) {
            res.audioPlayerPlayStream('REPLACE_ALL', {
              token: "ministryspot:" + episode,
              url: URL,
              offsetInMilliseconds: req.context.AudioPlayer.offsetInMilliseconds
            });
          });
        }
      else if (token[0] == "ccr") {
        //resume streaming radio
        var stream = {
          url: ccrStream,
          token: "ccr",
          offsetInMilliseconds: 0
        }
            
      res.audioPlayerPlayStream('REPLACE_ALL', stream).send();
      }
    }
});

alexaApp.intent("AMAZON.HelpIntent", {
    "slots": {},
    "utterances": []
  },
  function(req, res) {
    var helpOutput = "Welcome to the Gympie Information and News skill. You can listen to a ministry spot by saying <emphasis level='moderate'>play ministry spot</emphasis>.";  

    var reprompt = "What would you like to do?";
    // AMAZON.HelpIntent must leave session open -> .shouldEndSession(false)
    res.say(helpOutput).reprompt(reprompt).shouldEndSession(false);
  }
);

alexaApp.intent("AMAZON.StopIntent", {
    "slots": {},
    "utterances": []
  }, function(req, res) {
    var stopOutput = "Good bye. Thanks for using Gympie Info on Alexa.";
    res.say(stopOutput);
  }
);

alexaApp.intent("AMAZON.CancelIntent", {
    "slots": {},
    "utterances": []
  }, function(req, res) {
    var cancelOutput = "No problem. Request cancelled.";
    res.say(cancelOutput);
  }
);


module.exports = alexaApp;
app.listen(PORT, () => console.log("Listening on port " + PORT + "."));