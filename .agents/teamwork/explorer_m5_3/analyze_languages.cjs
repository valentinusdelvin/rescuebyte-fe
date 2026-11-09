const fs = require('fs');
const path = require('path');

const otherComments = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'pages_services_components_comments.json'), 'utf8')
);

// Check Indonesian words in comments
const indonesianKeywords = [
  'toko', 'produk', 'pesanan', 'keranjang', 'pengguna', 'pelanggan',
  'ambil', 'pembayaran', 'status', 'ulasan', 'dagangan', 'alamat',
  'simpan', 'ubah', 'hapus', 'tambah', 'ambil', 'hitung', 'jarak',
  'lokasi', 'batal', 'konfirmasi', 'data', 'pada', 'untuk', 'dengan',
  'dari', 'jika', 'atau', 'dan', 'tidak', 'hanya', 'sudah', 'belum'
];

let indonesianCount = 0;
let englishCount = 0;
const indonesianSamples = [];
const englishSamples = [];

for (const c of otherComments) {
  const text = c.raw.toLowerCase();
  const words = text.split(/\W+/);
  const matchIndo = words.filter(w => indonesianKeywords.includes(w));
  
  if (matchIndo.length >= 2) {
    indonesianCount++;
    if (indonesianSamples.length < 20) {
      indonesianSamples.push({ file: c.file, line: c.line, text: c.raw });
    }
  } else {
    englishCount++;
    if (englishSamples.length < 20) {
      englishSamples.push({ file: c.file, line: c.line, text: c.raw });
    }
  }
}

console.log(`Comments in pages/services/components:`);
console.log(`- Indonesian-leaning: ${indonesianCount}`);
console.log(`- English-leaning: ${englishCount}`);

console.log('\n--- SAMPLE INDONESIAN COMMENTS ---');
for (const s of indonesianSamples.slice(0, 10)) {
  console.log(`${s.file}:${s.line} -> ${s.text.replace(/\n\s*/g, ' ')}`);
}

console.log('\n--- SAMPLE ENGLISH COMMENTS ---');
for (const s of englishSamples.slice(0, 10)) {
  console.log(`${s.file}:${s.line} -> ${s.text.replace(/\n\s*/g, ' ')}`);
}
