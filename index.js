const dbConn = require('./dbConn.js');
const esConn = require('./esConn.js');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);



app.get('/', function(req, res) {
    res.render('index.ejs');
});
var contents = "";

var socket_id = "";
//socket io 연결
io.sockets.on('connection', function(socket) {
	
	//유저 채팅방 입장
    socket.on('username', function(username) {
		if(username == "상담사"){
			socket_id = socket.id;
		}else{
			socket_id = socket_id;
		}
		console.log(socket_id);
        socket.username = username;
        io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
    });

	// 유저 채팅방 퇴장
    socket.on('disconnect', function(username) {	
        io.emit('is_offline', '🔴 <i>' + socket.username + ' left the chat..</i>');
		//퇴장 시 대화 내용 es에 삽입
		if(contents.length>0){
			esConn.fnRegisterContent(contents);	
			contents = "";
		}
    })
	//메세지 전송
    socket.on('chat_message', function(message) {
		io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);		
		//새로운 메세지가 전송 될 때 마다 키워드 탐지
		dbConn.fnExtractDictKeyword(socket_id, io, message);
		//전송된 메세지 하나의 문서로 통합
		contents += message+"\n";
    });
});

//서버 가동
const server = http.listen(3000, function() {
    console.log('listening on *:3000');
});





