const {Client} = require("@googlemaps/google-maps-services-js");
const mqtt = require("mqtt");

const origin = process.env.MQTT_TRAFFIC_ORIGIN;
const destination = process.env.MQTT_TRAFFIC_DESTINATION;
const language = process.env.MQTT_TRAFFIC_LANGUAGE;
const apiKey = process.env.MQTT_TRAFFIC_API_KEY;
const mqttBroker = process.env.MQTT_TRAFFIC_MQTT_BROKER;
const mqttTopic = process.env.MQTT_TRAFFIC_MQTT_TOPIC;

if (!origin || !destination || !language || !apiKey || !mqttBroker || !mqttTopic) {
	console.log("Configuration environment variable(s) missing");
	process.exit(1);
}

console.log(`Monitoring traffic conditions from ${origin} to ${destination} and ` +
	`publishing updates to the MQTT broker at ${mqttBroker} on topic ${mqttTopic}...`);

const mqttClient = mqtt.connect(mqttBroker);
const mapsClient = new Client({})

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
	console.log("Done. Sleeping for 5 minutes.");
	setTimeout(updateTrafficData, 1000 * 60 * 5); // repeat after 5 min
}

function getRoutes() {
	console.log("Retrieving directions...");
	return mapsClient.directions({
		params: {
			origin,
			destination,
			language,
			mode: "driving",
			alternatives: true,
			key: apiKey
		}
	}).then((res) => {
		const data = res.data;
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
	const msg = JSON.stringify(trafficData);
	mqttClient.publish(mqttTopic, msg, {
		qos: 1, // must arrive at least once - also ensures order
	});
}

mqttClient.on("connect", function() {
	updateTrafficData();
});
