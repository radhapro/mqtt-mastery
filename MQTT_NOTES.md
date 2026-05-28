# MQTT Mastery — Complete Notes 📚
> Aaj ka poora kaam — revision ke liye

---

## 1. MQTT Kya Hai?

MQTT (Message Queuing Telemetry Transport) ek **lightweight messaging protocol** hai jo IoT devices ke liye bana hai.

**Simple analogy:** WhatsApp group ki tarah —
- Koi **publish** karta hai (message bhejta hai)
- Koi **subscribe** karta hai (message paata hai)
- **Broker** beech mein hota hai (WhatsApp server)

---

## 2. Aaj Ka Project — Full Flow

```
ESP32 (DHT11 + LED)
    ↓ Publish: home/sensor (temperature, humidity)
HiveMQ Cloud (MQTT Broker - 24/7 online)
    ↓ Forward to subscribers
Node.js Dashboard + React App
    ↓ Socket.io (live browser update)
Browser / Mobile App (PWA)
    ↓ Button click → Publish: home/led (ON/OFF)
HiveMQ Cloud
    ↓ Forward to ESP32
ESP32 → LED ON/OFF
```

---

## 3. Tools & Technologies Used

| Tool | Kaam |
|------|------|
| ESP32 | Hardware device — data bhejta hai |
| PlatformIO (VS Code) | ESP32 ka code likhne ke liye |
| PubSubClient Library | ESP32 mein MQTT use karne ke liye |
| ArduinoJson Library | JSON data banane ke liye |
| HiveMQ Cloud | Free cloud MQTT broker |
| Node.js + Express | Dashboard backend |
| Socket.io | Real-time browser update |
| Chart.js | Live graph |
| React + Vite | Frontend app |
| Vercel | React app deploy karne ke liye (free) |
| Git + GitHub | Code save aur share karne ke liye |

---

## 4. Important MQTT Concepts (Interview ke liye)

### Publisher
Jo device data bhejta hai. Hamare case mein **ESP32** publisher hai.
```
client.publish("home/sensor", jsonData);
```

### Subscriber
Jo device data receive karta hai. Hamare case mein **React App** subscriber hai.
```
client.subscribe("home/sensor");
```

### Broker
Beech ka server jo data forward karta hai. Humne **HiveMQ Cloud** use kiya.

### Topic
Ek address jahan data bheja/liya jaata hai. Jaise:
- `home/sensor` — sensor data ke liye
- `home/led` — LED control ke liye

### QoS (Quality of Service)
- **QoS 0** — Ek baar bhejo, guarantee nahi (fire and forget)
- **QoS 1** — Kam se kam ek baar milega
- **QoS 2** — Exactly ek baar milega (slowest but safest)

### Retained Message
Broker last message save karta hai — naya subscriber join kare toh turant data milta hai.

### LWT (Last Will Testament)
Agar device suddenly disconnect ho jaye toh broker ek pre-set message bhej deta hai — "device offline ho gaya".

### Topic Wildcards
- `+` — ek level: `home/+` → home/sensor, home/led dono match karega
- `#` — sab levels: `home/#` → home/sensor/temp, home/led/1 sab match karega

---

## 5. ESP32 Code Explained

```cpp
// WiFi se connect karo
WiFi.begin(ssid, password);

// HiveMQ se connect karo (TLS secure connection)
espClient.setInsecure();
client.setServer(mqtt_server, 8883);

// Data publish karo
client.publish("home/sensor", jsonBuffer);

// Dashboard se command receive karo
void callback(char* topic, byte* payload, unsigned int length) {
  if (message == "ON")  digitalWrite(LED_PIN, HIGH);
  if (message == "OFF") digitalWrite(LED_PIN, LOW);
}
```

**Key Points:**
- Port **8883** = MQTT with TLS (secure)
- Port **1883** = MQTT without TLS (unsecure)
- `setInsecure()` = certificate verify nahi karta (dev ke liye theek hai)

---

## 6. Node.js Dashboard Code Explained

