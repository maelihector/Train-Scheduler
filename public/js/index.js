$(document).ready(() => {

    var database = firebase.database(); // Create variable for the firebase database

    // Add  new train information input to table.
    $("#add-train-btn").on("click", function (e) {

        // Stop page from refreshing
        e.preventDefault();

        // Grab user input and trim white space
        var trainName = $(".trainName-input").val().trim();

        // check for duplicate train name
        if (checkDuplicateTrainNames(trainName) === true) {
            return false;
        }

        var trainStart = $(".trainStart-input").val().trim();
        // Make sure users input correct military time format
        if (trainStart.length != 4 || trainStart > 2359) {
            alert("Please enter four digits under 2359 for 'Train Start Time in Military Time' Like 2359 for 11:59.PM., or 0000 for 12:00 A.M.");
            return false;
        }
        var destinationName = $(".destination-input").val().trim();
        var frequencyMins = $(".frequency-input").val().trim();

        // Hold above data temporarily 
        var newTrain = {
            name: trainName,
            start: trainStart,
            destination: destinationName,
            frequency: frequencyMins
        };

        // Upload data to the firebase databse
        database.ref().push(newTrain);

        // Clear all text-boxes after data is pushed
        $(".trainName-input").val("");
        $(".trainStart-input").val("");
        $(".destination-input").val("");
        $(".frequency-input").val("");

    });


    function checkDuplicateTrainNames(trainName) {
        // check for duplicate trains
        var isDuplicate;
        database.ref().once('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                var childData = childSnapshot.val().name;
                if (trainName === childData) {
                    alert(trainName + " already exist in our database. If you want to submit anayway, try adding a unique number to the end of the train's name.");
                    isDuplicate = true;
                    return isDuplicate;
                } else {
                    isDuplicate = false;
                    return isDuplicate;
                }
            });
        });
        return isDuplicate;
    }

    // retrieve database train data from firebase and dump on DOM table
    // 'child_added' is triggered once for each existing child and then again every time a new child is added
    database.ref().on("child_added", function (childSnapshot, prevChildKey) {

        // grab important values and save into vars
        var trainName = childSnapshot.val().name;
        var trainStart = childSnapshot.val().start;
        var destinationName = childSnapshot.val().destination;
        var frequencyMins = childSnapshot.val().frequency;

        // Calculate time remaining for next train
        var trainStartFormat = moment(trainStart, "HH:mm").subtract(1, "years");
        // Difference between the times
        var diffTime = moment().diff(moment(trainStartFormat), "minutes");
        // Time apart (remainder)
        var tRemainder = diffTime % frequencyMins;
        // Minutes Until Train
        var tMinutesTillTrain = frequencyMins - tRemainder;
        // Next Train
        var nextTrain = moment().add(tMinutesTillTrain, "minutes");
        // Convert military time to standard time
        let militaryTime = moment(nextTrain).format("HH:mm:ss");

        militaryTime = militaryTime.split(':'); // convert to array

        // fetch
        var hours = Number(militaryTime[0]);
        var minutes = Number(militaryTime[1]);

        // convert military to standard time
        var timeOfNextTrain;
        if (hours > 0 && hours <= 12) {
            timeOfNextTrain = "" + hours;
        } else if (hours > 12) {
            timeOfNextTrain = "" + (hours - 12);
        } else if (hours === 0) {
            timeOfNextTrain = "12";
        }

        timeOfNextTrain += (minutes < 10) ? ":0" + minutes : ":" + minutes; // get minutes
        timeOfNextTrain += (hours >= 12) ? " P.M." : " A.M."; // get AM/PM

        // prepend updated time to table
        $("#train-table > tbody").prepend("<tr><td>" + trainName + "</td><td>" + destinationName + "</td><td id='frequencyMins'>" + frequencyMins + "</td><td id='minutesTillTrain'>" + tMinutesTillTrain + "</td><td id='arrivalTime" + frequencyMins + "'>" + timeOfNextTrain + "</td></tr>");

        // call function to update minutes countdown until next train arrives 
        minuteCountDown(tMinutesTillTrain, frequencyMins);

        // call function to show clock
        showClock();

    });

    // function that updates minutes until next train
    function minuteCountDown(tMinutesTillTrain, frequencyMins) {
        var minutesToBeReplaced = $('#minutesTillTrain');
        // get current time seconds
        var beginningSeconds = moment().format('ss');
        // upkeep
        var intervalId;
        //  The run function sets an interval that runs the increment function once a minute
        function run() {
            clearInterval(intervalId);
            intervalId = setInterval(increment, 1000);
        }
        //  Execute the run function to begin countdown
        run();

        function increment() {
            // Decrease seconds by one.
            beginningSeconds++;
            // when seconds reach 60...
            if (beginningSeconds === 60) {
                // reset seconds to 0
                beginningSeconds = 0
                // after 'arrived' has shown for 1 minute...
                if (tMinutesTillTrain === 'arrived') {
                    // reset tMinutesTillTrain to frequency minutes
                    tMinutesTillTrain = frequencyMins;
                    // call function that updates train arrival time
                    updateArrivalViaFrequency(frequencyMins);
                }
                //  Decrease tMinutesTillTrain by one
                tMinutesTillTrain--;
                //  Update DOM with correct minutes
                minutesToBeReplaced.text(tMinutesTillTrain);
            }
            //  If tMinutesTillTrain hits zero...
            if (tMinutesTillTrain === 0) {
                // show 'arrived' for one minute before resetting to frequency minutes
                tMinutesTillTrain = 'arrived';
                //  Update DOM with correct minutes 
                minutesToBeReplaced.text(tMinutesTillTrain);
            }

        }
    }

    // function that takes frequency minutes as parameter and searches DOM for
    function updateArrivalViaFrequency(frequencyMins) {
        // find and get the arrival time to be replaced on DOM (see line 84)
        var arrivalTimeId = '#arrivalTime' + frequencyMins;
        var foundArrivalTimeId = $(arrivalTimeId);
        var arrivalTimeString = $(foundArrivalTimeId)[0].innerText;
        // find the : and split
        var re = /\s*(?::|$)\s*/;
        var arrivalTimeStringArray = arrivalTimeString.split(re);
        // fetch hours and minutes and convert to numbers, fetch meridian
        var arrivalTimeHours = Number(arrivalTimeStringArray[0]);
        var minutesAndMeridian = arrivalTimeStringArray[1];
        var minutesMeridianSplit = minutesAndMeridian.split(" ");
        var arrivalTimeMinutes = Number(minutesMeridianSplit[0]) + 1; // 1 is added so it can match current and update the arrival time, otherwise current time will always be one minute ahead due to the (1 minute long) arrival message.
        var arrivalTimeMeridian = minutesMeridianSplit[1];

        // add zero in front of minutes if minutes < 10 in order to be able to match times, else arrival time can be 4:5 instead of 4:05. It was changed to a number initially so we could add the 1 minute that makes time matching possible.
        if (arrivalTimeMinutes < 10) {
            arrivalTimeMinutes = '0' + arrivalTimeMinutes;
        }

        var domArrivalTime = arrivalTimeHours + ":" + arrivalTimeMinutes; // create string that could match currentTime string

        // checking against current time is necessary since more than one train can have same frequency mins listed, but with different arrival times
        var currentTime = getCurrentTime();

        // if arrival time and current time match, then update IS needed.
        if (domArrivalTime === currentTime) {

            // convert frequency minutes to a number to be able to add to arrival minutes
            frequencyMins = Number(frequencyMins);
            // convert arrivalTimeMinutes back to a Number to subtract the 1 minute added when checking against current time
            arrivalTimeMinutes = Number(arrivalTimeMinutes) - 1;
            // add frequency minutes to arrival minutes
            arrivalTimeMinutes += frequencyMins;

            // update hours if minutes add up to greater than 59
            if (arrivalTimeMinutes > 59) {
                arrivalTimeHours++;
                arrivalTimeMinutes -= 60;
            }

            // add zero in front of minutes if minutes are less than 10 
            if (arrivalTimeMinutes < 10) {
                arrivalTimeMinutes = '0' + arrivalTimeMinutes;
            }

            // update meridian if hours are greater than 12
            if (arrivalTimeHours > 12) {
                arrivalTimeHours -= 12;
                if (arrivalTimeMeridian === "A.M.") {
                    arrivalTimeMeridian = "P.M."
                } else if (arrivalTimeMeridian === "P.M.") {
                    arrivalTimeMeridian = "A.M."
                }
            }

            // create a string with the updated arrival time to post to DOM
            var updatedArrivalTime = arrivalTimeHours + ":" + arrivalTimeMinutes + " " + arrivalTimeMeridian;

            // update DOM with new arrival time
            foundArrivalTimeId.text(updatedArrivalTime);
        }
    }

    // This function is just to show the accuracy of the table updates...
    function showClock() {

        // get current time from moment
        var time = moment().format('HH:mm:ss');

        time = time.split(':'); // convert to array

        // fetch
        var hours = Number(time[0]);
        var minutes = Number(time[1]);
        var seconds = Number(time[2]);

        // time upkeep
        var intervalId;
        // every second
        function run() {
            clearInterval(intervalId);
            intervalId = setInterval(increment, 1000);
        }
        // execute run function to begin clock
        run();

        function increment() {
            // Increase seconds by one.
            seconds++;
            // update time on DOM
            changeClock(hours, minutes, seconds);
            if (seconds === 59) {
                // increment miniutes by one
                minutes++
                if (minutes === 60) {
                    // increment hours by one
                    hours++;
                    // if hours reach 24, reset to 0
                    if (hours === 24) {
                        hours = 0;
                    }
                    // reset minutes to zero
                    minutes = 0;
                }
                // run the stop function
                stop();
            }
        }

        function stop() {
            clearInterval(intervalId);
            runAgain();
        }

        function runAgain() {
            seconds = -1;
            // Execute the run function again
            run();
        }
        // function to show time on DOM
        function changeClock(hours, minutes, seconds) {
            var clockDiv = $('#clock');
            //  convert military to standard time
            var time;
            if (hours > 0 && hours <= 12) {
                time = "" + hours;
            } else if (hours > 12) {
                time = "" + (hours - 12);
            } else if (hours == 0) {
                time = "12";
            }
            // use es6
            time += (minutes < 10) ? ":0" + minutes : ":" + minutes; // get minutes
            time += (seconds < 10) ? ":0" + seconds : ":" + seconds; // get seconds
            time += (hours >= 12) ? " P.M." : " A.M."; // get AM/PM

            clockDiv.text(time); // show clock on the DOM
        }

    }

    // funtion to get current time to check against next train arrival time. Called by updateArrivalViaFrequency() function
    function getCurrentTime() {

        // fetch current time from moment.js
        var time = moment().format('HH:mm');

        time = time.split(':'); // split to an array

        var hours = Number(time[0]);
        var minutes = time[1];
        // turn military time to standard time
        if (hours > 12) {
            hours = "" + (hours - 12);
        } else if (hours === 0) {
            hours = "12";
        }

        var currentTime = hours + ":" + minutes;

        return currentTime;
    }



});