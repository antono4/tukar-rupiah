# 💱 Tukar Rupiah - Konversi Mata Uang Indonesia

Aplikasi konversi mata uang Indonesia dengan kurs real-time dari Google Finance.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Fitur

- 📊 **Kurs Real-Time** dari Google Finance
- 🔄 **Update Otomatis** setiap 5 detik
- 🌐 **14+ Mata Uang** didukung
- 📱 **Responsif** - tampil bagus di semua perangkat
- 🌙 **Dark Mode** dengan desain modern
- 📅 **Jam & Tanggal Real-Time** dengan status pasar
- 🎨 **UI/UX Modern** dan intuitif

## 💱 Mata Uang yang Didukung

| Mata Uang | Negara |
|-----------|--------|
| 🇮🇩 IDR | Indonesia |
| 🇺🇸 USD | Amerika Serikat |
| 🇪🇺 EUR | Uni Eropa |
| 🇬🇧 GBP | Inggris |
| 🇯🇵 JPY | Jepang |
| 🇸🇬 SGD | Singapura |
| 🇲🇾 MYR | Malaysia |
| 🇦🇺 AUD | Australia |
| 🇨🇳 CNY | China |
| 🇹🇭 THB | Thailand |
| 🇰🇷 KRW | Korea Selatan |
| 🇭🇰 HKD | Hong Kong |
| 🇮🇳 INR | India |
| 🇵🇭 PHP | Filipina |
| 🇻🇳 VND | Vietnam |

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js v18 atau lebih tinggi

### Instalasi

```bash
# Clone repository
git clone https://github.com/antono4/tukar-rupiah.git
cd tukar-rupiah

# Install dependencies (jika ada)
npm install

# Jalankan server
node server.js
```

### Akses
Buka browser dan kunjungi: **http://localhost:3000**

## 📁 Struktur Proyek

```
tukar-rupiah/
├── index.html      # Aplikasi web utama
├── server.js       # Node.js server (Google Finance proxy)
├── README.md       # Dokumentasi proyek
└── AGENTS.md       # Memory untuk AI agent
```

## 🔧 Konfigurasi Server

Port default: `3000`

Untuk mengubah port:
```bash
PORT=8080 node server.js
```

## 📊 Sumber Data

- **Primary**: Google Finance (server-side scraping)
- **Fallback**: ExchangeRate-API

## ⚙️ Arsitektur

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Browser   │────▶│ Node Server │────▶│  Google Finance │
│  (index.html)│◀────│  (Proxy)    │◀────│   (Scraping)    │
└─────────────┘     └──────────────┘     └─────────────────┘
                           │
                           ▼
                    ┌─────────────────┐
                    │ ExchangeRate-API│
                    │   (Fallback)    │
                    └─────────────────┘
```

## 🎯 Endpoint API

### GET /api/rates
Mengambil semua kurs mata uang.

**Response:**
```json
{
  "rates": {
    "IDR": 1,
    "USD": 17675,
    "EUR": 20497.69,
    "GBP": 23732.22,
    ...
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "Google Finance"
}
```

## 📝 Lisensi

MIT License - Dibuat dengan ❤️ untuk Indonesia

## 👨‍💻 Author

**Anton Oktavian** - [GitHub](https://github.com/antono4)

---

⭐ Jika bermanfaat, jangan lupa star repository ini!