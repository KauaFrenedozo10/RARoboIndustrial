# industria-ra-cloud

Monitoramento de maquinas industriais com Realidade Aumentada.

Fluxo: simulator -> MQTT (Mosquitto) -> backend (Flask) -> frontend (A-Frame + AR.js)

## Como rodar

```bash
docker compose up --build
```

Abra http://localhost:5000 e aponte a camera para o marcador Hiro.
(A camera so funciona em `localhost` ou HTTPS.)

## Servicos

| Servico   | Porta | Descricao                                   |
|-----------|-------|---------------------------------------------|
| mosquitto | 1883  | Broker MQTT                                 |
| backend   | 5000  | API Flask + serve o frontend                |
| simulator | -     | Publica telemetria em `industria/<id>/telemetria` |

## API

- `GET /health`
- `GET /api/machines` - leitura atual de cada maquina
- `GET /api/machines/<id>` - leitura atual + historico (ultimas 60)

Status por temperatura: ok (< 85), alerta (>= 85), critico (>= 95).
