# Train Arrivals

## What is this?

Train Arrivals is an application that lists a hypothetical station's train arrival with the exact future arrival time along with a minute countdown for each train. The application updates automatically every minute to update the countdown.

Train Arrivals also allows for new train submissions, existing train edits, and train deletions. 

## How does it work?

The application uses [Firebase Realtime Database](https://firebase.google.com/) and [Moment.js](http://momentjs.com/) to host arrival and departure data and to  retrieve and manipulate the data. This allows for Train Arrivals to provide up-to-date information about various trains; namely their arrival time and a minute countdown until the train's next arrival.

## What does this do?

After the page has loaded, firebase is initially called with a `child_added` event that runs javaScript for each existing child in the Trains database, **and** then for every new child added to the database with `push()`, and when a child is updated with `update()`.

Train Arrivals takes the train's start time and its frequency to calculate the next train arrival and the minutes remaining until the next arrival. 

```

var  diffTime  = moment().diff(moment(trainStart), "minutes"); //  Fetch difference between train start time and the current time
var  tRemainder  =  diffTime  %  frequencyMins; // Calculate time remaining minutes till next train
var  tMinutesTillTrain  =  frequencyMins  -  tRemainder; // Calculate minutes until train arrives by taking the difference of frequency minutes and time remaining
var  nextTrainArrival  = moment().add(tMinutesTillTrain, "minutes"); // Fetch next train arrival by adding minutes until next train to current time

```

The function that maintains the minute-to-minute countdown for each train calls the function to update arrival time when the train's countdown has reached zero. This allows for Train Arrivals to continue updating indefinitely. 


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