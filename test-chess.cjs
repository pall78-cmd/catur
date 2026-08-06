const { Chess } = require('chess.js');
const chess = new Chess();
chess.move('e4');
const history = chess.history({ verbose: true });
const chess2 = new Chess();
try {
  chess2.move(history[0]);
  console.log('Success:', chess2.fen());
} catch(e) {
  console.log('Error:', e.message);
}
