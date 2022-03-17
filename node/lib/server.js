'use strict';

const express = require('express');
const amqplib = require('amqplib');

const PORT = 80;

const app = express();

const amqp_url = process.env.CLOUDAMQP_URL || 'amqp://192.168.50.101:5672';

app.get('/consume', async (_, res) => {	
	await consume();

	async function consume() {
		const conn = await amqplib.connect(amqp_url, "heartbeat=60");
		const channel = await conn.createChannel();

		const queue = 'test_queue';

		await conn.createChannel();
		await channel.assertQueue(queue, { durable: true });
		await channel.consume(queue, function (message) {
			res.json({ success: true, message: message.content.toString() });			
			channel.ack(message);
			channel.cancel('myconsumer');
		}, { consumerTag: 'myconsumer'});

		setTimeout(function () {
			channel.close();
			conn.close();
		}, 500);
	}	
});

app.get('/produce', async (_, res) => {
	await produce();

	async function produce() {
		const conn = await amqplib.connect(amqp_url, "heartbeat=60");
		const channel = await conn.createChannel();

		const exchange = 'test_exchange';
		const queue = 'test_queue';
		const route = 'test_route';
		const message = 'Hello World!';

		await channel.assertExchange(exchange, 'direct', { durable: true });
		await channel.assertQueue(queue, { durable: true });
		await channel.bindQueue(queue, exchange, route);
		await channel.publish(exchange, route, Buffer.from(message));

		setTimeout(function () {
			channel.close();
			conn.close();
		}, 500);
	}

	res.json({ success: true });	
});

app.get('/', (_, res) => {
	res.send('Hello World');
});

app.listen(PORT, async () => console.log(`Node server ready on ${PORT}`));