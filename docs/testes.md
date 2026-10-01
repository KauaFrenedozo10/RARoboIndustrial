# Matriz de testes (preencher durante a demonstração)

| ID  | Ação                         | Resultado esperado                       | Resultado | OK? |
|-----|------------------------------|------------------------------------------|-----------|-----|
| T01 | Abrir WebAR                  | Câmera disponível                        |           |     |
| T02 | Apontar para o target        | Estado "RA ATIVA"                        |           |     |
| T03 | Movimentar celular/target    | Hotspots acompanham o ativo              |           |     |
| T04 | Tocar hotspot técnico (1–3)  | Informação estática apresentada          |           |     |
| T05 | Tocar Monitoramento (4)      | API consultada e dados apresentados      |           |     |
| T06 | Publicar novo valor MQTT     | API recebe/atualiza o dado               |           |     |
| T07 | Consultar novamente          | Novo valor na RA                         |           |     |
| T08 | `docker compose stop api`    | Mensagem de indisponibilidade            |           |     |
| T09 | `docker compose start api`   | Consulta volta a funcionar               |           |     |
