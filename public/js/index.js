$(document).ready(function () {

  // Create variable for firebase database
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

  // Check if train start time is in present day && before the current time in order to give correct next arrival
  function checkCurrentTime(trainStart, frequency) {

    // Create empty variable for the valid train start time
    var validTrainStart;

    // Fetch hours and minutes of train start time
    var trainStartHours = trainStart.slice(0, 2);
    trainStartHours = Number(trainStartHours);
    var trainStartMinutes = trainStart.slice(2, 4);
    trainStartMinutes = Number(trainStartMinutes);

    // Get current time
    var time = moment().format("HH:mm");
    // Fetch hours and minutes of current time
    var currentHours = time.split(":")[0];
    currentHours = Number(currentHours);
    var currentMinutes = time.split(":")[1];
    currentMinutes = Number(currentMinutes);

    // If train start hours are greater than current time
    if (trainStartHours > currentHours) {
      timeTravel();
      // If train start and current time hours are the same, but train start minutes are greater than current minutes
    } else if (trainStartHours === currentHours && trainStartMinutes > currentMinutes) {
      timeTravel();
    } else {
      // Else time IS valid
      validTrainStart = trainStart;
    }

    // Bring train start time to current day
    function timeTravel() {

      var newMinutes;

      // Loop that goes forward one hour
      function goForward(mRemainder) {
        // While minutes are less than 60, add frequency num
        while (mRemainder < 60) {
          mRemainder = mRemainder + frequency;
        }
        // When minutes reach > 60, divide by 60 and get remainder
        mRemainder = mRemainder % 60;
        // Add 1 to train start hours
        trainStartHours++;
        // Return remainder minutes
        return mRemainder;
      }

      // Start loop to go forward one hour immediately at timeTravel() call
      newMinutes = goForward(trainStartMinutes);

      // Run goForward() one hour at a time while train start hours are less than 24
      while (trainStartHours <= 23) {
        newMinutes = goForward(newMinutes);
      }

      // Once train start hours equal 24, time has arrived to current day
      if (trainStartHours === 24) {
        trainStartHours = '00';
        if (newMinutes < 10) {
          newMinutes = "0" + newMinutes;
        }
        // Return a valid military time string
        validTrainStart = trainStartHours + newMinutes;
        return validTrainStart;
      }
    }

    // Return train start time
    return validTrainStart;
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
    standardTime += (hours >= 12) ? " PM" : " AM";

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
    minutes = minutes.toString;

    // Create military time string
    var trainStart = hours + minutes;

    return trainStart;
  }

  // Update DOM with minutes until next train
  function minuteCountDown(trainKey, tMinutesTillTrain, frequencyMins) {

    // Fetch train row from DOM
    var trainRow = $('#' + trainKey);

    // Fetch instance attribute value
    var instanceAttrVal = trainRow.attr('instance');

    // Fetch DOM elements where minutes and time arrival will need to be updated
    var trainChildNodes = trainRow[0].childNodes;
    var minutesToBeUpdated = $(trainChildNodes[4]);
    var arrivalTimeToUpdate = $(trainChildNodes[5]);

    // Get current time seconds to be in sync with real time
    var beginningSeconds = moment().format('ss');

    // Upkeep
    var intervalId;

    //  The run function sets an interval that runs the increment function once every second
    function run() {
      clearInterval(intervalId);
      intervalId = setInterval(increment, 1000);
    }

    //  Execute the run function to begin countdown immediately
    run();

    // Make sure to update DOM immediately if the train is currently at the station (has arrived)
    if (tMinutesTillTrain === frequencyMins) {
      minutesToBeUpdated.text('arrived');
    }

    function increment() {

      // Increase seconds by one.
      beginningSeconds++;

      // When seconds reach 60
      if (beginningSeconds === 60) {

        // Fetch instance attribute value again to check if a train has been updated (changed by `child_changed` function)
        var updatedInstanceAttrVal = $('#' + trainKey).attr('instance');
        // If instance has been updated with a greater value, stop instance so new instance can take over
        if (updatedInstanceAttrVal > instanceAttrVal) {
          stop();
          // Else instance goes on as active
        } else {

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
            // Update DOM with updated next train arrival time
            arrivalTimeToUpdate.text(nextTrain);
            // Show 'arrived' for one minute before resetting to frequency minutes
            tMinutesTillTrain = 'arrived';
          }

          //  Update DOM with correct minutes
          minutesToBeUpdated.text(tMinutesTillTrain);

          // reset seconds to 0
          beginningSeconds = 0;
        }
      }
    }

    // Add stop function to clearInterval after an arrival time or frequency update
    function stop() {
      // Clear intervalId
      clearInterval(intervalId);
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

          return trainObj;
        }
      });
    });

    return trainObj;
  }

  // Function to update the DOM when a train is added to firebase
  // 'child_added' retrieves lists of items or listens for additions to a list of items
  // This event is triggered once for each existing child and then again every time a new child is added to the specified path
  // The listener is passed a snapshot containing the new child's data
  database.ref().on("child_added", function (childSnapshot) {

    // Fetch important values and save into variables
    var trainKey = childSnapshot.ref.key;
    var trainName = childSnapshot.val().name;
    var trainStart = childSnapshot.val().start;
    var destinationName = childSnapshot.val().destination;
    var frequencyMins = childSnapshot.val().frequency;

    // Create 'Update' and 'Remove' btns for each train
    var editBtn = '<i id="edit-train-modal" data-target="edit_train" class="small material-icons modal-trigger">edit</i>';
    var removeBtn = '<i id="delete-train" class="small material-icons">delete</i>';

    // Add instance attr a value of 1 to keep track of future updates
    var instanceAttrVal = 1;

    // If train start time is a future time (last train arrival was yesterday), calculate arrival from yesterday, not from -(future time). This is necessary to get correct diff in minutes until next train
    var validTrainStartTime = checkCurrentTime(trainStart, frequencyMins);

    // If there is a difference it's not valid, change trainStart value to the valid train start value
    if (validTrainStartTime !== trainStart) {
      trainStart = validTrainStartTime;
    }

    // Fetch minutes until next train
    var tMinutesTillTrain = calculateTMinutesTillTrain(trainStart, frequencyMins);

    // Fetch time of next train arrival
    var timeOfNextTrain = calculateTrainArrivalTime(tMinutesTillTrain);

    // Prepend train with values to table
    $("#train-table > tbody").prepend("<tr instance='" + instanceAttrVal + "' id=" + trainKey + "><td class='center'>" + editBtn + removeBtn + "</td><td>" + trainName + "</td><td>" + destinationName + "</td><td>" + frequencyMins + "</td><td>" + tMinutesTillTrain + "</td><td>" + timeOfNextTrain + "</td></tr>");

    // Call function to update minutes countdown until next train arrival
    minuteCountDown(trainKey, tMinutesTillTrain, frequencyMins);
  });

  // Function to update the DOM when a train is updated on firebase
  // 'child_changed' listens for changes to the items in a list
  // This event is triggered any time a child node is modified. This includes any modifications to descendants of the child node
  // The snapshot passed to the event listener contains the updated data for the child
  database.ref().on('child_changed', function (childSnapshot) {

    // Fetch childSnapshot train values
    var trainKey = childSnapshot.ref.key;
    var trainName = childSnapshot.val().name;
    var trainStart = childSnapshot.val().start;
    var destinationName = childSnapshot.val().destination;
    var frequencyMins = childSnapshot.val().frequency;

    // Fetch train row from DOM
    var trainRow = $('#' + trainKey);

    // Fetch train row child nodes
    var rowChildNodes = trainRow[0].childNodes;

    // Update instance attribute value by adding 1 to it (this will stop the interval already running minuteCountdown intervalId on the train)
    var instanceAttrVal = trainRow.attr('instance');

    // Convert instance attribute value to a number to be able to add 1
    instanceAttrVal = Number(instanceAttrVal);
    instanceAttrVal++;
    trainRow.attr('instance', instanceAttrVal);

    // Update innerHTML to reflect update
    rowChildNodes[1].innerHTML = trainName;
    rowChildNodes[2].innerHTML = destinationName;
    rowChildNodes[3].innerHTML = frequencyMins;

    // Update tMinutes till Train
    var tMinutesTillTrain = calculateTMinutesTillTrain(trainStart, frequencyMins);
    rowChildNodes[4].innerHTML = tMinutesTillTrain;

    // Update train arrival time
    var updatedTrainArrival = calculateTrainArrivalTime(tMinutesTillTrain);
    rowChildNodes[5].innerHTML = updatedTrainArrival;

    // Call function to update minutes countdown until next train arrives 
    minuteCountDown(trainKey, tMinutesTillTrain, frequencyMins);

  });

  // Function to update the DOM when a train is deleted from firebase
  // 'child_removed' listens for items being removed from a list
  // This event is triggered when an immediate child is removed
  // The snapshot passed to the callback block contains the data for the removed child
  database.ref().on('child_removed', function (childSnapshot) {

    // Fetch train key from childSnapShot
    var trainKey = childSnapshot.ref.key;

    // Fetch train row from DOM
    var trainRow = $('#' + trainKey);

    // Remove train row from table
    trainRow.remove();
  });

  // Add new train to firebase
  $(document).on("click", "#add-train-btn", function (e) {

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

    // Upload data to firebase
    database.ref().push(newTrain);

    // Clear all text-boxes after data is pushed
    $(".trainName-input").val("");
    $(".trainStart-input").val("");
    $(".destination-input").val("");
    $(".frequency-input").val("");

  });

  // Click event to send edited train to firebase
  $(document).on('click', "#edit-train-btn", function (e) {

    // Stop page from refreshing
    e.preventDefault();

    // Fetch train key
    var trainKey = $(this).attr('trainid');

    // Get train values from database
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

    // If certain values are not being updated they will default to existing train values
    if (trainNameInput === "") {
      trainNameInput = trainName;
    } else {
      if (checkDuplicateTrainNames(trainNameInput) === true) {
        return false;
      }
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

  // Click event to delete a train on firebase
  $(document).on('click', "#delete-train", function (e) {

    // Stop page from refreshing
    e.preventDefault();

    // Fetch train row
    var trainRow = $(this)[0].parentNode.parentNode;

    // Fetch train key
    var trainKey = $(trainRow).attr('id');

    // Call firebase and remove train
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

    // Fetch database train arrival and convert to standard time
    var trainArrival = fetchTrain(trainKey);
    trainArrival = trainArrival.start;
    var hours = trainArrival.slice(0, 2);
    var minues = trainArrival.slice(2, 4);
    trainArrival = hours + ":" + minues;
    trainArrival = convertToStandard(trainArrival);

    // Fetch train row data
    var trainRowData = trainRow.childNodes;
    var trainName = trainRowData[1].innerHTML;
    var trainDestination = trainRowData[2].innerHTML;
    var trainFrequency = trainRowData[3].innerHTML;

    // Fetch input element labels
    var editFormTitle = $("#edit-train-form-title");
    var trainNameLabel = $("#trainName-edit-input-label");
    var destinationLabel = $("#destination-edit-input-label");
    var frequencyLabel = $("#frequency-edit-input-label");
    var trainStartLabel = $("#trainStart-edit-input-label");

    // Change form title and input label innerHTML to refelect train that is currently being edited
    editFormTitle[0].innerHTML = "Edit " + trainName;
    trainNameLabel[0].innerHTML = trainName;
    trainStartLabel[0].innerHTML = 'Train Start: ' + trainArrival;
    frequencyLabel[0].innerHTML = 'Frequency: ' + trainFrequency + ' Minutes';
    destinationLabel[0].innerHTML = trainDestination;

  });

});