```javascript
// HiveMQ se connect karo
const mqttClient = mqtt.connect('mqtts://...hivemq.cloud:8883', {
  username: 'radha',
  password: 'xxx'
});

// Jab data aaye — browser ko bhejo
mqttClient.on('message', (topic, message) => {
  io.emit('sensorData', JSON.parse(message));
});

// Browser se LED command aaye — ESP32 ko bhejo
socket.on('ledControl', (command) => {
  mqttClient.publish('home/led', command);
});
```

**Key Points:**
- `mqtts://` = MQTT over TLS (secure WebSocket)
- Socket.io = Node.js aur browser ke beech real-time link

---

## 7. React App Code Explained

```javascript
// Direct HiveMQ se connect karo (wss = WebSocket Secure)
const mqttClient = mqtt.connect('wss://...hivemq.cloud:8884/mqtt', options);

// Data aaye toh state update karo
mqttClient.on('message', (topic, message) => {
  const data = JSON.parse(message.toString());
  setTemp(data.temperature);
  setHum(data.humidity);
});

// LED control karo
client.publish('home/led', 'ON');
```

**Key Points:**
- Browser mein MQTT ke liye **WebSocket (wss://)** use hota hai
- Port **8884** = MQTT over WebSocket (HiveMQ)
- React state se UI automatically update hoti hai

---

## 8. PWA (Progressive Web App) Kya Hai?

PWA ek website hoti hai jo **app jaisi feel** deti hai:
- Mobile pe install ho jaati hai (Add to Home Screen)
- Offline bhi kuch features kaam karte hain
- App store ki zaroorat nahi

Humne kya kiya:
1. `manifest.json` banaya — app ka naam, icon, colors
2. `index.html` mein link add kiya
3. Vercel pe deploy kiya
4. Mobile Chrome mein "Add to Home Screen"

---

## 9. HiveMQ Cloud Details

```
URL:      8c77d38bb13146aeb2858d539a7cd2d0.s1.eu.hivemq.cloud
Port:     8883 (MQTT + TLS)
Port:     8884 (WebSocket + TLS)
Username: radha
```

---

## 10. Git Commands Used Today

```bash
# Repo clone kiya
git clone https://github.com/radhapro/mqtt-mastery.git

# Changes stage karo
git add .

# Commit karo
git commit -m "message"

# GitHub pe push karo
git push
```

---

## 11. Project Structure

```
mqtt-mastery/
├── esp32-mqtt/          # ESP32 firmware (PlatformIO)
│   ├── src/
│   │   └── main.cpp     # Main ESP32 code
│   └── platformio.ini   # Libraries config
├── dashboard/           # Node.js backend
│   ├── public/
│   │   └── index.html   # Dashboard UI
│   └── server.js        # Node.js server
├── react-app/           # React frontend (PWA)
│   ├── src/
│   │   └── App.jsx      # Main React component
│   ├── public/
│   │   └── manifest.json # PWA config
│   └── index.html
└── README.md
```

---

## 12. Interview Mein Pooche Jaane Wale Questions

**Q: MQTT aur HTTP mein kya fark hai?**
> HTTP request-response hai (ek baar poochho, ek baar jawaab). MQTT publish-subscribe hai (ek bhejo, bahut saare receive karein). MQTT IoT ke liye better hai kyunki lightweight hai.

**Q: MQTT broker kya karta hai?**
> Broker publishers aur subscribers ke beech message forward karta hai. Humne HiveMQ Cloud use kiya.

**Q: QoS 0, 1, 2 mein kya fark hai?**
> 0 = no guarantee, 1 = at least once, 2 = exactly once. Higher QoS = zyada reliable but slow.

**Q: Retained message kya hai?**
> Broker last message save karta hai us topic ka. Naya subscriber join kare toh turant latest data milta hai.

**Q: LWT kya hai?**
> Last Will Testament — device disconnect hone par broker ek pre-defined message publish karta hai.

**Q: MQTT WebSocket se alag kaise hai?**
> MQTT ek protocol hai, WebSocket ek transport layer. Browser mein MQTT run karne ke liye WebSocket ke upar MQTT use karte hain (wss:cd C:\Users\USER\Desktop\mqtt-mastery//).

---

*Banaya: 28 May 2026 | Project: mqtt-mastery*
