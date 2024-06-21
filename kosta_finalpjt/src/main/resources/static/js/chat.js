function connect(newRoomId) {
	roomId = newRoomId;
	var socket = new SockJS('/auth/ws');
	stompClient = Stomp.over(socket);
	stompClient.connect({}, function(frame) {
		var subscriptionId = 'sub-' + userId1;
		stompClient.subscribe('/room/' + roomId, function(messageOutput) {
			var message = JSON.parse(messageOutput.body);
			var cri = message[0].room.chatroomid;
			if (cri === roomId) {
				showMessage(message);
			}
		}, { id: subscriptionId });

		stompClient.subscribe('/recent/update', function() {
			recentChatRooms(userId1);
		});
		loadMessages(roomId);
		loadChatRoomsConnect(roomId, userId1);
	});
}


function loadMessages(roomId) {
	var URL = 'http://localhost:8081/chat/message/room/';
	$.ajax({
		url: URL + roomId,
		type: 'GET',
		success: function(data) {
			showMessage(data);
		},
		error: function() {
			alert('메시지를 불러오는데 실패했습니다.');
		}
	});
}

function loadChatRoomsBySearch() {
	var id = document.getElementById('inlineFormInputGroup').value;
	var URL = 'http://localhost:8081/chat/chatrooms/loadrooms/search/';
	if (!id) {
		id = userId1;
		URL = 'http://localhost:8081/chat/chatrooms/loadrooms/';
	}
	$.ajax({
		url: URL + id,
		type: 'GET',
		success: function(response) {
			loadChatRoomsView(response, userId1);
		},
		error: function() {
			alert('검색된 채팅방 없습니다.');
		}
	});
}

function loadChatRoomsConnect(chatroomid, userId1) {
	var URL = 'http://localhost:8081/chat/chatrooms/loadrooms/searchroom/';
	$.ajax({
		url: URL + chatroomid + '/' + userId1,
		type: 'GET',
		success: function(response) {
			loadChatRoomsConnectView(response, userId1);
		},
		error: function() {
			alert('채팅방을 불러오는데 실패했습니다.');
		}
	});
}


function loadChatRoomsConnectView(chatRoom, userId1) {
	var centerStyle = $('#centerstyle');
	centerStyle.empty();
	var chatRoomNames = '';
	var chatMembers = '';
	var imgName = chatRoom.img;
	if (chatRoom.img === null) {
		imgName = '';
	}
	if (chatRoom.roomType !== 'PRIVATE') {
		if (chatRoom.chatRoomNames.length > 0) {
			var name = chatRoom.chatRoomNames[0].editableName.replace(/_/g, ' ').trim();
			chatMembers = name;
			chatRoomNames = name;
		}
	} else {
		chatRoomNames = chatRoom.chatRoomNames[0].roomName;
		chatMembers = '개인방';
	}
	var chatRoomList = `
                <a href="#" class="d-flex align-items-center">
                    <div class="flex-shrink-0">
                     <img class="img-fluid-center" src="/member/memberimg?memberimgnm=${imgName}" alt="user img">
                        <span class="active"></span>
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <input class="roomNameStyle" type="text" id="chatRoomNameInput" value="${chatRoomNames}">
                        <img class="img-chateditImg" src="/img/chat/chatedit.png" id="editRoomNameImg" onclick="editRoomName('${chatRoom.chatroomid}','${userId1}')">
                        <p>${chatMembers}</p>
                    </div>
                </a>
            `;
	centerStyle.append(chatRoomList);
}

function editRoomName(chatRoomId, userId1) {
	var newRoomName = document.getElementById('chatRoomNameInput').value;
	if (newRoomName) {
		$.ajax({
			url: '/chat/chatrooms/edit',
			type: 'POST',
			data: {
				userId1: userId1,
				chatroomid: chatRoomId,
				newRoomName: newRoomName
			},
			success: function(response) {
				loadChatRooms(userId1);
			},
			error: function(error) {
				alert('채팅방 이름 수정에 실패했습니다.');
			}
		});
	}
}

