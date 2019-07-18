$(document).ready(() => {

  var database = firebase.database(); // Create variable for the firebase database

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

    var trainStart = $(".trainStart-input").val().trim();
    // Make sure users input correct military time format
    var trainStartHours = trainStart.slice(0, 2);
    var trainStartMins = trainStart.slice(-2);
    if (trainStart.length != 4 || parseInt(trainStartHours) > 23 || parseInt(trainStartMins) > 59) {
      alert("Please enter four digits, the first two between 00 and 23, and the last two digits between 00 and 59. For example 0000 for 12:00 A.M. or 2359 for 11:59 P.M.");
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

  // Retrieve database train data from firebase
  // 'child_added' is triggered once for each existing child and then again every time a new child is added
  database.ref().on("child_added", function (childSnapshot) {

    // Grab important values and save into variables
    var trainName = childSnapshot.val().name;
    var trainStart = childSnapshot.val().start;
    var destinationName = childSnapshot.val().destination;
    var frequencyMins = childSnapshot.val().frequency;

    // Calculate train arrival of each train
    var timeOfNextTrainTMins = calculateTrainArrivalTime(trainStart, frequencyMins);

    // Since calculateTrainArrival also updates tMins until next train, we return both train time and tMins in one string and have to split it
    var splitTimeofNextTrainTMins = timeOfNextTrainTMins.split("-");
    var timeOfNextTrain = splitTimeofNextTrainTMins[0];
    var tMinutesTillTrain = splitTimeofNextTrainTMins[1];

    // Create whitespace-free train name to add as attribute to train to update train information appropriately
    var spaceFreeTrainName = trainName.replace(/ +/g, "");

    // Prepend updated time to table
    $("#train-table > tbody").prepend("<tr><td>" + trainName + "</td><td>" + destinationName + "</td><td>" + frequencyMins + "</td><td id='minutesTillTrain'>" + tMinutesTillTrain + "</td><td id='arrivalTime" + spaceFreeTrainName + "'>" + timeOfNextTrain + "</td></tr>");

    // call function to update minutes countdown until next train arrives 
    minuteCountDown(spaceFreeTrainName, tMinutesTillTrain, frequencyMins, trainStart);

  });

  // Function that updates DOM with minutes until next train
  function minuteCountDown(trainName, tMinutesTillTrain, frequencyMins, trainStart) {
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
      // Decrease seconds by one.
      beginningSeconds++;
      // When seconds reach 60...
      if (beginningSeconds === 60) {
        // reset seconds to 0
        beginningSeconds = 0
        // After 'arrived' has shown for 1 minute...
        if (tMinutesTillTrain === 'arrived') {
          // reset tMinutesTillTrain to frequency minutes
          tMinutesTillTrain = frequencyMins;
          // Call function that updates train arrival time to update DOM
          updateArrivalTime(trainName, frequencyMins, trainStart);
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

  // Function that takes train name and frequency minutes as parameters and searches DOM for train arrival time to be replaced
  function updateArrivalTime(trainName, frequencyMins, trainStart) {

    // Find train to update
    var trainId = $('#arrivalTime' + trainName);

    // Calculate train arrival of each train
    var timeOfNextTrainTMins = calculateTrainArrivalTime(trainStart, frequencyMins);

    // Since calculateTrainArrival also updates tMins until next train, we return both train time and tMins in one string and have to split it
    var splitTimeofNextTrainTMins = timeOfNextTrainTMins.split("-");
    var timeOfNextTrain = splitTimeofNextTrainTMins[0];

    // Update DOM with updated arrival time
    trainId.text(timeOfNextTrain);
  }

  // Function that calculates train arrivals at page load and when a train has arrived and needs to be re-calculated
  function calculateTrainArrivalTime(trainStart, frequencyMins) {

    var trainStartFormat = moment(trainStart, "HH:mm").subtract(1, "years");
    // Difference between the times
    var diffTime = moment().diff(moment(trainStartFormat), "minutes");
    // Time apart (remainder)
    var tRemainder = diffTime % frequencyMins;
    // Minutes Until Train
    var tMinutesTillTrain = frequencyMins - tRemainder;
    // Next Train
    var nextTrain = moment().add(tMinutesTillTrain, "minutes");
    // Convert to standard time
    var timeOfNextTrain = convertToStandard(nextTrain);

    return timeOfNextTrain + "-" + tMinutesTillTrain;
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


});