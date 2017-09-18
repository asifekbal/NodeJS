var http = require('http');
const fs = require('fs');
const dns = require('dns');

http.createServer(function (request, response) {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end("<b><i> Hello Asif </i></b>");
}).listen(8081);

console.log("Server is running at port 8081 ...");

// try{
//     const a = 1;
//     const c = a + b;
// } catch(err){
//     console.log(err);
// }

function nodeStyleCallback(err,data){
    if (err) {
        console.log("There was an error",err);
        return;
    }
    console.log(data);
}
// fs.readFile('/Users/asifekbal/AsifLearning/NodeTutorials/firstapp/os1.js',nodeStyleCallback());
fs.readFile('/Users/asifekbal/AsifLearning/NodeTutorials/firstapp/os.js',nodeStyleCallback());

//DNS
dns.lookup('www.facebook.com', function (err,addresses,family) {
    console.log("Addresss : ", addresses);
    console.log("Family : ",family);
});

dns.resolve4("www.facebook.com",(err,addresses)=>{
    if(err) throw err;
    console.log(`Address : ${JSON.stringify(addresses)}`);
    addresses.forEach((a)=>{
        dns.reverse(a,(err,hostname)=>{
            if(err) throw err;
            console.log(`Reverse for ${a} : ${JSON.stringify(hostname)}`);
        })

    });
});



dns.lookupService('127.0.0.1', 22, (err, hostname, service) => {  
  console.log(hostname, service);  
});  
