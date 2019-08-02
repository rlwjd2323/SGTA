const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });
exports.client = client;
console.log("esConn Ok!");



//키워드로 정보 검색
exports.fnSearchInfo = function(socket_id, io, keywordArray){
	
		var makeQuery = async function(socket_id, io, keywordArray) {
			var result_list = [];
			for(var i=0; i<keywordArray.length; i++){
				var dict_keyword = keywordArray[i];
				try {
					const response = await client.search({
						index:"keyword_info",
						type:"keyword",
						body: {												
							"query": {
								"match" :{
									"keyword" : dict_keyword
								}
							} 
						}
					})
					for (var j=0; j<(response.body.hits.hits).length; j++){
						var keyword = response.body.hits.hits[j]._source.keyword;
						var information = response.body.hits.hits[j]._source.information;
						if (keyword.length > 0){
							var obj = {
								keyword : keyword,
								information : information
							}
							result_list.push(obj);
						}else{
							console.log("검색 결과 없음");
						}
					}					
				} catch (err) {
					result_list = [];
				}
			}
			if(result_list.length>0){
				
				io.to(socket_id).emit('information', result_list);
			}
		}
		makeQuery(socket_id, io, keywordArray);	

}






//대화 내용 삽입 function
exports.fnRegisterContent = function(content){

	var makeQuery = async function(content) {
	  
	  try {
		const response = await client.search({
			index:"chat_info",
			type:"contents",
			body: {}
		})
		var resList = response.body.hits.hits;
		var resList_Len = resList.length-1;
		var id = resList[resList_Len]._id;
		id = Number(id)+1;
		
		client.index({
			index:"chat_info",
			id:id,
			type:"contents",
			body:{
				"content":content
			}
		}, function(err, resp, status){
			//console.log(resp);		
		});
		
		console.log(content);
	  } catch (err) {
		console.error(err)
	  }
	}
	makeQuery(content);
}
