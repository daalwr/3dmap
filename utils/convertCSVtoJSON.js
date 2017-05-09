const csv=require('csvtojson')
const fs = require('fs');

var acc = {}
const constID = "ons_id"

csv({noheader:false})
.fromFile(process.argv[2])
.on('json',(json)=>{
    acc[json[constID]]=json
    console.log(json)
})
.on('done',()=>{
    //parsing finished 
    fs.writeFileSync('output.json', JSON.stringify(acc));
})