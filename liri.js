

var configData = {  //location of files and accounts
    logFile: "./log.txt",
    inputFile: "./random.txt",
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
    movieSearch: 'movie-this',
    commFromFile: 'do-what-it-says',
    resetLogFile: 'reset-log',
    quitProgram: 'quit'
};


require("dotenv").config();
var keys = require("./keys.js");
var Twitter = require('twitter');
var inquirer = require("inquirer");
var Spotify = require('node-spotify-api');
var request = require('request')
var fs = require('fs');

//var spotify = new SpotifyObj(keys.spotify);
var client = new Twitter(keys.twitter);
var spotify = new Spotify(keys.spotify);



var getDateTime = function () {
    //returns current date/time for time stamping the log file
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

};


var writeLogFile = function (msgIn, type) {
    //this is where messages get logged
    //make sure to put \n at end of msgIn
    //if type = 
    // "E" then error
    // "W" = warning
    // "C" = console output

    var outStr = "";
    switch (type) {
        case "E":
            outStr = "\n";
            outStr += "[" + getDateTime() + "]";
            outStr += " ERROR ---" + msgIn + "\n";
            break;
        case "N":
            outStr = "\n\n";
            outStr += "[" + getDateTime() + "]";
            outStr += "--- NEW RUN ---" + msgIn + "\n";
            break;
        case "P":
            outStr = "\nCommand picked --- " + msgIn + "\n";
            break;
        case "W":
            outStr = "\n";
            outStr += "[" + getDateTime() + "]";
            outStr += " Warning ---" + msgIn + "\n";
            break;
        case "CF":  //console output with a footer
            outStr = msgIn + "\n";
            outStr += "===================================\n";
            break;
        case "CH":  //console output with a header
            outStr = "===================================\n";
            outStr += msgIn + "\n";
            break;
        default:
            outStr = msgIn + "\n";
    };
    // Append the output to the log file
    fs.appendFile(configData.logFile, outStr, function (err) {
        if (err) {
            //can't error, because problem is with log file !!!
            console.log('error with log file.  error=' + err);
            throw err;
        };
    });
};


var writeOutput = function (msgIn, type) {
    //writes to both the console and the log file
    //slightly different output to console.  rely on \n
    var outStr = "";
    switch (type) {
        case "E":
            outStr = "\n--- ERROR :" + msgIn + "\n\n";
            break;
        case "W":
            outStr = "\n--- Warning :" + msgIn + "\n\n";
            break;
        case "CF":
            outStr = msgIn + "\n";
            outStr += "===================================\n";
            break;
        case "CH":
            outStr = "===================================\n";
            outStr += msgIn + "\n";
            break;
        default:
            outStr = msgIn + "\n";
    };
    console.log(outStr);
    writeLogFile(msgIn, type);
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
    writeOutput(outputStr, "CH");
    outputStr = "number of tweets found = " + numTweets + "\n";
    writeOutput(outputStr);
    for (var i = 0; i < numTweets; i++) {
        outputStr = "#" + i + ": \n";
        outputStr += "    " + tweetsIn[i].text + "\n";
        outputStr += "    " + tweetsIn[i].created_at + "\n";
        writeOutput(outputStr);
    };
    writeOutput("\n", "CF");
};


var sendTweet_start = function (tweetSend) {
    tweetSend = "auto-gen liri: " + tweetSend;
    params = { status: tweetSend };
    client.post('statuses/update', params, function (error, tweet, response) {
        if (!error) {
            writeOutput("Tweet: '" + tweetSend + "' sent", "C");
        };
    });
};


var searchTweet_start = function (subjSearch) {
    param = { q: subjSearch };

    client.get('search/tweets', param, function (error, tweets, response) {
        if (error) {
            writeOutput(error);
            writeLogFile("searching tweets", "E");
        } else {
            //valid tweets
            writeLogFile("searched tweeets correctly");
            searchTweet_done(tweets);
            //getTweets_done(tweets);
            //console.log(tweetsIn);
        };
    });
};


