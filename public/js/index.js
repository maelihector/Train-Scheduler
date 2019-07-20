$(document).ready(() => {

  // Create variable for the firebase database
  var database = firebase.database();

  // Check for duplicate train names
  function checkDuplicateTrainNames(trainName) {
    var trainNameStr = trainName.replace(/ +/g, "");
    // check for duplicate trains
    var isDuplicate;
    // grab database train data
    database.ref().once('value', function (snapshot) {
      // loop through each
      snapshot.forEach(function (childSnapshot) {
        // grab each data base train name
        var childData = childSnapshot.val().name;
        // if new input train name === database train name
        if (trainName === childData || trainNameStr === childData) {
          alert(trainName + " already exist in our database. If you want to submit anayway, try adding a unique number to the end of your train's name.");
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

  // Function that calculates minutes until next train arrival
  function calculateTMinutesTillTrain(trainStart, frequencyMins) {
    // Fetch correct trainStart time format
    var trainStartFormat = moment(trainStart, "HH:mm").subtract(1, "years");
    // Fetch difference between the times
    var diffTime = moment().diff(moment(trainStartFormat), "minutes");
    // Calculate time apart (remainder)
    var tRemainder = diffTime % frequencyMins;
    // Calculate minutes until train arrives
    var tMinutesTillTrain = frequencyMins - tRemainder;

    return tMinutesTillTrain;
  }

  // Function that calculates next train arrival time
  function calculateTrainArrivalTime(tMinutesTillTrain) {

    // Fetch Next Train Arrival
    var nextTrain = moment().add(tMinutesTillTrain, "minutes");
    // Convert to standard time
    var timeOfNextTrain = convertToStandard(nextTrain);

    return timeOfNextTrain;
  }

  // Update DOM with minutes until next train
  function minuteCountDown(trainName, tMinutesTillTrain, frequencyMins) {
    var minutesToBeReplaced = $('#minutesTillTrain');
    // Get current time seconds
    var beginningSeconds = moment().format('ss');
    // Upkeep
    var intervalId;
    //  The run function sets an interval that runs the increment function once a minute
    function run() {
      clearInterval(intervalId);
      intervalId = setInterval(increment, 1000);
    }
    //  Execute the run function to begin countdown
    run();

    function increment() {
      // Increase seconds by one.
      beginningSeconds++;
      // When seconds reach 60...
      if (beginningSeconds === 60) {
        // reset seconds to 0
        beginningSeconds = 0
        // After 'arrived' has shown for 1 minute...
        if (tMinutesTillTrain === 'arrived') {
          // reset tMinutesTillTrain to frequency minutes
          tMinutesTillTrain = frequencyMins;
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
        minutesToBeReplaced.text(tMinutesTillTrain);
        // Fetch time of next train arrival (since last arrival is now, tMinutesTillNextTrain === frequencyMins)
        var nextTrain = calculateTrainArrivalTime(frequencyMins);
        // Find correct train to update
        var trainId = $('#arrivalTime' + trainName);
        // Update DOM with updated next arrival time
        trainId.text(nextTrain);
      }
    }
  }

  // Function that converts military time to standard time
  function convertToStandard(time) {

    var militaryTime = moment(time).format("HH:mm");

    // Convert time string to array
    militaryTime = militaryTime.split(':');

    // Fetch hours and minutes
    var hours = Number(militaryTime[0]);
    var minutes = Number(militaryTime[1]);

    var standardTime;
    if (hours > 0 && hours <= 12) {
      standardTime = "" + hours;
    } else if (hours > 12) {
      standardTime = "" + (hours - 12);
    } else if (hours === 0) {
      standardTime = "12";
    }

    standardTime += (minutes < 10) ? ":0" + minutes : ":" + minutes; // get minutes
    standardTime += (hours >= 12) ? " P.M." : " A.M."; // get AM/PM

    return standardTime;
  }

  // Function that takes user input train time and converts it to military in order to use it with Moment.js Called by: $("#add-train-btn").on("click"..
  function convertToMilitary(trainStartInput) {
    console.log(trainStartInput);
    // Convert input time to military time format
    // Fetch hours, minutes and meridian
    var trainStartHours = trainStartInput.slice(0, 2);
    var trainStartMinutes = trainStartInput.slice(3, 5);
    var trainStartMeridian = trainStartInput.slice(6, 8);

    console.log(trainStartHours, trainStartMinutes, trainStartMeridian);

    // If meridian is PM and less than 12, add 12 to convert to military hours
    if (trainStartMeridian === "PM" && Number(trainStartHours) < 12) {
      console.log(trainStartHours);
      trainStartHours = Number(trainStartHours);
      console.log(trainStartHours);
      trainStartHours += 12;
      console.log(trainStartHours);
    }

    // If 12 AM, change to '00' military hours
    if (trainStartMeridian === "AM" && Number(trainStartHours) === 12) {
      trainStartHours = "00";
      console.log(trainStartHours);
    }

    // Moment.js takes strings
    trainStartMinutes.toString;

    console.log(trainStartHours, trainStartMinutes);

    var trainStart = trainStartHours + trainStartMinutes;

    console.log(trainStart);

    return trainStart;
  }

  // Add  new train information input to table.
  $("#add-train-btn").on("click", function (e) {

    // Stop page from refreshing
    e.preventDefault();

    // Grab user input and trim white space
    var trainName = $(".trainName-input").val().trim();
    // check and prevent duplicate train names
    if (checkDuplicateTrainNames(trainName) === true) {
      return false;
    }

    var trainStartInput = $(".trainStart-input").val().trim();
    // Convert input to military time in order to calculate next train arrival time when needed
    var trainStart = convertToMilitary(trainStartInput);

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

  // Retrieve database train data from firebase
  // 'child_added' is triggered once for each existing child and then again every time a new child is added
  database.ref().on("child_added", function (childSnapshot) {

    // Grab important values and save into variables
    var trainName = childSnapshot.val().name;
    var trainStart = childSnapshot.val().start;
    var destinationName = childSnapshot.val().destination;
    var frequencyMins = childSnapshot.val().frequency;

    // Fetch minutes until next train
    var tMinutesTillTrain = calculateTMinutesTillTrain(trainStart, frequencyMins);

    // Fetch time of next train arrival
    var timeOfNextTrain = calculateTrainArrivalTime(tMinutesTillTrain);

    // Create whitespace-free train name to add as attribute to update train information appropriately
    var spaceFreeTrainName = trainName.replace(/ +/g, "");

    // Prepend train to table
    $("#train-table > tbody").prepend("<tr><td>" + trainName + "</td><td>" + destinationName + "</td><td>" + frequencyMins + "</td><td id='minutesTillTrain'>" + tMinutesTillTrain + "</td><td id='arrivalTime" + spaceFreeTrainName + "'>" + timeOfNextTrain + "</td></tr>");

    // Call function to update minutes countdown until next train arrives 
    minuteCountDown(spaceFreeTrainName, tMinutesTillTrain, frequencyMins);

  });

});