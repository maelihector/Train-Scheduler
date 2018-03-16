$(function () {

    // Have Train Start time pop up a clock where users can input time
    $('.timepicker').pickatime({
        default: 'now', // Set default time: 'now', '1:30AM', '16:30'
        fromnow: 0, // set default time to * milliseconds from now (using with default = 'now')
        twelvehour: false, // Use AM/PM or 24-hour format
        donetext: 'OK', // text for done-button
        cleartext: 'Clear', // text for clear-button
        canceltext: 'Cancel', // Text for cancel-button
        autoclose: false, // automatic close timepicker
        ampmclickable: true, // make AM PM clickable
        aftershow: function () {} //Function for after opening timepicker
    });

    // Create variable for the firebase database
    var database = firebase.database();

    // Add  new train information input to table????????
    $("#add-train-btn").on("click", function (e) {
        // Stop page from refreshing
        e.preventDefault();
        
        // Grab user input and trim white space
        var trainName = $(".trainName-input").val().trim();
        var trainStart = $(".trainStart-input").val().trim();
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
        console.log(name);
        console.log(start);
        console.log(destination);
        console.log(frequency);
        
        
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
        console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));

        $("#train-table > tbody").append("<tr><td>" + trainName + "</td><td>" + trainStart + "</td><td>" +
            destinationName + "</td><td>" + frequencyMins + "</td><td>" + moment(nextTrain).format("hh:mm") + "</td></tr>");

    });

    // $("#add-train-btn").on("submit", function (e) {
    //     e.preventDefault();

    //     let form = $(this).closest("form");

    //     let trainName = form.find("[name='trainName']").val();
    //     let startTrain = form.find("[name='startTrain']").val();
    //     let destinationName = form.find("[name='destinationName']").val();
    //     let frequencyMins = form.find("[name='frequencyMins']").val();

    //     let key = localStorage.userkey;

    //     firebase.database().ref("trains/" + key).update({

    //         name: trainName,
    //         start: trainStart,
    //         destination: destinationName,
    //         frequency: frequencyMins
    //     });
    // })
});

$("#add-train-btn").on("click", function (e) {
    // Stop page from refreshing
    e.preventDefault();

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

    var $clock = $('#clock'),
    tMinutes = moment(tMinutesTillTrain, "minutes");
    console.log(tMinutes);
    //eventTime = moment('27-11-2020 08:30:00', 'DD-MM-YYYY HH:mm:ss').unix(),
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
        var $d = $('<div class="days" ></div>').appendTo($clock),
            $h = $('<div class="hours" ></div>').appendTo($clock),
            $m = $('<div class="minutes" ></div>').appendTo($clock),
            $s = $('<div class="seconds" ></div>').appendTo($clock);

        setInterval(function () {

            duration = moment.duration(duration.asMilliseconds() - interval, 'milliseconds');
            var d = moment.duration(duration).days(),
                h = moment.duration(duration).hours(),
                m = moment.duration(duration).minutes(),
                s = moment.duration(duration).seconds();

            d = $.trim(d).length === 1 ? '0' + d : d;
            h = $.trim(h).length === 1 ? '0' + h : h;
            m = $.trim(m).length === 1 ? '0' + m : m;
            s = $.trim(s).length === 1 ? '0' + s : s;

            // show how many hours, minutes and seconds are left
            $d.text(d);
            $h.text(h);
            $m.text(m);
            $s.text(s);

        }, interval);

    }

});