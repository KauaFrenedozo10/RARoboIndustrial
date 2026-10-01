# IaaS, PaaS e SaaS (rascunho — revise com suas palavras)

| Cenário | Modelo | Provedor cuida de | Empresa continua responsável por |
|---|---|---|---|
| VM Linux com Docker, Flask e MQTT instalados pela empresa | **IaaS** | Hardware, rede e virtualização | SO, atualizações, Docker, Flask, MQTT, segurança e dados |
| Envio da aplicação a uma plataforma que gerencia infraestrutura e ambiente de execução | **PaaS** | Infra, SO e runtime | Código, configuração e dados |
| Técnico apenas usa uma aplicação pronta no navegador | **SaaS** (visão do usuário) | Toda a pilha, incluindo a aplicação | Apenas o uso e os dados inseridos |

Neste projeto, IaaS é o mais adequado (controlamos os containers sobre uma VM). Em PaaS, deixaríamos de administrar SO e orquestração, mas dependeríamos do broker MQTT oferecido/gerenciado pela plataforma.
