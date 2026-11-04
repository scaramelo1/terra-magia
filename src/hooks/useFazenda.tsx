import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import type { Fazenda, Resultado } from '../dominio/fazenda';
import { ancorar, horaDoServidor, VIAGEM_MAXIMA, type Ancora } from '../dominio/relogio';
import { lerFazenda, salvarFazenda } from '../db/salvar';

/** De onde vem a hora. Troca pelo servidor do jogo no passo 6. */
const FONTE_DA_HORA = 'https://fsadesigners.com.br/';
/** Confere a hora de novo de tempos em tempos (o relógio monotônico pode parar com o celular dormindo). */
const RESSINCRONIZAR = 5 * 60_000;

type Contexto = {
  fazenda: Fazenda | null;
  agora: number;
  /** false enquanto não deu para conferir a hora com o servidor: a fazenda fica só para olhar. */
  horaConferida: boolean;
  mensagem: { texto: string; erro: boolean } | null;
  /** Aplica uma regra do motor; se der certo, guarda a fazenda nova. */
  agir: (acao: (f: Fazenda, agora: number) => Resultado) => boolean;
};

const Ctx = createContext<Contexto | null>(null);
const monotonico = () => performance.now();

async function buscarAncora(): Promise<Ancora | null> {
  const enviadoEm = monotonico();
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), VIAGEM_MAXIMA);
  try {
    const r = await fetch(FONTE_DA_HORA, {
      method: 'HEAD',
      headers: { 'Cache-Control': 'no-cache' },
      signal: controle.signal,
    });
    return ancorar(r.headers.get('date'), enviadoEm, monotonico());
  } catch {
    return null;
  } finally {
    clearTimeout(limite);
  }
}

export function ProvedorFazenda({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [fazenda, setFazenda] = useState<Fazenda | null>(null);
  const [ancora, setAncora] = useState<Ancora | null>(null);
  const [agora, setAgora] = useState(() => Date.now());
  const [mensagem, setMensagem] = useState<Contexto['mensagem']>(null);
  const buscando = useRef(false);

  const sincronizar = useCallback(async () => {
    if (buscando.current) return;
    buscando.current = true;
    const nova = await buscarAncora();
    buscando.current = false;
    // Sem resposta, mantém a âncora antiga (se houver): o relógio monotônico continua valendo.
    if (nova) setAncora(nova);
  }, []);

  useEffect(() => {
    lerFazenda(db).then(setFazenda);
  }, [db]);

  // Confere a hora ao abrir, ao voltar para o app e a cada 5 minutos.
  useEffect(() => {
    sincronizar();
    const intervalo = setInterval(sincronizar, RESSINCRONIZAR);
    const sub = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') sincronizar();
    });
    return () => {
      clearInterval(intervalo);
      sub.remove();
    };
  }, [sincronizar]);

  // Relógio da tela: atualiza os estágios das plantas a cada segundo.
  // Sem hora conferida, mostra pela hora do celular, mas nenhuma ação é aceita.
  useEffect(() => {
    const atualizar = () => setAgora(ancora ? horaDoServidor(ancora, monotonico()) : Date.now());
    atualizar();
    const id = setInterval(atualizar, 1000);
    return () => clearInterval(id);
  }, [ancora]);

  useEffect(() => {
    if (!mensagem) return;
    const id = setTimeout(() => setMensagem(null), 2500);
    return () => clearTimeout(id);
  }, [mensagem]);

  const agir = useCallback<Contexto['agir']>(
    (acao) => {
      if (!fazenda) return false;
      if (!ancora) {
        setMensagem({ texto: 'Sem internet: não deu para conferir a hora. Tente de novo.', erro: true });
        sincronizar();
        return false;
      }
      const r = acao(fazenda, horaDoServidor(ancora, monotonico()));
      if (!r.ok) {
        setMensagem({ texto: r.motivo, erro: true });
        return false;
      }
      setFazenda(r.fazenda);
      salvarFazenda(db, r.fazenda);
      if (r.aviso) setMensagem({ texto: r.aviso, erro: false });
      return true;
    },
    [ancora, db, fazenda, sincronizar],
  );

  return (
    <Ctx.Provider value={{ fazenda, agora, horaConferida: ancora !== null, mensagem, agir }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFazenda() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useFazenda fora do ProvedorFazenda');
  return c;
}
