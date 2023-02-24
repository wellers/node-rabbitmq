import express from "express";
import amqplib from "amqplib";

const hostname = "192.168.50.101";
const username = "test_user";
const password = "password";
const vhost = "/test_host";
const queue = "test_queue";

process.on("unhandledRejection", function (e) {
	process.exit(1);
});

const startDate = Date.now();

async function boot() {	
	const connection = await amqplib.connect({
		protocol: "amqp",
		hostname,
		port: 5672,
		username,
		password,
		vhost
	}, "heartbeat=60");

	const channel = await connection.createChannel();
	await channel.assertQueue(queue, { durable: true });
	channel.consume(queue, async (message) => {
		if (message !== null) {
			console.log(`Message received: ${message.content.toString()}`);
			channel.ack(message);
		}
	});

	const app = express();

	app.get("/status", (_, res) => res.json({ start: startDate }));
	
	app.listen(80, async () => console.log(`🚀 Server ready`));
}

boot().catch(function (e) {
	console.log("Boot failure", e);
	process.exit(1);
});