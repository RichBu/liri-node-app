

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
    spotifySearch: 'spotify-this-song',
    movieSearch: 'movie-this'
};


require("dotenv").config();
var keys = require("./keys.js");
var Twitter = require('twitter');
var inquirer = require("inquirer");
var Spotify = require('node-spotify-api');

//var spotify = new SpotifyObj(keys.spotify);
var client = new Twitter(keys.twitter);
var spotify = new Spotify(keys.spotify);


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
    writeLogFile(msgIn, "C");
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
    tweetSend = "auto-gen liri: " + tweetSend;
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




        //        spotifySong_done(error,data);
    });
};


var spotifySong_done = function (error, data) {
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
	var search;
	if (movie === '') {
		search = 'Mr. Nobody';
	} else {
		search = movie;
	}

	// Replace spaces with '+' for the query string
	search = search.split(' ').join('+');

	// Construct the query string
	var queryStr = 'http://www.omdbapi.com/?t=' + search + '&plot=full&tomatoes=true&apikey='+keys.OMDB;

	// Send the request to OMDB
	request(queryStr, function (error, response, body) {
		if ( error || (response.statusCode !== 200) ) {
			var errorStr1 = 'ERROR: Retrieving OMDB entry -- ' + error;

			// Append the error string to the log file
			fs.appendFile('./log.txt', errorStr1, (err) => {
				if (err) throw err;
				console.log(errorStr1);
			});
			return;
		} else {
			var data = JSON.parse(body);
			if (!data.Title && !data.Released && !data.imdbRating) {
				var errorStr2 = 'ERROR: No movie info retrieved, please check the spelling of the movie name!';

				// Append the error string to the log file
				fs.appendFile('./log.txt', errorStr2, (err) => {
					if (err) throw err;
					console.log(errorStr2);
				});
				return;
			} else {
		    	// Pretty print the movie information
		    	var outputStr = '------------------------\n' + 
								'Movie Information:\n' + 
								'------------------------\n\n' +
								'Movie Title: ' + data.Title + '\n' + 
								'Year Released: ' + data.Released + '\n' +
								'IMBD Rating: ' + data.imdbRating + '\n' +
								'Country Produced: ' + data.Country + '\n' +
								'Language: ' + data.Language + '\n' +
								'Plot: ' + data.Plot + '\n' +
								'Actors: ' + data.Actors + '\n' + 
								'Rotten Tomatoes Rating: ' + data.tomatoRating + '\n' +
								'Rotten Tomatoes URL: ' + data.tomatoURL + '\n';

				// Append the output to the log file
				fs.appendFile('./log.txt', 'LIRI Response:\n\n' + outputStr + '\n', (err) => {
					if (err) throw err;
					console.log(outputStr);
				});
			}
		}
	});

};


var evalCommand = function (cmdIn) {
    //function to evaluate an incoming command

    var cd = commandsData; //shortcut notation

    switch (cmdIn) {
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
        case cd.tweetSend:
            sendTweet_start(cmdParam);
            break;
        case cd.tweetSearch:
            break;
        case cd.spotifySearch:
            spotifySong_start(cmdParam);
            break;
        case cd.movieSearch:
            break;
    };
};


//main loop is here
var cmdLineArgs = process.argv;
var cmdReadIn = cmdLineArgs[2];
var cmdParam = "";
for (var i = 3; i < cmdLineArgs.length; i++) {
    if (!(i === 3)) {
        //if it is not the first parameter, then add space
        cmdParam += "+";
    };
    cmdParam += cmdLineArgs[i];
};

//make all lower case just in case
if (cmdReadIn === "" || cmdReadIn === null || cmdReadIn === undefined) {
    writeOutput("no line command parameters", "C");
    writeOutput("switching to screen input");
    inquirer
        .prompt([
            // Here we create a basic text prompt.
            // Here we give the user a list to choose from.
            {
                type: "list",
                message: "Which commannd do you want to run",
                choices: ["read tweets", "send tweets", "search spotify", "search movie title"],
                name: "cmdList"
            },
            {
                type: "input",
                message: "What title / string ",
                name: "searchString",
            },
            // Here we ask the user to confirm.
            {
                type: "confirm",
                message: "Are you sure ",
                name: "confirm",
                default: true
            }
        ])
        .then(function (inquireResponse) {
            // If the inquirerResponse confirms, we displays the inquirerResponse's username and pokemon from the answers.
            if (inquireResponse.confirm) {
                var cd = commandsData;  //for short hand notation
                cmdParam = inquireResponse.searchString.trim();
                pickedCmd = inquireResponse.cmdList.trim();
                switch (pickedCmd) {
                    case "read tweets":
                        cmdReadIn = cd.tweetRead;
                        break;
                    case "send tweets":
                        cmdReadIn = cd.tweetSend;
                        break;
                    case "search spotify":
                        cmdReadIn = cd.spotifySearch;
                        break;
                    case "search movie title":
                        cmdReadIn = cd.movieSearch;
                        break;
                };
                evalCommand(cmdReadIn);
            }
            else {
                writeLogFile("user aborted", "W");
                writeOutput("Thanks for stopping by");
            };
        });

} else {
    cmdReadIn = cmdReadIn.toLowerCase();
    evalCommand(cmdReadIn);
};

