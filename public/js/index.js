$(document).ready(() => {
    // Create variable for the firebase database
    var database = firebase.database();

    // Add  new train information input to table.
    $("#add-train-btn").on("click", function (e) {
        // Stop page from refreshing
        e.preventDefault();

        // Grab user input and trim white space
        var trainName = $(".trainName-input").val().trim();
        var trainStart = $(".trainStart-input").val().trim();
        if (trainStart.length != 4) {
            alert("Please enter four digits for 'Train Start Time in Military Time' Example: 0200");
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

        // Upload and replace data in the firebase databse
        database.ref().push(newTrain);

        // Clear all text-boxes after data is pushed
        $(".trainName-input").val("");
        $(".trainStart-input").val("");
        $(".destination-input").val("");
        $(".frequency-input").val("");

    });

    // Create Firebase event for adding train info to the database and add a row in the <tbody> when a user submits a new train
    database.ref().on("child_added", function (childSnapshot) {

        // Store everything into a var
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

        // calculate
        var standardTime;

        if (hours > 0 && hours <= 12) {
            standardTime = "" + hours;
        } else if (hours > 12) {
            standardTime = "" + (hours - 12);
        } else if (hours == 0) {
            standardTime = "12";
        }

        standardTime += (minutes < 10) ? ":0" + minutes : ":" + minutes; // get minutes
        standardTime += (hours >= 12) ? " P.M." : " A.M."; // get AM/PM

        // prepend to table
        $("#train-table > tbody").prepend("<tr><td>" + trainName + "</td><td>" + destinationName + "</td><td>" + frequencyMins + "</td><td>" + tMinutesTillTrain + "</td><td>" + standardTime + "</td></tr>");

    });

});