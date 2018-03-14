$(function () {
    // create variable for the firebase variable
    var database = firebase.database();

    $("#add-train-btn").on("click", function (e) {
        // stop page from refreshing
        e.preventDefault();

        var trainName = $(".trainName-input").val().trim();
        var trainStart = $(".trainStart-input").val().trim();
        var destinationName = $(".destination-input").val().trim();
        var frequencyMins = $(".frequency-input").val().trim();

        var newTrain = {
            name: trainName,
            start: trainStart,
            destination: destinationName,
            frequency: frequencyMins
        }
        // make sure vars work
        console.log(newTrain.name);
        console.log(newTrain.start);
        console.log(newTrain.destination);
        console.log(newTrain.frequency);
        
                $("#train-table > tbody").append("<tr><td>" + trainName + "</td><td>" + trainStart + "</td><td>" +
                destinationName + "</td><td>" + frequencyMins + "</td></tr>");

        // uploads data to database
        database.ref().set(newTrain);

        // clears all text-boxes
        $(".trainName-input").val("");
        $(".trainStart-input").val("");
        $(".destination-input").val("");
        $(".frequency-input").val("");


        // set val in database, ref points to a specific type on object to recall later
        // database.ref("trainName").set(val);
    });

    // database.ref().on("child_added", function (childSnapshot, prevChildKey) {
    //     console.log(childSnapshot.val());

    //     // Store everything into a var
    //     var trainName = childSnapshot.val().name;
    //     var trainStart = childSnapshot.val().start;
    //     var destinationName = childSnapshot.val().destination;
    //     var frequencyMins = childSnapshot.val().frequency;

    //     console.log(trainName);
    //     console.log(trainStart);
    //     console.log(destinationName);
    //     console.log(frequencyMins);

    // });

    // access ref for snapshot of current state
    // database.ref("trainName").on("value", function (snapshot) {
    //     let data = snapshot.val();
    //     console.log(data);
    //     $(".trainName-input").text(data);
    // })
})