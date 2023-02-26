import express from "express";
import amqplib from "amqplib";

const {	
	CLOUDAMQP_HOST,
	CLOUDAMQP_PORT,
	RABBITMQ_USERNAME,
	RABBITMQ_PASSWORD,
	RABBITMQ_VHOST,
	RABBITMQ_QUEUE_NAME	
} = process.env;

process.on("unhandledRejection", function (e) {
	process.exit(1);
});

const startDate = Date.now();

async function boot() {	
	const connection = await amqplib.connect({
		protocol: "amqp",
		hostname: CLOUDAMQP_HOST,
		port: CLOUDAMQP_PORT as number | undefined,
		username: RABBITMQ_USERNAME,
		password: RABBITMQ_PASSWORD,
		vhost: RABBITMQ_VHOST
	}, "heartbeat=60");

	const channel = await connection.createChannel();
	await channel.assertQueue(RABBITMQ_QUEUE_NAME, { durable: true });
	channel.consume(RABBITMQ_QUEUE_NAME, async (message) => {
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