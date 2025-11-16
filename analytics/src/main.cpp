#include <iostream>
#include <string>
#include <deque>
#include <unordered_map>
#include <csignal>
#include <librdkafka/rdkafkacpp.h>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

struct Tick {
    double price;
    int volume;
};

bool keepRunning = true;
void stopRunning(int) {
    keepRunning = false;
}

int main() {
    std::string brokers = "kafka:9092";
    std::string inputTopic = "market_ticks";
    std::string outputTopic = "market_analytics";

    std::cout << "Starting analytics engine..." << std::endl;
    std::signal(SIGINT, stopRunning);

    std::string err;

    RdKafka::Conf* config = RdKafka::Conf::create(RdKafka::Conf::CONF_GLOBAL);
    config->set("bootstrap.servers", brokers, err);
    config->set("group.id", "analytics-publisher", err);
    config->set("enable.auto.commit", "true", err);

    RdKafka::KafkaConsumer* consumer = RdKafka::KafkaConsumer::create(config, err);
    if (!consumer) {
        std::cerr << "Failed to create consumer: " << err << std::endl;
        return 1;
    }
    consumer->subscribe({inputTopic});

    RdKafka::Producer* producer = RdKafka::Producer::create(config, err);
    if (!producer) {
        std::cerr << "Failed to create producer: " << err << std::endl;
        return 1;
    }

    std::cout << "Subscribed to " << inputTopic << " and producing to " << outputTopic << std::endl;

    std::unordered_map<std::string, std::deque<Tick>> symbolTicks;

    const int MAX_TICKS = 10;

    while (keepRunning) {
        RdKafka::Message* msg = consumer->consume(1000);

        if (msg->err() == RdKafka::ERR_NO_ERROR) {
            std::string payload(static_cast<const char*>(msg->payload()), msg->len());

            try {
                json tickJson = json::parse(payload);

                std::string symbol = tickJson["symbol"];
                double price = tickJson["price"];
                int volume = tickJson["volume"];

                std::deque<Tick>& ticks = symbolTicks[symbol];

                ticks.push_back({price, volume});

                if (ticks.size() > MAX_TICKS) {
                    ticks.pop_front();
                }

                double sumPriceVolume = 0;
                double sumVolume = 0;

                for (const Tick& t : ticks) {
                    sumPriceVolume += t.price * t.volume;
                    sumVolume += t.volume;
                }

                double vwap = (sumVolume > 0) ? (sumPriceVolume / sumVolume) : 0.0;

                json outMsg = {
                    {"symbol", symbol},
                    {"vwap", vwap},
                    {"timestamp", tickJson["timestamp"]}
                };

                std::string outString = outMsg.dump();

                RdKafka::ErrorCode resp = producer->produce(
                    outputTopic,
                    RdKafka::Topic::PARTITION_UA,
                    RdKafka::Producer::RK_MSG_COPY,
                    const_cast<char*>(outString.c_str()),
                    outString.size(),
                    nullptr, 0, 0, nullptr
                );

            } catch (std::exception& e) {
                std::cerr << e.what() << std::endl;
            }
        }

        delete msg;
        producer->poll(0);
    }

    std::cout << "Stopping analytics engine..." << std::endl;
    consumer->close();
    delete consumer;
    delete producer;
    delete config;
    RdKafka::wait_destroyed(5000);
}