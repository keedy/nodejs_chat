
var socket = io.connect();
var logged = false;

function addMessage(msg, nickname) {
   if(logged) {
	  $('#chatEntries').append('<div class="message"><p><strong>' + nickname + '</strong>: ' + msg + '</p></div>');
   }
}

function sentMessage() {
	if ($('#messageInput').val() != "") 
	{
      $('#messageInput').parent().removeClass('has-error');
      socket.emit('message', $('#messageInput').val());
      addMessage($('#messageInput').val(), "Me", new Date().toISOString(), true);
		$('#messageInput').val('').focus();
	}
   else {
      $('#messageInput').parent().addClass('has-error');
   }
}

function setNickname() {
   if ($('#nicknameInput').val() != "")
   {
      socket.emit('setNickname', $("#nicknameInput").val());
      logged = true;
      $('#chatControls').show();
      $('#chatEntries').show();
      $('#users').show();
      $('#nicknameContainer').hide();
      $('#submit').show();
      $('#nicknameInput').hide();
      $('#nicknameSet').hide();
      $('#messageInput').focus();
   }
   else {
      $('#nicknameInput').parent().addClass('has-error');
   }
}

socket.on('message', function(data) {
   addMessage(data['message'], data['nickname']);
});

$(function() {
   $('#nicknameSet').click(function() { setNickname(); });
   $('#nicknameInput').keypress(function(e) { if(e.which == 13) { setNickname(); } }).focus();
   $('#submit').click(function() { sentMessage(); });
   $('#messageInput').keypress(function(e) { if(e.which == 13) { sentMessage(); } });
});