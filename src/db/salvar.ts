import type { SQLiteDatabase } from 'expo-sqlite';

import { migrarFazenda, novaFazenda, type Fazenda } from '../dominio/fazenda';

const VERSAO_ATUAL = 1;

/** Passado como onInit do SQLiteProvider; roda a cada abertura do banco. */
export async function migrar(db: SQLiteDatabase) {
  const linha = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if ((linha?.user_version ?? 0) >= VERSAO_ATUAL) return;
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS config (
      chave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    ) WITHOUT ROWID;
    PRAGMA user_version = ${VERSAO_ATUAL};
  `);
}

// Por enquanto a fazenda vive só no aparelho. Quando o servidor entrar, ele passa a ser o dono do estado.
export async function lerFazenda(db: SQLiteDatabase): Promise<Fazenda> {
  const linha = await db.getFirstAsync<{ valor: string }>("SELECT valor FROM config WHERE chave = 'fazenda'");
  if (!linha) return novaFazenda();
  try {
    return migrarFazenda(JSON.parse(linha.valor));
  } catch {
    return novaFazenda();
  }
}

export const salvarFazenda = (db: SQLiteDatabase, f: Fazenda) =>
  db.runAsync(
    "INSERT INTO config (chave, valor) VALUES ('fazenda', ?) ON CONFLICT (chave) DO UPDATE SET valor = excluded.valor",
    JSON.stringify(f),
  );
