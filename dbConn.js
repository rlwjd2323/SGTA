const esConn = require('./esConn.js');
const express = require('express');
const router = express.Router();
const mysql = require("mysql");
// 커넥션 연결
var pool = mysql.createPool({
    host: '192.168.0.237',
    post: 3306,
    user: 'sig_app',
    password: '!thffnrpdlxm23',
    database: 'SGTA_CHAT'
});
console.log("dbConn Ok");

//문장 단위에서 사전에 있는 키워드 언급여부 검색
exports.fnExtractDictKeyword = function(socket_id, io, message){
	pool.getConnection(function(err,con){
	con.query('SELECT tc_seq, tc_keyword FROM TB_TA_DICT_KEYWORD', function(err,result){
		keywordArray = [];
		for(var i=0; i<result.length;i++){
			var dict_keyword = result[i].tc_keyword;
			if(message.indexOf(dict_keyword)>-1){
				keywordArray.push(dict_keyword);
			}
		}
		if(keywordArray.length>0){
			esConn.fnSearchInfo(socket_id, io, keywordArray);
		}
	});
});
}




