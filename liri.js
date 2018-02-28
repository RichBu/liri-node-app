

var configData = {  //location of files and accounts
    logFile: "./log.txt",
    twitterAcctName: "RTwitAccount",
    twitterNumTweets: 10,
    EOR: ""                //place keeper
};

var commandsData = {  //all of the line commands
    help: "?",
    tweetRead: 'my-tweets',
    tweetSend: 'send-tweet',
    tweetSearch: 'search-tweet',
    spotifyPlay: 'spotify-this-song',
    movieSearch: 'movie-this'
};


require("dotenv").config();
var keys = require("./keys.js");
var Twitter = require('twitter');
//var Spotify = require('spotify');

//var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

//var OMDB_key = new OMDB(keys.OMDB);

//writeOutput(client);
//writeOutput(keys.twitter);

var writeLogFile = function (msgIn, type) {
    //this is where messages get logged
    //make sure to put \n at end of msgIn
    //if type = 
    // "E" then error
    // "W" = warning
    // "C" = console output
};


var writeOutput = function (msgIn, type) {
    console.log(msgIn);
    writeLogFile( msgIn, "C");
};


var getTweets_start = function () {
    var params = { screen_name: configData.twitterAcctName, count: configData.twitterNumTweets };
    writeLogFile("REQ tweets");
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (error) {
            writeOutput(error);
            writeLogFile("reading tweets", "E");
        } else {
            //valid tweets
            writeLogFile("received tweeets correctly");
            getTweets_done(tweets);
        };
    });
};


var getTweets_done = function (tweetsIn) {
    var numTweets = tweetsIn.length;
    writeLogFile("tweet output to screen :");
    var outputStr = "User tweets:\n";
    writeOutput(outputStr);
    outputStr = "number of tweets found = " + numTweets + "\n";
    writeOutput(outputStr);
    for (var i = 0; i < numTweets; i++) {
        outputStr = "#" + i + ": \n";
        outputStr += "    " + tweetsIn[i].text + "\n";
        outputStr += "    " + tweetsIn[i].created_at + "\n";
        writeLogFile(":" + outputStr);
        writeOutput(outputStr);
    };
};


var sendTweet_start = function (tweetSend) {
    params = { status: tweetSend };
    client.post('statuses/update', params, function (error, tweet, response) {
        if (!error) {
            writeOutput(tweet);
        }
    });
};

var searchTweet_start = function (subjSearch) {
    param = { q: subjSearch };

    client.get('search/tweets', param, function (error, tweets, response) {
        writeOutput(tweets);
    });
};


var spotifySong_start = function (songIn) {
    //takes song in and spotifies it
    var search;
    if (songIn === '') {   //check if null
        writeLogFile("no song specified. using default", "W"); //warning
        search = 'I am not your fool';
    } else {
        search = songIn;
    };

    writeLogFile("REQ spotify");
    var params = { type: 'track', query: search };
    spotify.search(params, function (error, data) {
        //search is done
        spotifySong_done();
    });
};


var spotifySong_done = function () {
    //spotify search back from async search
    writeLogFile("spotify retrieve done");
    if (error) {
        writeLogFile("retrieving Spotify track", "E", error);
    } else {
        var songInfo = data.tracks.items[0];
        if (!songInfo) {
            writeLogFile("no song found", "E");
            writeOutput("... no song found ... check your spelling");
            return;
        } else {
            //valid song found 
            var outputStr = '------------------------\n' +
                'Song Information:\n' +
                '------------------------\n\n' +
                'Song Name: ' + songInfo.name + '\n' +
                'Artist: ' + songInfo.artists[0].name + '\n' +
                'Album: ' + songInfo.album.name + '\n' +
                'Preview Here: ' + songInfo.preview_url + '\n';
            writeOutput(outputStr);
        };
    };
};


var OMDBsearch_start = function (movieIn) {

};


//main loop is here
var cmdLineArgs = process.argv;
var cmdReadIn = cmdLineArgs[2];
console.log( cmdReadIn);
var cmdParam = "";
for (var i = 2; i < cmdLineArgs.length; i++) {
    if (!(i === 2)) {
        //if it is not the first parameter, then add space
        cmdParam += " ";
    };
    cmdParam += cmdLineArgs[i];
};
//make all lower case just in case
cmdReadIn = cmdReadIn.toLowerCase();
var cd = commandsData; //shortcut notation

switch (cmdReadIn) {
    case cd.help:
        var outputStr = "help command:";
        writeOutput(outputStr, "C");
        outputStr = "help=          '" + cd.help + "'";
        writeOutput(outputStr, "C");
        outputStr = "read tweets=   '" + cd.tweetRead + "'";
        writeOutput(outputStr, "C");
        outputStr = "send tweet=    '" + cd.tweetSend + "' + tweet to send";
        writeOutput(outputStr, "C");
        outputStr = "search tweets= '" + cd.tweetSearch + "' + tweet search string";
        writeOutput(outputStr, "C");
        outputStr = "(by subject)";
        writeOutput(outputStr, "C");
        outputStr = "spotify=       '" + cd.spotifyPlay + "' + song title to play";
        writeOutput(outputStr, "C");
        outputStr = "movie search=  '" + cd.movieSearch + "'";
        writeOutput(outputStr, "C");
        outputStr = "(by title)";
        writeOutput(outputStr, "C");
        break;
    case cd.tweetRead:
        getTweets_start();
        break;
    case cd.tweetSend(cmdParam):
        break;
    case cd.tweetSearch:
        break;
    case cd.spotifyPlay:
        break;
    case cd.movieSearch:
        break;
};

