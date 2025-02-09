const http = require('http');

http.createServer((req, res) => {
	res.write("On the way to be a full stack");
	res.end();
}).listen(3000);

console.log("Server started on port 3000");

