import json
import os
import random
import time
from datetime import datetime, timezone

import paho.mqtt.client as mqtt

MQTT_HOST = os.environ.get("MQTT_HOST", "localhost")
MQTT_PORT = int(os.environ.get("MQTT_PORT", "1883"))
INTERVALO = float(os.environ.get("INTERVALO", "2"))

maquinas = {
    "prensa-01": {"nome": "Prensa Hidraulica", "temperatura": 70.0, "rpm": 1200},
    "torno-02": {"nome": "Torno CNC", "temperatura": 65.0, "rpm": 2400},
    "esteira-03": {"nome": "Esteira Principal", "temperatura": 50.0, "rpm": 300},
}


def conectar():
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    while True:
        try:
            client.connect(MQTT_HOST, MQTT_PORT, 60)
            break
        except OSError:
            print("Aguardando broker MQTT...")
            time.sleep(2)
    client.loop_start()
    return client


def proxima_leitura(maquina_id, estado):
    estado["temperatura"] += random.uniform(-2.0, 2.5)
    estado["temperatura"] = max(40.0, min(105.0, estado["temperatura"]))
    estado["rpm"] = max(0, estado["rpm"] + random.randint(-40, 40))
    return {
        "id": maquina_id,
        "nome": estado["nome"],
        "temperatura": round(estado["temperatura"], 1),
        "vibracao": round(random.uniform(0.5, 6.5), 2),
        "rpm": estado["rpm"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def main():
    client = conectar()
    print("Simulador iniciado.")
    while True:
        for maquina_id, estado in maquinas.items():
            leitura = proxima_leitura(maquina_id, estado)
            client.publish(f"industria/{maquina_id}/telemetria", json.dumps(leitura))
            print(f"{maquina_id}: {leitura['temperatura']} C")
        time.sleep(INTERVALO)


if __name__ == "__main__":
    main()
