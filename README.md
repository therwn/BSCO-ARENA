# BSCO Arena - 5v5 Lobi Sistemi

5v5 oyun lobisi hazırlama sistemi. Oyuncular lobi kodu ile giriş yaparak takımlara katılabilir.

## Özellikler

- Lobi kodu ile giriş
- 2 takım yapısı (her takımda 2 kaptan + 4 oyuncu)
- Takım kaptanları takım adlarını düzenleyebilir
- Oyuncular slotlara katılabilir/çıkabilir
- Dark tema tasarımı
- Framer Motion animasyonları

## Teknolojiler

- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn UI
- Framer Motion
- Zustand (State Management)
- Supabase (Database & Real-time)

## Kurulum

```bash
npm install
```

## Geliştirme

```bash
npm run dev
```

## Supabase Kurulumu

1. **Vercel Marketplace'den Supabase ekle:**
   - Vercel Dashboard → Projeniz → **Integrations** (veya **Marketplace**)
   - **Supabase**'i arayın ve **Add Integration** tıklayın
   - Yeni bir Supabase projesi oluşturun veya mevcut birini bağlayın

2. **Database Schema oluştur:**
   - Supabase Dashboard → **SQL Editor**'e gidin
   - `supabase-schema.sql` dosyasındaki SQL'i çalıştırın
   - Bu `lobbies` tablosunu oluşturacak

3. **Environment Variables:**
   - Supabase entegrasyonu eklendiğinde otomatik olarak eklenir:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (opsiyonel, admin işlemleri için)

4. **Deploy:**
   - Environment variable'lar eklendikten sonra yeni bir deploy yapın
   - Kod otomatik olarak Supabase'i kullanacak

**Not:** Environment variable'lar yoksa kod memory store kullanır (development için).

## Deploy

Proje Vercel'e deploy edilmek için hazırdır. GitHub'a push edildikten sonra Vercel otomatik olarak deploy edecektir.