function recentChatRooms(userId1) {
	var URL = 'http://localhost:8081/chat/chatrooms/loadrooms/';
	$.ajax({
		url: URL + userId1,
		type: 'GET',
		success: function(response) {
			loadChatRoomsView(response, userId1);
		},
		error: function() {
			alert('채팅방을 불러오는데 실패했습니다.');
		}
	});
}


function loadChatRooms(userId1) {
	var URL = 'http://localhost:8081/chat/chatrooms/loadrooms/';
	$.ajax({
		url: URL + userId1,
		type: 'GET',
		success: function(response) {
			loadChatRoomsView(response, userId1);
		},
		error: function() {
			alert('채팅방을 불러오는데 실패했습니다.');
		}
	});
}

function loadChatRoomsView(data, userId1) {
	var openStyle = $('#openstyle');
	var closeStyle = $('#closestyle');
	openStyle.empty();
	closeStyle.empty();
	data.forEach(function(chatRoom) {
		var chatRoomNames = '';
		var chatMembers = '';
		var imgName = chatRoom.img;
		if (chatRoom.img === null) {
			imgName = '';
		}
		if (chatRoom.roomType !== 'PRIVATE') {
			if (chatRoom.chatRoomNames.length > 0) {
				var name = chatRoom.chatRoomNames[0].editableName.replace(/_/g, ' ').trim();
				chatMembers = chatRoom.recentMsg;
				chatRoomNames = name;
			}
		} else {
			chatRoomNames = chatRoom.chatRoomNames[0].roomName;
			chatMembers = '개인방';
		}
		var chatRoomList = `
			         <a href="#" class="d-flex align-items-center">
			             <div class="flex-shrink-0">
			                 <img class="img-fluid-center" src="/member/memberimg?memberimgnm=${imgName}" alt="user img">
			                 <span class="active"></span>
			             </div>
			             <div class="flex-grow-1 ms-3">
			                 <h3 onclick="connect('${chatRoom.chatroomid}')">${chatRoomNames}</h3>
			                 <p>${chatMembers}</p>
			             </div>
			         </a>
			      `;
		if (chatRoom.roomType === 'PERSONAL' || chatRoom.roomType === 'PRIVATE') {
			openStyle.append(chatRoomList);
		} else if (chatRoom.roomType === 'GROUP') {
			closeStyle.append(chatRoomList);
		}
	});
}

function getOutRoom(roomId) {
	const date = new Date();
	const yoptions = {
		year: 'numeric',
		month: 'long',
		day: '2-digit'
	};
	const hoptions = {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	}
	const sendDay = date.toLocaleString('ko-KR', yoptions);
	const sendTime = date.toLocaleString('ko-KR', hoptions);
	var message = {
		'type': 'OUT',
		'sender': userId1,
		'content': userId1 + "님이 퇴장했습니다.",
		'sendDate': sendDay + ' ' + sendTime
	};
	stompClient.send("/send/chat/message/" + roomId, {}, JSON.stringify(message));
	document.getElementById('message').value = '';


	$.ajax({
		url: 'http://localhost:8081/chat/chatrooms/out/' + roomId + '/' + userId1,
		type: 'GET',
		success: function(response) {
			window.location.href = response;
		},
		error: function(error) {
			console.error(error);
		}
	});
}


function sendMessage(roomId) {
	const date = new Date();
	const yoptions = {
		year: 'numeric',
		month: 'long',
		day: '2-digit'
	};
	const hoptions = {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	}
	const sendDay = date.toLocaleString('ko-KR', yoptions);
	const sendTime = date.toLocaleString('ko-KR', hoptions);

	var content = document.getElementById('message').value;
	var sender = document.getElementById('sender').value;
	var partId = document.getElementById('partid').value;
	var message = {
		'type': 'MESSAGE',
		'content': content,
		'sender': sender,
		'partid': partId,
		'sendDate': sendDay + ' ' + sendTime
	};
	stompClient.send("/send/chat/message/" + roomId, {}, JSON.stringify(message));
	document.getElementById('message').value = '';
}

