import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { desenhoDoCanteiro } from '../arte';
import { formatarTempo, Mensagem, Placar } from '../componentes/ui';
import { estadoDoAnimal } from '../dominio/curral';
import {
  colher,
  COLUNAS,
  estagio,
  expandir,
  limpar,
  LINHAS,
  nivelDe,
  plantar,
  proximaExpansao,
  regar,
  tempoRestante,
  TOTAL_CANTEIROS,
} from '../dominio/fazenda';
import { PLANTAS, plantaPorId } from '../dominio/plantas';
import { useFazenda } from '../hooks/useFazenda';
import { CAMPO, LUGARES, MAPA, MAPA_ALTURA, MAPA_LARGURA, ZOOM_INICIAL, ZOOMS, type Lugar } from '../mapa';
import { cores, espaco } from '../tema';

type Ponto = { x: number; y: number };

export default function TelaFazenda() {
  const { fazenda, agora, horaConferida, mensagem, agir } = useFazenda();
  const { width, height } = useWindowDimensions();
  const margens = useSafeAreaInsets();
  const [semente, setSemente] = useState('cenoura');
  const [zoom, setZoom] = useState(ZOOM_INICIAL);

  // Escala: quantos pontos da tela vale cada pixel da imagem original. No zoom 1 o mapa cobre a tela.
  const escala = Math.max(width / MAPA_LARGURA, height / MAPA_ALTURA) * zoom;
  const mapaL = MAPA_LARGURA * escala;
  const mapaA = MAPA_ALTURA * escala;

  // Arrastar: um ScrollView horizontal com um vertical dentro.
  const rolagemH = useRef<ScrollView>(null);
  const rolagemV = useRef<ScrollView>(null);
  const posicao = useRef<Ponto>({ x: 0, y: 0 });
  // Ponto do mapa (em pixels da imagem original) que deve ficar no meio da tela; começa no campo.
  const centroDesejado = useRef<Ponto | null>({
    x: CAMPO.x + CAMPO.largura / 2,
    y: CAMPO.y + CAMPO.altura / 2,
  });

  useEffect(() => {
    const alvo = centroDesejado.current;
    if (!alvo) return;
    const x = Math.min(Math.max(alvo.x * escala - width / 2, 0), Math.max(mapaL - width, 0));
    const y = Math.min(Math.max(alvo.y * escala - height / 2, 0), Math.max(mapaA - height, 0));
    const id = requestAnimationFrame(() => {
      rolagemH.current?.scrollTo({ x, animated: false });
      rolagemV.current?.scrollTo({ y, animated: false });
      posicao.current = { x, y };
      centroDesejado.current = null;
    });
    return () => cancelAnimationFrame(id);
  }, [escala, width, height, mapaL, mapaA]);

  function mudarZoom(passo: number) {
    const i = ZOOMS.indexOf(zoom) + passo;
    if (i < 0 || i >= ZOOMS.length) return;
    // mantém no meio da tela o mesmo ponto do mapa
    centroDesejado.current = {
      x: (posicao.current.x + width / 2) / escala,
      y: (posicao.current.y + height / 2) / escala,
    };
    setZoom(ZOOMS[i]);
  }

  const aoRolarH = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    posicao.current.x = e.nativeEvent.contentOffset.x;
  };
  const aoRolarV = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    posicao.current.y = e.nativeEvent.contentOffset.y;
  };

  if (!fazenda) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator color={cores.primaria} size="large" />
      </View>
    );
  }

  const nivel = nivelDe(fazenda.xp);
  const celL = (CAMPO.largura / COLUNAS) * escala;
  const celA = (CAMPO.altura / LINHAS) * escala;

  function temProntoNoLugar(lugar: Lugar) {
    if (!lugar.animal) return false;
    return fazenda!.animais.some((a) => a.tipo === lugar.animal && estadoDoAnimal(a, agora) === 'pronto');
  }

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
    Alert.alert('Crescer o campo', `Liberar mais um canteiro por 🪙 ${prox.preco}? (precisa do nível ${prox.nivel})`, [
      { text: 'Agora não', style: 'cancel' },
      { text: 'Liberar', onPress: () => agir((f) => expandir(f)) },
    ]);
  }

  return (
    <View style={estilos.tela}>
      <ScrollView
        ref={rolagemH}
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={aoRolarH}
      >
        <ScrollView
          ref={rolagemV}
          nestedScrollEnabled
          bounces={false}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={aoRolarV}
          style={{ width: mapaL, height }}
        >
          <View style={{ width: mapaL, height: mapaA }}>
            <Image source={MAPA} style={{ width: mapaL, height: mapaA }} accessibilityIgnoresInvertColors />

            {/* construções: tocar abre a tela de cada uma */}
            {LUGARES.map((lugar) =>
              lugar.areas.map((a, i) => (
                <Pressable
                  key={`${lugar.id}-${i}`}
                  accessibilityRole="button"
                  accessibilityLabel={lugar.nome}
                  onPress={() => router.push(lugar.destino)}
                  style={{
                    position: 'absolute',
                    left: a.x * escala,
                    top: a.y * escala,
                    width: a.largura * escala,
                    height: a.altura * escala,
                  }}
                />
              )),
            )}
            {LUGARES.map((lugar) => (
              <Pressable
                key={`rotulo-${lugar.id}`}
                accessibilityRole="button"
                onPress={() => router.push(lugar.destino)}
                style={[estilos.rotulo, { left: lugar.rotulo.x * escala - 60, top: lugar.rotulo.y * escala - 13 }]}
              >
                <Text style={estilos.rotuloTexto} numberOfLines={1}>
                  {lugar.nome}
                  {temProntoNoLugar(lugar) ? ' ✨' : ''}
                </Text>
              </Pressable>
            ))}

            {/* canteiros em cima do campo arado */}
            {Array.from({ length: TOTAL_CANTEIROS }, (_, i) => {
              const linha = Math.floor(i / COLUNAS);
              const coluna = i % COLUNAS;
              const e = estagio(fazenda, i, agora);
              const plantio = fazenda.canteiros[i];
              const planta = plantio ? plantaPorId(plantio.plantaId) : undefined;
              const { fonte, selo } = desenhoDoCanteiro(e, planta?.id, planta?.emoji);
              const crescendo = e === 'semente' || e === 'broto' || e === 'crescendo';
              const tamanhoSelo = Math.min(celL, celA) * (e === 'bloqueado' ? 0.25 : 0.4);
              return (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityLabel={`Canteiro ${i + 1}: ${planta ? `${planta.nome}, ` : ''}${e}`}
                  onPress={() => tocar(i)}
                  style={({ pressed }) => [
                    estilos.canteiro,
                    {
                      left: (CAMPO.x + (coluna * CAMPO.largura) / COLUNAS) * escala,
                      top: (CAMPO.y + (linha * CAMPO.altura) / LINHAS) * escala,
                      width: celL,
                      height: celA,
                    },
                    e === 'bloqueado' && estilos.bloqueado,
                    e === 'pronta' && estilos.pronta,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  {e !== 'vazio' && e !== 'bloqueado' && <Image source={fonte} style={estilos.desenho} />}
                  {selo && <Text style={{ fontSize: tamanhoSelo }}>{selo}</Text>}
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
        </ScrollView>
      </ScrollView>

      {/* painel por cima do mapa */}
      <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, estilos.painel, painelMargens(margens)]}>
        <View pointerEvents="box-none" style={estilos.linhaDeCima}>
          <Placar fazenda={fazenda} estilo={estilos.placar} />
          {!horaConferida && <Text style={estilos.semHora}>📡 Sem internet: só para olhar</Text>}
          <View style={estilos.zoom}>
            <BotaoRedondo texto="＋" rotulo="Aproximar" aoTocar={() => mudarZoom(1)} desativado={zoom === ZOOMS.at(-1)} />
            <BotaoRedondo texto="－" rotulo="Afastar" aoTocar={() => mudarZoom(-1)} desativado={zoom === ZOOMS[0]} />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={estilos.sementes}
          contentContainerStyle={{ gap: espaco.p, paddingRight: espaco.p }}
        >
          {PLANTAS.map((p) => {
            const travada = nivel < p.nivel;
            const escolhida = semente === p.id;
            return (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityLabel={`Semente de ${p.nome}`}
                accessibilityState={{ selected: escolhida, disabled: travada }}
                disabled={travada}
                onPress={() => setSemente(p.id)}
                style={[
                  estilos.semente,
                  p.magica && estilos.magica,
                  escolhida && estilos.escolhida,
                  travada && { opacity: 0.5 },
                ]}
              >
                <Text style={{ fontSize: 22 }}>{travada ? '🔒' : p.emoji}</Text>
                <Text style={estilos.sementeInfo}>
                  {travada ? `Nv ${p.nivel}` : `🪙${p.semente} · ${formatarTempo(p.minutos * 60_000)}`}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {mensagem && <Mensagem {...mensagem} />}
    </View>
  );
}

function painelMargens(m: { top: number; right: number; bottom: number; left: number }) {
  return {
    paddingTop: Math.max(m.top, espaco.p),
    paddingRight: Math.max(m.right, espaco.p),
    paddingBottom: Math.max(m.bottom, espaco.p),
    paddingLeft: Math.max(m.left, espaco.p),
  };
}

function BotaoRedondo({
  texto,
  rotulo,
  aoTocar,
  desativado,
}: {
  texto: string;
  rotulo: string;
  aoTocar: () => void;
  desativado?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ disabled: desativado }}
      disabled={desativado}
      onPress={aoTocar}
      style={({ pressed }) => [estilos.redondo, desativado && { opacity: 0.4 }, pressed && { opacity: 0.7 }]}
    >
      <Text style={estilos.redondoTexto}>{texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  painel: { justifyContent: 'space-between' },
  linhaDeCima: { flexDirection: 'row', alignItems: 'flex-start', gap: espaco.p },
  placar: { width: 250, paddingVertical: 8, opacity: 0.95 },
  semHora: {
    backgroundColor: '#FFF4D6',
    borderColor: cores.destaque,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: cores.texto,
    fontWeight: '700',
    fontSize: 12,
  },
  zoom: { marginLeft: 'auto', gap: espaco.p },
  redondo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: cores.cartao,
    borderWidth: 2,
    borderColor: cores.borda,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redondoTexto: { fontSize: 20, fontWeight: '800', color: cores.texto },
  rotulo: {
    position: 'absolute',
    width: 120,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(59,42,26,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotuloTexto: { color: '#fff', fontWeight: '800', fontSize: 12 },
  canteiro: {
    position: 'absolute',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desenho: { position: 'absolute', width: '100%', height: '100%' },
  bloqueado: { backgroundColor: 'rgba(40,25,10,0.45)', borderColor: 'transparent' },
  pronta: { borderColor: cores.destaque, borderWidth: 2 },
  tempo: {
    position: 'absolute',
    bottom: 2,
    paddingHorizontal: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  sementes: { flexGrow: 0, alignSelf: 'flex-start', maxWidth: '100%' },
  semente: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: cores.cartao,
    borderWidth: 2,
    borderColor: cores.borda,
  },
  magica: { borderColor: cores.magia, backgroundColor: '#F3EEFF' },
  escolhida: { borderColor: cores.primaria, backgroundColor: '#E3F5DF' },
  sementeInfo: { color: cores.texto, fontSize: 11, fontWeight: '700' },
});
