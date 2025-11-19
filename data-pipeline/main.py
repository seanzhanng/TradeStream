import asyncio
import json
import random
import time
import logging
import asyncpg
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from symbols import allowed_symbols

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

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


async def wait_for_kafka():
    while True:
        try:
            test = AIOKafkaProducer(bootstrap_servers=KAFKA_BROKER)
            await test.start()
            await test.stop()
            logging.info("Kafka is ready.")
            return
        except Exception as e:
            logging.warning(f"Kafka not ready: {e}. Retrying in 2s...")
            await asyncio.sleep(2)


async def wait_for_db():
    while True:
        try:
            conn = await asyncpg.connect(**DB_CONFIG)
            logging.info("Connected to TimescaleDB.")
            return conn
        except Exception as e:
            logging.warning(f"DB not ready: {e}. Retrying in 2s...")
            await asyncio.sleep(2)


async def produce():
    await wait_for_kafka()
    producer = AIOKafkaProducer(
        bootstrap_servers=KAFKA_BROKER,
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    )
    await producer.start()
    logging.info("Producer started.")

    try:
        while True:
            for symbol in allowed_symbols:
                msg = {
                    "symbol": symbol,
                    "price": round(150 + random.uniform(-5, 5), 2),
                    "volume": random.randint(100, 2000),
                    "timestamp": time.time(),
                }
                await producer.send_and_wait(TOPIC, msg)
                logging.info(f"Produced → {msg}")
            await asyncio.sleep(2)
    finally:
        logging.info("Stopping producer...")
        await producer.stop()


async def consume_and_store():
    conn = await wait_for_db()

    await conn.execute(CREATE_TABLE_QUERY)
    logging.info("Table ensured.")

    try:
        await conn.execute(CREATE_HYPERTABLE_QUERY)
        logging.info("Hypertable ready.")
    except Exception as e:
        logging.info(f"Hypertable already exists: {e}")

    consumer = AIOKafkaConsumer(
        TOPIC,
        bootstrap_servers=KAFKA_BROKER,
        group_id="db-writer-group",
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
    )

    await consumer.start()
    logging.info("DB consumer started.")

    try:
        async for msg in consumer:
            tick = msg.value
            logging.info(f"Inserting tick → {tick}")

            await conn.execute(
                INSERT_QUERY,
                tick["symbol"],
                tick["price"],
                tick["volume"],
                tick["timestamp"],
            )
    finally:
        await consumer.stop()
        await conn.close()


async def main():
    await asyncio.gather(
        produce(),
        consume_and_store()
    )


if __name__ == "__main__":
    asyncio.run(main())