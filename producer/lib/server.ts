import express from "express";
import amqplib from "amqplib";

const hostname = "192.168.50.101";
const username = "test_user";
const password = "password";
const vhost = "/test_host";
const queue = "test_queue";
const exchange = "test_exchange";
const route = "test_route";

process.on("unhandledRejection", function (e) {
	process.exit(1);
});

const startDate = Date.now();

async function boot() {
	const app = express();

	app.get("/produce", async ({ query: { message } }, res) => {
		if (!message) {
			res.json({ success: false, message: "message is required." });
			return;
		}

		if (typeof message !== "string") {
			res.json({ success: false, message: "message must be a String." });
			return;
		}

		const connection = await amqplib.connect({
			protocol: "amqp",
			hostname,
			port: 5672,
			username,
			password,
			vhost
		}, "heartbeat=60");

		const channel = await connection.createChannel();
		await channel.assertExchange(exchange, "direct", { durable: true });
		await channel.assertQueue(queue, { durable: true });
		await channel.bindQueue(queue, exchange, route);
		channel.publish(exchange, route, Buffer.from(message));

		setTimeout(() => {
			channel.close();
			connection.close();
		}, 500);

		res.json({ success: true, message: "Message queued." });
	});

	app.get("/status", (_, res) => res.json({ start: startDate }));

	app.listen(80, () => console.log(`🚀 Server ready`));
}

boot().catch(function (e) {
	console.log("Boot failure", e);
	process.exit(1);
});