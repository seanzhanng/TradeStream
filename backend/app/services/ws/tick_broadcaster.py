import asyncio
from aiokafka import AIOKafkaConsumer
import json

KAFKA_BROKER = "kafka:9092"
TOPIC = "market_ticks"

tick_clients = {}
async def tick_kafka_consumer():
    consumer = AIOKafkaConsumer(
        TOPIC,
        bootstrap_servers=KAFKA_BROKER,
        group_id="backend-tick-group",
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
        auto_offset_reset="latest"
    )

    while True:
        try:
            await consumer.start()
            print("📡 Tick consumer connected")
            break
        except:
            print("⏳ Waiting for Kafka...")
            await asyncio.sleep(3)

    try:
        async for msg in consumer:
            tick = msg.value
            symbol = tick["symbol"]

            dead = []

            for ws, subs in tick_clients.items():
                if symbol in subs or "*" in subs:
                    try:
                        await ws.send_json(tick)
                    except:
                        dead.append(ws)

            for ws in dead:
                tick_clients.pop(ws, None)

    finally:
        await consumer.stop()
