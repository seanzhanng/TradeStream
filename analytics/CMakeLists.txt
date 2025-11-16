cmake_minimum_required(VERSION 3.10)
project(analytics_engine)
set(CMAKE_CXX_STANDARD 17)

find_package(PkgConfig REQUIRED)
pkg_check_modules(RDKAFKA REQUIRED rdkafka++)
find_path(JSON_INCLUDE_DIR nlohmann/json.hpp)

include_directories(${RDKAFKA_INCLUDE_DIRS} ${JSON_INCLUDE_DIR})
link_directories(${RDKAFKA_LIBRARY_DIRS})

add_executable(analytics_engine src/main.cpp)
target_link_libraries(analytics_engine ${RDKAFKA_LIBRARIES})