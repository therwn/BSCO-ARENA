# Vercel Environment Variables Kurulumu

## Sorun
Log'larda `[Supabase] Client oluşturulamadı - Memory store kullanılacak { hasUrl: false, hasKey: true }` görünüyor.

Bu, `NEXT_PUBLIC_SUPABASE_URL` environment variable'ının eksik olduğunu gösteriyor.

## Çözüm

### 1. Supabase Dashboard'dan Bilgileri Alın

1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. **Settings** → **API** sayfasına gidin
4. Şu bilgileri kopyalayın:
   - **Project URL** (örn: `https://xxxxx.supabase.co`)
   - **anon public** key (API Keys bölümünden)
   - **service_role** key (API Keys bölümünden - gizli tutun!)

### 2. Vercel Dashboard'a Environment Variables Ekleyin

1. Vercel Dashboard → Projeniz → **Settings** → **Environment Variables**
2. Şu variable'ları ekleyin:

#### Production, Preview, Development için:

**Variable 1:**
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** Supabase Project URL'iniz (örn: `https://xxxxx.supabase.co`)
- **Environment:** Production, Preview, Development (hepsini seçin)

**Variable 2:**
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** Supabase anon public key'iniz
- **Environment:** Production, Preview, Development (hepsini seçin)

**Variable 3 (Önerilen):**
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Supabase service_role key'iniz
- **Environment:** Production, Preview, Development (hepsini seçin)
- **⚠️ ÖNEMLİ:** Bu key'i gizli tutun, public repository'ye commit etmeyin!

### 3. Yeni Deploy Yapın

Environment variable'lar eklendikten sonra:
1. Vercel Dashboard → **Deployments**
2. Son deployment'ın yanındaki **...** menüsünden **Redeploy** seçin
3. Veya yeni bir commit push edin

### 4. Test Edin

Deploy tamamlandıktan sonra:
1. Test endpoint'ini açın: `https://bsco-arena.vercel.app/api/test-supabase`
2. Şunu görmelisiniz:
   ```json
   {
     "hasUrl": true,
     "hasKey": true,
     "connected": true,
     "tableExists": true
   }
   ```

3. Lobi oluşturmayı test edin
4. Supabase Dashboard → Table Editor → `lobbies` tablosunu kontrol edin
5. Yeni lobi kaydı görünmeli

## Alternatif: Vercel Marketplace Entegrasyonu

Eğer Supabase'i Vercel Marketplace'den eklediyseniz:
1. Vercel Dashboard → Projeniz → **Integrations**
2. Supabase entegrasyonunu kontrol edin
3. Eğer yoksa, **Add Integration** → **Supabase** → Projenizi seçin
4. Environment variable'lar otomatik eklenmeli

## Sorun Giderme

### Environment Variable'lar ekledim ama hala çalışmıyor
- Yeni bir deploy yaptığınızdan emin olun
- Variable'ların doğru environment'larda (Production, Preview, Development) olduğunu kontrol edin
- Variable isimlerinin tam olarak doğru olduğunu kontrol edin (büyük/küçük harf duyarlı)

### Test endpoint hala "hasUrl: false" diyor
- Vercel Dashboard'da environment variable'ları tekrar kontrol edin
- Deploy log'larında environment variable'ların yüklendiğini kontrol edin
- Variable'ların Production environment'ında olduğundan emin olun

