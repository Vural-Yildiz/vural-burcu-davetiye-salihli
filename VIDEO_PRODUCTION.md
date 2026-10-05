# Davetiye filmi — üretim ve teslim

## Durum
Film HeyGen Video Agent'ta üretime gönderildi: https://app.heygen.com/video-agent/3a97b3a31df14b8d9b5a6e69be7240ff . Henüz tamamlanmış MP4 alınmadı veya görsel kontrol yapılmadı. Bu dal video oynatıcısını ve görsel yedek akışı hazırlar. Film gözden geçirilene kadar src boş kalır.

## Akış
Giriş otomatik başlar; video sessiz oynar, kullanıcı isterse sesi açar. Film bitince scene-10 sabit son ekranı ve gerçek HTML düğmesi gösterilir. Daveti Aç yalnızca ana davetiyeyi açar. Açılışı Geç her zaman kullanılabilir. Hareket azaltma tercihi olan ziyaretçi doğrudan son ekrana ulaşır. Dosya yüklenemezse mevcut fotoğraflar kullanılır. Ana görsel invitation-final.png korunur.

## Film tasarımı (yaklaşık 22 saniye, dikey 9:16)

| Süre | Kaynak sahne | Hareket |
| --- | --- | --- |
| 0–2 | 01 | Karanlık kapı, çok yavaş yaklaşma, ince sis |
| 2–4 | 02 | Orta çizgiden dallara yayılan altın ışık |
| 4–6 | 03 | BV çizgilerinin aydınlanması, kısa duraklama |
| 6–8 | 04 | Kilidin çözülmesi, kontrollü toz, kanatların ayrılması |
| 8–11 | 05 | Ağır kanatların açılması, eşikten gün batımına geçiş |
| 11–13 | 06 | Zarfın ışığın içinden gelmesi |
| 13–15 | 07 | Mühür yakın planı, yüzeyde tek bir ışık geçişi |
| 15–17 | 08 | Mührün ayrılması, kapağın açılması |
| 17–20 | 09 | Kartın yükselmesi, manzara çizimine yaklaşma |
| 20–22 | 10 | Gün batımı manzarasına geçiş ve durulma |

Fotoğraflarda kapı, monogram ve mühür biçimleri farklı. Hepsini aynı nesnenin ardışık kareleri gibi zorlamak yerine kapı açılışı, zarf ve finali ayrı çekimler olarak üretip ışık geçişleriyle birleştirin. 07'de V harfi W'ye benziyor; mührün BV kimliğini üretimden önce doğrulayın. Gerçek düğme videoya gömülmez.

## Üretim komutları

### Kapı — 01/03/05 görsel referansları
Vertical cinematic wedding invitation opening. Begin on the provided dark stone doorway. Very slow forward dolly, stable symmetrical composition. A thin warm gold seam gradually illuminates the carved olive branches and the precise BV monogram. The door retains one consistent shape and material throughout. Two massive hinged stone leaves slowly swing inward with believable weight, revealing the warm sunset valley and ancient columns from the landscape reference. Camera glides across the threshold. Subtle ground mist and sparse gold dust. Deep stone friction, gentle low resonance, no voices. Elegant, warm, ceremonial. No lightning bolts, exploding rocks, dissolving architecture, letter mutations, extra text, camera shake, or fast cuts.

### Zarf — 06/08/09 görsel referansları
Continue the golden sunset atmosphere. The provided black envelope with metallic olive branches gently emerges from the light and approaches the lens. Preserve the envelope's rectangular geometry and exact BV emblem. Close-up on the gold seal: one fine crack, a restrained shimmer, then the seal lifts away and the hinged paper flap opens naturally. The ivory illustrated invitation card rises smoothly from inside the envelope. Preserve card shape, olive ornament, and landscape illustration. Slow cinematic macro camera with shallow depth of field; sparse floating gold dust. Soft paper movement and delicate metal chime. No talking, confetti, explosions, warped paper, changing letters, or new text.

### Final — 09/10 görsel referansları
Move smoothly toward the landscape illustration on the ivory invitation card. Transition through a brief warm light veil into the matching sunset valley with ancient columns, distant mountains and olive branches framing the vertical composition. Motion decelerates into a steady elegant view. No new text or buttons. Leave the frame calm for a seamless handoff to the approved scene-10 still and its HTML button.

## Teslim
1. BV ve tüm yazıları görüntü karelerinde doğrulayın; mümkünse metni ayrı sabit katman olarak kompozitleyin.
2. Çekimleri tek MP4 olarak birleştirin; tekrarlanan başlangıç/bitiş beklemelerini kesin.
3. 1080×1920 master tutun; web için 720×1280, H.264, yuv420p, faststart ve AAC ses hazırlayın. Mobil indirme için yaklaşık 10 MB hedefi kaliteyi görsel kontrol ederek değerlendirin.
4. Filmi assets/intro.mp4 olarak ekleyin, intro-config.js içindeki src değerini bu yola ayarlayın.
5. Son kare ile scene-10 arasında sıçrama olmadığını, iPhone/Safari ve Android'de ilk açılışı, sesi, ekran yönünü ve yeniden izlemeyi gerçek cihazda doğrulayın. Sonrasında PR birleştirilmeye hazırdır.

## Doğrulama durumu

`node tests/intro-state.cjs`: 7 kontrol geçti (yedek akış, video bitişi, oynatma engeli, hata, azaltılmış hareket, sekme görünürlüğü ve ses). JavaScript sözdizimi ve git diff kontrolleri geçti. Bunlar DOM/media taklitleriyle durum kontrolleridir; gerçek tarayıcı oynatımını kanıtlamaz. Playwright tarayıcı testi hazırlandı ancak Chromium indirmesi ağda bozuk/aracılı yanıt döndüğü için çalıştırılamadı. Mobil/masaüstü görsel kontrol ve gerçek cihaz doğrulaması bekliyor.

## Yerel doğrulama
Playwright ve Chromium bulunan ortamda önce `python -m http.server 8765 --bind 127.0.0.1`, ardından `node tests/intro.spec.cjs` çalıştırın. Testler FFmpeg ile geçici siyah bir test videosu üretir; bu dosya üretim filmi değildir ve repoya eklenmez.
