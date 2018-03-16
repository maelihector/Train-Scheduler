$(document).ready(() => {
    // Create variable for the firebase database
    var database = firebase.database();

    // Add  new train information input to table?.
    $("#add-train-btn").on("click", function (e) {
        // Stop page from refreshing
        e.preventDefault();

        // Grab user input and trim white space
        var trainName = $(".trainName-input").val().trim();
        var trainStart = $(".trainStart-input").val().trim();
            if (trainStart.length != 4) {
                alert ("Please enter four digits for 'Train Start Time in Military Time' Example: 0200");
                return false
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

        // check what logs out
        console.log(trainName);
        console.log(trainStart);
        console.log(destinationName);
        console.log(frequencyMins);


        // Upload and replace data in the firebase databse
        database.ref().push(newTrain);

        // Clear all text-boxes after data is pushed
        $(".trainName-input").val("");
        $(".trainStart-input").val("");
        $(".destination-input").val("");
        $(".frequency-input").val("");

    });

    // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
    // Create Firebase event for adding train info to the database and add a row in the <tbody> when a user submits a form
    database.ref().on("child_added", function (childSnapshot, prevChildKey) {

        console.log(childSnapshot.val()); //logs as object

        // Store everything into a var
        var trainName = childSnapshot.val().name;
        var trainStart = childSnapshot.val().start;
        var destinationName = childSnapshot.val().destination;
        var frequencyMins = childSnapshot.val().frequency;

        // Calculate time remaining for next train
        // Change format of moment().format('MMMM Do YYYY, h:mm:ss a');
        var trainStartFormat = moment(trainStart, "HH:mm").subtract(1, "years");
        console.log(trainStartFormat); // as a moment object
        // Current Time
        var currentTime = moment();
        console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));
        // Difference between the times
        var diffTime = moment().diff(moment(trainStartFormat), "minutes");
        console.log("DIFFERENCE IN TIME: " + diffTime);
        // Time apart (remainder)
        var tRemainder = diffTime % frequencyMins;
        console.log(tRemainder);
        // Minute Until Train
        var tMinutesTillTrain = frequencyMins - tRemainder;
        console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);
        // Next Train
        var nextTrain = moment().add(tMinutesTillTrain, "minutes");
        console.log("ARRIVAL TIME: " + moment(nextTrain).format("HH:mm"));

        $("#train-table > tbody").prepend("<tr><td>" + trainName + "</td><td>" + trainStart + "</td><td>" +
            frequencyMins + "</td><td>" + destinationName + "</td><td>" + tMinutesTillTrain + "</td><td>" + moment(nextTrain).format("HH:mm") + "</td></tr>");

    });
});

// Add countdown till next train to table
$("#add-train-btn").on("click", function (e) {

        // Delete the countdown prior
        $("#clock").empty();

    // Grab user input
    var trainName = $(".trainName-input").val().trim();
    var trainStart = $(".trainStart-input").val().trim();
    var destinationName = $(".destination-input").val().trim();
    var frequencyMins = $(".frequency-input").val().trim();

    var trainStartFormat = moment(trainStart, "HH:mm").subtract(1, "years");
    console.log(trainStartFormat); // as a moment object
    // Current Time
    var currentTime = moment();
    console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));
    // Difference between the times
    var diffTime = moment().diff(moment(trainStartFormat), "minutes");
    console.log("DIFFERENCE IN TIME: " + diffTime);
    // Time apart (remainder)
    var tRemainder = diffTime % frequencyMins;
    console.log(tRemainder);
    // Minute Until Train
    var tMinutesTillTrain = frequencyMins - tRemainder;
    console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

    // Next Train
    var nextTrain = moment().add(tMinutesTillTrain, "minutes");
    console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));

    var clock = $('#clock'),
        tMinutes = moment(tMinutesTillTrain, "minutes");
    console.log(tMinutes);
    currentTime = moment().unix(),
        console.log(currentTime);
    diffTime = tMinutesTillTrain * 60;
    console.log(diffTime);
    duration = moment.duration(diffTime * 1000, 'milliseconds'),
        console.log(duration);
    interval = 1000;

    // if time to countdown
    if (diffTime > 0) {

        // Show clock
        // ** I was unable to just just show the most recent input's countdown. **
        var $h = $('<p class="hours" ></p>').appendTo(clock),
            $m = $('<p class="minutes" ></p>').appendTo(clock),
            $s = $('<p class="seconds" ></p>').appendTo(clock);

        setInterval(function () {
            duration = moment.duration(duration.asMilliseconds() - interval, 'milliseconds');
            var h = moment.duration(duration).hours(),
                m = moment.duration(duration).minutes(),
                s = moment.duration(duration).seconds();

            h = $.trim(h).length === 1 ? '0' + h : h;
            m = $.trim(m).length === 1 ? '0' + m : m;
            s = $.trim(s).length === 1 ? '0' + s : s;

            // show how many hours, minutes and seconds are left
            $h.text(h);
            $m.text(m);
            $s.text(s);

        }, interval);
    }

});