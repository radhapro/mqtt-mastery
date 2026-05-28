import 'package:flutter/material.dart';
import 'package:mqtt_client/mqtt_client.dart';
import 'package:mqtt_client/mqtt_server_client.dart';
import 'dart:convert';
import 'dart:io';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ESP32 Monitor',
      theme: ThemeData.dark(),
      home: const MqttScreen(),
    );
  }
}

class MqttScreen extends StatefulWidget {
  const MqttScreen({super.key});
  @override
  State<MqttScreen> createState() => _MqttScreenState();
}

class _MqttScreenState extends State<MqttScreen> {
  String temperature = '--';
  String humidity = '--';
  String status = 'Connecting...';
  MqttServerClient? client;

  @override
  void initState() {
    super.initState();
    connectMqtt();
  }

  Future<void> connectMqtt() async {
    final client = MqttServerClient.withPort(
      '8c77d38bb13146aeb2858d539a7cd2d0.s1.eu.hivemq.cloud',
      'flutter_client_${DateTime.now().millisecondsSinceEpoch}',
      8883,
    );

    client.secure = true;
    client.logging(on: false);
    client.keepAlivePeriod = 30;
    client.onDisconnected = () => setState(() => status = '🔴 Disconnected');

    final SecurityContext context = SecurityContext.defaultContext;
    client.securityContext = context;

    final connMessage = MqttConnectMessage()
        .withClientIdentifier('flutter_client_${DateTime.now().millisecondsSinceEpoch}')
        .authenticateAs('radha', 'Radha@mqtt123')
        .startClean();

    client.connectionMessage = connMessage;

    try {
      await client.connect();
      this.client = client;
      setState(() => status = '🟢 Connected');

      client.subscribe('home/sensor', MqttQos.atLeastOnce);

      client.updates!.listen((messages) {
        final message = messages[0].payload as MqttPublishMessage;
        final payload = MqttPublishPayload.bytesToStringAsString(
            message.payload.message);

        final doc = jsonDecode(payload);
        setState(() {
          temperature = doc['temperature'].toStringAsFixed(1);
          humidity = doc['humidity'].toStringAsFixed(1);
        });
      });
    } catch (e) {
      setState(() => status = '🔴 Error: $e');
    }
  }

  void publishMessage(String topic, String message) {
    if (client == null) return;
    final builder = MqttClientPayloadBuilder();
    builder.addString(message);
    client!.publishMessage(topic, MqttQos.atLeastOnce, builder.payload!);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('🌿 ESP32 Monitor',
                style: TextStyle(fontSize: 28, color: Colors.white, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(status, style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 32),
            _card('🌡️ Temperature', '$temperature°C'),
            const SizedBox(height: 16),
            _card('💧 Humidity', '$humidity%'),
            const SizedBox(height: 32),
            const Text('💡 LED Control',
                style: TextStyle(color: Colors.grey, fontSize: 16)),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  ),
                  onPressed: () => publishMessage('home/led', 'ON'),
                  child: const Text('ON', style: TextStyle(fontSize: 18)),
                ),
                const SizedBox(width: 24),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  ),
                  onPressed: () => publishMessage('home/led', 'OFF'),
                  child: const Text('OFF', style: TextStyle(fontSize: 18)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _card(String label, String value) {
    return Container(
      width: 280,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 16)),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(
              color: Color(0xFF38BDF8), fontSize: 48, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}