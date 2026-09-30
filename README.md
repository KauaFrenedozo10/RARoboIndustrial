# Sistema de Apoio à Manutenção Industrial com Realidade Aumentada e Serviços em Nuvem

> Protótipo acadêmico desenvolvido para integrar Realidade Aumentada (WebAR), uma API Flask, comunicação MQTT e serviços conteinerizados com Docker e Docker Compose.

## Sobre o projeto

O projeto tem como objetivo facilitar o acesso a informações técnicas e operacionais de equipamentos industriais por meio de dispositivos móveis. Ao apontar a câmera para uma identificação visual (target) associada ao equipamento, o usuário poderá visualizar pontos interativos em Realidade Aumentada e consultar informações relacionadas ao ativo.

A aplicação utiliza uma API Flask para disponibilizar dados por HTTP/JSON. Um broker MQTT e um simulador representam o recebimento de dados operacionais, como temperatura, vibração e status. Os serviços são executados de forma coordenada com Docker Compose.

**Importante:** os valores de temperatura, vibração, status e manutenção utilizados neste protótipo são simulados e têm finalidade exclusivamente didática. Não representam limites reais de segurança nem parâmetros oficiais de máquinas específicas.

## Objetivos

- Reconhecer um equipamento por meio de um target usando MindAR.
- Exibir hotspots interativos posicionados sobre regiões do equipamento.
- Consultar informações técnicas e dados dinâmicos por meio de uma API REST.
- Simular o envio de telemetria com MQTT.
- Executar e integrar os serviços utilizando Docker e Docker Compose.
- Tratar situações em que a API esteja indisponível.

## Tecnologias utilizadas

| Tecnologia | Finalidade |
| --- | --- |
| HTML, CSS e JavaScript | Desenvolvimento da interface WebAR |
| A-Frame | Criação da experiência de Realidade Aumentada |
| MindAR | Reconhecimento e rastreamento do target |
| Python e Flask | Desenvolvimento da API |
| HTTP/JSON | Comunicação entre o frontend e a API |
| MQTT | Mensageria para dados simulados |
| Docker | Conteinerização dos serviços |
| Docker Compose | Inicialização coordenada dos serviços |

## Arquitetura

O sistema é composto pelos seguintes elementos:

1. **Aplicação WebAR:** reconhece o target e apresenta os hotspots interativos.
2. **API Flask:** disponibiliza informações do equipamento e a telemetria mais recente.
3. **Broker MQTT:** recebe as mensagens publicadas pelo simulador.
4. **Simulador de telemetria:** publica valores fictícios periodicamente.
5. **Docker Compose:** coordena a execução dos serviços.

Fluxo simplificado:

```text
Equipamento / target
        |
        v
     WebAR
        |
        | HTTP / JSON
        v
    API Flask <----- dados atualizados
        ^                    ^
        |                    |
        +--------------- Broker MQTT
                             ^
                             |
                      Simulador MQTT
```

O navegador consulta a API por HTTP/JSON. Não é necessário que a aplicação WebAR se conecte diretamente ao MQTT.

## Funcionalidades

- [ ] Reconhecimento do target associado ao equipamento.
- [ ] Exibição de pelo menos quatro hotspots interativos.
- [ ] Hotspots acompanham o target durante o rastreamento.
- [ ] Exibição de informações técnicas ao tocar nos hotspots.
- [ ] Consulta à API Flask para obter dados dinâmicos.
- [ ] Exibição de status e de pelo menos dois indicadores simulados.
- [ ] Recebimento de atualizações simuladas via MQTT.
- [ ] Exibição do dado atualizado na próxima consulta.
- [ ] Mensagem amigável quando a API estiver indisponível.
- [ ] Inicialização dos serviços por Docker Compose.

> Marque os itens conforme forem implementados e testados pela equipe.

## Estrutura do repositório

```text
industria-ra-cloud/
├── README.md
├── compose.yaml
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── assets/
│       ├── images/
│       └── targets/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
├── mqtt/
│   └── mosquitto.conf
├── simulator/
│   ├── simulator.py
│   └── requirements.txt
└── docs/
    ├── arquitetura.png
    └── testes.md
```

A estrutura acima é uma sugestão e deve ser ajustada para corresponder aos arquivos presentes no repositório.

## Requisitos

- Docker instalado.
- Docker Compose (integrado ao Docker atual como `docker compose`).
- Navegador móvel compatível com a experiência WebAR.
- Acesso por HTTPS quando a aplicação WebAR estiver publicada, além da permissão de uso da câmera.

## Como executar

