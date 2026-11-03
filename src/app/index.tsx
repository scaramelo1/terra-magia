import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { desenhoDoCanteiro, PROPORCAO_TOPO, TOPO } from '../arte';
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
} from '../dominio/fazenda';
import { PLANTAS, plantaPorId } from '../dominio/plantas';
import { useFazenda } from '../hooks/useFazenda';
import { cores, espaco } from '../tema';

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
      <ScrollView>
        <Image source={TOPO} style={estilos.topo} resizeMode="cover" accessibilityIgnoresInvertColors />
        <View style={estilos.tela}>
          <Placar fazenda={fazenda} />

          <View style={[estilos.grade, { gap: vao, width: lado * LADO + vao * (LADO - 1) }]}>
            {Array.from({ length: TOTAL_CANTEIROS }, (_, i) => {
              const e = estagio(fazenda, i, agora);
              const plantio = fazenda.canteiros[i];
              const planta = plantio ? plantaPorId(plantio.plantaId) : undefined;
              const { fonte, selo } = desenhoDoCanteiro(e, planta?.id, planta?.emoji);
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
                  <Image source={fonte} style={estilos.desenho} />
                  {selo && <Text style={[estilos.selo, { fontSize: lado * 0.32 }]}>{selo}</Text>}
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
        </View>
      </ScrollView>
      {mensagem && <Mensagem {...mensagem} />}
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tela: { padding: espaco.m, gap: espaco.m, alignItems: 'stretch' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'center' },
  topo: { width: '100%', aspectRatio: PROPORCAO_TOPO },
  canteiro: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: cores.terraEscura,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desenho: { position: 'absolute', width: '100%', height: '100%' },
  bloqueado: { borderColor: '#6E9A3A', opacity: 0.85 },
  pronta: { borderColor: cores.destaque, borderWidth: 3 },
  selo: { textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 3 },
  tempo: {
    position: 'absolute',
    bottom: 2,
    paddingHorizontal: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  dica: { color: cores.sobreGrama, fontSize: 12, textAlign: 'center', fontWeight: '600' },
  titulo: { fontSize: 17, fontWeight: '800', color: cores.sobreGrama },
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
