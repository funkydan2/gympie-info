'use strict';
var parsePodcast = require('node-podcast-parser');
var request = require('request');
var _ = require('lodash');


const URI = "http://ccr.sermon.net/rss/main/audio";

function getPodcast(){
	return new Promise (function (resolve, reject) {
		request(URI, (err, res, data) => {
 			if (err) {
		    	console.error('Network error', err);
			    reject (err);
  			}

			parsePodcast(data, (err, data) => {
    			if (err) {
    	  			console.error('Parsing error', err);
      				reject (err);
    			}

    			console.log("Podcast Retrieved:", data.title);
    			resolve (data);
  			})
		})
	})
}


function MinistrySpotHelper () {}

MinistrySpotHelper.prototype.getEpisodeURL = function(episode) {
	return getPodcast().then(function(pod){
    if (_.isUndefined(episode)) { episode = 0; }
		  var URL = pod.episodes[episode].enclosure.url.replace('http://', 'https://');
      console.log("URL", URL)
		  return URL;
	  }).catch(function (error) {
      console.log('Failed', error);
			return error;
  })
}

MinistrySpotHelper.prototype.getTitle = function(episode) {
	return getPodcast().then(function(pod){
		if (_.isUndefined(episode)) { episode = 0; }
    return pod.episodes[episode].title;
	}).catch(function (error) {
      console.log('Failed', error);
			return error;
  })
}

MinistrySpotHelper.prototype.getDate = function(episode) {
	return getPodcast().then(function(pod){
		if (_.isUndefined(episode)) { episode = 0; }
    return pod.episodes[episode].published;
	}).catch(function (error) {
      console.log('Failed', error);
			return error;
  })
}

MinistrySpotHelper.prototype.getEpisode = function(episode) {
  //This function will return an object with a pre-roll string and the URL of the episode
  return getPodcast().then(function(pod){
    if (_.isUndefined(episode)) {episode = 0; }   
 
    var prompt = "This is a ministry spot from Cooloola Christian Radio called " + pod.episodes[episode].title 
                  + " it was aired on " + pod.episodes[episode].published.toDateString();
    
    //Alexa has to download the MP3 file over https
    var mp3URL = pod.episodes[episode].enclosure.url.replace('http://', 'https://');
    
    var podcast = {preRoll : prompt, mp3URL :  mp3URL};
    return podcast;
  }).catch(function (error) {
      console.log('Failed', error);
			return error;
  })
}                                                 

module.exports = MinistrySpotHelper;