import asyncio
import json
import asyncpg
from aiokafka import AIOKafkaConsumer

KAFKA_BROKER = "kafka:9092"
TOPIC = "market_ticks"

DB_CONFIG = {
    "user": "postgres",
    "password": "postgres",
    "database": "tradestream",
    "host": "db",
    "port": 5432,
}

CREATE_TABLE_QUERY = """
CREATE TABLE IF NOT EXISTS ticks (
    id SERIAL PRIMARY KEY,
    symbol TEXT,
    price DOUBLE PRECISION,
    volume INTEGER,
    ts TIMESTAMPTZ
);
"""

INSERT_QUERY = """
INSERT INTO ticks (symbol, price, volume, ts)
VALUES ($1, $2, $3, to_timestamp($4));
"""

async def consume_and_store():
    # connect to TimescaleDB
    conn = await asyncpg.connect(**DB_CONFIG)
    await conn.execute(CREATE_TABLE_QUERY)
    print("Connected to TimescaleDB")

    # connect to Kafka
    consumer = AIOKafkaConsumer(
        TOPIC,
        bootstrap_servers=KAFKA_BROKER,
        group_id="db-writer-group",
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
    )

    await consumer.start()
    print("Kafka consumer started")

    try:
        async for msg in consumer:
            tick = msg.value
            await conn.execute(
                INSERT_QUERY,
                tick["symbol"],
                tick["price"],
                tick["volume"],
                tick["timestamp"],
            )
            print(f"Saved tick: {tick}")
    finally:
        await consumer.stop()
        await conn.close()

if __name__ == "__main__":
    asyncio.run(consume_and_store())
