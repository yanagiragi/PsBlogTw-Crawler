const fs = require('fs');
const obj = JSON.parse(fs.readFileSync('json/first.json', 'utf8'))

var container = []
for(var i = 0; i < obj.length; ++i){
	for (var j = 0; j < obj[i].length; ++j) {
		if(obj[i][j].title.indexOf('PS Plus 20') >= 0 && obj[i][j].title.indexOf('月免費遊戲') >= 0){
			container.push(obj[i][j])
		}
	}
}

fs.writeFile('json/second.json', JSON.stringify(container, null, 4));