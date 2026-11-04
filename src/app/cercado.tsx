import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Botao, formatarTempo, Mensagem, Placar } from '../componentes/ui';
import { ANIMAIS, animalPorId, MAXIMO_POR_TIPO } from '../dominio/animais';
import { alimentar, comprarAnimal, estadoDoAnimal, quantosDoTipo, recolher } from '../dominio/curral';
import { nivelDe } from '../dominio/fazenda';
import { itemPorId } from '../dominio/itens';
import { useFazenda } from '../hooks/useFazenda';
import { cores, espaco } from '../tema';

export default function TelaCercado() {
  const { fazenda, agora, mensagem, agir } = useFazenda();
  if (!fazenda) return null;
  const nivel = nivelDe(fazenda.xp);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={estilos.tela}>
        <Placar fazenda={fazenda} />

        <Text style={estilos.titulo}>Seus animais</Text>
        {fazenda.animais.length === 0 && (
          <Text style={estilos.vazio}>O cercado está vazio. Compre um animal aqui embaixo.</Text>
        )}
        {fazenda.animais.map((a) => {
          const animal = animalPorId(a.tipo);
          if (!animal) return null;
          const estado = estadoDoAnimal(a, agora);
          const comida = itemPorId(animal.come.item);
          return (
            <View key={a.id} style={estilos.linha}>
              <Text style={{ fontSize: 34 }}>{animal.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={estilos.nome}>{animal.nome}</Text>
                <Text style={estilos.info}>
                  {estado === 'fome' && `Com fome: come ${animal.come.quantidade} ${comida?.emoji ?? ''}`}
                  {estado === 'produzindo' &&
                    `${animal.produto.emoji} em ${formatarTempo((a.prontoEm ?? agora) - agora)}`}
                  {estado === 'pronto' && `${animal.produto.nome} pronto!`}
                </Text>
              </View>
              {estado === 'fome' && (
                <Botao
                  texto={`Alimentar ${comida?.emoji ?? ''}`}
                  aoTocar={() => agir((f, t) => alimentar(f, a.id, t))}
                />
              )}
              {estado === 'pronto' && (
                <Botao texto={`Recolher ${animal.produto.emoji}`} aoTocar={() => agir((f, t) => recolher(f, a.id, t))} />
              )}
            </View>
          );
        })}

        <Text style={estilos.titulo}>Comprar</Text>
        {ANIMAIS.map((animal) => {
          const travado = nivel < animal.nivel;
          const tem = quantosDoTipo(fazenda, animal.id);
          const comida = itemPorId(animal.come.item);
          return (
            <View key={animal.id} style={[estilos.linha, travado && { opacity: 0.5 }]}>
              <Text style={{ fontSize: 34 }}>{travado ? '🔒' : animal.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={estilos.nome}>
                  {animal.nome} · {tem}/{MAXIMO_POR_TIPO}
                </Text>
                <Text style={estilos.info}>
                  {travado
                    ? `Libera no nível ${animal.nivel}`
                    : `Come ${animal.come.quantidade} ${comida?.emoji ?? ''} → ${animal.produto.emoji} em ${formatarTempo(animal.minutos * 60_000)} (🪙 ${animal.produto.venda})`}
                </Text>
              </View>
              <Botao
                texto={`🪙 ${animal.preco}`}
                desativado={travado || tem >= MAXIMO_POR_TIPO}
                aoTocar={() => agir((f) => comprarAnimal(f, animal.id))}
              />
            </View>
          );
        })}
      </ScrollView>
      {mensagem && <Mensagem {...mensagem} />}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { padding: espaco.m, gap: espaco.m },
  titulo: { fontSize: 17, fontWeight: '800', color: cores.sobreGrama },
  vazio: { color: cores.sobreGrama, fontWeight: '600' },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.p,
    backgroundColor: cores.cartao,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  nome: { fontWeight: '800', color: cores.texto, fontSize: 15 },
  info: { color: cores.textoSuave, fontSize: 12 },
});
