// @ts-check
'use strict';

const express = require('express');
const amqplib = require('amqplib');

const PORT = 80;

const app = express();

const amqp_url = process.env.CLOUDAMQP_URL || 'amqp://192.168.50.101:5672';

const queue = 'test_queue';
const exchange = 'test_exchange';	
const route = 'test_route';

app.get('/produce', async ({ query }, res) => {	
	const { message } = query;

	if (!message) {
		res.json({ success: false, message: 'message is required.' });
		return;
	}	

	if (typeof message !== "string") {
		res.json({ success: false, message: 'message must be a String.' });
		return;
	}
	
	const connection = await amqplib.connect(amqp_url, "heartbeat=60");

	const channel = await connection.createChannel();		
	await channel.assertExchange(exchange, 'direct', { durable: true });
	await channel.assertQueue(queue, { durable: true });
	await channel.bindQueue(queue, exchange, route);

	channel.publish(exchange, route, Buffer.from(message));

	setTimeout(() => {
		channel.close();
		connection.close();
	}, 500);

	res.json({ success: true, message: 'Message queued.' });	
});

app.get('/status', (_, res) => {
	return res.json({
		start: Date.now()
	});
});

app.listen(PORT, async () => console.log(`Node server ready on ${PORT}`));