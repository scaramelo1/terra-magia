# Terra & Magia

Jogo de fazenda mágica para Android e iOS (Expo SDK 58, Expo Router, expo-sqlite).

- `src/dominio/`: regras puras (plantar, regar, colher, murchar, celeiro, níveis, terreno). O horário entra como parâmetro, para o servidor reaproveitar o mesmo código depois.
- `src/app/`: telas (fazenda e celeiro).
- `arte-original/`: ícone original (2048 px) e a cena da fazenda em pixel art.
- `scripts/recortar-arte.py`: recorta canteiros e o topo da cena para `assets/fazenda/` (`python3 scripts/recortar-arte.py`).

## Rodar

```bash
npm install
npm test             # motor, sem precisar do Expo
npx expo start       # Expo Go
npx expo start --android   # emulador do Android Studio aberto
```

Na VPS (1 GB de RAM) só `npm test`; Expo, tsc e lint rodam no PC.
