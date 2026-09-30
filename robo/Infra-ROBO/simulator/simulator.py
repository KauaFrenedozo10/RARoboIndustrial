
import paho.mqtt.client as mqtt
import random
import time

cliente = mqtt.Client()

while True:
    try:
        cliente.connect("mqtt", 1883, 60)
        break
    except Exception:
        print("Aguardando broker MQTT...")
        time.sleep(3)

cliente.loop_start()

while True:
    temperatura = round(random.uniform(20, 50), 2)
    vibracao = round(random.uniform(0.1, 5.0), 2)

    if temperatura > 45:
        status = "atencao"
    else:
        status = "operando"

    cliente.publish(
        "industria/ROBO-01/temperatura",
        str(temperatura)
    )

    cliente.publish(
        "industria/ROBO-01/vibracao",
        str(vibracao)
    )

    cliente.publish(
        "industria/ROBO-01/status",
        status
    )

    print("Temperatura:", temperatura)
    print("Vibração:", vibracao)
    print("Status:", status)

    time.sleep(5)