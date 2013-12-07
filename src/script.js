 "use strict";
/*global $:false, io:false */

var socket = io.connect();
var logged = false;

function switchControlls() {
   $('#nicknameContainer').css('display') === 'none' ? $('#nicknameContainer').show()   : $('#nicknameContainer').hide();
   $('#nicknameInput').css('display')     === 'none' ? $('#nicknameInput').show()       : $('#nicknameInput').hide();
   $('#nicknameSet').css('display')       === 'none' ? $('#nicknameSet').show()         : $('#nicknameSet').hide();
   $('#chatEntries').css('display')       === 'none' ? $('#chatEntries').show()         : $('#chatEntries').hide();
   $('#chatControls').css('display')      === 'none' ? $('#chatControls').show()        : $('#chatControls').hide();
   $('#usersContainer').css('display')    === 'none' ? $('#usersContainer').show()      : $('#usersContainer').hide();
   $('#users').css('display')             === 'none' ? $('#users').show()               : $('#users').hide();
   $('#messageInput').css('display')      === 'none' ? $('#messageInput').show()        : $('#messageInput').hide();
   $('#submit').css('display')            === 'none' ? $('#submit').show()              : $('#submit').hide();
}

function addMessage(message, nickname, room) {
   if(logged) {
      $('#chatEntries > . ' + room).append('<div class="message"><p><strong>' + nickname + '</strong>: ' + message + '</p></div>');
   }
}

function sentMessage() {
   var messageElem = $('#messageInput');
   var message = messageElem.val();

   if (message !== '') {
      messageElem.parent().removeClass('has-error');
      socket.emit('message', message);
      addMessage(message, 'Me', 'chat');
      messageElem.val('').focus();
   }
   else {
      messageElem.parent().addClass('has-error');
   }
}

function setNickname() {
   var nickname = $('#nicknameInput').val();
   if(nickname !== '') {
      socket.emit('setNickname', nickname);
      socket.emit('join', 'chat');
      logged = true;

      switchControlls();

      $('#messageInput').focus();
   }
   else {
      $('#nicknameInput').parent().addClass('has-error');
   }
}

socket.on('message', function(data) {
   addMessage(data['message'], data['nickname'], data['room']);
});

socket.on('usersList', function(users) {
   $.each(users, function(k, v) {
      $('#users').append('<a href="#" class="list-group-item">' + v['nickname'] + '</a>');
   });
});

socket.on('disconnect', function() {
   switchControlls();
});

$(function() {
   $('#nicknameSet').click(function() { setNickname(); });
   $('#nicknameInput').keypress(function(e) { if(e.which === 13) { setNickname(); } }).focus();
   $('#submit').click(function() { sentMessage(); });
   $('#messageInput').keypress(function(e) { if(e.which === 13) { sentMessage(); } });
   $('#users').on('click', 'a', function() { $('#users a').removeClass('active'); $(this).addClass('active'); });
});