import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Botao, formatarTempo, Mensagem, Placar } from '../componentes/ui';
import {
  colher,
  estagio,
  expandir,
  LADO,
  limpar,
  nivelDe,
  plantar,
  proximaExpansao,
  regar,
  tempoRestante,
  TOTAL_CANTEIROS,
  type Estagio,
} from '../dominio/fazenda';
import { PLANTAS, plantaPorId } from '../dominio/plantas';
import { useFazenda } from '../hooks/useFazenda';
import { cores, espaco } from '../tema';

const FIGURA: Record<Exclude<Estagio, 'pronta'>, string> = {
  bloqueado: '🔒',
  vazio: '',
  semente: '🫘',
  broto: '🌱',
  crescendo: '🌿',
  murcha: '🥀',
};

export default function TelaFazenda() {
  const { fazenda, agora, mensagem, agir } = useFazenda();
  const { width } = useWindowDimensions();
  const [semente, setSemente] = useState('cenoura');

  if (!fazenda) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator color={cores.primaria} size="large" />
      </View>
    );
  }

  const nivel = nivelDe(fazenda.xp);
  const vao = 6;
  const lado = Math.floor((Math.min(width, 520) - espaco.m * 2 - vao * (LADO - 1)) / LADO);
  const noCeleiro = Object.values(fazenda.celeiro).reduce((a, b) => a + b, 0);

  function tocar(indice: number) {
    const e = estagio(fazenda!, indice, agora);
    if (e === 'bloqueado') return oferecerExpansao();
    if (e === 'vazio') return agir((f, t) => plantar(f, indice, semente, t));
    if (e === 'pronta') return agir((f, t) => colher(f, indice, t));
    if (e === 'murcha') return agir((f, t) => limpar(f, indice, t));
    agir((f, t) => regar(f, indice, t));
  }

  function oferecerExpansao() {
    const prox = proximaExpansao(fazenda!);
    if (!prox) return;
    Alert.alert('Crescer o terreno', `Liberar mais um canteiro por 🪙 ${prox.preco}? (precisa do nível ${prox.nivel})`, [
      { text: 'Agora não', style: 'cancel' },
      { text: 'Liberar', onPress: () => agir((f) => expandir(f)) },
    ]);
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={estilos.tela}>
        <Placar fazenda={fazenda} />

        <View style={[estilos.grade, { gap: vao, width: lado * LADO + vao * (LADO - 1) }]}>
          {Array.from({ length: TOTAL_CANTEIROS }, (_, i) => {
            const e = estagio(fazenda, i, agora);
            const plantio = fazenda.canteiros[i];
            const planta = plantio ? plantaPorId(plantio.plantaId) : undefined;
            const figura = e === 'pronta' ? (planta?.emoji ?? '') : FIGURA[e];
            const crescendo = e === 'semente' || e === 'broto' || e === 'crescendo';
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={`Canteiro ${i + 1}: ${planta ? `${planta.nome}, ` : ''}${e}`}
                onPress={() => tocar(i)}
                style={({ pressed }) => [
                  estilos.canteiro,
                  { width: lado, height: lado },
                  e === 'bloqueado' && estilos.bloqueado,
                  e === 'pronta' && estilos.pronta,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={{ fontSize: lado * 0.45 }}>{figura}</Text>
                {crescendo && (
                  <Text style={estilos.tempo}>
                    {plantio?.regado ? '💧' : ''}
                    {formatarTempo(tempoRestante(fazenda, i, agora))}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <Text style={estilos.dica}>
          Toque na terra para plantar · na planta para regar (−20% do tempo) · quando estiver pronta, para colher.
        </Text>

        <Text style={estilos.titulo}>Sementes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: espaco.p }}>
          {PLANTAS.map((p) => {
            const travada = nivel < p.nivel;
            const escolhida = semente === p.id;
            return (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityState={{ selected: escolhida, disabled: travada }}
                disabled={travada}
                onPress={() => setSemente(p.id)}
                style={[
                  estilos.semente,
                  p.magica && estilos.magica,
                  escolhida && estilos.escolhida,
                  travada && { opacity: 0.45 },
                ]}
              >
                <Text style={{ fontSize: 28 }}>{travada ? '🔒' : p.emoji}</Text>
                <Text style={estilos.sementeNome}>{p.nome}</Text>
                <Text style={estilos.sementeInfo}>
                  {travada ? `Nível ${p.nivel}` : `🪙 ${p.semente} · ${formatarTempo(p.minutos * 60_000)}`}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Botao texto={`🏚️ Celeiro (${noCeleiro})`} aoTocar={() => router.push('/celeiro')} />
      </ScrollView>
      {mensagem && <Mensagem {...mensagem} />}
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tela: { padding: espaco.m, gap: espaco.m, alignItems: 'stretch' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'center' },
  canteiro: {
    backgroundColor: cores.terra,
    borderRadius: 10,
    borderBottomWidth: 4,
    borderColor: cores.terraEscura,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloqueado: { backgroundColor: cores.bloqueado, borderColor: '#9FB08E' },
  pronta: { borderColor: cores.destaque, borderWidth: 2, borderBottomWidth: 4 },
  tempo: { position: 'absolute', bottom: 2, fontSize: 9, fontWeight: '700', color: '#fff' },
  dica: { color: cores.textoSuave, fontSize: 12, textAlign: 'center' },
  titulo: { fontSize: 17, fontWeight: '800', color: cores.texto },
  semente: {
    width: 104,
    padding: espaco.p,
    borderRadius: 14,
    backgroundColor: cores.cartao,
    borderWidth: 2,
    borderColor: cores.borda,
    alignItems: 'center',
    gap: 2,
  },
  magica: { borderColor: cores.magia, backgroundColor: '#F3EEFF' },
  escolhida: { borderColor: cores.primaria, backgroundColor: '#E3F5DF' },
  sementeNome: { fontWeight: '800', color: cores.texto, fontSize: 13, textAlign: 'center' },
  sementeInfo: { color: cores.textoSuave, fontSize: 11, textAlign: 'center' },
});
