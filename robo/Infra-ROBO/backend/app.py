
from flask import Flask, jsonify
from flask_cors import CORS
import paho.mqtt.client as mqtt
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

equipamento = {
    "id": "ROBO-01",
    "tipo": "Robô industrial",
    "setor": "Produção",
    "status": "operacional"
}

telemetria = {
    "temperatura": 25.0,
    "vibracao": 0.5,
    "status": "operando",
    "atualizacao": None
}

def ao_conectar(client, userdata, flags, rc):
    print("Conectado ao MQTT:", rc)

    client.subscribe("industria/ROBO-01/#")

def ao_receber(client, userdata, msg):
    global telemetria

    valor = msg.payload.decode()
    topico = msg.topic.split("/")[-1]

    if topico == "temperatura":
        telemetria["temperatura"] = float(valor)

    elif topico == "vibracao":
        telemetria["vibracao"] = float(valor)

    elif topico == "status":
        telemetria["status"] = valor

    telemetria["atualizacao"] = datetime.now().strftime("%H:%M:%S")

    print("Dado recebido:", topico, valor)


cliente = mqtt.Client()
cliente.on_connect = ao_conectar
cliente.on_message = ao_receber

@app.route("/api/equipamentos/<id>")
def consultar_equipamento(id):
    if id != equipamento["id"]:
        return jsonify({"erro": "Equipamento não encontrado"}), 404

    return jsonify(equipamento)

@app.route("/api/equipamentos/<id>/telemetria")
def consultar_telemetria(id):
    if id != equipamento["id"]:
        return jsonify({"erro": "Equipamento não encontrado"}), 404

    return jsonify(telemetria)

if __name__ == "__main__":
    cliente.connect("mqtt", 1883, 60)
    cliente.loop_start()

    app.run(host="0.0.0.0", port=5000)