# Sistema de Apoio à Manutenção Industrial — WebAR + Flask + MQTT + Docker

Protótipo didático. **Todos os dados de temperatura, vibração e status são simulados** e não representam limites oficiais de segurança ou manutenção.

## Como executar
Requisito: Docker com Docker Compose.

```bash
docker compose up --build
```

| Serviço   | Container    | Porta        | Função |
|-----------|--------------|--------------|--------|
| frontend  | nginx        | 8080 / 8443  | Serve a WebAR (HTTP/HTTPS) e faz proxy de `/api` para a API |
| api       | Flask        | 5000         | Identificação e telemetria em JSON |
| mqtt      | Mosquitto    | 1883         | Broker de telemetria |
| simulator | Python       | —            | Publica dados fictícios a cada 2 s |

Ordem de inicialização: `mqtt` (saudável) → `api` e `simulator` → `frontend`.

## Acessando
- Computador: http://localhost:8080 (a câmera funciona em `localhost`).
- Celular (mesma rede Wi‑Fi): `https://IP_DO_COMPUTADOR:8443` — aceite o aviso do certificado autoassinado. A câmera exige HTTPS.
- URL pública (entregável): exponha o `:8443` com um túnel HTTPS, ou publique em uma VM/plataforma com HTTPS.

O target de exemplo é `frontend/assets/images/target.png` (cartão oficial do MindAR). Aponte a câmera para essa imagem na tela do computador ou impressa.

## Usando a imagem do SEU ativo
1. Compile a imagem em https://hiukim.github.io/mind-ar-js-doc/tools/compile e baixe o `.mind`.
2. Substitua `frontend/assets/targets/targets.mind` e `frontend/assets/images/target.png`.
3. Ajuste as `posicao` dos hotspots em `HOTSPOTS` (`app.js`) para as regiões do ativo.
4. Para outro ativo: edite `EQUIPAMENTOS` em `backend/app.py`, `EQUIPAMENTO_ID` no `compose.yaml` e `equipamentoId` no `app.js`.
5. `docker compose up --build`.

## Testes rápidos
```bash
curl localhost:5000/api/equipamentos/CNC-01
curl localhost:5000/api/equipamentos/CNC-01/telemetria

# T06/T07: pare o simulador para ele não sobrescrever o valor e publique manualmente
docker compose stop simulator
docker compose exec mqtt mosquitto_pub -t industria/CNC-01/temperatura -r -m 88.8
# toque em Monitoramento na RA → 88.8 °C

# T08/T09: indisponibilidade
docker compose stop api      # RA mostra a mensagem de erro
docker compose start api
```
Matriz completa em `docs/testes.md`; arquitetura em `docs/arquitetura.md`; IaaS/PaaS/SaaS em `docs/analise-nuvem.md`.

## Decisões de projeto
- **Dado de interface vs. serviço:** textos de componentes/manutenção são conteúdo estático (mudam raramente); status, temperatura, vibração e atualização mudam o tempo todo, então vêm da API.
- **Último dado em memória** (no Flask), com 1 worker do gunicorn. As mensagens MQTT são `retain`, então a API recupera o último valor ao reconectar.
- **Se o broker cair:** a API continua respondendo com o último valor guardado e reconecta sozinha; o dado só deixa de atualizar.
- **Se a API cair:** a RA, o tracking e os hotspots estáticos continuam funcionando.
- **Segurança:** broker anônimo e certificado autoassinado são apenas para o laboratório.
