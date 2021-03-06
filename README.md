# mqtt-traffic
[![Docker Hub Pulls](https://img.shields.io/docker/pulls/randombyte/mqtt-traffic.svg)](https://hub.docker.com/r/randombyte/mqtt-traffic)

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
- **MQTT_TRAFFIC_MQTT_TOPIC_PPREFIX** MQTT topic prefix to publish traffic data on, e.g. `Traffic/Work/`

## Docker Image
A Docker image is available on [Docker Hub](https://hub.docker.com/r/randombyte/mqtt-traffic).

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
-e MQTT_TRAFFIC_MQTT_TOPIC_PPREFIX="Traffic/Work/" \
randombyte/mqtt-traffic:latest
````

### Option 2: Source
```sh
MQTT_TRAFFIC_ORIGIN="Frankfurt" \
MQTT_TRAFFIC_DESTINATION="Stuttgart" \
MQTT_TRAFFIC_LANGUAGE="en" \
MQTT_TRAFFIC_API_KEY="<your google API key>" \
MQTT_TRAFFIC_MQTT_BROKER="mqtt://<broker HOST or IP>" \
MQTT_TRAFFIC_MQTT_TOPIC_PPREFIX="Traffic/Work/" \
npm start
````

### Output
```
Publishing current traffic conditions (first is quickest):
[Traffic/Work/0/] "A5 and A8" taking 139 min
[Traffic/Work/1/] "A5, A8 and B14" taking 140 min
[Traffic/Work/2/] "A6" taking 144 min
Done. Sleeping for 5 minutes.
```

### MQTT Message Examples

| Topic        | Payload
| ------------- |-------------|
| `Traffic/Work/Routes` | `A5 and A8;139` |
| `Traffic/Work/Routes` | `A5, A8 and B14;140` |
| `Traffic/Work/Routes` | `A6;144` |

## License
Released under the [MIT License](https://opensource.org/licenses/MIT).
