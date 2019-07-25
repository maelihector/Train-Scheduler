$(document).ready(() => {

  // Create variable for the firebase database
  var database = firebase.database();

  // Check for duplicate train names
  function checkDuplicateTrainNames(possibleDuplicate) {

    // Create is Duplicate variable
    var isDuplicate;

    // Remove whitespace from inbetween words of possibleDuplicate and convert to lower case
    var possibleDuplicateStr = possibleDuplicate.replace(/ +/g, "");
    possibleDuplicateStr.toLowerCase();

    // Fetch database train data
    database.ref().once('value', function (snapshot) {

      // Loop through each child snapshot/train
      snapshot.forEach(function (childSnapshot) {

        // Fetch each database train name
        var existingTrain = childSnapshot.val().name;

        // Remove whitespace from inbetween words of database train names and convert to lower case
        var existingTrainStr = existingTrain.replace(/ +/g, "");
        existingTrainStr.toLowerCase();

        // If new input train name matches an already existing train name
        if (possibleDuplicateStr === existingTrainStr) {
          alert(possibleDuplicate + " is too similar to " + existingTrain + ", which already exists in our database. If you want to submit " + possibleDuplicate + " anayway, try adding a unique number to the end of the name.");
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

    // Fetch correct trainStart time format from Moment.js
    var trainStartFormat = moment(trainStart, "HH:mm").subtract(1, "years");
    // Fetch difference between trainStart time and current time
    var diffTime = moment().diff(moment(trainStartFormat), "minutes");
    // Calculate time remaining till next train by fetching remainder from diffTime/frequencyMins
    var tRemainder = diffTime % frequencyMins;
    // Calculate minutes until train arrives by taking the difference of frequency minutes and time remaining
    var tMinutesTillTrain = frequencyMins - tRemainder;

    return tMinutesTillTrain;
  }

  // Function that calculates next train arrival time
  function calculateTrainArrivalTime(tMinutesTillTrain) {

    // Fetch next train arrival by adding minutes until next train to current time
    var nextTrainArrival = moment().add(tMinutesTillTrain, "minutes");
    // Fetch returned Moment.js string in military format
    nextTrainArrival = moment(nextTrainArrival).format("HH:mm");
    // Convert military time to standard time
    nextTrainArrival = convertToStandard(nextTrainArrival);

    return nextTrainArrival;
  }

  // Function that converts military time to standard time
  function convertToStandard(time) {

    // Convert time string to array of two
    time = time.split(':');

    // Fetch hours and minutes and convert to numbers
    var hours = Number(time[0]);
    var minutes = Number(time[1]);

    // Calculate standard hours
    var standardTime;
    if (hours > 0 && hours <= 12) {
      standardTime = "" + hours;
    } else if (hours > 12) {
      standardTime = "" + (hours - 12);
    } else if (hours === 0) {
      standardTime = "12";
    }

    // Add '0' in front of minutes if minutes < 10
    standardTime += (minutes < 10) ? ":0" + minutes : ":" + minutes;
    // Fetch meridian
    standardTime += (hours >= 12) ? " P.M." : " A.M.";

    return standardTime;
  }

  // Function that takes standard time and converts it to military time in order to call Moment.js
  function convertToMilitary(time) {

    // Fetch hours, minutes and meridian
    var hours = time.slice(0, 2);
    var minutes = time.slice(3, 5);
    var meridian = time.slice(6, 8);

    // If meridian is PM AND less than 12, add 12 to convert to military hours
    if (meridian === "PM" && Number(hours) < 12) {
      hours = Number(hours);
      hours += 12;
    }

    // If 12 AM, change to '00' military hours
    if (meridian === "AM" && Number(hours) === 12) {
      hours = "00";
    }

    // Convert minutes to string in order to build military time string
    minutes.toString;

    // Create military time string
    var trainStart = hours + minutes;

    return trainStart;
  }

  // Update DOM with minutes until next train
  function minuteCountDown(trainKey, tMinutesTillTrain, frequencyMins) {

    // Fetch DOM element where minutes will be updated
    var minutesToBeReplaced = $('#minutesTillTrain');

    // Get current time seconds to be in sync with real time
    var beginningSeconds = moment().format('ss');

    // Upkeep
    var intervalId;
    //  The run function sets an interval that runs the increment function once every second
    function run() {
      clearInterval(intervalId);
      intervalId = setInterval(increment, 1000);
    }
    //  Execute the run function to begin countdown
    run();

    // Make sure to update DOM immediately if the train is currently at the station (has arrived)
    if (tMinutesTillTrain === frequencyMins) {
      minutesToBeReplaced.text('arrived');
    }

    function increment() {

      // Increase seconds by one.
      beginningSeconds++;

      // When seconds reach 60
      if (beginningSeconds === 60) {

        // If train shows as 'arrived'
        if (tMinutesTillTrain === 'arrived') {
          // Reset tMinutesTillTrain to frequency minutes
          tMinutesTillTrain = frequencyMins;
        }

        //  Decrease tMinutesTillTrain by 1
        tMinutesTillTrain--;

        // If minutes until train arrives is 0
        if (tMinutesTillTrain === 0) {
          // Call function to calculate the time of the next arrival (since last arrival is now, tMinutesTillNextTrain === frequencyMins)
          var nextTrain = calculateTrainArrivalTime(frequencyMins);
          // Find correct train to update
          var trainId = $('#arrivalTime' + trainKey);
          // Update DOM with updated next train arrival time
          trainId.text(nextTrain);
          // Show 'arrived' for one minute before resetting to frequency minutes
          tMinutesTillTrain = 'arrived';
        }

        //  Update DOM with correct minutes
        minutesToBeReplaced.text(tMinutesTillTrain);

        // reset seconds to 0
        beginningSeconds = 0;
      }
    }
  }

  // Function that finds the childSnapshot needed
  function fetchTrain(trainKey) {

    // Create empty obj variable
    var trainObj = {};

    // Fetch database train data
    database.ref().once('value', function (snapshot) {

      // Loop through each child snapshot/train
      snapshot.forEach(function (childSnapshot) {

        // Fetch train reference key
        var train = childSnapshot.ref.key;

        // Return the matching childSnapshot 
        if (trainKey === train) {

          // Save childSnapshot values to trainObj variable
          trainObj = childSnapshot.val();

          return trainObj
        }
      });
    });

    return trainObj
  }

  // 'child_added' retrieves lists of items or listens for additions to a list of items. 
  // This event is triggered once for each existing child and then again every time a new child is added to the specified path.
  // The listener is passed a snapshot containing the new child's data.
  database.ref().on("child_added", function (childSnapshot) {

    // Fetch important values and save into variables
    var trainKey = childSnapshot.ref.key;
    var trainName = childSnapshot.val().name;
    var trainStart = childSnapshot.val().start;
    var destinationName = childSnapshot.val().destination;
    var frequencyMins = childSnapshot.val().frequency;

    // Fetch minutes until next train
    var tMinutesTillTrain = calculateTMinutesTillTrain(trainStart, frequencyMins);

    // Fetch time of next train arrival
    var timeOfNextTrain = calculateTrainArrivalTime(tMinutesTillTrain);

    // Create 'Update' and 'Remove' btns
    var editBtn = '<i id="edit-train-modal" data-target="edit_train" class="small material-icons modal-trigger">edit</i>';
    var removeBtn = '<i id="delete-train" class="small material-icons">delete</i>';

    // Prepend train to table
    $("#train-table > tbody").prepend("<tr id=" + trainKey + "><td class='center'>" + editBtn + removeBtn + "</td><td>" + trainName + "</td><td>" + destinationName + "</td><td>" + frequencyMins + "</td><td id='minutesTillTrain'>" + tMinutesTillTrain + "</td><td id='arrivalTime" + trainKey + "'>" + timeOfNextTrain + "</td></tr>");

    // Call function to update minutes countdown until next train arrives 
    minuteCountDown(trainKey, tMinutesTillTrain, frequencyMins);
  });

  // 'child_changed' listens for changes to the items in a list. 
  // This event is triggered any time a child node is modified. This includes any modifications to descendants of the child node.
  // The snapshot passed to the event listener contains the updated data for the child.
  database.ref().on('child_changed', function (childSnapshot) {

    // Fetch childSnapshot train values
    var trainName = childSnapshot.val().name;
    var trainStart = childSnapshot.val().start;
    var destinationName = childSnapshot.val().destination;
    var frequencyMins = childSnapshot.val().frequency;
    var trainKey = childSnapshot.ref.key;

    // Fetch train row from DOM
    var trainRow = $('#' + trainKey);
    // Fetch train row child nodes
    var rowChildNodes = trainRow[0].childNodes;

    // Update innerHTML to reflect update
    rowChildNodes[1].innerHTML = trainName;
    rowChildNodes[2].innerHTML = destinationName;
    rowChildNodes[3].innerHTML = frequencyMins;

    // Update tMinutes till Train
    var tMinutesTillTrain = calculateTMinutesTillTrain(trainStart, frequencyMins);
    rowChildNodes[4].innerHTML = tMinutesTillTrain;
    var updatedTrainArrival = calculateTrainArrivalTime(tMinutesTillTrain);

    // Update train arrival time
    rowChildNodes[5].innerHTML = updatedTrainArrival;

    // Call function to update minutes countdown until next train arrives 
    minuteCountDown(trainKey, tMinutesTillTrain, frequencyMins);

  });

  // 'child_removed' listens for items being removed from a list. 
  // This event is triggered when an immediate child is removed. 
  // The snapshot passed to the callback block contains the data for the removed child.
  database.ref().on('child_removed', function (childSnapshot) {

    // Fetch train key from childSnapShot
    var trainKey = childSnapshot.ref.key;
    // Fetch train row from DOM
    var trainRow = $('#' + trainKey);

    // Remove train row from table
    trainRow.remove();

  });


  // Add  new train information input to table.
  $("#add-train-btn").on("click", function (e) {

    // Stop page from refreshing
    e.preventDefault();

    // Fetch user input and trim white space
    var trainName = $(".trainName-input").val().trim();
    // Check and prevent duplicate train names
    if (checkDuplicateTrainNames(trainName) === true) {
      return false;
    }

    var trainStart = $(".trainStart-input").val().trim();
    // Convert input to military time in order to calculate next train arrival with Moment.js
    trainStart = convertToMilitary(trainStart);

    var destinationName = $(".destination-input").val().trim();
    var frequencyMins = $(".frequency-input").val().trim();
    // Convert frequency minues to a number to use for time calculations later
    frequencyMins = Number(frequencyMins);

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

  // Click event to delete a train
  $(document).on('click', "#delete-train", function (e) {

    // Stop page from refreshing
    e.preventDefault();

    // Fetch train row
    var trainRow = $(this)[0].parentNode.parentNode;
    // Fetch train key
    var trainKey = $(trainRow).attr('id');

    // Call firebase and remove the train data
    firebase.database().ref(trainKey).remove();

  });

  // Click event to auto fill form labels
  $(document).on('click', "#edit-train-modal", function (e) {

    // Stop page from refreshing
    e.preventDefault();

    // Fetch train row
    var trainRow = $(this)[0].parentNode.parentNode;
    // Fetch train key
    var trainKey = $(trainRow).attr('id');

    // Add train id value to form submit btn 'id' attribute to use if user submits the change
    var formSubmitBtn = $("#edit-train-btn");
    $(formSubmitBtn).attr('trainid', trainKey);

    // Fetch train row data
    var trainRowData = trainRow.childNodes;
    var trainName = trainRowData[1].innerHTML;
    var trainDestination = trainRowData[2].innerHTML;
    var trainFrequency = trainRowData[3].innerHTML;
    var trainArrival = trainRowData[5].innerHTML;

    // Fetch input element labels
    var editFormTitle = $("#edit-train-form-title");
    var trainNameLabel = $("#trainName-edit-input-label");
    var destinationLabel = $("#destination-edit-input-label");
    var frequencyLabel = $("#frequency-edit-input-label");
    var trainStartLabel = $("#trainStart-edit-input-label");

    // Change form title and input label innerHTMLs to refelect train that is to be edited
    editFormTitle[0].innerHTML = "Edit " + trainName;
    trainNameLabel[0].innerHTML = trainName;
    trainStartLabel[0].innerHTML = 'Next Arrival: ' + trainArrival;
    frequencyLabel[0].innerHTML = 'Frequency: ' + trainFrequency + ' Minutes';
    destinationLabel[0].innerHTML = trainDestination;

  });

  // Click event to delete a train
  $(document).on('click', "#edit-train-btn", function (e) {

    // Stop page from refreshing
    e.preventDefault();

    // Fetch train key
    var trainKey = $(this).attr('trainid');
    // Call function to fetch train values from database
    var existingTrain = fetchTrain(trainKey);

    // Fetch existing train values seperately
    var trainName = existingTrain.name;
    var trainStart = existingTrain.start;
    var destinationName = existingTrain.destination;
    var frequencyMins = existingTrain.frequency;

    // Fetch input data fields from DOM
    var trainNameInput = $(".trainName-edit-input").val().trim();
    var trainStartInput = $(".trainStart-edit-input").val().trim();
    var destinationNameInput = $(".destination-edit-input").val().trim();
    var frequencyMinsInput = $(".frequency-edit-input").val().trim();

    // Make sure we have all update values, if not, values will default to existing train values
    if (trainNameInput === "") {
      trainNameInput = trainName;
    }
    if (trainStartInput === "") {
      trainStartInput = trainStart;
    } else {
      trainStartInput = convertToMilitary(trainStartInput);
    }
    if (destinationNameInput === "") {
      destinationNameInput = destinationName;
    }
    if (frequencyMinsInput === "") {
      frequencyMinsInput = frequencyMins;
    } else {
      frequencyMinsInput = Number(frequencyMinsInput);
    }

    // Hold above data temporarily 
    var train = {
      name: trainNameInput,
      start: trainStartInput,
      destination: destinationNameInput,
      frequency: frequencyMinsInput
    };

    // Clear all text-boxes after data is submitted
    $(".trainName-edit-input").val("");
    $(".trainStart-edit-input").val("");
    $(".destination-edit-input").val("");
    $(".frequency-edit-input").val("");

    // Call firebase to update train data
    return firebase.database().ref(trainKey).update(train);
  });


});