const fetch = require('node-fetch')
const fs = require('fs');
const entity = 'Q44541'

function isObject(obj)
{
    return obj != null && obj.constructor.name === "Object"
}

const remoteRepo = 'https://github.com/agnescameron/wikidata'

const context = {
	"@vocab": "https://www.wikidata.org/wiki/Template:",
	"prov": "http://www.w3.org/ns/prov#",
}

const fetchURL = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entity}&format=json&props=sitelinks|labels|descriptions|claims`

try{
	fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entity}&format=json&props=sitelinks|labels|descriptions|claims`)
		.then(response => response.json())
		.then(data => {
		
		//iterate claims as assertions
		for(claim in data.entities[entity].claims){
			var now = new Date();

			const claimType = data.entities[entity].claims[claim][0].mainsnak.datavalue.type;
			let claimVal = data.entities[entity].claims[claim][0].mainsnak.datavalue.value;
			claimVal = isObject(claimVal) ? claimVal.id : claimVal;

			const claimGraph = {
				"@context": context,
				"prov:wasDerivedFrom": {
					"@id": fetchURL
				},
				"prov:wasGeneratedBy": {
					"prov:startedAtTime": {
						"@value": now.toISOString(),
						"@type": "http://www.w3.org/2001/XMLSchema#dateTime"
					},
					"prov:used": {
						"@id": remoteRepo
					}
				},
				"@graph": {
					"@type": "Claim",
					"subject": entity,
					"property": claim,
					"qualifier": claimType,
					"qualifierValue": claimVal
				}
			};

			//write assertion to file
			fs.writeFile(`package/${claim}.jsonld`, JSON.stringify(claimGraph, null, 4), function (err) {
			  if (err) return console.log(err);
			});
		};
	});
}
catch(e){
	console.log(e)
}