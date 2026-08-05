const Worker = require('worker_threads').Worker;
// wait we don't have worker_threads for a browser stockfish.js
// let's just parse the file to see if it's the expected version
