/* WebAR de apoio à manutenção: hotspots em RA + consulta à API Flask. */
(() => {
  "use strict";

  // ---------- Configuração ----------
  const CONFIG = Object.freeze({
    equipamentoId: "CNC-01",
    urlApi: "/api/equipamentos",
    timeoutMs: 5000,
  });

  const TEXTOS = Object.freeze({
    aguardandoAlvo: "Aponte a câmera para o target",
    raAtiva: "RA ATIVA",
    consultando: "Consultando a API…",
    indisponivel:
      "⚠ Não foi possível consultar os dados do equipamento. " +
      "Verifique a disponibilidade do serviço e tente novamente.",
    semDados: "Aguardando o primeiro dado do broker MQTT.",
  });

  const SEM_VALOR = "—";

  /* posicao: coordenadas no plano do target (x e y em unidades da LARGURA do target,
     origem no centro). Ajuste conforme a imagem do seu ativo. */
  const HOTSPOTS = Object.freeze([
    {
      rotulo: "1", titulo: "Identificação", tipo: "estatico", posicao: { x: -0.28, y: 0.15 },
      itens: [
        ["ID", "CNC-01"],
        ["Tipo", "Torno CNC"],
        ["Setor", "Usinagem"],
        ["Função", "Usinagem de peças cilíndricas por remoção de material, com controle numérico."],
      ],
    },
    {
      rotulo: "2", titulo: "Componentes", tipo: "estatico", posicao: { x: 0.28, y: 0.15 },
      itens: [
        ["Cabeçote/placa", "Fixa e gira a peça durante a usinagem."],
        ["Torre", "Suporta e posiciona as ferramentas de corte."],
        ["Painel", "Interface de comando e programação da máquina."],
        ["Proteção", "Porta e carenagem que isolam a área de usinagem."],
      ],
    },
    {
      rotulo: "3", titulo: "Manutenção", tipo: "estatico", posicao: { x: -0.28, y: -0.15 },
      itens: [
        ["Inspeção visual", "Verificar proteções, porta e painel antes da operação."],
        ["Limpeza", "Remover cavacos da área de usinagem."],
        ["Lubrificação", "Seguir o plano e o manual do fabricante."],
        ["Registro", "Anotar qualquer anomalia observada."],
      ],
    },
    { rotulo: "4", titulo: "Monitoramento", tipo: "monitoramento", posicao: { x: 0.28, y: -0.15 } },
  ]);

  // ---------- Estado ----------
  const ancoras = []; // { entidade, botao } por hotspot
  const ui = {};
  let alvoVisivel = false;

  // ---------- Projeção 3D → tela ----------
  AFRAME.registerComponent("projetor-hotspots", {
    init() {
      this.vetor = new AFRAME.THREE.Vector3();
    },
    tick() {
      if (alvoVisivel) projetarHotspots(this.el, this.vetor);
    },
  });

  function projetarHotspots(cena, vetor) {
    const { clientWidth: largura, clientHeight: altura } = cena.canvas;
    ancoras.forEach(({ entidade, botao }) => {
      entidade.object3D.getWorldPosition(vetor);
      vetor.project(cena.camera);
      const x = ((vetor.x + 1) / 2) * largura;
      const y = ((1 - vetor.y) / 2) * altura;
      botao.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    });
  }

  // ---------- DOM ----------
  function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
  }

  function renderizarItens(itens) {
    const lista = criarElemento("dl", "itens");
    itens.forEach(([rotulo, texto]) => {
      lista.append(criarElemento("dt", "", rotulo), criarElemento("dd", "", texto));
    });
    return lista;
  }

  function formatarMedida(valor, unidade) {
    return valor === null || valor === undefined ? SEM_VALOR : `${valor.toFixed(1)} ${unidade}`;
  }

  function renderizarTelemetria(dados) {
    const bloco = criarElemento("div");
    bloco.append(
      renderizarItens([
        ["Status", dados.status ?? SEM_VALOR],
        ["Temperatura", formatarMedida(dados.temperatura, "°C")],
        ["Vibração", formatarMedida(dados.vibracao, "mm/s")],
        ["Última atualização", dados.atualizacao ?? SEM_VALOR],
      ])
    );
    if (dados.atualizacao === null) bloco.append(criarElemento("p", "aviso", TEXTOS.semDados));
    return bloco;
  }

  function renderizarErro(aoTentarNovamente) {
    const bloco = criarElemento("div");
    const botao = criarElemento("button", "botao", "Tentar novamente");
    botao.type = "button";
    botao.addEventListener("pointerup", aoTentarNovamente);
    bloco.append(criarElemento("p", "erro", TEXTOS.indisponivel), botao);
    return bloco;
  }

  function abrirPainel(titulo, conteudo) {
    ui.painelTitulo.textContent = titulo;
    ui.painelCorpo.replaceChildren(conteudo);
    ui.painel.hidden = false;
  }

  function definirEstadoRA(ativo) {
    alvoVisivel = ativo;
    ui.estado.textContent = ativo ? TEXTOS.raAtiva : TEXTOS.aguardandoAlvo;
    ui.estado.classList.toggle("ativo", ativo);
    ui.camada.classList.toggle("visivel", ativo);
  }

  // ---------- API ----------
  async function buscarTelemetria(equipamentoId) {
    const controle = new AbortController();
    const temporizador = setTimeout(() => controle.abort(), CONFIG.timeoutMs);
    try {
      const url = `${CONFIG.urlApi}/${encodeURIComponent(equipamentoId)}/telemetria`;
      const resposta = await fetch(url, { signal: controle.signal, cache: "no-store" });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      return await resposta.json();
    } finally {
      clearTimeout(temporizador);
    }
  }

  // ---------- Ações dos hotspots ----------
  async function mostrarMonitoramento(hotspot) {
    abrirPainel(hotspot.titulo, criarElemento("p", "aviso", TEXTOS.consultando));
    try {
      const dados = await buscarTelemetria(CONFIG.equipamentoId);
      abrirPainel(hotspot.titulo, renderizarTelemetria(dados));
    } catch (erro) {
      console.error("Falha ao consultar a API:", erro);
      abrirPainel(hotspot.titulo, renderizarErro(() => mostrarMonitoramento(hotspot)));
    }
  }

  function tratarToque(hotspot) {
    if (hotspot.tipo === "monitoramento") {
      mostrarMonitoramento(hotspot);
    } else {
      abrirPainel(hotspot.titulo, renderizarItens(hotspot.itens));
    }
  }

  // ---------- Inicialização ----------
  function criarHotspot(hotspot) {
    const entidade = document.createElement("a-entity");
    entidade.setAttribute("position", `${hotspot.posicao.x} ${hotspot.posicao.y} 0`);
    ui.alvo.appendChild(entidade);

    const botao = criarElemento("button", "hotspot", hotspot.rotulo);
    botao.type = "button";
    botao.setAttribute("aria-label", hotspot.titulo);
    botao.addEventListener("pointerup", () => tratarToque(hotspot));
    ui.camada.appendChild(botao);

    ancoras.push({ entidade, botao });
  }

  function iniciar() {
    ui.alvo = document.getElementById("alvo");
    ui.camada = document.getElementById("camada-hotspots");
    ui.estado = document.getElementById("estado");
    ui.painel = document.getElementById("painel");
    ui.painelTitulo = document.getElementById("painel-titulo");
    ui.painelCorpo = document.getElementById("painel-corpo");

    HOTSPOTS.forEach(criarHotspot);
    ui.alvo.addEventListener("targetFound", () => definirEstadoRA(true));
    ui.alvo.addEventListener("targetLost", () => definirEstadoRA(false));
    document.getElementById("painel-fechar").addEventListener("pointerup", () => {
      ui.painel.hidden = true;
    });
    definirEstadoRA(false);
  }

  document.addEventListener("DOMContentLoaded", iniciar);
})();
