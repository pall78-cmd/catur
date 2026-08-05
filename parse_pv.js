const str = "info depth 10 seldepth 14 multipv 1 score cp 26 nodes 13444 nps 6722000 tbhits 0 time 2 pv e2e4 e7e5";
const match = str.match(/pv ([a-h][1-8])([a-h][1-8])/);
console.log(match);
