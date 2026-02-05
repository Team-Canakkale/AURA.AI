# 🐿️ TUSU Finance Dashboard

Modern ve premium bir finansal analiz uygulaması! TUSU (sincap maskot) ile harcamalarınızı analiz edin, tasarruf fırsatlarını keşfedin ve akıllı yatırım önerileri alın.

## ✨ Özellikler

### 📄 PDF Ekstre Yükleme
- Banka ekstresi PDF'lerini yükleyin
- Otomatik transaction çıkarma
- Akıllı kategorizasyon
- Tarih ve tutar parse etme
- Türk bankalarını destekler (Garanti, İş Bankası, Akbank, vb.)

### 💰 Harcama Analizi
- Kolay transaction ekleme formu
- Kategori bazlı harcama takibi
- Örnek veri yükleme özelliği
- Gerçek zamanlı analiz

### 📊 Akıllı Öneriler
- Aşırı harcama tespiti
- Tasarruf potansiyeli hesaplama
- Canlı döviz kuru entegrasyonu
- Yatırım önerileri (USD, Altın, Fonlar, vb.)

### 💬 TUSU AI Chat
- Google Gemini destekli sohbet
- Finansal koçluk
- Hızlı sorular
- Bağlam farkındalığı

### 🎨 Premium Tasarım
- Glassmorphism efektleri
- Smooth animasyonlar
- Responsive tasarım
- Modern gradient'ler
- Typing indicators

## 🚀 Kurulum

### 1. Environment Variables
`.env` dosyası oluşturun (`.env.example`'dan kopyalayın):

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin ve Gemini API anahtarınızı ekleyin:
```
GEMINI_API_KEY=your_actual_api_key_here
```

### 2. Dependencies Yükleme

```bash
# Frontend
cd apps/frontend
npm install

# Backend
cd ../backend-finance
npm install
```

### 3. Servisleri Başlatma

**Terminal 1 - Backend:**
```bash
cd apps/backend-finance
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/frontend
npm run dev
```

## 📱 Kullanım

### Yöntem 1: PDF Ekstre Yükleme (Önerilen)
1. **Ana Sayfa**: http://localhost:3000
2. **Finance Service** kartına tıklayın
3. **Upload Bank Statement (PDF)** bölümünden banka ekstrenizi yükleyin
4. PDF otomatik olarak parse edilecek ve transaction'lar çıkarılacak
5. **Analyze Expenses** butonuna tıklayın
6. Sonuçları görüntüleyin ve **Chat with TUSU** ile sohbet edin!

### Yöntem 2: Manuel Giriş
1. **Ana Sayfa**: http://localhost:3000
2. **Finance Service** kartına tıklayın
3. **Add Transactions** bölümünden manuel olarak harcamalarınızı ekleyin
4. Veya **Load Sample Data** ile örnek veri yükleyin
5. **Analyze Expenses** butonuna tıklayın
6. Sonuçları görüntüleyin ve **Chat with TUSU** ile sohbet edin!

## 🎯 API Endpoints

### Backend (Port 4001)

- `GET /health` - Servis durumu
- `POST /api/analyze-expenses` - Harcama analizi
- `GET /api/expense-categories` - Kategori listesi
- `POST /api/chat` - AI sohbet
- `GET /api/chat/greeting` - Karşılama mesajı

## 🏗️ Proje Yapısı

```
apps/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── FinanceDashboard.tsx
│       │   └── FinanceDashboard.css
│       ├── components/
│       │   └── finance/
│       │       ├── PdfUploader.tsx
│       │       ├── PdfUploader.css
│       │       ├── ExpenseAnalyzer.tsx
│       │       ├── ExpenseAnalyzer.css
│       │       ├── RecommendationCard.tsx
│       │       ├── RecommendationCard.css
│       │       ├── TusuChatWidget.tsx
│       │       └── TusuChatWidget.css
│       └── App.tsx
└── backend-finance/
    └── src/
        ├── controllers/
        ├── services/
        ├── types/
        └── index.ts
```

## 🎨 Tasarım Özellikleri

- **Glassmorphism**: Modern cam efekti
- **Gradient Backgrounds**: Canlı renk geçişleri
- **Smooth Animations**: Hover ve geçiş animasyonları
- **Responsive**: Mobil ve desktop uyumlu
- **Dark Theme**: Göz yormayan koyu tema

## 🔧 Teknolojiler

### Frontend
- React 18
- TypeScript
- Vite
- Axios
- PDF.js (pdfjs-dist)
- CSS3 (Glassmorphism)

### Backend
- Node.js
- Express
- TypeScript
- Google Gemini AI
- ExchangeRate API
- Supabase (optional)

## ⚠️ Notlar

- Backend'in çalışması için `GEMINI_API_KEY` gereklidir
- Supabase opsiyoneldir (şu an kullanılmıyor)
- Frontend proxy ayarları zaten yapılmış (vite.config.ts)

## 🐛 Sorun Giderme

### Backend başlamıyor
- `.env` dosyasının olduğundan emin olun
- `GEMINI_API_KEY` değerinin doğru olduğunu kontrol edin
- `npm install` komutunu çalıştırın

### Frontend hata veriyor
- `npm install` komutunu çalıştırın
- Port 3000'in boş olduğundan emin olun
- Backend'in çalıştığını kontrol edin

### Chat çalışmıyor
- Backend'in çalıştığından emin olun
- Gemini API key'in geçerli olduğunu kontrol edin
- Browser console'da hata olup olmadığına bakın

## 📝 Örnek Kullanım

1. "Load Sample Data" butonuna tıklayın
2. Örnek veriler yüklenecek (Kahve, Uber, Restaurant, vb.)
3. "Analyze Expenses" butonuna tıklayın
4. Analiz sonuçlarını görün:
   - Toplam tasarruf potansiyeli
   - Aşırı harcama kategorileri
   - Yatırım önerileri
5. "Chat with TUSU" ile sohbet başlatın

## 🎉 Özellikler

- ✅ PDF ekstre yükleme ve otomatik parse
- ✅ Modern ve premium UI/UX
- ✅ Gerçek zamanlı harcama analizi
- ✅ AI destekli finansal koçluk
- ✅ Yatırım önerileri
- ✅ Responsive tasarım
- ✅ Smooth animasyonlar
- ✅ Glassmorphism efektleri

---

**Geliştirici**: TUSU Finance Team 🐿️
**Versiyon**: 1.0.0
**Lisans**: MIT
