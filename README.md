# mqtt-traffic
[![Docker Hub Pulls](https://img.shields.io/docker/pulls/randombyte/armhf-mqtt-traffic.svg)](https://hub.docker.com/r/randombyte/armhf-mqtt-traffic)

Monitors traffic conditions from one location to another and publishes updates via MQTT.

## Prerequisites
- A Google Maps Web Service **API Key**. See https://github.com/googlemaps/google-maps-services-js#api-keys

## Usage
mqtt-traffic can be configured using environment variables:

- **MQTT_TRAFFIC_ORIGIN:** Route start, e.g. `Frankfurt` or `49.465890, 8.754082`
- **MQTT_TRAFFIC_DESTINATION:** Route destination, e.g. `Rotebühlplatz 1, 70178 Stuttgart`
- **MQTT_TRAFFIC_LANGUAGE:** Language to be used in the route summary
- **MQTT_TRAFFIC_API_KEY:** [Your Google Maps Web Service API Key](https://github.com/googlemaps/google-maps-services-js#api-keys)
- **MQTT_TRAFFIC_MQTT_BROKER:** URL of your MQTT broker, e.g. `mqtt://test.mosquitto.org`
- **MQTT_TRAFFIC_MQTT_TOPIC:** MQTT topic to publish traffic data on, e.g. `Traffic/Work`

## Docker Image
A Docker image for the **armhf** architecture (Raspberry Pi et al.) is available on [Docker Hub](https://hub.docker.com/r/randombyte/armhf-mqtt-traffic).

## Example
Routes from **Frankfurt to Stuttgart** based on current traffic conditions

### Option 1: Docker
````sh
docker run --rm -it \
-e MQTT_TRAFFIC_ORIGIN="Frankfurt" \
-e MQTT_TRAFFIC_DESTINATION="Stuttgart" \
-e MQTT_TRAFFIC_LANGUAGE="en" \
-e MQTT_TRAFFIC_API_KEY="<your google API key>" \
-e MQTT_TRAFFIC_MQTT_BROKER="mqtt://<broker HOST or IP>" \
-e MQTT_TRAFFIC_MQTT_TOPIC="Home/WorkTraffic" \
randombyte/armhf-mqtt-traffic:latest
````

### Option 2: Source
```sh
MQTT_TRAFFIC_ORIGIN="Frankfurt" \
MQTT_TRAFFIC_DESTINATION="Stuttgart" \
MQTT_TRAFFIC_LANGUAGE="en" \
MQTT_TRAFFIC_API_KEY="<your google API key>" \
MQTT_TRAFFIC_MQTT_BROKER="mqtt://<broker HOST or IP>" \
MQTT_TRAFFIC_MQTT_TOPIC="Home/WorkTraffic" \
npm start
````

### Output
```
A5 and A8: 134min
A6: 140min
A3 and A81: 156min
```

### MQTT message payload
```json
{
    "A5 and A8": {
        "duration": 134
    },
    "A6": {
        "duration": 140
    },
    "A3 and A81": {
        "duration": 156
    }
}
```


## License
Released under the [MIT License](https://opensource.org/licenses/MIT).
