# Train Arrivals

## What is this?

Train Arrivals is an application that lists a hypothetical station's train arrival times. The application lists the exact future arrival time along with a minute countdown for each train. The application updates automatically every minute to update accurate train arrivals and their minute-to-minute countdown. 

Users can also submit new train information by inputing the train's name, destination, frequency, and the time the train started running from the station, or its last known arrival to the station. 

## How does it work?

The application uses [Firebase](https://firebase.google.com/) to host arrival and departure data, and uses [Moment.js](http://momentjs.com/) to retrieve and manipulate the data. This allows for Train Arrivals to provide up-to-date information about various trains; namely their arrival time and a minute countdown until their next arrival.


## What does this do?

After the page has loaded, firebase is called and asked to run some javaScript for each existing child in the Trains database, **and** for every new child added to the database. 

For each child, or train data set, the javaScript saves necessary database values to variables to use as parameters for several functions that then return the manipulated data to dump on the DOM.

The last call is the function that maintains the minute-to-minute countdown for each train, which in turn calls the function to update arrival time when the train's countdown has reached zero.


## Technologies Used

HTML

[Materializecss](http://materializecss.com)

JavaScript

[jQuery](https://jquery.com/)

[Firebase](https://firebase.google.com/)

[Moment.js](http://momentjs.com/)

### Credits

Photo by [Max Andrey](https://unsplash.com/@maxandrey?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/search/photos/train-tracks?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

> Written with [StackEdit](https://stackedit.io/).