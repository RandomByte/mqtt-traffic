const {Client} = require("@googlemaps/google-maps-services-js");
const mqtt = require("mqtt");

const origin = process.env.MQTT_TRAFFIC_ORIGIN;
const destination = process.env.MQTT_TRAFFIC_DESTINATION;
const language = process.env.MQTT_TRAFFIC_LANGUAGE;
const apiKey = process.env.MQTT_TRAFFIC_API_KEY;
const mqttBroker = process.env.MQTT_TRAFFIC_MQTT_BROKER;

// Remove any trailing slash from topic prefix because we can
const mqttTopicPrefix = process.env.MQTT_TRAFFIC_MQTT_TOPIC_PREFIX.replace(/\/$/, "");

if (!origin || !destination || !language || !apiKey || !mqttBroker || !mqttTopicPrefix) {
	console.log("Configuration environment variable(s) missing");
	process.exit(1);
}

console.log(`Monitoring traffic conditions from ${origin} to ${destination} and ` +
	`publishing updates to the MQTT broker at ${mqttBroker} using topic prefix ${mqttTopicPrefix}/...`);

const mqttClient = mqtt.connect(mqttBroker);
const mapsClient = new Client({});

async function updateTrafficData() {
	try {
		const routes = await getRoutes();

		const routeOptions = routes.map((route) => {
			const durationSec = route.legs[0].duration.value;
			const duration = Math.ceil(durationSec/60);
			return {
				name: route.summary,
				duration
			};
		});

		if (routeOptions.length) {
			await publishTraffic(routeOptions);
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

function publishTraffic(routeOptions) {
	console.log("Publishing current traffic conditions (first is quickest):");

	routeOptions.forEach((route) => {
		const routeTopic = `${mqttTopicPrefix}/Routes`;
		console.log(`[${routeTopic}]: ${route.name} takes ${route.duration} min`);
		mqttClient.publish(routeTopic, `${route.name};${route.duration}`, {
			qos: 1
		});
	});
}

mqttClient.on("connect", function() {
	updateTrafficData();
});
