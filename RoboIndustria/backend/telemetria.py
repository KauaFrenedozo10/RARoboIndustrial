"""Armazenamento do último dado de telemetria e assinatura MQTT."""
import logging
import threading
from datetime import datetime
from zoneinfo import ZoneInfo

import paho.mqtt.client as mqtt

LOG = logging.getLogger(__name__)
FUSO_HORARIO = ZoneInfo("America/Sao_Paulo")
TOPICO_BASE = "industria"
CAMPOS_ACEITOS = {"temperatura": float, "vibracao": float, "status": str}
ATRASO_RECONEXAO_SEGUNDOS = (1, 10)


class RepositorioTelemetria:
    """Guarda, em memória, o último valor recebido de cada equipamento."""

    def __init__(self):
        self._dados = {}
        self._trava = threading.Lock()

    def atualizar(self, equipamento_id, campo, valor):
        with self._trava:
            registro = self._dados.setdefault(equipamento_id, {})
            registro[campo] = valor
            registro["atualizacao"] = datetime.now(FUSO_HORARIO).strftime("%H:%M:%S")

    def obter(self, equipamento_id):
        with self._trava:
            registro = self._dados.get(equipamento_id, {})
            return {
                "temperatura": registro.get("temperatura"),
                "vibracao": registro.get("vibracao"),
                "status": registro.get("status"),
                "atualizacao": registro.get("atualizacao"),
            }


def interpretar_mensagem(topico, payload):
    """Converte ('industria/ROB-01/temperatura', b'47.2') em ('ROB-01', 'temperatura', 47.2)."""
    partes = topico.split("/")
    if len(partes) != 3 or partes[0] != TOPICO_BASE or partes[2] not in CAMPOS_ACEITOS:
        raise ValueError(f"Tópico inesperado: {topico}")
    _, equipamento_id, campo = partes
    valor = CAMPOS_ACEITOS[campo](payload.decode().strip())
    return equipamento_id, campo, valor


def iniciar_assinatura(repositorio, host, porta):
    """Conecta ao broker (com reconexão automática) e alimenta o repositório."""
    cliente = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="api-flask")

    def ao_conectar(cliente_, _dados, _flags, _codigo, _propriedades):
        LOG.info("Conectado ao broker MQTT em %s:%s", host, porta)
        cliente_.subscribe(f"{TOPICO_BASE}/+/+")

    def ao_receber(_cliente, _dados, mensagem):
        try:
            repositorio.atualizar(*interpretar_mensagem(mensagem.topic, mensagem.payload))
        except ValueError as erro:
            LOG.warning("Mensagem MQTT ignorada: %s", erro)

    cliente.on_connect = ao_conectar
    cliente.on_message = ao_receber
    cliente.reconnect_delay_set(*ATRASO_RECONEXAO_SEGUNDOS)
    cliente.connect_async(host, porta)
    cliente.loop_start()
    return cliente
