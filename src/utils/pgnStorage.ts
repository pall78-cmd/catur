export interface SavedPgnGame {
  id: string;
  title: string;
  pgn: string;
  white?: string;
  black?: string;
  event?: string;
  date?: string;
  result?: string;
  savedAt: number;
}

const DB_NAME = 'ChessPgnStorageDB';
const DB_VERSION = 1;
const STORE_NAME = 'pgn_library';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB tidak didukung pada browser ini.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('savedAt', 'savedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function parsePgnHeaderTags(pgn: string): { white?: string; black?: string; event?: string; date?: string; result?: string } {
  const whiteMatch = pgn.match(/\[White\s+"([^"]+)"\]/i);
  const blackMatch = pgn.match(/\[Black\s+"([^"]+)"\]/i);
  const eventMatch = pgn.match(/\[Event\s+"([^"]+)"\]/i);
  const dateMatch = pgn.match(/\[Date\s+"([^"]+)"\]/i);
  const resultMatch = pgn.match(/\[Result\s+"([^"]+)"\]/i);

  return {
    white: whiteMatch ? whiteMatch[1] : undefined,
    black: blackMatch ? blackMatch[1] : undefined,
    event: eventMatch ? eventMatch[1] : undefined,
    date: dateMatch ? dateMatch[1] : undefined,
    result: resultMatch ? resultMatch[1] : undefined,
  };
}

export async function savePgnToLibrary(title: string, pgn: string): Promise<SavedPgnGame> {
  const db = await openDB();
  const tags = parsePgnHeaderTags(pgn);
  const derivedTitle = title.trim() || (tags.white && tags.black ? `${tags.white} vs ${tags.black}` : 'Koleksi PGN Kustom');

  const gameItem: SavedPgnGame = {
    id: `pgn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: derivedTitle,
    pgn,
    white: tags.white,
    black: tags.black,
    event: tags.event,
    date: tags.date,
    result: tags.result,
    savedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(gameItem);

    req.onsuccess = () => resolve(gameItem);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllSavedPgns(): Promise<SavedPgnGame[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = (req.result as SavedPgnGame[]) || [];
        results.sort((a, b) => b.savedAt - a.savedAt);
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Gagal mengambil daftar PGN dari IndexedDB:', err);
    return [];
  }
}

export async function deleteSavedPgn(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
