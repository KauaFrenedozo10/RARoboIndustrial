"""API Flask: identificação e telemetria SIMULADA (fins didáticos)."""
import logging
import os

from flask import Flask, jsonify

from telemetria import RepositorioTelemetria, iniciar_assinatura

MQTT_HOST = os.getenv("MQTT_HOST", "mqtt")
MQTT_PORTA = int(os.getenv("MQTT_PORTA", "1883"))

EQUIPAMENTOS = {
    "ROB-01": {"id": "ROB-01", "tipo": "Robô industrial", "setor": "Manufatura", "status": "operacional"},
}


def criar_app(repositorio):
    app = Flask(__name__)
    app.json.sort_keys = False
    app.json.ensure_ascii = False

    def equipamento_ou_404(equipamento_id):
        equipamento = EQUIPAMENTOS.get(equipamento_id)
        if equipamento is None:
            return None, (jsonify(erro="Equipamento não encontrado"), 404)
        return equipamento, None

    @app.get("/api/saude")
    def saude():
        return jsonify(status="ok")

    @app.get("/api/equipamentos/<equipamento_id>")
    def identificacao(equipamento_id):
        equipamento, erro = equipamento_ou_404(equipamento_id)
        return erro or jsonify(equipamento)

    @app.get("/api/equipamentos/<equipamento_id>/telemetria")
    def telemetria(equipamento_id):
        _, erro = equipamento_ou_404(equipamento_id)
        return erro or jsonify(repositorio.obter(equipamento_id))

    return app


logging.basicConfig(level=logging.INFO)
repositorio = RepositorioTelemetria()
app = criar_app(repositorio)
iniciar_assinatura(repositorio, MQTT_HOST, MQTT_PORTA)
