🐿️ Yapay Zeka Destekli Finansal Asistan"Akıllı Harca, Akıllı Yatır." 

Gençlerin tüketim alışkanlıklarını analiz ederek gereksiz harcamaları tespit eden, bu tasarrufları anlık piyasa verileriyle eşleştirerek yatırıma dönüştürmeyi öneren ve kullanıcıyla bir finansal koç gibi sohbet eden yapay zeka tabanlı bir asistandır.📋 Proje ÖzetiBu proje, Team-Canakkale/AURA.AI reposu altında geliştirilen bir Backend MVP (Minimum Viable Product) çalışmasıdır. Sistem, kullanıcının harcama verilerini işler ve gerçek zamanlı döviz kurları ile yapay zeka (Google Gemini) yeteneklerini birleştirerek kişiselleştirilmiş finansal tavsiyeler üretir.

🏗️ Teknik MimariProje Node.js ve TypeScript kullanılarak, modüler bir servis mimarisiyle geliştirilmiştir. 3 temel katmandan oluşur:

1. 📊 Harcama Analiz Servisi (ExpenseAnalysisService)Kullanıcının banka hareketlerini (ekstre) tarar ve kullanıcının harcama alışkanlıklarını öğrenir.Anomali Tespiti: Bir kategorideki harcama, kullanıcının o kategorideki aylık ortalamasını %20'den fazla aşarsa, bunu "Aşırı Tüketim" olarak işaretler.Tasarruf Potansiyeli: Gereksiz harcanan tutarı hesaplar (Örn: "Kahve için fazladan 3000 TL harcadın").

2. 📈 Hibrit Öneri Motoru (RecommendationService)Tasarruf edilen paranın nasıl değerlendirileceğini belirler. Hibrit Veri Modeli kullanır:Canlı Veri (Real-time): ExchangeRate-API üzerinden anlık USD/TRY kurunu çeker. Kullanıcıya dolar önerisi yaparken gerçek piyasa fiyatını kullanır.Simülasyon Veri (Mock): Fonlar, Altın ve Sürdürülebilir Enerji gibi varlıklar için (MVP aşamasında) simüle edilmiş trend verileri kullanır.Akıllı Eşleştirme: Mevcut piyasa koşullarında en yüksek getiri potansiyeli olan varlığı seçer ve kullanıcıya önerir.

3. 🤖 AI Chatbot Katmanı (ChatService)Kullanıcı ile etkileşime giren konuşma arayüzüdür.Google Gemini Entegrasyonu: Google'ın Gemini modeli kullanılarak doğal dil işleme sağlanır.Persona: "TUSU" isimli sevimli sincap maskot karakterine bürünerek finansal okuryazarlığı eğlenceli hale getirir.Bağlam (Context) Yönetimi: Chatbot, sadece "merhaba" demez; kullanıcının o anki harcama analizini ve önerilen yatırımı bilerek cevap verir.🚀 Kurulum ve ÇalıştırmaGeliştirme ortamını kurmak için aşağıdaki adımları izleyin:GereksinimlerNode.js (v18+)Google Gemini API AnahtarıAdım 1: Repoyu KlonlayınBashgit clone https://github.com/Team-Canakkale/AURA.AI.git
cd AURA.AI
git checkout feature/tusu-mvp
Adım 2: Bağımlılıkları YükleyinBashnpm install
Adım 3: Ortam Değişkenlerini AyarlayınAna dizinde .env dosyası oluşturun ve API anahtarınızı ekleyin:Kod snippet'iGEMINI_API_KEY=AIzaSy... (Senin API Anahtarın)
Adım 4: Sunucuyu BaşlatınBashnpm run dev
Sunucu varsayılan olarak http://localhost:4001 adresinde çalışacaktır.🔌 API Dokümantasyonu1. Harcama Analizi ve Öneri (POST /api/tusu/analyze)Kullanıcının harcama listesini alır, analizi ve yatırım önerisini döndürür.İstek (Request):JSON{
  "transactions": [
    { "date": "2025-02-05", "category": "Dining", "amount": 5000, "currency": "TRY" },
    { "date": "2025-02-01", "category": "Dining", "amount": 200, "currency": "TRY" }
  ]
}
Cevap (Response):JSON{
  "anomaly": {
    "category": "Dining",
    "excessAmount": 4800,
    "average": 200
  },
  "recommendation": {
    "asset": "USD/TRY",
    "currentRate": 30.55,  // Canlı API'den çekilen gerçek veri
    "trend": "+0.5%",
    "message": "Yemek harcamandan artırdığın 4800 TL ile yaklaşık 157 Dolar alabilirsin."
  }
}
2. AI Sohbet (POST /chat)Kullanıcının TUSU ile konuşmasını sağlar.İstek (Request):JSON{
  "userMessage": "Dolar şu an mantıklı mı Tusu?",
  "contextData": { ...analiz verisi... }
}
Cevap (Response):JSON{
  "reply": "Merhaba! 🐿️ Dolar kuru şu an 30.55 seviyesinde. Portföyünü çeşitlendirmek için güzel bir seçenek olabilir ama tüm cevizlerini tek sepete koymamalısın!"
}
🛠️ Kullanılan TeknolojilerTeknolojiAmaçTypeScriptTip güvenli backend geliştirmeNode.js & ExpressSunucu ve API yönetimiGoogle Gemini APIAI Chatbot ve Persona yönetimiExchangeRate-APICanlı döviz kuru verileri (Dış Servis)Axios / FetchHTTP istekleri🔮 Gelecek Planları (Roadmap)[ ] Altın ve Borsa verileri için canlı API entegrasyonu (Finnet/Yahoo Finance).[ ] Kullanıcıların geçmiş analizlerini saklamak için veritabanı (PostgreSQL/Supabase) bağlantısı.[ ] PDF ekstrelerini (OCR) otomatik okuma modülü.