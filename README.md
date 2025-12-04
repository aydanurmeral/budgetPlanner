# Kişisel Finans Takip Uygulaması

Vue.js, Tailwind CSS, Node.js (Express.js) ve MySQL kullanılarak geliştirilmiş kapsamlı kişisel finans takip uygulaması.

## Özellikler

###  Kullanıcı Sistemi
- Kullanıcı kayıt ve giriş sistemi (JWT)
- Güvenli şifre hashleme (bcrypt)
- Her kullanıcının kendi verileri

###  İşlem Yönetimi
- Gelir ve gider kayıtları
- Kategorilere göre harcama takibi
- Arama ve filtreleme
- Tarih bazlı filtreleme

###  Dashboard ve Analiz
- Özet görünüm (Gelir, Gider, Bakiye)
- Aylık trend grafikleri (Line Chart)
- Kategori dağılım grafikleri (Pie Chart)
- Tarih aralığına göre filtreleme

###  Kullanıcı Deneyimi
- Modern ve responsive tasarım
- Dark mode desteği
- Kullanıcı dostu arayüz

## Teknolojiler

- **Frontend**: Vue.js 3, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Veritabanı**: MySQL

## Kurulum

### Backend Kurulumu

```bash
cd backend
npm install
```

MySQL veritabanını oluşturun ve `backend/.env` dosyasını oluşturun:

```bash
cp backend/.env.example backend/.env
```

Ardından `backend/.env` dosyasını düzenleyin ve kendi veritabanı bilgilerinizi girin.

`JWT_SECRET` için güçlü bir rastgele string kullanın (production ortamında).

Veritabanı şemasını oluşturun:
```bash
mysql -u root -p < database/schema.sql
```

Backend'i başlatın:
```bash
npm start
```

### Frontend Kurulumu

```bash
cd frontend
npm install
npm run dev
```

## Kullanım

1. Backend'i `http://localhost:3000` adresinde çalıştırın
2. Frontend'i `http://localhost:5173` adresinde çalıştırın
3. Tarayıcıda uygulamayı açın

## Proje Yapısı

```
finans/
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── categories.js
│   │   └── transactions.js
│   ├── middleware/
│   │   └── auth.js
│   ├── database/
│   │   ├── db.js
│   │   ├── schema.sql
│   │   └── migration.sql
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LineChart.vue
│   │   │   └── PieChart.vue
│   │   ├── views/
│   │   │   ├── Dashboard.vue
│   │   │   ├── Transactions.vue
│   │   │   ├── Categories.vue
│   │   │   ├── Login.vue
│   │   │   └── Register.vue
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```


