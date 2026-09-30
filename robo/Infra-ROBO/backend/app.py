import json
import os
import threading
from collections import deque
from datetime import datetime, timezone

import paho.mqtt.client as mqtt
from flask import Flask, abort, jsonify, send_from_directory

MQTT_HOST = os.environ.get("MQTT_HOST", "localhost")
MQTT_PORT = int(os.environ.get("MQTT_PORT", "1883"))
FRONTEND_DIR = os.environ.get("FRONTEND_DIR", "/app/frontend")
TOPICO = "industria/+/telemetria"
HISTORICO_MAX = 60

app = Flask(__name__)
maquinas = {}
lock = threading.Lock()


def calcular_status(temperatura):
    if temperatura >= 95:
        return "critico"
    if temperatura >= 85:
        return "alerta"
    return "ok"


def on_connect(client, userdata, flags, reason_code, properties=None):
    print(f"[MQTT] conectado: {reason_code}", flush=True)
    client.subscribe(TOPICO)


def on_message(client, userdata, msg):
    try:
        dados = json.loads(msg.payload.decode())
        maquina_id = dados["id"]
        dados["status"] = calcular_status(dados["temperatura"])
        dados["recebido_em"] = datetime.now(timezone.utc).isoformat()
    except (ValueError, KeyError) as erro:
        print(f"[MQTT] mensagem invalida: {erro}", flush=True)
        return

    with lock:
        maquina = maquinas.setdefault(
            maquina_id, {"atual": None, "historico": deque(maxlen=HISTORICO_MAX)}
        )
        maquina["atual"] = dados
        maquina["historico"].append(dados)


def iniciar_mqtt():
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect_async(MQTT_HOST, MQTT_PORT, 60)
    client.loop_start()


@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/health")
def health():
    return jsonify(status="ok")


@app.route("/api/machines")
def listar_maquinas():
    with lock:
        return jsonify([m["atual"] for m in maquinas.values() if m["atual"]])


@app.route("/api/machines/<maquina_id>")
def detalhar_maquina(maquina_id):
    with lock:
        maquina = maquinas.get(maquina_id)
        if not maquina:
            abort(404)
        return jsonify(atual=maquina["atual"], historico=list(maquina["historico"]))


if __name__ == "__main__":
    iniciar_mqtt()
    app.run(host="0.0.0.0", port=5000)
