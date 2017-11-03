var params = getQueryParams();
var fs = new FamilySearch({ accessToken: params.token, environment: 'production' });
var conversation = [
  "I have to go help other people now.",
  "It was a pleasure talking to you!",
  "Good luck in your research!",
  "Bye!",
  "Please stop talking to me. I have other people I need to help."
]

// Get location
navigator.geolocation.getCurrentPosition(function(position) {
  console.log(position.coords.latitude +" "+ position.coords.longitude);
  let locationUrl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+position.coords.latitude+','+position.coords.longitude;
  $.get(locationUrl, function(rsp) {
    let location = rsp.results[rsp.results.length-3].formatted_address;
    console.log(location);
    conversation.splice(conversation.length-5, 0, 'It looks like you are located in '+location+', Is that correct? Would you like me to tell you where the nearest family history center is?');
  });
});

// Get user tree person
fs.get('/platform/tree/current-person', function(error, rsp) {
  // console.log(rsp.headers.location);
  fs.get(rsp.headers.location, function(error, rsp) {
    // console.log(rsp.data);
    let person = rsp.data.persons[0];
    let name = person.display.name.split(" ")[0];
    let birth = person.display.birthDate;
    let kids = (person.display.familiesAsParent[0].children) ? person.display.familiesAsParent[0].children.length : 0;
    let title = (person.display.gender == "Male") ? "Father" : "Mother";

    conversation.unshift('I see you have '+kids+' children. They must be proud of their '+title+' ;-)');
    conversation.unshift('Glad to hear it! It looks like you have a birthday coming up on '+birth+'. Happy Birthday!');
    conversation.unshift('Hello '+name+'. I\'m Leafie, your automated research assistant. How are you doing today?');
  });
});

// Get current person
fs.get('/platform/tree/persons/'+params.pid, function(error, rsp) {
  // console.log(rsp.data);
  let person = rsp.data.persons[0];
  let name = person.display.name;

  conversation.splice(conversation.length-5, 0, 'It looks like you are researching '+name+'. Can I help you find more information about this person?');
});

// Get Query parameters
function getQueryParams() {
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for(var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
  }
  return vars;
}



var $messages = $('.messages-content'),
    d, h, m,
    i = 0;

$(window).load(function() {
  $messages.mCustomScrollbar();
  setTimeout(function() {
    fakeMessage();
  }, 100);
});

function updateScrollbar() {
  $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
    scrollInertia: 10,
    timeout: 0
  });
}

function setDate(){
  d = new Date()
  if (m != d.getMinutes()) {
    m = d.getMinutes();
    $('<div class="timestamp">' + d.toTimeString().substr(0,5) + '</div>').appendTo($('.message:last'));
  }
}

function insertMessage() {
  msg = $('.message-input').val();
  if ($.trim(msg) == '') {
    return false;
  }
  $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
  setDate();
  $('.message-input').val(null);
  updateScrollbar();
  setTimeout(function() {
    fakeMessage();
  }, 1000 + (Math.random() * 20) * 100);
}

$('.message-submit').click(function() {
  insertMessage();
});

$(window).on('keydown', function(e) {
  if (e.which == 13) {
    insertMessage();
    return false;
  }
})

function fakeMessage() {
  if ($('.message-input').val() != '') {
    return false;
  }
  $('<div class="message loading new"><figure class="avatar"><img src="https://misbach.github.io/tabs/bot/icon.jpg" /></figure><span></span></div>').appendTo($('.mCSB_container'));
  updateScrollbar();

  setTimeout(function() {
    $('.message.loading').remove();
    $('<div class="message new"><figure class="avatar"><img src="https://misbach.github.io/tabs/bot/icon.jpg" /></figure>' + conversation[i] + '</div>').appendTo($('.mCSB_container')).addClass('new');
    setDate();
    updateScrollbar();
    i++;
  }, 1000 + (Math.random() * 20) * 100);

}