const googleMaps = require("@google/maps");
const mqtt = require("mqtt");

const origin = process.env.MQTT_TRAFFIC_ORIGIN;
const destination = process.env.MQTT_TRAFFIC_DESTINATION;
const language = process.env.MQTT_TRAFFIC_LANGUAGE;
const apiKey = process.env.MQTT_TRAFFIC_API_KEY;
const mqttBroker = process.env.MQTT_TRAFFIC_MQTT_BROKER;
const mqttTopic = process.env.MQTT_TRAFFIC_MQTT_TOPIC;

if (!origin || !destination || !language || !apiKey || !mqttBroker || !mqttTopic) {
	throw new Error("Configuration environment variable(s) missing");
}

console.log(`Monitoring traffic conditions from ${origin} to ${destination} and ` +
	`publishing updates to the MQTT broker at ${mqttBroker} on topic ${mqttTopic}...`);

const mqttClient = mqtt.connect(mqttBroker);

const googleMapsClient = googleMaps.createClient({
	key: apiKey,
	Promise: Promise
});

async function updateTrafficData() {
	try {
		const routes = await getRoutes();
		const trafficData = {};
		console.log("Current traffic conditions:");
		for (let i = 0; i < routes.length; i++) {
			const route = routes[i];
			const durationSec = route.legs[0].duration.value;
			const duration = Math.ceil(durationSec/60);
			console.log(`${route.summary}: ${duration}min`);
			trafficData[route.summary] = {duration};
		}
		if (Object.keys(trafficData).length) {
			await publishTraffic(trafficData);
		} else {
			console.log("Nothing to publish");
		}
	} catch (err) {
		console.log("Error:");
		console.log(err);
	}
	setTimeout(updateTrafficData, 1000 * 60 * 5); // repeat after 5 min
}

function getRoutes() {
	console.log("Retrieving directions...");
	return googleMapsClient.directions({
		origin,
		destination,
		language,
		mode: "driving",
		alternatives: true
	}).asPromise()
		.then((res) => {
			const data = res.json;

			if (!data || !data.routes) {
				throw new Error("No data received");
			} else if (data.status !== "OK") {
				throw new Error("Bad status: " + data.status);
			} else {
				return data.routes;
			}
		});
}

function publishTraffic(trafficData) {
	console.log("Publishing...");
	const data = JSON.stringify(trafficData);
	mqttClient.publish(mqttTopic, data, {
		qos: 2 // must arrive and must arrive exactly once - also ensures order
	});
}

updateTrafficData();
