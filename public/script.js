var socket = io.connect();
var logged = false;

function addMessage(msg, nickname) {
   if(logged) {
	  $('#chatEntries').append('<div class="message"><p>' + nickname + ' : ' + msg + '</p></div>');
   }
}

function sentMessage() {
	if ($('#messageInput').val() != "") 
	{
		socket.emit('message', $('#messageInput').val());
		addMessage($('#messageInput').val(), "Me", new Date().toISOString(), true);
		$('#messageInput').val('');
	}
}

function setNickname() {
   if ($('#nicknameInput').val() != "")
   {
      socket.emit('setNickname', $("#nicknameInput").val());
      logged = true;
      $('#chatControls').show();
      $('#nicknameLabel').hide();
      $('#nicknameInput').hide();
      $('#nicknameSet').hide();
      $('#messageInput').focus();
   }
}

socket.on('message', function(data) {
   addMessage(data['message'], data['nickname']);
});

$(function() {
   $('#chatControls').hide();
   $('#nicknameSet').click(function() { setNickname(); });
   $('#nicknameInput').keypress(function(e) { if(e.which == 13) { setNickname(); } });
   $('#submit').click(function() { sentMessage(); });
   $('#messageInput').keypress(function(e) { if(e.which == 13) { sentMessage(); } });
});