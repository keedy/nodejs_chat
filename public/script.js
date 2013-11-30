
var socket = io.connect();
var logged = false;

function addMessage(message, nickname, room) {
   if(logged) {
	  $('#chatEntries > .' + room).append('<div class="message"><p><strong>' + nickname + '</strong>: ' + message + '</p></div>');
   }
}

function sentMessage() {
   var messageElem = $('#messageInput');
   var message = messageElem.val();

	if (message != '') {
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
   if(nickname != '') {
      socket.emit('setNickname', nickname);
      socket.emit('join', 'chat');
      logged = true;

      $('#chatControls').show();
      $('#chatEntries').show();
      $('#users').show();
      $('#messageInput').show();
      $('#submit').show();

      $('#nicknameContainer').hide();
      $('#nicknameInput').hide();
      $('#nicknameSet').hide();

      $('#messageInput').focus();
   }
   else {
      $('#nicknameInput').parent().addClass('has-error');
   }
}

socket.on('message', function(data) {
   console.log(data);
   addMessage(data['message'], data['nickname'], data['room']);
});

$(function() {
   $('#nicknameSet').click(function() { setNickname(); });
   $('#nicknameInput').keypress(function(e) { if(e.which == 13) { setNickname(); } }).focus();
   $('#submit').click(function() { sentMessage(); });
   $('#messageInput').keypress(function(e) { if(e.which == 13) { sentMessage(); } });
});