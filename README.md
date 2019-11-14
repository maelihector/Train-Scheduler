
# Train Arrivals


## What is Train Arrivals?


Train Arrivals is a [Firebase](https://firebase.google.com/docs) application built using [JavaScript](https://en.wikipedia.org/wiki/JavaScript) and [jQuery](https://jquery.com/).


Train Arrivals lists hypothetical train data, including exact future train arrival times along with a minute countdown for each train.


Train Arrivals also allows for new train submissions, existing train edits, and existing train deletions.


## How does Train Arrivals work?


Train Arrivals uses [Firebase Realtime Database](https://firebase.google.com/) and [Moment.js](http://momentjs.com/) to host arrival and departure data and to retrieve and manipulate the data. This allows for Train Arrivals to provide up-to-date information about various trains, namely their arrival time and a minute countdown until the train's next arrival.


## What does Train Arrivals do?


On page load, Train Arrivals' [Firebase Database](https://firebase.google.com/) is called with a `child_added` event that runs javaScript for each existing train in the Trains database, and lists each trains data to the DOM.

Train Arrivals takes the train's start time and its frequency to calculate the next train arrival and the minutes remaining until the next arrival.

The function that maintains the minute-to-minute countdown for each train calls the function to update arrival time when the train's countdown has reached zero, and then resets its start to frequency minutes. This allows for Train Arrivals to continue updating indefinitely.



## Technologies Used


HTML


[Materializecss](http://materializecss.com)


JavaScript


[jQuery](https://jquery.com/)


[Firebase Realtime Database](https://firebase.google.com/)


[Moment.js](http://momentjs.com/)



### Credits


Photo by [Max Andrey](https://unsplash.com/@maxandrey?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/search/photos/train-tracks?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)



> Written with [StackEdit](https://stackedit.io/).