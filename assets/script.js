 "use strict";
/*global $:false, io:false */

var socket = io.connect();
var logged = false; // fixme: get from socket getAccessLevel method...
var accessLevel = 0; // guest
var configuration = null;

function displayChat() {
   $('#loaderContainer').hide();
   $('#loginContainer').hide();
   $('#chatContainer').show();
}

function displayLoginForm() {
   $('#loaderContainer').hide();
   $('#loginContainer').show();
   $('#chatContainer').hide();
}

function setNickname() {
   var nickname = $('#nicknameInput').val();
   if(nickname !== '') {
      socket.emit('setNickname', nickname);
      socket.emit('setAccessLevel', 1); // user
      socket.emit('join', configuration.defaults.main_room_name);
      logged = true;// fixme: use getAccessLevel

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

socket.on('accessLevel', function(response) {
   if(response > 0) {
      logged = true;
      accessLevel = response;
   }
   else {
      logged = false;
      accessLevel = 0;
   }
});

socket.on('config', function(config) {
   configuration = config;
   displayLoginForm();
});

socket.on('message', function(data) {
   sentMessage();
});

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
   // TODO
   displayLoginForm();
});

$(function() {
   $('#nicknameSet').click(function() { setNickname(); });
   $('#nicknameInput').keypress(function(e) { if(e.which === 13) { setNickname(); } }).focus();
   $('#submit').click(function() { sentMessage(); });
   $('#messageInput').keypress(function(e) { if(e.which === 13) { sentMessage(); } });
   $('#users').on('click', 'a', function() { $('#users a').removeClass('active'); $(this).addClass('active'); });
   $('#rooms').on('click', 'a', function() { $('#rooms a').removeClass('active'); $(this).addClass('active'); });

   window.onbeforeunload = function(e) {
      if(logged) {
         socket.emit('logout');
         logged = false; //fixme
      }
   };

});