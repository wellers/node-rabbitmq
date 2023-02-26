import express from "express";
import amqplib from "amqplib";

const {	
	CLOUDAMQP_HOST,
	CLOUDAMQP_PORT,
	RABBITMQ_USERNAME,
	RABBITMQ_PASSWORD,
	RABBITMQ_VHOST,
	RABBITMQ_QUEUE_NAME,
	RABBITMQ_EXCHANGE_NAME,
	RABBITMQ_ROUTE_NAME
} = process.env;

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
			hostname: CLOUDAMQP_HOST,
			port: CLOUDAMQP_PORT as number | undefined,
			username: RABBITMQ_USERNAME,
			password: RABBITMQ_PASSWORD,
			vhost: RABBITMQ_VHOST
		}, "heartbeat=60");

		const channel = await connection.createChannel();
		await channel.assertExchange(RABBITMQ_EXCHANGE_NAME, "direct", { durable: true });
		await channel.assertQueue(RABBITMQ_QUEUE_NAME, { durable: true });
		await channel.bindQueue(RABBITMQ_QUEUE_NAME, RABBITMQ_EXCHANGE_NAME, RABBITMQ_ROUTE_NAME);
		channel.publish(RABBITMQ_EXCHANGE_NAME, RABBITMQ_ROUTE_NAME, Buffer.from(message));

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