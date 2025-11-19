#include <iostream>
#include <string>
#include <deque>
#include <unordered_map>
#include <csignal>
#include <cmath>
#include <thread>
#include <chrono>
#include <librdkafka/rdkafkacpp.h>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

struct Tick {
    double price;
    int volume;
};

bool keepRunning = true;
void stopRunning(int) { keepRunning = false; }

int main() {
    std::string brokers = "kafka:9092";
    std::string inputTopic = "market_ticks";
    std::string outputTopic = "market_analytics";

    std::cout << "📡 Starting analytics engine...\n";
    std::signal(SIGINT, stopRunning);

    std::string err;

    RdKafka::Conf* conf = RdKafka::Conf::create(RdKafka::Conf::CONF_GLOBAL);
    conf->set("bootstrap.servers", brokers, err);
    conf->set("group.id", "analytics-engine", err);
    conf->set("enable.auto.commit", "true", err);

    RdKafka::KafkaConsumer* consumer = nullptr;

    for (int i = 0; i < 20; i++) {
        consumer = RdKafka::KafkaConsumer::create(conf, err);
        if (consumer) break;
        std::cout << "⏳ Kafka not ready — retrying in 3s...\n";
        std::this_thread::sleep_for(std::chrono::seconds(3));
    }

    if (!consumer) {
        std::cerr << "❌ Failed to connect to Kafka after retries\n";
        return 1;
    }

    consumer->subscribe({inputTopic});
    std::cout << "✅ Connected to Kafka consumer — listening on topic: " << inputTopic << "\n";

    RdKafka::Producer* producer = RdKafka::Producer::create(conf, err);
    if (!producer) {
        std::cerr << "❌ Failed to create producer: " << err << "\n";
        return 1;
    }
    std::cout << "✅ Kafka producer ready (topic: " << outputTopic << ")\n";

    std::unordered_map<std::string, std::deque<Tick>> symbolTicks;
    const int MAX_TICKS = 20;

    while (keepRunning) {
        RdKafka::Message* msg = consumer->consume(1000);

        if (msg->err() == RdKafka::ERR_NO_ERROR) {
            try {
                std::string payload(static_cast<const char*>(msg->payload()), msg->len());
                json tickJson = json::parse(payload);

                std::string symbol = tickJson["symbol"];
                double price = tickJson["price"];
                int volume = tickJson["volume"];
                double ts = tickJson["timestamp"];

                std::cout << "📥 Consumed tick → "
                          << symbol << " | price=" << price
                          << " | volume=" << volume
                          << " | ts=" << ts << "\n";

                auto& ticks = symbolTicks[symbol];
                ticks.push_back({price, volume});

                if (ticks.size() > MAX_TICKS) ticks.pop_front();

                std::cout << "📊 Window size for " << symbol
                          << " = " << ticks.size() << "\n";

                if (ticks.size() < 2) {
                    std::cout << "⏸ Not enough data for " << symbol << " (need 2+ ticks)\n";
                    delete msg;
                    continue;
                }

                double sumPV = 0, sumV = 0, sumPrice = 0, sumPriceSq = 0, sumVol = 0;

                for (auto& t : ticks) {
                    sumPV += t.price * t.volume;
                    sumV += t.volume;
                    sumPrice += t.price;
                    sumPriceSq += t.price * t.price;
                    sumVol += t.volume;
                }

                double vwap = (sumV > 0) ? (sumPV / sumV) : 0.0;

                int n = ticks.size();
                double mean = sumPrice / n;
                double variance = 0;
                for (auto& t : ticks)
                    variance += (t.price - mean) * (t.price - mean);
                variance /= (n - 1);
                double volatility = std::sqrt(variance);

                double firstPrice = ticks.front().price;
                double lastPrice = ticks.back().price;
                double pctChange =
                    (firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100.0 : 0.0);

                double avgVolume = sumVol / n;

                bool volumeSpike = volume > avgVolume * 1.8;

                std::cout << "📈 Computed → VWAP=" << vwap
                          << " | Volatility=" << volatility
                          << " | %Change=" << pctChange
                          << " | AvgVol=" << avgVolume
                          << " | Spike=" << (volumeSpike ? "YES" : "no")
                          << "\n";

                json outMsg = {
                    {"symbol", symbol},
                    {"timestamp", ts},
                    {"vwap", vwap},
                    {"volatility", volatility},
                    {"pct_change", pctChange},
                    {"avg_volume", avgVolume},
                    {"volume_spike", volumeSpike}
                };

                std::string outStr = outMsg.dump();

                RdKafka::ErrorCode resp = producer->produce(
                    outputTopic,
                    RdKafka::Topic::PARTITION_UA,
                    RdKafka::Producer::RK_MSG_COPY,
                    const_cast<char*>(outStr.c_str()),
                    outStr.size(),
                    nullptr, 0, 0, nullptr
                );

                if (resp == RdKafka::ERR_NO_ERROR) {
                    std::cout << "📤 Produced analytics → " << outStr << "\n";
                } else {
                    std::cerr << "❌ Produce error: " << RdKafka::err2str(resp) << "\n";
                }

                producer->poll(0);

            } catch (std::exception& e) {
                std::cerr << "⚠️ JSON parse error: " << e.what() << "\n";
            }
        }

        delete msg;
    }

    std::cout << "🛑 Stopping analytics engine...\n";
    consumer->close();
    delete consumer;
    delete producer;
    delete conf;
    RdKafka::wait_destroyed(5000);

    return 0;
}
