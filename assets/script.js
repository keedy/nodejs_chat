 "use strict";
/*global $:false, io:false */

var socket = io.connect();
var logged = false; // todo get from socket getState...
var configuration = null;

function displayChat() {
   $('#nicknameContainer, #nicknameInput, #nicknameSet').hide();
   $('#chatEntries, #chatControls, #usersContainer, #users, #roomsContainer, #rooms, #messageInput,#submit').show();
}

function displaySignInForm() {
   $('#nicknameContainer, #nicknameInput, #nicknameSet').show();
   $('#chatEntries, #chatControls, #usersContainer, #users, #roomsContainer, #rooms, #messageInput,#submit').hide();
}

function setNickname() {
   var nickname = $('#nicknameInput').val();
   if(nickname !== '') {
      socket.emit('setNickname', nickname);
      socket.emit('setAccessLevel', 1); // user
      socket.emit('join', configuration.defaults.main_room_name);
      logged = true;// hmm ?

      displayChat();

      $('#messageInput').focus();
   }
   else {
      $('#nicknameInput').parent().addClass('has-error');
   }
}

function sentMessage() {
   var messageElem = $('#messageInput');
   var message = messageElem.val();
   var room = configuration.defaults.main_room_name;
   var nickname = 'Me'; // get from socket too


   if (message !== '') {
      messageElem.parent().removeClass('has-error');
      socket.emit('message', message);
      $('#chatEntries > .' + room).append('<div class="message"><p><strong>' + nickname + '</strong>: ' + message + '</p></div>');
      messageElem.val('').focus();
   }
   else {
      messageElem.parent().addClass('has-error');
   }
}

socket.on('accessLevel', function(accessLevel) {
   if(accessLevel > 0) {
      logged = true;
   }
   else {
      logged = false;
   }
});

socket.on('message', function(data) {
   sentMessage();
});

socket.on('config', function(config) {
   configuration = config;
})

socket.on('usersList', function(users) {
   $('#users').empty();
   $.each(users, function(k, v) {
      $('#users').append('<a href="#" class="list-group-item">' + v['nickname'] + '</a>');
   });
});

socket.on('roomsList', function(rooms) {
   $('#rooms').empty();
   $.each(rooms, function(k, v) {
      $('#rooms').append('<a href="#" class="list-group-item">' +v['name'] + '(' + v['counter'] + ')</a>');
   });
})

socket.on('logout', function() {
   displaySignInForm();
});

$(function() {
   $('#nicknameSet').click(function() { setNickname(); });
   $('#nicknameInput').keypress(function(e) { if(e.which === 13) { setNickname(); } }).focus();
   $('#submit').click(function() { sentMessage(); });
   $('#messageInput').keypress(function(e) { if(e.which === 13) { sentMessage(); } });
   $('#users').on('click', 'a', function() { $('#users a').removeClass('active'); $(this).addClass('active'); });
   $('#rooms').on('click', 'a', function() { $('#rooms a').removeClass('active'); $(this).addClass('active'); });

   window.onunload=function() {
return confirm('Are you sure you want to leave the current page?');
}
   // $(window).bind('onbeforeunload', window.confirm('aaa'));
});