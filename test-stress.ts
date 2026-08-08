import { ChessEngine } from './src/ChessEngine';
import { Chess } from 'chess.js';

async function main() {
  console.log('Memulai Stress Test 1000x untuk ChessEngine...');
  try {
    const report = await ChessEngine.execute1000CycleBruteforceTest();
    console.log('\n--- HASIL STRESS TEST (1000 SIKLUS) ---');
    console.log(`Total Siklus   : ${report.totalCycles}`);
    console.log(`Siklus Lolos   : ${report.passedCycles}`);
    console.log(`Siklus Gagal   : ${report.failedCycles}`);
    console.log(`Tingkat Lolos  : ${report.passRatePercentage}%`);
    console.log(`Total Waktu    : ${report.totalTimeMs} ms`);
    console.log(`Rata-rata Eval : ${report.averageLatencyMs} ms`);
    console.log(`Memori Cache   : ${report.memoryUsageMbEstimate} MB`);
    
    if (report.failedCycles === 0) {
      console.log('\n✅ KESIMPULAN: LULUS. Aplikasi sangat stabil tanpa memory leak, FEN parser konsisten.');
    } else {
      console.log('\n❌ KESIMPULAN: GAGAL. Terdeteksi masalah kestabilan pada siklus ke-' + report.failedCycles);
    }
  } catch (err) {
    console.error('Error saat stress test:', err);
  }
}

main();
