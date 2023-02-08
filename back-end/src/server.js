import http from 'http';

let server = http.createServer();

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});