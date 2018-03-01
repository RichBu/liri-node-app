# LIRI

by Rich Budek 03/01/2018

Project location for viewing   [richbu.github.io](https://github.com/RichBu/liri-node-app)

Description:
This is an demonstration of using Node.js to initiate command lines.  Liri will take command line arguments or by calling it without an parameters, it will bring up an inquirer menu. By picking from several options, the user can: read tweets,  send tweets,  search for tweets,  search spotify,  search movie db,  or read commands from a text file.  A log file is also kept for all of the responses

Starting up Liri:
The Liri require Node.JS to run.  Type:  Node Liri followed by one of theses parameters:
![Help Screen](/assets/images/screen_caps/Help_01.png)

If Liri is started up without any parameters, it will default to an inquirer menu.
![Starting up Liri](/assets/images/screen_caps/Scrn_01.png)

This is what the interactive inquirer menu looks like:
![Inquirer menu](/assets/images/screen_caps/Scrn_02.png)

This will allow the user to quickly check the options.

READ TWEETS is the first option.
The user can do it from the command line by doing:  node my-tweets
The other method is to pick the Read Tweets from the interacive menu:
![Tweets activate](/assets/images/screen_caps/ReadTweets_01.png)

A list is brought up on the screen showing all of Rich Budek's tweets.

![Tweets read in](/assets/images/screen_caps/ReadTweets_03.png)

SEND TWEET is the next option.
The user can do it from the command line by doing:  node send-tweets <tweet to send>
The other method is to pick the Send Tweets from the interacive menu.
Typing a one line statement will send the tweet instantly:

SEARCH TWEETS is the next option.
The user can do it from the command line by doing:  node search-tweet <search string>
The other method is to pick the Search Tweets from the interacive menu:

SPOTIFY SEARCH is the next option.
The user can do it from the command line by doing:  node spotify-this-song <song-title>
The other method is to pick the Spotify from the interacive menu:
![Tweets activate](/assets/images/screen_caps/SearchSpotify_01.png)

If no song is selected, a default song is searched.

MOVIE SEARCH  is the next option.
The user can do it from the command line by doing:  node movie-this <movie title>
The other method is to pick Movie Search from the interacive menu:
![Tweets activate](/assets/images/screen_caps/SearchMovie_01.png)


READ COMMANDS FROM FILE  is the next option.
The user can do it from the command line by doing:  node do-what-it-says
The other method is to pick Read From File from the interacive menu:
![Tweets activate](/assets/images/screen_caps/ReadFile_03.png)

Liri will then take the text from the file and interpret it as keyboard commands.
The default and only file right now is to read from random.txt

CLEARING THE LOG FILE is the last option
The user can do it from the command line by doing:  node reset-log
The other method is to pick Reset Log from the interacive menu:
![Tweets activate](/assets/images/screen_caps/LogFile_01.png)

Liri logs all of the user input, the console outputs, and any errors into a file callled
log.txt.

Technolgies used:
1. Node.JS
2. Javascript for program functions
3. Inquirer for interactive menu choices
4. Twitter from npm for handling twitter calls
5. node-spotify-api from npm to handle spotify commands
6. odb website for movie searches
7. fs from npm for handling the file searches

Internal design
1. User inputs are read in as process.argv elements in an array
2. A string is assembled of all the elements and the command line is interpretted
3. If no parameters are entered, then an interactive inquirer menu is brought up
4. If commands are read from the random file, then the command is read in and the evaluate
    function is called recursively
5. All keys are stored in a hidden .env file and brought in as process variables so that the keys
    do not have to be sent with the file to outside users.

Left to do:
1. Clean up the screen.
2. Add some more features.


