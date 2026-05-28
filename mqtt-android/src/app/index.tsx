 import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import mqtt from 'mqtt';

export default function Index() {
  const [temperature, setTemperature] = useState('--');
  const [humidity, setHumidity] = useState('--');
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    const client = mqtt.connect('wss://8c77d38bb13146aeb2858d539a7cd2d0.s1.eu.hivemq.cloud:8884/mqtt', {
      username: 'radha',
      password: 'Radha@mqtt123', // 👈 yahan apna password dalo
    });

    client.on('connect', () => {
      setStatus('🟢 Connected');
      client.subscribe('esp32/dht11');
    });

    client.on('message', (topic, message) => {
      const data = JSON.parse(message.toString());
      setTemperature(data.temperature);
      setHumidity(data.humidity);
    });

    client.on('error', () => setStatus('🔴 Error'));

    return () => { client.end(); };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>🌿 ESP32 Monitor</Text>
      <Text style={styles.status}>{status}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>🌡️ Temperature</Text>
        <Text style={styles.value}>{temperature}°C</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>💧 Humidity</Text>
        <Text style={styles.value}>{humidity}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, color: '#fff', fontWeight: 'bold', marginBottom: 8 },
  status: { fontSize: 14, color: '#94a3b8', marginBottom: 32 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 24, width: '80%', marginBottom: 16, alignItems: 'center' },
  label: { fontSize: 16, color: '#94a3b8', marginBottom: 8 },
  value: { fontSize: 48, color: '#38bdf8', fontWeight: 'bold' },
});