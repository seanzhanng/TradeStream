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
    id SERIAL,
    symbol TEXT NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    volume INTEGER NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (symbol, ts, id)
);
"""

CREATE_HYPERTABLE_QUERY = """
SELECT create_hypertable(
    'ticks',
    'ts',
    partitioning_column => 'symbol',
    number_partitions => 8,
    if_not_exists => TRUE
);
"""

INSERT_QUERY = """
INSERT INTO ticks (symbol, price, volume, ts)
VALUES ($1, $2, $3, to_timestamp($4));
"""

async def consume_and_store():
    conn = await asyncpg.connect(**DB_CONFIG)
    print("Connected to TimescaleDB")

    await conn.execute(CREATE_TABLE_QUERY)
    print("Ensured ticks table exists")

    try:
        await conn.execute(CREATE_HYPERTABLE_QUERY)
        print("Converted ticks table into hypertable with symbol partitioning")
    except Exception as e:
        print("Hypertable creation skipped:", e)

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
                tick["timestamp"]
            )

    finally:
        await consumer.stop()
        await conn.close()

if __name__ == "__main__":
    asyncio.run(consume_and_store())