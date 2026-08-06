const { Chess } = require('chess.js');
const chess = new Chess();
chess.move('e4'); chess.move('e5');
chess.move('Nf3'); chess.move('Nc6');
chess.move('Bc4'); chess.move('Bc5');
const move = chess.move({ from: 'e1', to: 'g1', promotion: 'q' });
console.log('Castling:', move);