var searchTweet_done = function (tweetsIn) {
    var numTweets = tweetsIn.statuses.length;
    writeLogFile("tweet search output to screen :");
    var outputStr = "Search tweets:\n";
    writeOutput(outputStr, "CH");
    outputStr = "number of tweets found = " + numTweets + "\n";
    writeOutput(outputStr);
    for (var i = 0; i < numTweets; i++) {
        outputStr = "#" + i + ":   " + tweetsIn.statuses[i].text + "\n";;
        outputStr += "  by: " + tweetsIn.statuses[i].user.screen_name + "\n";
        outputStr += "  at: " + tweetsIn.statuses[i].created_at + "\n";
        writeOutput(outputStr);
    };
    writeOutput("\n", "CF");
};


var spotifySong_start = function (songIn) {
    //takes song in and spotifies it
    var search;
    if (songIn === '') {   //check if null
        writeOutput("no song specified. using default", "W"); //warning
        search = 'the sign ace of base';
    } else {
        search = songIn;
    };

    writeLogFile("REQ spotify");
    var params = { type: 'track', query: search };
    spotify.search(params, function (error, data) {
        //search is done
        spotifySong_done(error, data);
    });
};


var spotifySong_done = function (error, data) {
    //spotify search back from async search
    writeLogFile("spotify retrieve done");
    if (error) {
        writeLogFile("retrieving Spotify track", "W", error);
    } else {
        var songInfo = data.tracks.items[0];
        if (!songInfo) {
            writeLogFile("no song found", "W");
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
    if (movieIn === '') {
        search = '' + '&i=tt0485947';
    } else {
        search = movieIn;
    };

    //take out all the spaces and put in '+'s
    //just in case the movie name snuck in
    search = search.split(' ').join('+');

    // Construct the query string
    var queryStr = 'http://www.omdbapi.com/?t=' + search + '&plot=full&tomatoes=true&apikey=' + keys.OMDB;

    // Send the request to OMDB
    request(queryStr, function (error, response, body) {
        if (error || (response.statusCode !== 200)) {
            writeLogFile("getting HTTP response", "E");
            // Append the error string to the log file
            return;
        } else {
            var data = JSON.parse(body);
            if (!data.Title && !data.Released && !data.imdbRating) {
                writeLogFile("no movie found, check your spelling");
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
                writeOutput(outputStr, "C");
            }
        }
    });
};


var readCommFromFile = function (fileIn) {
    var cd = configData;  //shorthand notation
    var inpFile;
    if (fileIn === "" || fileIn === undefined) {
        //if incoming is blank, then use default
        inpFile = cd.inputFile;
    } else {
        var testString = fileIn;
        if (testString[0] != ".") {
            //first character is not a directory, so add in
            testString = "./" + fileIn;
        }
        inpFile = testString;
    };
    //open and read command from file here
    fs.readFile(inpFile, 'utf8', function (error, data) {
        if (error) {
            writeLogFile("reading from '" + inpFile + "'.", "E");
            writeLogFile("error message = " + error);
            writeOutput("reading from file '" + inpFile + "'. make sure it existis", "E");
            writeOutput("error = " + error);
            return;
        } else {
            // Split out the command name and the parameter name
            var inputString = data.split(',');
            var cmd = inputString[0].trim();
            var param = inputString[1].trim();
            writeLogFile("command read in from file : " + cmd);
            writeLogFile("parameter read in from file : " + param);
            evalCommand(cmd, param); //this is a recursive call
        };
    });
};


var resetLogFile = function () {
    //clear the log file.  prompt first
    inquirer
        .prompt([
            // Here we create a basic text prompt.
            {
                type: "confirm",
                message: "Are you sure you want to PERMANENTLY clear the log file ? ",
                name: "confirm",
                default: true
            }
        ])
        .then(function (inquireResponse) {
            // If the inquirerResponse confirms, we displays the inquirerResponse's username and pokemon from the answers.
            if (inquireResponse.confirm) {
                //delete the file by writing a blank line
                fs.writeFile(configData.logFile, "", function (err) {
                    if (err) {
                        console.log('error with log file.  error=' + err);
                        throw err;
                    } else {
                        writeLogFile("user chose to manually clear the log file", "W");
                    };
                });
            }
            else {
                writeLogFile("user aborted clearing the log file", "W");
                writeOutput("Thanks for stopping by");
            };
        });

};


var evalCommand = function (cmdIn, cmdParamIn) {
    //function to evaluate an incoming command

    var cd = commandsData; //shortcut notation

    switch (cmdIn) {
        case cd.help:
            writeLogFile("help", "P");
            var outputStr = "help command:";
            writeOutput(outputStr, "C");
            outputStr = "help=          '" + cd.help + "'";
            writeOutput(outputStr, "C");
            outputStr = "interactive     " + "no parameters give interactive screen";
            writeOutput(outputStr, "C");
            outputStr = "read tweets=   '" + cd.tweetRead + "'";
            writeOutput(outputStr, "C");
            outputStr = "send tweet=    '" + cd.tweetSend + "' + <tweet to send>";
            writeOutput(outputStr, "C");
            outputStr = "search tweets= '" + cd.tweetSearch + "' + <tweet search string>";
            writeOutput(outputStr, "C");
            outputStr = "(by subject)";
            writeOutput(outputStr, "C");
            outputStr = "spotify=       '" + cd.spotifyPlay + "' + <song title to play>";
            writeOutput(outputStr, "C");
            outputStr = "movie search=  '" + cd.movieSearch + "' + <movie title>";
            writeOutput(outputStr, "C");
            outputStr = "(by title)";
            writeOutput(outputStr, "C");
            outputStr = "read command  ='" + cd.commFromFile + "'";
            writeOutput(outputStr, "C");
            outputStr = "from random.txt";
            writeOutput(outputStr, "C");
            outputStr = "reset log file='" + cd.resetLogFile + "'";
            writeOutput(outputStr, "C");
            break;
        case cd.tweetRead:
            writeLogFile("read tweets", "P");
            getTweets_start();
            break;
        case cd.tweetSend:
            writeLogFile("send tweet", "P");
            sendTweet_start(cmdParamIn);
            break;
        case cd.tweetSearch:
            writeLogFile("search tweet", "P");
            searchTweet_start(cmdParamIn);
            break;
        case cd.spotifySearch:
            writeLogFile("spotify search", "P");
            spotifySong_start(cmdParamIn);
            break;
        case cd.movieSearch:
            writeLogFile("movie search", "P");
            OMDBsearch_start(cmdParamIn);
            break;
        case cd.commFromFile:
            writeLogFile("read command from file", "P");
            readCommFromFile(); //for now, use default
            break;
        case cd.resetLogFile:
            writeLogFile("reset (clear) log file", "P");
            resetLogFile();
            break;
        case cd.quitProgram:
            writeLogFile("user quit program using Quit command", "W");
            writeOutput("Thanks for stopping by", "C");
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

console.log("use '?' for help or no parameter for interactive mode\n\n");
writeLogFile("", "N");

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
                choices: ["read tweets", "send tweets", "search tweets", "search spotify", "search movie title", "read commands from random.txt", "reset log file", "Quit"],
                name: "cmdList",
                pageSize: 10
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
                    case "search tweets":
                        cmdReadIn = cd.tweetSearch;
                        break;
                    case "search spotify":
                        cmdReadIn = cd.spotifySearch;
                        break;
                    case "search movie title":
                        cmdReadIn = cd.movieSearch;
                        break;
                    case "read commands from random.txt":
                        cmdReadIn = cd.commFromFile;
                        break;
                    case "reset log file":
                        cmdReadIn = cd.resetLogFile;
                        break;
                    case "Quit":
                        cmdReadIn = "quit";
                        break;
                };
                evalCommand(cmdReadIn, cmdParam);
            }
            else {
                writeLogFile("user aborted", "W");
                writeOutput("Thanks for stopping by");
            };
        });

} else {
    cmdReadIn = cmdReadIn.toLowerCase();
    evalCommand(cmdReadIn, cmdParam);
};

