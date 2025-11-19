import json
import asyncio
from aiokafka import AIOKafkaConsumer
from datetime import datetime
from app.db.session import async_session
from app.db.models import Analytics

KAFKA_BOOTSTRAP = "kafka:9092"
TOPIC = "market_analytics"


async def consume_analytics():
    consumer = AIOKafkaConsumer(
        TOPIC,
        bootstrap_servers=KAFKA_BOOTSTRAP,
        group_id="analytics-db-writer",
        enable_auto_commit=True,
        auto_offset_reset="earliest",
    )

    while True:
        try:
            await consumer.start()
            print("🔥 Analytics DB Consumer connected to Kafka.")
            break
        except Exception:
            print("⚠️ DB Consumer waiting for Kafka...")
            await asyncio.sleep(3)

    try:
        async for msg in consumer:
            try:
                data = json.loads(msg.value.decode("utf-8"))
                ts = datetime.fromtimestamp(data["timestamp"])

                async with async_session() as session:
                    row = Analytics(
                        time=ts,
                        symbol=data["symbol"],
                        vwap=data["vwap"],
                        volatility=data["volatility"],
                        pct_change=data["pct_change"],
                        avg_volume=data["avg_volume"],
                        volume_spike=data["volume_spike"],
                    )

                    session.add(row)
                    await session.commit()

                print(f"💾 Saved analytics → {data['symbol']} @ {ts}")

            except Exception as e:
                print(f"⚠️ Error inserting analytics: {e}")

    finally:
        await consumer.stop()
