#include <SPI.h>
#include <LoRa.h>
#include <WiFi.h>
#include <ThingSpeak.h>
#include <ArduinoJson.h>

// Credenciales WIFI
const char* SSID = " ";
const char* PASSWORD = " ";

// Configuración de ThingSpeak
unsigned long channelID = " "; 
const char* WriteAPIKey = " ";

// Pines de VSPI para LoRa SX1278
#define SCK     18
#define MISO    19
#define MOSI    23
#define SS      5
#define RST     26
#define DIO0    27

SPIClass vspi(VSPI);

WiFiClient cliente; // Cliente WiFi para ThingSpeak

// Pin del LED
#define LED_PIN 12

void setup() {
  // Iniciar comunicación serial
  Serial.begin(115200);
  while (!Serial);

  // Conectar a la red WiFi
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi conectado!");
i
  // Mostrar la dirección IP obtenida
  Serial.print("Dirección IP: ");
  Serial.println(WiFi.localIP());

  ThingSpeak.begin(cliente); // Iniciar cliente ThingSpeak

  // Iniciar la SPI para VSPI
  vspi.begin(SCK, MISO, MOSI, SS);
  
  // Configurar los pines del LoRa
  LoRa.setPins(SS, RST, DIO0);

  // Reiniciar el módulo LoRa manualmente
  pinMode(RST, OUTPUT);
  digitalWrite(RST, LOW);
  delay(100);
  digitalWrite(RST, HIGH);
  delay(100);

  // Establecer la interfaz y velocidad SPI
  LoRa.setSPI(vspi); 
  LoRa.setSPIFrequency(1E6); // Reducir la velocidad de SPI a 1 MHz

  // Iniciar LoRa en la frecuencia 433 MHz
  if (!LoRa.begin(433E6)) { // Frecuencia de 433 MHz para el módulo SX1278
    Serial.println("Error iniciando LoRa");
    while (1); // Detener el código si LoRa no se inicia
  }
  Serial.println("LoRa iniciado correctamente");

  // Configurar el pin del LED como salida
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  // Intentar recibir un paquete
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    // Leer el paquete
    String receivedText = "";
    while (LoRa.available()) {
      receivedText += (char)LoRa.read();
    }
    Serial.print("Paquete encriptado");
    Serial.print("Paquete recibido: ");
    Serial.println(receivedText);

    // Parsear el JSON recibido
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, receivedText);

    if (error) {
      Serial.print("Error al parsear JSON: ");
      Serial.println(error.c_str());
      return;
    }

    float humedad = doc["humidity"];
    float temperatura = doc["temperature"];
    float latitud = doc["latitude"];
    float longitud = doc["longitude"];

    // Mostrar los datos recibidos
    Serial.print("Humedad: ");
    Serial.println(humedad);
    Serial.print("Temperatura: ");
    Serial.println(temperatura);
    Serial.print("Latitud: ");
    Serial.println(latitud, 6);
    Serial.print("Longitud: ");
    Serial.println(longitud, 6);

    // Encender el LED cuando se reciben y envían los datos a ThingSpeak
    digitalWrite(LED_PIN, HIGH);

    // Enviar datos a ThingSpeak
    ThingSpeak.setField(1, humedad);
    ThingSpeak.setField(2, temperatura);
    ThingSpeak.setField(3, latitud);
    ThingSpeak.setField(4, longitud);

    // Escribir en ThingSpeak y verificar si la operación fue exitosa
    if (ThingSpeak.writeFields(channelID, WriteAPIKey) == 200) {
      Serial.println("Datos enviados con éxito!");
    } else {
      Serial.println("Error al enviar los datos a ThingSpeak");
    }

    // Apagar el LED después de un tiempo para indicar el éxito del envío
    delay(1000);
    digitalWrite(LED_PIN, LOW);
  }
  delay(2000); // Esperar 2 segundos antes de la siguiente lectura
}
