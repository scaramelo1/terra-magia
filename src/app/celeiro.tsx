import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Botao, Mensagem, Placar } from '../componentes/ui';
import { vender } from '../dominio/fazenda';
import { PLANTAS } from '../dominio/plantas';
import { useFazenda } from '../hooks/useFazenda';
import { cores, espaco } from '../tema';

export default function TelaCeleiro() {
  const { fazenda, mensagem, agir } = useFazenda();
  if (!fazenda) return null;

  const itens = PLANTAS.filter((p) => (fazenda.celeiro[p.id] ?? 0) > 0);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={estilos.tela}>
        <Placar fazenda={fazenda} />
        {itens.length === 0 && <Text style={estilos.vazio}>O celeiro está vazio. Vá colher alguma coisa!</Text>}
        {itens.map((p) => {
          const qtd = fazenda.celeiro[p.id];
          return (
            <View key={p.id} style={estilos.linha}>
              <Text style={{ fontSize: 32 }}>{p.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={estilos.nome}>
                  {p.nome} × {qtd}
                </Text>
                <Text style={estilos.info}>🪙 {p.venda} cada</Text>
              </View>
              <Botao texto="Vender 1" secundario aoTocar={() => agir((f) => vender(f, p.id, 1))} />
              <Botao texto={`Tudo · ${p.venda * qtd}`} aoTocar={() => agir((f) => vender(f, p.id, qtd))} />
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
  vazio: { textAlign: 'center', color: cores.textoSuave, marginTop: espaco.g },
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
