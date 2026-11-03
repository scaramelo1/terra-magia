import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import type { Fazenda, Resultado } from '../dominio/fazenda';
import { lerFazenda, salvarFazenda } from '../db/salvar';

type Contexto = {
  fazenda: Fazenda | null;
  agora: number;
  mensagem: { texto: string; erro: boolean } | null;
  /** Aplica uma regra do motor; se der certo, guarda a fazenda nova. */
  agir: (acao: (f: Fazenda, agora: number) => Resultado) => boolean;
};

const Ctx = createContext<Contexto | null>(null);

export function ProvedorFazenda({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [fazenda, setFazenda] = useState<Fazenda | null>(null);
  const [agora, setAgora] = useState(() => Date.now());
  const [mensagem, setMensagem] = useState<Contexto['mensagem']>(null);

  useEffect(() => {
    lerFazenda(db).then(setFazenda);
  }, [db]);

  // Relógio da tela: atualiza os estágios das plantas a cada segundo.
  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!mensagem) return;
    const id = setTimeout(() => setMensagem(null), 2500);
    return () => clearTimeout(id);
  }, [mensagem]);

  const agir = useCallback<Contexto['agir']>(
    (acao) => {
      if (!fazenda) return false;
      const r = acao(fazenda, Date.now());
      if (!r.ok) {
        setMensagem({ texto: r.motivo, erro: true });
        return false;
      }
      setFazenda(r.fazenda);
      salvarFazenda(db, r.fazenda);
      if (r.aviso) setMensagem({ texto: r.aviso, erro: false });
      return true;
    },
    [db, fazenda],
  );

  return <Ctx.Provider value={{ fazenda, agora, mensagem, agir }}>{children}</Ctx.Provider>;
}

export function useFazenda() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useFazenda fora do ProvedorFazenda');
  return c;
}
