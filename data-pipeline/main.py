import asyncio
import json
import random
import time
from aiokafka import AIOKafkaProducer
from symbols import allowed_symbols

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
            for symbol in allowed_symbols:
                message = {
                    "symbol": symbol,
                    "price": round(150 + random.uniform(-5, 5), 2),
                    "volume": random.randint(100, 2000),
                    "timestamp": time.time(),
                }
                await producer.send_and_wait(TOPIC, message)
            await asyncio.sleep(2)

    finally:
        await producer.stop()

if __name__ == "__main__":
    asyncio.run(produce())
