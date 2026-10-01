"""Publica telemetria FICTÍCIA no broker MQTT (fins didáticos)."""
import logging
import os
import random
import time

import paho.mqtt.client as mqtt

MQTT_HOST = os.getenv("MQTT_HOST", "mqtt")
MQTT_PORTA = int(os.getenv("MQTT_PORTA", "1883"))
EQUIPAMENTO_ID = os.getenv("EQUIPAMENTO_ID", "CNC-01")
INTERVALO_SEGUNDOS = float(os.getenv("INTERVALO_SEGUNDOS", "2"))

TEMPERATURA = {"inicial": 42.0, "minimo": 35.0, "maximo": 55.0, "passo": 1.2}
VIBRACAO = {"inicial": 2.3, "minimo": 1.0, "maximo": 4.0, "passo": 0.3}
STATUS_POSSIVEIS = ("operando",) * 9 + ("em espera",)

LOG = logging.getLogger("simulador")


def proximo_valor(atual, faixa):
    """Passeio aleatório limitado à faixa."""
    variado = atual + random.uniform(-faixa["passo"], faixa["passo"])
    return round(min(faixa["maximo"], max(faixa["minimo"], variado)), 1)


def publicar(cliente, campo, valor):
    topico = f"industria/{EQUIPAMENTO_ID}/{campo}"
    cliente.publish(topico, str(valor), qos=1, retain=True)
    LOG.info("%s = %s", topico, valor)


def main():
    logging.basicConfig(level=logging.INFO)
    cliente = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="simulador")
    cliente.connect_async(MQTT_HOST, MQTT_PORTA)
    cliente.loop_start()

    temperatura, vibracao = TEMPERATURA["inicial"], VIBRACAO["inicial"]
    while True:
        temperatura = proximo_valor(temperatura, TEMPERATURA)
        vibracao = proximo_valor(vibracao, VIBRACAO)
        publicar(cliente, "temperatura", temperatura)
        publicar(cliente, "vibracao", vibracao)
        publicar(cliente, "status", random.choice(STATUS_POSSIVEIS))
        time.sleep(INTERVALO_SEGUNDOS)


if __name__ == "__main__":
    main()
