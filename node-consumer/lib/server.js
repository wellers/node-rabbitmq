// @ts-check
'use strict';

const express = require('express');
const amqplib = require('amqplib');

const PORT = 4000;

const amqp_url = process.env.CLOUDAMQP_URL || 'amqp://192.168.50.101:5672';

const queue = 'test_queue';

async function boot() {	
	const app = express();	

	app.get('/status', (_, res) => res.json({ start: Date.now() }));
	
	app.listen(PORT, async () => console.log(`Node server ready on ${PORT}`));

	console.log('Waiting for messages...');

	const connection = await amqplib.connect(amqp_url, "heartbeat=60");	

	const channel = await connection.createChannel();	
	await channel.assertQueue(queue, { durable: true });
	await channel.consume(queue, async (message) => {
		if (message !== null) {
			console.log(`Message received: ${message.content.toString()}`);
			channel.ack(message);				
		}
	});
}
boot();