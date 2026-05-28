import { useEffect, useState } from "react";
import mqtt from "mqtt";
const MQTT_URL = "wss://8c77d38bb13146aeb2858d539a7cd2d0.s1.eu.hivemq.cloud:8884/mqtt";
const MQTT_OPTIONS = {
  username: "radha",
  password: "Radha@mqtt123",
  reconnectPeriod: 1000,
};

export default function App() {
  const [temp, setTemp] = useState("--");
  const [hum, setHum] = useState("--");
  const [ledStatus, setLedStatus] = useState("--");
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const mqttClient = mqtt.connect(MQTT_URL, MQTT_OPTIONS);

    mqttClient.on("connect", () => {
      setConnected(true);
      mqttClient.subscribe("home/sensor");
    });

    mqttClient.on("message", (topic, message) => {
      const data = JSON.parse(message.toString());
      setTemp(data.temperature.toFixed(1));
      setHum(data.humidity.toFixed(1));
    });

    setClient(mqttClient);
    return () => mqttClient.end();
  }, []);

  const ledControl = (command) => {
    if (client) {
      client.publish("home/led", command);
      setLedStatus(command);
    }
  };

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", padding: "20px", fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center", color: "#38bdf8", marginBottom: "30px" }}>
        🌡️ ESP32 React Dashboard
      </h1>

      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <span style={{ background: connected ? "#22c55e" : "#ef4444", padding: "4px 12px", borderRadius: "20px", fontSize: "13px" }}>
          {connected ? "🟢 Connected" : "🔴 Disconnected"}
        </span>
      </div>

      <div style={{ display: "flex", gap: "20px", justifyContent: "center", margin: "30px 0" }}>
        <div style={{ background: "#1e293b", borderRadius: "16px", padding: "30px 50px", textAlign: "center" }}>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>Temperature</p>
          <p style={{ color: "#f97316", fontSize: "48px", fontWeight: "bold" }}>{temp}°C</p>
        </div>
        <div style={{ background: "#1e293b", borderRadius: "16px", padding: "30px 50px", textAlign: "center" }}>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>Humidity</p>
          <p style={{ color: "#38bdf8", fontSize: "48px", fontWeight: "bold" }}>{hum}%</p>
        </div>
      </div>

      <div style={{ background: "#1e293b", borderRadius: "16px", padding: "30px", textAlign: "center", maxWidth: "400px", margin: "0 auto" }}>
        <h2 style={{ color: "#94a3b8", marginBottom: "20px" }}>💡 LED Control</h2>
        <button onClick={() => ledControl("ON")}
          style={{ padding: "14px 40px", background: "#22c55e", color: "white", border: "none", borderRadius: "10px", fontSize: "18px", cursor: "pointer", margin: "0 10px", fontWeight: "bold" }}>
          ON
        </button>
        <button onClick={() => ledControl("OFF")}
          style={{ padding: "14px 40px", background: "#ef4444", color: "white", border: "none", borderRadius: "10px", fontSize: "18px", cursor: "pointer", margin: "0 10px", fontWeight: "bold" }}>
          OFF
        </button>
        <p style={{ color: "#94a3b8", marginTop: "15px" }}>Status: LED {ledStatus}</p>
      </div>
    </div>
  );
}