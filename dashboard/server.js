const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mqtt = require('mqtt');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Static files serve karo
app.use(express.static('public'));

// HiveMQ connection
const mqttClient = mqtt.connect('mqtts://8c77d38bb13146aeb2858d539a7cd2d0.s1.eu.hivemq.cloud:8883', {
  username: 'radha',
  password: 'Radha@mqtt123',
  rejectUnauthorized: false
});

mqttClient.on('connect', () => {
  console.log('MQTT connected!');
  mqttClient.subscribe('home/sensor');
  mqttClient.subscribe('home/led');
});

mqttClient.on('message', (topic, message) => {
  const data = JSON.parse(message.toString());
  console.log('Data aaya:', data);
  io.emit('sensorData', data);
});

// Browser se LED command aaye toh ESP32 ko bhejo
io.on('connection', (socket) => {
  console.log('Browser connected!');
  
  socket.on('ledControl', (command) => {
    mqttClient.publish('home/led', command);
    console.log('LED command bheja:', command);
  });
});

server.listen(3000, () => {
  console.log('Dashboard chal raha hai: http://localhost:3000');
});