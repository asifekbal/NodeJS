const net = require('net');

var server = net.createServer((socket) => {
    socket.end(`Good Bye Asif!`);
}).on('error',(err)=>{
    console.log(err);
    throw err;
});

server.listen(50302,()=>{
    address = server.address();
    console.log('Opened server at %j',address);
});

