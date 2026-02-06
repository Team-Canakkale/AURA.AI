# 🛠️ "Failed to create task" Hatası ve Çözüm Adımları

Şu anda karşılaştığınız hata, Backend'de "Demo Modu"nu kaldırdığımız için yetkilendirme (Auth) eksikliğinden kaynaklanacaktır (401 Unauthorized) veya RLS politikaları nedeniyle Anonim erişime izin verilmemesindendir.

Sistemi canlı ve güvenli bir şekilde çalıştırmak için aşağıdaki adımları uygulamanız gerekir:

## 1. Supabase Ayarları (RLS)

Eğer veritabanı tablolarınızda RLS (Row Level Security) aktifse, anonim istekler reddedilir. Gerçek Auth sistemine geçene kadar **geçici olarak** RLS'i devre dışı bırakabilir veya politika ekleyebilirsiniz (Önerilmez, 2. adıma geçin).

```sql
-- RLS'i tamamen kapatmak için (Sadece test için):
alter table tasks disable row level security;
```

## 2. Frontend Login Entegrasyonu (Kesin Çözüm)

Uygulamanın çalışması için kullanıcının gerçekten giriş yapması ve bir **Access Token** alması gerekir.

### A. Login Sayfası Oluşturun
`apps/frontend/src/pages/Login.tsx` dosyası oluşturun ve `supabase.auth.signInWithPassword` fonksiyonunu kullanarak giriş yapın.

### B. Oturumu Saklayın
Başarılı girişten sonra gelen `session.access_token` değerini `localStorage` veya `cookie` içerisine kaydedin.

### C. API İsteklerine Token Ekleyin
Frontend'deki `taskApi` (eski adıyla `habitApi`) istek yaparken Header'a bu token'ı eklemelidir:

```typescript
// api/habit.ts içinde örnek güncelleme:
const getHeaders = () => {
  const token = localStorage.getItem('sb-access-token'); // Veya cookie
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// İsteklerde kullanımı:
fetch(`${API_BASE_URL}/tasks`, {
  method: 'GET',
  headers: getHeaders()
});
```

## 3. Backend Doğrulama

Biz zaten `middleware/auth.ts` dosyasında şu mantığı kurduk:
1. Header'dan `Authorization: Bearer <token>` okunur.
2. `supabase.auth.getUser(token)` ile Supabase'den kullanıcı doğrulanır.
3. Geçerli ise işlem yapılır.

Bu yapı hazırdır. Sadece Frontend'den geçerli bir token gelmesi gerekmektedir.

## Özet
Mock (Demo) modu kaldırıldığı için, uygulamanız artık **gerçek kimlik doğrulama** beklemektedir. Frontend tarafına Login/Signup akışını ekleyerek bu hatayı kalıcı olarak çözebilirsiniz.
