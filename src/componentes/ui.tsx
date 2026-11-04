import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { nivelDe, xpDoNivel, type Fazenda } from '../dominio/fazenda';
import { cores, espaco } from '../tema';

export function Botao({
  texto,
  aoTocar,
  secundario,
  desativado,
}: {
  texto: string;
  aoTocar?: () => void;
  secundario?: boolean;
  desativado?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: desativado }}
      disabled={desativado}
      onPress={aoTocar}
      style={({ pressed }) => [
        estilos.botao,
        secundario && estilos.botaoSecundario,
        desativado && { opacity: 0.4 },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[estilos.botaoTexto, secundario && { color: cores.texto }]}>{texto}</Text>
    </Pressable>
  );
}

/** Moedas, nível e barra de experiência. */
export function Placar({ fazenda, estilo }: { fazenda: Fazenda; estilo?: StyleProp<ViewStyle> }) {
  const nivel = nivelDe(fazenda.xp);
  const inicio = xpDoNivel(nivel);
  const fim = xpDoNivel(nivel + 1);
  const fracao = (fazenda.xp - inicio) / (fim - inicio);
  return (
    <View style={[estilos.placar, estilo]}>
      <Text style={estilos.moedas}>🪙 {fazenda.moedas}</Text>
      <View style={{ flex: 1 }}>
        <Text style={estilos.nivel}>
          Nível {nivel} · {fazenda.xp - inicio}/{fim - inicio} XP
        </Text>
        <View style={estilos.barra}>
          <View style={[estilos.barraCheia, { width: `${Math.round(fracao * 100)}%` }]} />
        </View>
      </View>
    </View>
  );
}

export function Mensagem({ texto, erro }: { texto: string; erro: boolean }) {
  return (
    <View style={[estilos.mensagem, { backgroundColor: erro ? cores.erro : cores.primaria }]}>
      <Text style={estilos.mensagemTexto}>{texto}</Text>
    </View>
  );
}

/** "1h 05min", "4min 12s", "30s". */
export function formatarTempo(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`;
  if (m > 0) return `${m}min ${String(s % 60).padStart(2, '0')}s`;
  return `${s}s`;
}

const estilos = StyleSheet.create({
  botao: {
    backgroundColor: cores.primaria,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: espaco.m,
    alignItems: 'center',
  },
  botaoSecundario: { backgroundColor: cores.cartao, borderWidth: 1, borderColor: cores.borda },
  botaoTexto: { color: '#fff', fontWeight: '800', fontSize: 15 },
  placar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.m,
    backgroundColor: cores.cartao,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  moedas: { fontSize: 20, fontWeight: '800', color: cores.texto },
  nivel: { fontSize: 13, fontWeight: '700', color: cores.textoSuave, marginBottom: 4 },
  barra: { height: 10, borderRadius: 5, backgroundColor: '#EFE6D2', overflow: 'hidden' },
  barraCheia: { height: '100%', backgroundColor: cores.destaque },
  mensagem: { position: 'absolute', left: 16, right: 16, bottom: 24, borderRadius: 14, padding: 12 },
  mensagemTexto: { color: '#fff', fontWeight: '700', textAlign: 'center' },
});
