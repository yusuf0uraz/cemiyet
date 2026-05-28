import { pool } from './pool';

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── Kullanıcılar ─────────────────────────────────────────────
    const { rows: users } = await client.query(`
      INSERT INTO users (phone, name, username, bio, city, avatar_tone)
      VALUES
        ('+905551234567', 'Berkay Doğan',  'berkay',        'CemiApp kurucusu. Tenis ve fotoğraf.',   'Elazığ', '1'),
        ('+905559876543', 'Ayşe Yılmaz',   'ayse_y',        'Tenis ve kitap tutkunuyum.',              'Elazığ', '2'),
        ('+905553334455', 'Mehmet Kaya',   'mkaya',         'Hazar Gölü sakinlerindenim.',             'Elazığ', '3'),
        ('+905551112233', 'Selin Arslan',  'selin_a',       'Fotoğrafçı, doğa sever.',                'Elazığ', '4'),
        ('+905556667788', 'Burak Yıldız',  'burakyildiz',   'Satranç ve kitap düşkünü.',              'Elazığ', '5')
      ON CONFLICT (phone) DO UPDATE SET
        name = EXCLUDED.name, bio = EXCLUDED.bio, avatar_tone = EXCLUDED.avatar_tone
      RETURNING id, username
    `);

    const berkay = users.find(u => u.username === 'berkay')!;
    const ayse   = users.find(u => u.username === 'ayse_y')!;
    const mehmet = users.find(u => u.username === 'mkaya')!;
    const selin  = users.find(u => u.username === 'selin_a')!;
    const burak  = users.find(u => u.username === 'burakyildiz')!;

    // ── Kulüpler ──────────────────────────────────────────────────
    const { rows: clubs } = await client.query(`
      INSERT INTO clubs (name, cat, description, city, member_count, created_by)
      VALUES
        ('F.Ü. Tenis Kulübü',         'tenis',   'Fırat Üniversitesi tenis topluluğu. Her seviyeden oyuncuya açık.', 'Elazığ', 124, $1),
        ('Hazar Sabah Yürüyüşçüleri', 'yuruyus', 'Her sabah Hazar Gölü çevresinde yürüyüş. Herkese açık.',          'Elazığ',  38, $2),
        ('Mahalle Kitap Cemiyeti',    'kitap',   'Her hafta bir kitap, ayda bir büyük okuma buluşması.',             'Elazığ',  67, $3),
        ('Harput Satranç Kulübü',     'satranc', 'Haftalık turnuvalar ve antrenmanlar. Tüm seviyeler.',              'Elazığ',  29, $1),
        ('Harput Foto Söyleşileri',   'foto',    'Harput ve çevresini fotoğraflayan topluluk.',                      'Elazığ',  42, $4),
        ('Elazığ Koşucular',          'doga',    'Haftalık parkur koşuları ve doğa yürüyüşleri.',                    'Elazığ',  88, $3),
        ('Elazığ Müzik Topluluğu',    'muzik',   'Canlı performanslar, atölyeler ve konserler.',                     'Elazığ',  54, $1)
      ON CONFLICT DO NOTHING
      RETURNING id, name
    `, [berkay.id, ayse.id, mehmet.id, selin.id]);

    if (clubs.length === 0) {
      console.log('Seed verisi zaten mevcut, atlanıyor...');
      await client.query('COMMIT');
      return;
    }

    const tenis   = clubs.find(c => c.name.includes('Tenis'))!;
    const yuruyus = clubs.find(c => c.name.includes('Yürüyüş'))!;
    const kitap   = clubs.find(c => c.name.includes('Kitap'))!;
    const satranc = clubs.find(c => c.name.includes('Satranç'))!;
    const foto    = clubs.find(c => c.name.includes('Foto'))!;
    const muzik   = clubs.find(c => c.name.includes('Müzik'))!;

    // ── Üyelikler ─────────────────────────────────────────────────
    const memberships = [
      [berkay.id,  tenis.id,   'reis'],
      [ayse.id,    yuruyus.id, 'yardimci'],
      [mehmet.id,  kitap.id,   'aza'],
      [selin.id,   foto.id,    'reis'],
      [burak.id,   satranc.id, 'aza'],
      [berkay.id,  muzik.id,   'aza'],
      [mehmet.id,  satranc.id, 'reis'],
      [ayse.id,    tenis.id,   'aza'],
      [selin.id,   yuruyus.id, 'aza'],
    ];
    for (const [uid, cid, role] of memberships) {
      await client.query(
        'INSERT INTO club_members (user_id, club_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [uid, cid, role]
      );
    }

    // ── Etkinlikler ───────────────────────────────────────────────
    const events = [
      { title: 'Tenis Turnuvası Finali',        cat: 'tenis',   clubId: tenis.id,   clubName: 'F.Ü. Tenis Kulübü',         date: '24 May · Cmt', time: '18:30', place: 'F.Ü. Tenis Kortları',        cap: 16, live: true,  free: true,  by: berkay.id },
      { title: 'Hazar Sabah Yürüyüşü',          cat: 'yuruyus', clubId: yuruyus.id, clubName: 'Hazar Sabah Yürüyüşçüleri', date: '24 May · Cmt', time: '07:00', place: 'Hazar Gölü Sahil Yolu',      cap: 50, live: true,  free: true,  by: ayse.id  },
      { title: 'Kitap: Tutunamayanlar',         cat: 'kitap',   clubId: kitap.id,   clubName: 'Mahalle Kitap Cemiyeti',     date: '25 May · Paz', time: '15:00', place: 'Kültür Merkezi, Kat 2',      cap: 20, live: false, free: true,  by: mehmet.id},
      { title: 'Harput Fotoğraf Gezisi',        cat: 'foto',    clubId: foto.id,    clubName: 'Harput Foto Söyleşileri',    date: '26 May · Pzt', time: '10:00', place: 'Harput Kalesi, Giriş',       cap: 15, live: false, free: true,  by: selin.id },
      { title: 'Akustik Gece — Fırat Kafé',     cat: 'muzik',   clubId: muzik.id,   clubName: 'Elazığ Müzik Topluluğu',    date: '27 May · Sal', time: '20:30', place: 'Fırat Kafé, Merkez',         cap: 60, live: false, free: false, by: berkay.id},
      { title: 'Cumartesi Tenis Antrenmanı',    cat: 'tenis',   clubId: tenis.id,   clubName: 'F.Ü. Tenis Kulübü',         date: '31 May · Cmt', time: '09:00', place: 'F.Ü. Tenis Kortları, Kort2', cap:  8, live: false, free: true,  by: berkay.id},
      { title: 'Satranç Turnuvası 1. Tur',      cat: 'satranc', clubId: satranc.id, clubName: 'Harput Satranç Kulübü',      date: '28 May · Car', time: '14:00', place: 'Harput Kültür Evi',          cap: 24, live: false, free: true,  by: mehmet.id},
      { title: 'Hazar Gölü Gün Batımı Turu',   cat: 'yuruyus', clubId: yuruyus.id, clubName: 'Hazar Sabah Yürüyüşçüleri', date: '29 May · Per', time: '18:00', place: 'Hazar Gölü, Kuzey Çıkış',   cap: 30, live: false, free: true,  by: ayse.id  },
      { title: 'Sokak Fotoğrafçılığı Atölyesi', cat: 'foto',   clubId: foto.id,    clubName: 'Harput Foto Söyleşileri',    date: '30 May · Cum', time: '11:00', place: 'Çarşı Caddesi, Elazığ',     cap: 10, live: false, free: true,  by: selin.id },
      { title: 'Kitap: Şeker Portakalı',        cat: 'kitap',   clubId: kitap.id,   clubName: 'Mahalle Kitap Cemiyeti',     date: '1 Haz · Pzt',  time: '15:00', place: 'Hadim Çay Bahçesi',          cap: 20, live: false, free: true,  by: mehmet.id},
    ];
    for (const ev of events) {
      await client.query(
        `INSERT INTO events (title, cat, club_id, club_name, date, time, place, capacity, is_live, free, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT DO NOTHING`,
        [ev.title, ev.cat, ev.clubId, ev.clubName, ev.date, ev.time, ev.place, ev.cap, ev.live, ev.free, ev.by]
      );
    }

    // ── Duvar gönderileri ─────────────────────────────────────────
    const wallPosts = [
      [tenis.id,   berkay.id, '🏆 Bu haftaki turnuva sonuçlandı! Tebrikler herkese. Önümüzdeki cumartesi çeyrek final!', true],
      [tenis.id,   berkay.id, 'Cumartesi sabahı açık antrenman var. Kort 3\'te buluşuyoruz saat 09:00\'da.', false],
      [yuruyus.id, ayse.id,   'Bugün sabah yürüyüşü harika geçti! Hazar Gölü her zaman büyülüyor 🌅', false],
      [yuruyus.id, ayse.id,   'Yarın gün batımı turu için hava tahminleri iyi görünüyor. Katılım artıyor!', false],
      [kitap.id,   mehmet.id, 'Bu ay Tutunamayanlar okuyoruz. Cumartesi saat 15:00\'de buluşuyoruz.', true],
      [kitap.id,   mehmet.id, 'Kitap önerileri listesini güncelledik. Yorumlara bakın!', false],
      [foto.id,    selin.id,  'Harput gezisinden döndük, harika fotoğraflar çektik. Yakında paylaşacağız.', false],
      [muzik.id,   berkay.id, '27 Mayıs gecesi Fırat Kafé\'de akustik performans için herkesi bekliyoruz 🎸', true],
    ];
    for (const [clubId, authorId, text, isAnnouncement] of wallPosts) {
      await client.query(
        `INSERT INTO wall_posts (club_id, author_id, text, is_announcement)
         VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
        [clubId, authorId, text, isAnnouncement]
      );
    }

    await client.query('COMMIT');
    console.log('✓ Seed tamamlandı — 5 kullanıcı, 7 kulüp, 10 etkinlik, 8 duvar gönderisi');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed hatası:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
