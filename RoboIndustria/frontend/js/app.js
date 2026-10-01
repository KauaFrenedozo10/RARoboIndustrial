/* WebAR de apoio à manutenção: hotspots em RA + consulta à API Flask. */
(() => {
  "use strict";

  // ---------- Configuração ----------
  const CONFIG = Object.freeze({
    equipamentoId: window.ATIVO.equipamentoId,
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

  const HOTSPOTS = window.ATIVO.hotspots;

  // ---------- Estado ----------
  const ancoras = []; // { entidade, marcador } por hotspot
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
    ancoras.forEach(({ entidade, marcador }) => {
      entidade.object3D.getWorldPosition(vetor);
      vetor.project(cena.camera);
      const x = ((vetor.x + 1) / 2) * largura;
      const y = ((1 - vetor.y) / 2) * altura;
      marcador.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
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

    const marcador = criarElemento("div", "ancora");
    marcador.append(botao, criarElemento("span", "hotspot-rotulo", hotspot.titulo));
    ui.camada.appendChild(marcador);

    ancoras.push({ entidade, marcador });
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
