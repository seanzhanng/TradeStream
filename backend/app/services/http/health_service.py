# backend/app/services/http/health_service.py
from aiokafka import AIOKafkaProducer
import asyncio

KAFKA_BROKER = "kafka:9092"

class HealthService:
    @staticmethod
    async def check_kafka() -> bool:
        """Return True if we can successfully connect to Kafka."""
        producer = AIOKafkaProducer(bootstrap_servers=KAFKA_BROKER)
        try:
            await producer.start()
            return True
        except Exception:
            return False
        finally:
            try:
                await producer.stop()
            except Exception:
                pass

    @classmethod
    async def get_health(cls) -> dict:
        kafka_ok = await cls.check_kafka()
        return {
            "kafka": kafka_ok,
        }