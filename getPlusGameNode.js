const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs');
const obj = JSON.parse(fs.readFileSync('json/second.json', 'utf8'))
const FreeGamePattern = 'https://farm1.staticflickr.com/314/19510947234_fe188595b8_o.jpg'
const FreeContentPattern = 'https://c2.staticflickr.com/2/1700/24180962200_d39a69285b_o.jpg'
const DiscountPattern = 'https://farm1.staticflickr.com/370/19510947034_61393d5835_o.jpg'

var Rcontainer = []
var nowDone = 0
var jobs = 12 // Since before 2016 Jan there's another webpage pattern

for(var k = 0; k < jobs; ++k){
	getSingleMonth(k)
}

function getSingleMonth(k){
	request(obj[k].href, (err, res, body) => {
		var $ = cheerio.load(body)
		var nodes = $('.con_detail').children()
		
		for(var i = 0; i < nodes.length; ++i){
			if(nodes[i].name != 'p') continue
			else{
				if(typeof nodes[i].children[0].name != undefined && nodes[i].children[0].name == 'img' && nodes[i].children[0].attribs.src == FreeGamePattern){
					parse(nodes[i].next, obj[k].title, [])
				}
			}
			
		}
	})
}

function parse(node, metaData, container=[]){
	if(node == null){
		return done(metaData,container)
	}
	else if(node.type == 'text') return parse(node.next,metaData,container)
	else{
		if(node.name == 'p'){
			if(node.children[0].type == 'tag' && node.children[0].name == 'img' && (node.children[0].attribs.src == FreeContentPattern || node.children[0].attribs.src == DiscountPattern)) {
				return done(metaData,container)
			}
		}
		else if(node.name == 'div'){
			for(var i = 0; i < node.children.length; ++i){
				if(node.children[i].type == 'tag' && node.children[i].name == 'div'){
					
					if(node.children[i].children[0].data.replace(/\n/g, '').length != 0) // get rid of blanks
						continue
					
					var $ = cheerio.load(node.children[i])
					var tmpcontainer = { title : '', platform: [], img : ''}
					var title = ''
					
					for(var j = 0; j < $('.nowrap').length; ++j) // sometimes title splits to multiple spans
						title += $('.nowrap')[j].children[0].data + ' '
					tmpcontainer.title = title.substring(0, title[title.length-1] == ' ' ? title.length-1 : title.length)

					for(var j = 0; j < $('img').length; ++j){
						var src = $('img')[j].attribs.src
						
						if(['ps4', 'ps3', 'psv'].indexOf(src.substring(src.lastIndexOf('/') + 1, src.length - 4)) >= 0)
							tmpcontainer.platform.push(src.substring(src.lastIndexOf('/') + 1, src.length - 4))
						else
							tmpcontainer.img = src
					}

					container.push(tmpcontainer)
				}
				else if(node.children[i].type == 'tag' && node.children[i].name == 'p'){ // end of node
					if(node.children[i].children[0].type == 'tag' && (node.children[i].children[0].attribs.src == FreeContentPattern || node.children[i].children[0].attribs.src == DiscountPattern))
						return done(metaData,container)
				}
			}
		}
		if(typeof node.next != undefined)
			return parse(node.next,metaData, container)
	}
}

function done(metaData,container){
	Rcontainer.push({ title : metaData, container : container })
	nowDone++
	if(nowDone >= jobs)
		fs.writeFile('json/last.json', JSON.stringify(Rcontainer, null, 4));
}