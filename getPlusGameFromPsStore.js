const request = require('request')

var container = []

request('https://store.playstation.com/chihiro-api/viewfinder/TW/ch/999/STORE-MSF86012-PSPLUSCONTENTS?size=999&gkb=1&geoCountry=TW', (err, res, body) => {
	var j = JSON.parse(body)
	for(var i = 0; i < j.links.length; ++i){
		if(j.links[i].bucket == "games"){
			//console.log(JSON.stringify(j.links[i], null, 4 ))

			container.push({
				name : j.links[i].name,
				price : j.links[i].default_sku.display_price,
				id : j.links[i].default_sku.id,
				images: j.links[i].images[0].url,
				platform : j.links[i].playable_platform[0],
				//content_descriptors : j.links[i].content_descriptors == undefined ? [] : j.links[i].content_descriptors
			})
		}
		if(i == j.links.length - 1)
			console.log(JSON.stringify(container, null, 4))
	}
})