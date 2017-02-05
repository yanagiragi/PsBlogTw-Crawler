const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs');

const prefix = 'https://blog.asia.playstation.com/tw-cht/page/'
const postfix = '/#BreakingNews'
const max = 10000

p_getPage().then( data => {
	fs.writeFile('json/first.json', JSON.stringify(data.data, null, 4));
})

function p_getPage(){
	return new Promise( (resolve, reject) => {
		getAllPage({now : 1, max : max, data : []}, resolve)
	})
}

function getAllPage(controller, callback){
	
	console.log(`${controller.now}/${controller.max}, getting ${prefix + controller.now.toString() + postfix} ...`)
	
	if(controller.now >= controller.max) callback(controller)
	else {
		p_requestPage(prefix + controller.now.toString() + postfix)
			.then(data => {
				if(data == null){
					callback(controller)	
				} 
				else{
					controller.data.push(data)
					controller.now++
					getAllPage(controller, callback)
				} 
			})
	}
}

function p_requestPage(url){
	return new Promise((resolve, reject) => {
		request(url, (err, res, body) => {
			if(!err){
				var $ = cheerio.load(body)
				var nodes = $('.list_tit')
				if(nodes.length == 0) resolve(null)
				else parse(nodes, resolve)
			}
			else{
				console.error(err)
			}
		})
	})
}

function parse(nodes, callback){
	var container = []
	for (var i = nodes.length - 1; i >= 0; i--) {
		container.push({
			title : nodes[i].children[1].children[0].data,
			href : nodes[i].parent.parent.attribs.href
		})
	}
	callback(container)
}

