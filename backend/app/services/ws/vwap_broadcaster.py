import asyncio
from aiokafka import AIOKafkaConsumer
import json

KAFKA_BROKER = "kafka:9092"
TOPIC = "market_analytics"

connected_clients = {}

async def vwap_kafka_consumer():
    consumer = AIOKafkaConsumer(
        TOPIC,
        bootstrap_servers=KAFKA_BROKER,
        group_id="backend-vwap-group",
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
        auto_offset_reset="latest"
    )

    while True:
        try:
            await consumer.start()
            print("Connected to Kafka: VWAP consumer started")
            break
        except Exception as e:
            await asyncio.sleep(3)

    try:
        async for msg in consumer:
            data = msg.value
            symbol = data.get("symbol")

            dead = []

            for ws, subs in connected_clients.items():
                if "*" in subs or symbol in subs:
                    try:
                        await ws.send_json(data)
                    except:
                        dead.append(ws)

            for ws in dead:
                del connected_clients[ws]

    finally:
        await consumer.stop()