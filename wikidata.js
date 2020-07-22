const fetch = require('node-fetch')
const fs = require('fs');
const entity = 'Q44541'

function isObject(obj)
{
    return obj != null && obj.constructor.name === "Object"
}

try{
	fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entity}&format=json&props=sitelinks|labels|descriptions|claims`)
		.then(response => response.json())
		.then(data => {
		
		//iterate claims as assertions
		for(claim in data.entities[entity].claims){
			let claimVal = data.entities[entity].claims[claim][0].mainsnak.datavalue.value;
			claimVal = isObject(claimVal) ? claimVal.id : claimVal;
			const assertion = `<${entity}><${claim}><${claimVal}>`;

			//write assertion to file
			fs.writeFile(`package/${claim}.nt`, assertion, function (err) {
			  if (err) return console.log(err);
			});
		};
	});
}
catch(e){
	console.log(e)
}