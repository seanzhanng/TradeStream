import asyncio
import json
import random
import time
from aiokafka import AIOKafkaProducer

KAFKA_BROKER = "kafka:9092"
TOPIC = "market_ticks"

async def produce():
    producer = AIOKafkaProducer(
        bootstrap_servers=KAFKA_BROKER,
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    )
    await producer.start()
    try:
        while True:
            message = {
                "symbol": "AAPL",
                "price": round(150 + random.uniform(-1, 1), 2),
                "volume": random.randint(100, 1000),
                "timestamp": time.time(),
            }
            await producer.send_and_wait(TOPIC, message)
            print(f"Sent: {message}")
            await asyncio.sleep(1)
    finally:
        await producer.stop()

if __name__ == "__main__":
    asyncio.run(produce())
