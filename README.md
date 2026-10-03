# Burcu & Vural — Salihli Düğün Davetiyesi

Bağımsız proje adı: **vural-burcu-salihli-davetiye**

Bu klasör GitHub Pages'a doğrudan yayınlanabilecek statik bir mobil davetiyedir. Van projesinden bağımsızdır.

## Etkinlik

- Burcu & Vural
- 7 Kasım 2026, Cumartesi
- 14:00–17:00
- Salihli Öğretmenevi, Salihli / Manisa
- Gelin tarafı: Mürüvvet & Ergül
- Damat tarafı: Herdem & Nurettin

## Tasarım

Açılış koyu gece laciverti zarf, B/V mühür, Sardes sütun ritmi, Bozdağ silueti ve bağ çizgilerinin deboss hissiyle başlar. Kullanıcı **DAVETİ AÇ** düğmesine dokunduğunda mühür ayrılır, az sayıda metalik ışık parçacığı oluşur, zarf kapağı 3B açılır ve onaylanan premium Salihli sanat kartı yükselir. Final ekranda konum, takvime ekleme, katılım onayı ve açılışı yeniden izleme işlevleri bulunur.

## Dosyalar

- `index.html`
- `styles.css`
- `app.js`
- `burcu-vural-salihli-dugun.ics`
- `assets/invitation.webp`
- `assets/favicon.svg`
- `.nojekyll`

## GitHub Pages

Yeni repository adı tam olarak:

`vural-burcu-salihli-davetiye`

Dosyaları repository köküne yükleyin. GitHub'da **Settings → Pages → Build and deployment → Deploy from a branch → main / root** seçildiğinde adres şu formatta olur:

`https://[KULLANICI-ADI].github.io/vural-burcu-salihli-davetiye/`

## Müzik

Müzik özellikle eklenmedi. Bir ses dosyası geldiğinde `assets/music.mp3` gibi eklenip `app.js` içindeki `CONFIG.musicSrc` alanına yazılır. Safari/iPhone kısıtlamaları nedeniyle müzik yalnızca kullanıcının **DAVETİ AÇ** dokunuşundan sonra başlar ve 1.4 saniyede yumuşak fade-in yapar.
