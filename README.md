# Sprint Planning Uygulaması

Modern ve kullanıcı dostu bir sprint planlama uygulaması. Takım üyelerinin sprint planlaması, efor hesaplaması ve izin/eğitim yönetimi için tasarlanmıştır.

## 🚀 Özellikler

### 📋 Sprint Yönetimi

- Sprint oluşturma ve düzenleme
- Sprint başlangıç/bitiş tarihleri
- İş günü hesaplama (hafta sonları hariç)
- Resmi tatil günlerini çıkarma
- Sprint durumu takibi (Kaydedildi, Planlanıyor, Tamamlandı)

### 👥 Takım Yönetimi

- Kişi ekleme/düzenleme/silme
- Rol bazlı yetkilendirme (Analist, Developer)
- LDAP entegrasyonu
- Kişi bazlı efor hesaplama

### 📊 Planlama Grid'i

- Task bazlı sprint planlama
- Çoklu analist/developer atama
- Story Point (SP) yönetimi
- Maliyet hesaplama (Analiz, Yazılım, Test)
- Component bazlı kategorilendirme
- Otomatik kaydetme

### 🏖️ İzin/Eğitim Yönetimi

- Kişi bazlı izin/eğitim takibi
- Saat bazlı hesaplama
- Efor hesaplamasına dahil etme

### 📅 Resmi Tatil Yönetimi

- Resmi tatil ekleme/düzenleme/silme
- Tarih aralığı desteği
- Şablon tatiller (Yılbaşı, 23 Nisan, vb.)
- İş günü hesaplamasına dahil etme

### 📈 Kalan Efor Takibi

- Kişi bazlı kalan efor gösterimi
- Progress bar ile görsel takip
- Planlanan vs. kalan saat karşılaştırması
- Renk kodlu durum göstergesi

## 🛠️ Teknolojiler

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, React Select
- **State Management**: React Hooks
- **Data Storage**: JSON dosyaları (yerel)
- **Date Handling**: date-fns
- **ID Generation**: UUID

## 📁 Proje Yapısı

```
sprint-planning/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── config/            # Konfigürasyon API'si
│   │   ├── people/            # Kişi yönetimi API'si
│   │   ├── sprints/           # Sprint yönetimi API'si
│   │   ├── holidays/          # Tatil yönetimi API'si
│   │   └── sprint-planning/   # Sprint planlama API'si
│   ├── konfigurasyonlar/      # Konfigürasyon sayfası
│   ├── planlama/              # Planlama sayfası
│   ├── sprintler/             # Sprint listesi sayfası
│   └── globals.css            # Global stiller
├── components/
│   ├── ui/                    # UI bileşenleri
│   └── PlanningGrid.tsx        # Ana planlama grid'i
├── data/                      # JSON veri dosyaları
├── lib/                       # Yardımcı fonksiyonlar
└── public/                    # Statik dosyalar
```

## 🚀 Kurulum

1. **Projeyi klonlayın**

```bash
git clone <repository-url>
cd sprint-planning
```

2. **Bağımlılıkları yükleyin**

```bash
npm install
```

3. **Geliştirme sunucusunu başlatın**

```bash
npm run dev
```

4. **Tarayıcıda açın**

```
http://localhost:3000
```

## 📊 Veri Yapısı

### Sprint Planning JSON

```json
{
  "tasks": [
    {
      "id": "uuid",
      "taskName": "Task Adı",
      "sp": 2.5,
      "sprintEndTarget": "Geliştirme",
      "currentStatus": "Başlanmadı",
      "responsibleAnalyst": ["analist-id"],
      "responsibleDeveloper": ["developer-id"],
      "delayReason": "",
      "analysisCost": 15,
      "softwareCost": 20,
      "analysisTaskSP": 2,
      "softwareTaskSP": 4,
      "testTaskSP": 1,
      "component": "Roadmap_Torus"
    }
  ],
  "personLeaves": [
    {
      "id": "uuid",
      "personId": "person-id",
      "type": "İzin",
      "hours": 24,
      "description": "Yıllık izin"
    }
  ]
}
```

## 🎯 Kullanım Senaryoları

### 1. Sprint Oluşturma

- Sprintler sayfasından yeni sprint ekleyin
- Başlangıç/bitiş tarihlerini belirleyin
- Sistem otomatik olarak iş günü hesaplar

### 2. Takım Kurulumu

- Konfigürasyonlar sayfasından kişi ekleyin
- Rolleri belirleyin (Analist/Developer)
- LDAP bilgilerini girin

### 3. Sprint Planlama

- Planlama sayfasından sprint seçin
- Task'ları ekleyin ve düzenleyin
- Analist/Developer atamaları yapın
- Maliyetleri hesaplayın

### 4. Efor Takibi

- Kalan eforlar panelinde durumu takip edin
- İzin/eğitim saatlerini yönetin
- Progress bar ile görsel takip yapın

## 🔧 API Endpoints

- `GET/PUT /api/config` - Konfigürasyon yönetimi
- `GET/POST/PUT/DELETE /api/people` - Kişi yönetimi
- `GET/POST/DELETE /api/sprints` - Sprint yönetimi
- `GET/POST/DELETE /api/holidays` - Tatil yönetimi
- `GET/POST /api/sprint-planning/[sprintId]` - Sprint planlama
- `GET/POST /api/sprint-planning/[sprintId]/leaves` - İzin/eğitim yönetimi

## 📱 Responsive Tasarım

- Desktop: 2 kolonlu layout
- Tablet: Esnek grid sistemi
- Mobile: Tek kolon, stack layout
- Horizontal scroll desteği

## 🎨 UI/UX Özellikleri

- Modern ve temiz tasarım
- Dark/Light tema desteği
- Smooth animasyonlar
- Kullanıcı dostu form validasyonları
- Otomatik kaydetme
- Progress göstergeleri

## 🔮 Gelecek Özellikler

- [ ] Excel/CSV import/export
- [ ] Gantt chart görünümü
- [ ] Bildirim sistemi
- [ ] Raporlama modülü
- [ ] Veritabanı entegrasyonu
- [ ] Çoklu dil desteği

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştirici

Sprint Planning Uygulaması - Modern sprint yönetimi için tasarlanmış kapsamlı bir çözüm.
