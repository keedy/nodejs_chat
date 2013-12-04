var http = require('http');
var ip = process.env.APP_IP || '0.0.0.0';
var port = parseInt(process.env.APP_PORT || '8000');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello, node.js World\n');
}).listen(port, ip);
console.log('Server running at http://' + ip + ':' + port + '/');
