#include <SPI.h>
#include <LoRa.h>
#include <DHT.h>
#include <Wire.h>
#include <TinyGPS++.h>

#define DHTPIN 4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

// Pines de VSPI
#define SCK     18
#define MISO    19
#define MOSI    23
#define SS      5
#define RST     26
#define DIO0    27

SPIClass vspi(VSPI);

// Pines del GPS
#define RXD2 16
#define TXD2 17

HardwareSerial neogps(1);
TinyGPSPlus gps;

// Pin del LED
#define LED_PIN 12

void setup() {
  Serial.begin(115200);
  while (!Serial);

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

  // Iniciar LoRa
  if (!LoRa.begin(433E6)) { // Frecuencia de 915 MHz para México
    Serial.println("Error iniciando LoRa");
    while (1);
  }
  Serial.println("LoRa iniciado correctamente");

  // Iniciar DHT
  dht.begin();

  // Iniciar GPS
  neogps.begin(9600, SERIAL_8N1, RXD2, TXD2);
  Serial.println("GPS iniciado correctamente");

  // Configurar el pin del LED como salida
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  // Leer datos del DHT
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("Error leyendo del sensor DHT");
    return;
  }

  // Leer datos del GPS
  while (neogps.available() > 0) {
    gps.encode(neogps.read());
  }

  float latitude = 0.0;
  float longitude = 0.0;

  if (gps.location.isValid()) {
    latitude = gps.location.lat();
    longitude = gps.location.lng();
  } else {
    Serial.println("Sin señal GPS");
  }

  // Mostrar datos en Serial
  Serial.print("Humedad: ");
  Serial.print(h);
  Serial.print("%  Temperatura: ");
  Serial.print(t);
  Serial.println("°C");

  Serial.print("Lat: ");
  Serial.println(latitude, 6);
  Serial.print("Lng: ");
  Serial.println(longitude, 6);

  // Enciende el LED antes de enviar los datos
  digitalWrite(LED_PIN, HIGH);

  // Enviar datos por LoRa en formato JSON
  LoRa.beginPacket();
  LoRa.print("{\"humidity\":");
  LoRa.print(h);
  LoRa.print(",\"temperature\":");
  LoRa.print(t);
  LoRa.print(",\"latitude\":");
  LoRa.print(latitude, 6);
  LoRa.print(",\"longitude\":");
  LoRa.print(longitude, 6);
  LoRa.println("}");
  LoRa.endPacket();

  // Apaga el LED después de enviar los datos
  digitalWrite(LED_PIN, LOW);

  delay(2000); // Enviar cada 2 segundos
}
