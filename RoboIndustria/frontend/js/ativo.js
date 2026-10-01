/* >>> CONFIGURAÇÃO DO ATIVO — edite AQUI ao trocar o target <<<
   equipamentoId: deve ser o mesmo de backend/app.py e do compose.yaml.
   posicao: coordenadas no plano do target (unidades da LARGURA do target, origem no
   centro, y para cima). Gere os valores clicando na imagem em /calibrar.html.
   As posições abaixo são PROVISÓRIAS: recalibre com a foto do seu robô. */
window.ATIVO = Object.freeze({
  equipamentoId: "ROB-01",
  hotspots: [
    {
      rotulo: "1", titulo: "Base", tipo: "estatico", posicao: { x: -0.3, y: -0.18 },
      itens: [
        ["Função", "Sustenta o robô e gira o conjunto no primeiro eixo."],
        ["Atenção", "Verificar a fixação ao piso e a integridade dos cabos que chegam à base."],
      ],
    },
    {
      rotulo: "2", titulo: "Braço", tipo: "estatico", posicao: { x: -0.1, y: 0.0 },
      itens: [
        ["Função", "Liga a base ao punho e define o alcance do robô."],
        ["Composição", "Segmentos articulados movidos por motores e redutores."],
        ["Atenção", "Observar ruídos e folgas nas articulações, conforme o manual do fabricante."],
      ],
    },
    {
      rotulo: "3", titulo: "Punho", tipo: "estatico", posicao: { x: 0.1, y: 0.12 },
      itens: [
        ["Função", "Orienta o efetuador final com movimentos de rotação."],
        ["Atenção", "Verificar o chicote de cabos e mangueiras que passa pelo punho."],
      ],
    },
    {
      rotulo: "4", titulo: "Garra (efetuador)", tipo: "estatico", posicao: { x: 0.3, y: 0.05 },
      itens: [
        ["Função", "Ferramenta que interage com a peça: garra, pinça, solda, etc."],
        ["Atenção", "Conferir fixação, desgaste e acionamento (pneumático ou elétrico)."],
      ],
    },
    {
      rotulo: "5", titulo: "Área de segurança", tipo: "estatico", posicao: { x: 0.35, y: -0.2 },
      itens: [
        ["Função", "Região delimitada ao redor do robô por cercas, barreiras ou sensores."],
        ["Regra", "Não entrar com o robô em operação; seguir os procedimentos de bloqueio da empresa."],
      ],
    },
    { rotulo: "6", titulo: "Monitoramento", tipo: "monitoramento", posicao: { x: -0.35, y: 0.2 } },
  ],
});
