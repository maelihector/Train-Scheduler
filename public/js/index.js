$(function () {
    // Create variable for the firebase variable
    var database = firebase.database();

    // Add  new train information to table
    $("#add-train-btn").on("click", function (e) {
        // Stop page from refreshing
        e.preventDefault();

        // Grab user input
        var trainName = $(".trainName-input").val().trim();
        var trainStart = $(".trainStart-input").val().trim();
        var destinationName = $(".destination-input").val().trim();
        var frequencyMins = $(".frequency-input").val().trim();

        // Hold employee date temporarily 
        var newTrain = {
            name: trainName,
            start: trainStart,
            destination: destinationName,
            frequency: frequencyMins
        };
        // Uploads and replaces data in the databse
        database.ref().push(newTrain);

        // make sure vars work
        // console.log(newTrain.name);
        // console.log(newTrain.start);
        // console.log(newTrain.destination);
        // console.log(newTrain.frequency);


        // clears all text-boxes
        $(".trainName-input").val("");
        $(".trainStart-input").val("");
        $(".destination-input").val("");
        $(".frequency-input").val("");

    });

    $("#add-train-btn").on("submit", function(e){
        e.preventDefault();

        let form = $(this).closest("form");

        let trainName = form.find("[name='trainName']").val();
        let startTrain = form.find("[name='startTrain']").val();
        let destinationName = form.find("[name='destinationName']").val();
        let frequencyMins = form.find("[name='frequencyMins']").val();    
        
        let key = localStorage.userkey;

        firebase.database().ref('trains/' + key).update({
           
            name: trainName,
            start: trainStart,
            destination: destinationName,
            frequency: frequencyMins
            
    
        });        
    })

    // Create Firebase event for adding Train info to the database and a row in the html when a user adds an entry
    database.ref().on("child_added", function (childSnapshot, prevChildKey) {

        console.log(childSnapshot.val());

        // Store everything into a var
        var trainName = childSnapshot.val().name;
        var trainStart = childSnapshot.val().start;
        var destinationName = childSnapshot.val().destination;
        var frequencyMins = childSnapshot.val().frequency;

        // console.log(trainName);
        // console.log(trainStart);
        // console.log(destinationName);
        // console.log(frequencyMins);

        // Calculate time remaining for next train
        // Change format of moment().format('MMMM Do YYYY, h:mm:ss a');
        var trainStartFormat = moment(trainStart, "HH:mm").subtract(1, "years");
        console.log(trainStartFormat);
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
        var countDownTillTrain= moment(tMinutesTillTrain).format("mm:ss a");
        console.log(countDownTillTrain);
        // Next Train
        var nextTrain = moment().add(tMinutesTillTrain, "minutes");
        console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));
        
        
        $("#train-table > tbody").append("<tr><td>" + trainName + "</td><td>" + trainStart + "</td><td>" +
            destinationName + "</td><td>" + frequencyMins + "</td><td>" + moment(nextTrain).format("hh:mm") + "</td></tr>");

    });
});