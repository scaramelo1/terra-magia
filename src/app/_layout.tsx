import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import { migrar } from '../db/salvar';
import { ProvedorFazenda } from '../hooks/useFazenda';
import { cores } from '../tema';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="terra-magia.db" onInit={migrar}>
      <ProvedorFazenda>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: cores.ceu },
            headerTintColor: cores.texto,
            headerTitleStyle: { fontWeight: '800' },
            contentStyle: { backgroundColor: cores.fundo },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Terra & Magia' }} />
          <Stack.Screen name="celeiro" options={{ title: 'Celeiro' }} />
          <Stack.Screen name="cercado" options={{ title: 'Cercado' }} />
        </Stack>
      </ProvedorFazenda>
    </SQLiteProvider>
  );
}
