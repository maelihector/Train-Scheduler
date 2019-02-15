# Train Arrivals
## Using Firebase and Moment.js.

### What is this?

The Train Arrivals application is a way to determine when a specific train arrives to our hypothetical Austin Train Station by either having a user check if the train already exists on the application, or by submitting a new train's name, start time (or last known train arrival), frequency, and destination to the application. The app will then post the train's next arrival time, plus a minute countdown until its next arrival (you know, in case you're bad at math or aren't good at managing your time well). 

- - -
### What does this do?

**The application incorporates [Firebase](https://firebase.google.com/)  to host arrival and departure data, it  retrieves and manipulates the data with [Moment.js](http://momentjs.com/), and provides up-to-date information about various trains; namely their arrival time and a minute countdown until their next arrival.**

## How does it work?

To submit a new train, users input a unique train name, the time it started running (or its last known arrival), its frequency in minutes, and its destination on a form at the bottom of the page and click the submit button.

All newly submitted train information is stored in the Firebase database and is prepended to the train list on the site in real-time for other users to view as well. 
- - -

## Technologies Used

1. HTML
2. [Materializecss](http://materializecss.com) 
3. CSS
4. JavaScript
5. [jQuery](https://jquery.com/)
6.  [Firebase](https://firebase.google.com/)
7. [Moment.js](http://momentjs.com/)


### Credits

> Written with  [StackEdit](https://stackedit.io/).