function sendFileMessage(roomId) {
	const date = new Date();
	const yoptions = {
		year: 'numeric',
		month: 'long',
		day: '2-digit'
	};
	const hoptions = {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	}
	const sendDay = date.toLocaleString('ko-KR', yoptions);
	const sendTime = date.toLocaleString('ko-KR', hoptions);

	var sender = document.getElementById('sender').value;
	var partId = document.getElementById('partid').value;
	var fileInput = document.getElementById('upload');
	var file = fileInput.files[0];
	var formData = new FormData();
	formData.append('file', file);

	$.ajax({
		url: '/chat/message/upload',
		type: 'POST',
		data: formData,
		processData: false,
		contentType: false,
		success: function(response) {
			var message = {
				'type': 'FILE',
				'fileName': response.fileName,
				'fileRoot': response.fileRoot,
				'sender': sender,
				'partid': partId,
				'sendDate': sendDay + ' ' + sendTime
			};
			stompClient.send("/send/chat/message/" + roomId, {}, JSON.stringify(message), function() {
				loadChatRooms(userId1);
			});
		},
		error: function() {
			alert('파일 업로드에 실패했습니다.');
		}
	});

	fileInput.value = '';
}

function showMessage(messages) {
	const date = new Date();
	const yoptions = {
		year: 'numeric',
		month: 'long',
		day: '2-digit'
	};
	const hoptions = {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	}
	const sendDay = date.toLocaleString('ko-KR', yoptions);
	const sendTime = date.toLocaleString('ko-KR', hoptions);

	var response = document.getElementById('chat-content');
	response.innerHTML = "";
	messages.forEach(function(message) {
		if (message.room.chatroomid !== roomId) return;
		var spanName = document.createElement('span');
		spanName.className = 'senderName';
		var spanTime = document.createElement('span');
		spanTime.className = 'time';
		var li = document.createElement('li');
		var p = document.createElement('p');
		if (message.sender === userId1) {
			li.className = 'sender';
		} else {
			li.className = 'reply';
		}

		if (message.type === 'INVITE' || message.type === 'MESSAGE' || message.type === 'OUT') {
			spanName.textContent = message.partid;
			p.innerHTML = message.content;
			spanTime.textContent = message.sendDate.substring(13, 18);
		} else if (message.type === "FILE") {
			var fileLink;
			var fileType = message.fileName.split('.').pop().toLowerCase();
			if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(fileType)) {
				fileLink = '<img src="' + message.fileRoot + '" alt="' + message.fileName + '" style="width:200px; height:200px;">';
				spanName.textContent = message.partid;
				p.innerHTML = fileLink;
				spanTime.textContent = message.sendDate.substring(13, 18);
			} else {
				fileLink = '<a href="' + message.fileRoot + '" download="' + message.fileName + '">' + message.fileName + '</a>';
				spanName.textContent = message.partid;
				p.innerHTML = fileLink;
				spanTime.textContent = message.sendDate.substring(13, 18);
			}
		}
		li.appendChild(spanName);
		li.appendChild(p);
		li.appendChild(spanTime);
		response.appendChild(li);
	});
}


function searchChatRooms() {
	var user = document.getElementById('search').value;
	window.location.href = '/chat/chatrooms?user=' + user;
}

function resetModal(modalId) {
	if (modalId === '0') {
		$('#exampleModal .list_input').val('');
	} else if (modalId === '1') {
		$('#exampleModal2 .list_input').val('');
	}
}

$(document).ready(function() {
	loadChatRooms(userId1);
	$("#sendButton").click(function() { sendMessage(roomId); });
	$("#inviteButton").click(function() { inviteUser(roomId); });
	$("#searchButton").click(function() { searchChatRooms(); });
	$("#upLoadButton").click(function() { sendFileMessage(roomId); });

	$('#exampleModal').on('show.bs.modal', function(e) {
		resetModal('0');
	});

	$('#exampleModal2').on('show.bs.modal', function(e) {
		$('#roomIdInput').val(roomId);
		resetModal('1');
	});
});