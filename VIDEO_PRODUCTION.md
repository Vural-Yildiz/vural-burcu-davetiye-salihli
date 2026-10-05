# Davetiye filmi

`assets/intro.mp4`: 22 saniye, 720×1280, 25 fps, H.264/yuv420p, AAC stereo, faststart; yaklaşık 4,6 MB. `intro-config.js` bu filmi etkinleştirir.

İlk 9 saniye HeyGen'den alınan, görsel olarak incelenmiş taş kapı çekimidir. Zarf ve kart bölümü sabit BV yazısı, menteşeli kapak, ayrılan mühür ve yükselen kartla kod üzerinden çizilmiştir. Bu bölüm stilize bir yorumdur; referans fotoğrafların birebir fotogerçekçi yeniden üretimi değildir. Kapıdaki üretilmiş süsleme de onaylı BV logosunun birebir kopyası değildir. Son kare mevcut `assets/scene-10.webp` görseline geçer. Ses, özgün hafif ambient tonlar ve hareketlere zamanlanmış efektlerden oluşur.

## Ziyaretçi akışı

Video otomatik ve sessiz başlar; kullanıcı sesi açabilir. Film bitince gerçek HTML “Daveti Aç” düğmesi mevcut `invitation-final.png` davetiyesini açar. Otomatik oynatma engellenirse devam düğmesi gösterilir. Video hatasında mevcut 10 fotoğraflı yedek akış çalışır. Açılışı geçme, tekrar izleme ve hareket azaltma tercihleri desteklenir.

## Doğrulama

- FFmpeg tüm video ve sesi hata vermeden çözümler; süre ve kodekler doğrulandı.
- Son kare, onaylı son görselle karşılaştırıldı; küçük H.264 sıkıştırma farkları dışında eşleşir.
- `node tests/intro-state.cjs`: yedi akış kontrolü geçti.
- `node --check app.js` ve `git diff --check` geçti.
- Gerçek Safari/Android cihaz testi yapılmadı. Bu ortamda Chromium kurulumu başarısız olduğu için `tests/intro.spec.cjs` tarayıcı testleri çalıştırılamadı.

## Yeniden üretim

Kaynak kapı MP4'ünü HeyGen projesinden dışa aktarın. `tools/film/README.md` komutları, son kapı karesinden eşleşen zarf arka planını ve tek teslim videosunu üretir. Kaynak kapı dosyası repoya ayrıca eklenmemiştir; tamamlanmış video repodadır.
