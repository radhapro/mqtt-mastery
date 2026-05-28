 import { useEffect, useState } from "react";
import mqtt from "mqtt";

const MQTT_URL = "wss://8c77d38bb13146aeb2858d539a7cd2d0.s1.eu.hivemq.cloud:8884/mqtt";
const MQTT_OPTIONS = {
  username: "radha",
  password: "Radha@mqtt123",
  reconnectPeriod: 1000,
};

export default function App() {
  const [temp, setTemp] = useState(null);
  const [hum, setHum] = useState(null);
  const [ledStatus, setLedStatus] = useState("OFF");
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("--");
  const [alert, setAlert] = useState(false);

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
      setLastUpdate(new Date().toLocaleTimeString());
      setAlert(data.temperature > 35);
    });
    mqttClient.on("disconnect", () => setConnected(false));
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
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", fontFamily: "Arial", padding: "16px", maxWidth: "480px", margin: "0 auto" }}>
      
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1 style={{ color: "#38bdf8", fontSize: "22px", marginBottom: "8px" }}>🌡️ ESP32 Dashboard</h1>
        <span style={{ background: connected ? "#166534" : "#7f1d1d", padding: "4px 14px", borderRadius: "20px", fontSize: "12px" }}>
          {connected ? "🟢 Connected" : "🔴 Disconnected"}
        </span>
      </div>

      {/* Alert */}
      {alert && (
        <div style={{ background: "#7f1d1d", border: "1px solid #ef4444", borderRadius: "12px", padding: "12px", textAlign: "center", marginBottom: "16px", fontSize: "14px" }}>
          ⚠️ High Temperature Alert! {temp}°C
        </div>
      )}

      {/* Sensor Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <div style={{ background: "#1e293b", borderRadius: "16px", padding: "20px", textAlign: "center", border: alert ? "1px solid #ef4444" : "1px solid #334155" }}>
          <div style={{ fontSize: "32px", marginBottom: "4px" }}>🌡️</div>
          <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "6px" }}>Temperature</p>
          <p style={{ color: alert ? "#ef4444" : "#f97316", fontSize: "36px", fontWeight: "bold" }}>
            {temp ?? "--"}°C
          </p>
        </div>
        <div style={{ background: "#1e293b", borderRadius: "16px", padding: "20px", textAlign: "center", border: "1px solid #334155" }}>
          <div style={{ fontSize: "32px", marginBottom: "4px" }}>💧</div>
          <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "6px" }}>Humidity</p>
          <p style={{ color: "#38bdf8", fontSize: "36px", fontWeight: "bold" }}>
            {hum ?? "--"}%
          </p>
        </div>
      </div>

      {/* LED Control */}
      <div style={{ background: "#1e293b", borderRadius: "16px", padding: "20px", marginBottom: "16px", border: "1px solid #334155" }}>
        <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "16px", textAlign: "center" }}>💡 LED Control</p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => ledControl("ON")} style={{ flex: 1, padding: "14px", background: ledStatus === "ON" ? "#16a34a" : "#166534", color: "white", border: "none", borderRadius: "12px", fontSize: "16px", cursor: "pointer", fontWeight: "bold" }}>
            ON
          </button>
          <button onClick={() => ledControl("OFF")} style={{ flex: 1, padding: "14px", background: ledStatus === "OFF" ? "#dc2626" : "#7f1d1d", color: "white", border: "none", borderRadius: "12px", fontSize: "16px", cursor: "pointer", fontWeight: "bold" }}>
            OFF
          </button>
        </div>
        <p style={{ textAlign: "center", marginTop: "12px", fontSize: "13px", color: "#94a3b8" }}>
          Status: <span style={{ color: ledStatus === "ON" ? "#4ade80" : "#f87171" }}>● LED {ledStatus}</span>
        </p>
      </div>

      {/* Last Update */}
      <p style={{ textAlign: "center", color: "#475569", fontSize: "12px" }}>
        Last updated: {lastUpdate}
      </p>
    </div>
  );
}