### 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd industria-ra-cloud
```

### 2. Iniciar os serviços

Na pasta raiz do projeto, execute:

```bash
docker compose up --build
```

Esse comando constrói as imagens necessárias e inicia os serviços definidos no `compose.yaml`.

Para executar em segundo plano:

```bash
docker compose up --build -d
```

### 3. Verificar os serviços

Consulte o estado dos containers:

```bash
docker compose ps
```

Acompanhe os logs:

```bash
docker compose logs -f
```

Para encerrar os serviços:

```bash
docker compose down
```

> As portas, URLs e eventuais variáveis de ambiente dependem da configuração real do `compose.yaml`. Consulte esse arquivo e atualize esta seção com os endereços utilizados pela equipe.

## API

A API Flask deve disponibilizar, no mínimo, endpoints equivalentes aos seguintes:

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/equipamentos/<id>` | Retorna informações de identificação do equipamento |
| `GET` | `/api/equipamentos/<id>/telemetria` | Retorna os dados simulados de monitoramento |

Exemplo ilustrativo de resposta de identificação:

```json
{
  "id": "CNC-01",
  "tipo": "Torno CNC",
  "setor": "Usinagem",
  "status": "operacional"
}
```

Exemplo ilustrativo de resposta de telemetria:

```json
{
  "temperatura": 41.8,
  "vibracao": 2.3,
  "status": "operando",
  "atualizacao": "10:42:16"
}
```

Os exemplos acima são fictícios. Os campos e os valores devem ser conferidos com a implementação efetiva da API.

## MQTT

O simulador publica dados fictícios no broker MQTT. Os tópicos sugeridos para o equipamento `CNC-01` são:

```text
industria/CNC-01/temperatura
industria/CNC-01/vibracao
industria/CNC-01/status
```

O serviço responsável por receber as mensagens deve atualizar os dados disponibilizados pela API. Assim, quando o usuário consultar novamente o monitoramento pela WebAR, poderá visualizar o valor mais recente recebido.

## Uso da aplicação WebAR

1. Acesse a URL publicada da aplicação em um navegador móvel compatível.
2. Autorize o uso da câmera.
3. Aponte a câmera para a imagem cadastrada como target.
4. Aguarde o reconhecimento do equipamento.
5. Toque nos hotspots para consultar as informações.
6. Utilize o hotspot de monitoramento para consultar os dados disponibilizados pela API.

**URL da aplicação:** `PREENCHER_COM_A_URL_PUBLICADA`

**Equipamento/ativo:** `PREENCHER_COM_O_ATIVO_DA_EQUIPE`

## Tratamento de indisponibilidade

Se a API não estiver disponível, a aplicação deverá continuar apresentando a experiência de Realidade Aumentada e informar que não foi possível consultar os dados do equipamento.

Mensagem sugerida:

> Não foi possível consultar os dados do equipamento. Verifique a disponibilidade do serviço e tente novamente.

Após a API voltar a funcionar, uma nova consulta deverá ser realizada para recuperar os dados.

## Testes

| ID | Ação | Resultado esperado |
| --- | --- | --- |
| T01 | Abrir a WebAR | Câmera disponível após autorização |
| T02 | Apontar para o target | Realidade Aumentada ativada |
| T03 | Movimentar o celular ou o target | Hotspots acompanham o equipamento |
| T04 | Tocar em um hotspot técnico | Informação estática apresentada |
| T05 | Tocar em Monitoramento | API consultada e dados apresentados |
| T06 | Publicar um novo valor via MQTT | Serviço recebe e atualiza o dado |
| T07 | Consultar novamente | Novo valor aparece na WebAR |
| T08 | Parar a API | Aplicação exibe mensagem de indisponibilidade |
| T09 | Restaurar a API | Consulta volta a funcionar |

Registre os resultados e eventuais observações em `docs/testes.md`.

## Organização da equipe

- **Equipe:** `PREENCHER`
- **Integrantes:** `PREENCHER`
- **Equipamento selecionado:** `PREENCHER`
- **Curso:** Análise e Desenvolvimento de Sistemas
- **Unidades curriculares:** Realidade Aumentada e Computação em Nuvem

## Entregáveis

- Repositório GitHub organizado.
- Aplicação WebAR publicada.
- Imagem utilizada como target e arquivo `.mind`.
- Frontend HTML, CSS e JavaScript.
- API Flask e seu `Dockerfile`.
- Arquivo `compose.yaml`.
- Configuração do broker MQTT.
- Simulador/publicador MQTT.
- Diagrama da arquitetura.
- Matriz de testes preenchida.
- Documentação e análise dos cenários IaaS, PaaS e SaaS.
- Demonstração funcional do protótipo.

## Observações

Este projeto é um protótipo acadêmico. Os dados apresentados são simulados e não devem ser utilizados para orientar operações, manutenção real ou decisões de segurança industrial.

