import { Coordinates, POIItem } from '../types';

export interface KecamatanItem {
  name: string;
  lat: number;
  lng: number;
}

export interface CityItem {
  name: string;
  province: string;
  lat: number;
  lng: number;
  kecamatans: KecamatanItem[];
}

export interface OSMSearchResult extends Coordinates {
  title: string;
  subtitle: string;
  street: string;
  suburb: string;
  district: string;
  city: string;
  source: 'local' | 'osm';
}

export interface ReverseGeocodeResult {
  displayName: string;
  street: string;
  suburb: string;
  district: string;
  city: string;
}

// Popular points of interest in Malang & East Java (Instant local search)
export const LOCAL_POPULAR_POIS: POIItem[] = [
  {
    name: 'Piaggone Scooter Malang',
    displayName: 'Piaggone Scooter, Jl. Terusan Dieng No. 45, Pisang Candi, Sukun, Kota Malang',
    street: 'Jl. Terusan Dieng No. 45',
    suburb: 'Pisang Candi',
    district: 'Sukun',
    city: 'Kota Malang',
    state: 'Jawa Timur',
    lat: -7.9735,
    lng: 112.6105,
  },
  {
    name: 'Piaggone Merjosari',
    displayName: 'Piaggone Service & Store, Jl. Joyo Utomo No. 18, Merjosari, Lowokwaru, Kota Malang',
    street: 'Jl. Joyo Utomo No. 18',
    suburb: 'Merjosari',
    district: 'Lowokwaru',
    city: 'Kota Malang',
    state: 'Jawa Timur',
    lat: -7.9428,
    lng: 112.6025,
  },
  {
    name: 'Jl. Veteran No. 10, Merjosari',
    displayName: 'Jl. Veteran No. 10, Ketawanggede, Lowokwaru, Kota Malang, Jawa Timur',
    street: 'Jl. Veteran No. 10',
    suburb: 'Ketawanggede',
    district: 'Lowokwaru',
    city: 'Kota Malang',
    state: 'Jawa Timur',
    lat: -7.9526,
    lng: 112.6146,
  },
  {
    name: 'Universitas Brawijaya (UB)',
    displayName: 'Universitas Brawijaya, Jl. Veteran, Ketawanggede, Lowokwaru, Kota Malang',
    street: 'Jl. Veteran',
    suburb: 'Ketawanggede',
    district: 'Lowokwaru',
    city: 'Kota Malang',
    state: 'Jawa Timur',
    lat: -7.9526,
    lng: 112.6144,
  },
  {
    name: 'Malang Town Square (MATOS)',
    displayName: 'Malang Town Square, Jl. Veteran No. 2, Penanggungan, Klojen, Kota Malang',
    street: 'Jl. Veteran No. 2',
    suburb: 'Penanggungan',
    district: 'Klojen',
    city: 'Kota Malang',
    state: 'Jawa Timur',
    lat: -7.9572,
    lng: 112.6186,
  },
  {
    name: 'Transmart MX Mall Malang',
    displayName: 'Transmart MX Mall, Jl. Veteran No. 8, Penanggungan, Klojen, Kota Malang',
    street: 'Jl. Veteran No. 8',
    suburb: 'Penanggungan',
    district: 'Klojen',
    city: 'Kota Malang',
    state: 'Jawa Timur',
    lat: -7.9567,
    lng: 112.6163,
  },
  {
    name: 'Alun-Alun Tugu Kota Malang',
    displayName: 'Alun-Alun Tugu Malang, Jl. Tugu, Kiduldalem, Klojen, Kota Malang',
    street: 'Jl. Tugu',
    suburb: 'Kiduldalem',
    district: 'Klojen',
    city: 'Kota Malang',
    state: 'Jawa Timur',
    lat: -7.9772,
    lng: 112.634,
  },
  {
    name: 'Alun-Alun Merdeka Malang',
    displayName: 'Alun-Alun Merdeka, Jl. Merdeka Selatan, Kauman, Klojen, Kota Malang',
    street: 'Jl. Merdeka Selatan',
    suburb: 'Kauman',
    district: 'Klojen',
    city: 'Kota Malang',
    state: 'Jawa Timur',
    lat: -7.9826,
    lng: 112.6308,
  },
  {
    name: 'Pasar Terpadu Merjosari',
    displayName: 'Pasar Merjosari, Jl. Mertojoyo Sel., Merjosari, Lowokwaru, Kota Malang',
    street: 'Jl. Mertojoyo Sel.',
    suburb: 'Merjosari',
    district: 'Lowokwaru',
    city: 'Kota Malang',
    state: 'Jawa Timur',
    lat: -7.9421,
    lng: 112.5982,
  },
  {
    name: 'Stasiun Malang Kotabaru',
    displayName: 'Stasiun Malang Kotabaru, Jl. Trunojoyo No. 10, Klojen, Kota Malang',
    street: 'Jl. Trunojoyo No. 10',
    suburb: 'Klojen',
    district: 'Klojen',
    city: 'Kota Malang',
    state: 'Jawa Timur',
    lat: -7.9774,
    lng: 112.6375,
  },
];

// Comprehensive Indonesian Cities & Regencies with their Kecamatans and Centers
export const INDONESIA_CITIES: CityItem[] = [
  {
    name: 'Kota Malang',
    province: 'Jawa Timur',
    lat: -7.9666,
    lng: 112.6326,
    kecamatans: [
      { name: 'Lowokwaru', lat: -7.9433, lng: 112.6146 },
      { name: 'Klojen', lat: -7.977, lng: 112.628 },
      { name: 'Blimbing', lat: -7.94, lng: 112.645 },
      { name: 'Sukun', lat: -7.995, lng: 112.615 },
      { name: 'Kedungkandang', lat: -7.998, lng: 112.665 },
    ],
  },
  {
    name: 'Kabupaten Malang',
    province: 'Jawa Timur',
    lat: -8.1333,
    lng: 112.5667,
    kecamatans: [
      { name: 'Kepanjen', lat: -8.1333, lng: 112.5667 },
      { name: 'Singosari', lat: -7.892, lng: 112.665 },
      { name: 'Lawang', lat: -7.838, lng: 112.695 },
      { name: 'Dau', lat: -7.925, lng: 112.57 },
      { name: 'Pakis', lat: -7.955, lng: 112.71 },
      { name: 'Karangploso', lat: -7.895, lng: 112.605 },
      { name: 'Pujon', lat: -7.85, lng: 112.47 },
      { name: 'Ngantang', lat: -7.82, lng: 112.37 },
      { name: 'Turen', lat: -8.17, lng: 112.7 },
      { name: 'Dampit', lat: -8.21, lng: 112.77 },
      { name: 'Sumberpucung', lat: -8.16, lng: 112.49 },
      { name: 'Wagir', lat: -7.99, lng: 112.57 },
      { name: 'Tajinan', lat: -8.04, lng: 112.67 },
      { name: 'Tumpang', lat: -7.995, lng: 112.765 },
      { name: 'Bululawang', lat: -8.08, lng: 112.64 },
      { name: 'Gondanglegi', lat: -8.175, lng: 112.64 },
    ],
  },
  {
    name: 'Kota Batu',
    province: 'Jawa Timur',
    lat: -7.8671,
    lng: 112.5239,
    kecamatans: [
      { name: 'Batu', lat: -7.8671, lng: 112.5239 },
      { name: 'Bumiaji', lat: -7.825, lng: 112.54 },
      { name: 'Junrejo', lat: -7.895, lng: 112.555 },
    ],
  },
  {
    name: 'Kota Madiun',
    province: 'Jawa Timur',
    lat: -7.6298,
    lng: 111.5239,
    kecamatans: [
      { name: 'Kartoharjo', lat: -7.625, lng: 111.53 },
      { name: 'Manguharjo', lat: -7.635, lng: 111.515 },
      { name: 'Taman', lat: -7.64, lng: 111.535 },
    ],
  },
  {
    name: 'Kabupaten Madiun',
    province: 'Jawa Timur',
    lat: -7.6167,
    lng: 111.65,
    kecamatans: [
      { name: 'Mejayan', lat: -7.55, lng: 111.66 },
      { name: 'Caruban', lat: -7.545, lng: 111.665 },
      { name: 'Geger', lat: -7.69, lng: 111.52 },
      { name: 'Wungu', lat: -7.66, lng: 111.56 },
      { name: 'Dolopo', lat: -7.74, lng: 111.53 },
      { name: 'Dagangan', lat: -7.71, lng: 111.57 },
      { name: 'Balerejo', lat: -7.54, lng: 111.59 },
    ],
  },
  {
    name: 'Kota Mojokerto',
    province: 'Jawa Timur',
    lat: -7.4726,
    lng: 112.4381,
    kecamatans: [
      { name: 'Magersari', lat: -7.465, lng: 112.445 },
      { name: 'Prajurit Kulon', lat: -7.478, lng: 112.425 },
      { name: 'Kranggan', lat: -7.475, lng: 112.438 },
    ],
  },
  {
    name: 'Kabupaten Mojokerto',
    province: 'Jawa Timur',
    lat: -7.55,
    lng: 112.5,
    kecamatans: [
      { name: 'Mojosari', lat: -7.5, lng: 112.55 },
      { name: 'Ngoro', lat: -7.56, lng: 112.61 },
      { name: 'Trowulan', lat: -7.55, lng: 112.38 },
      { name: 'Pacet', lat: -7.67, lng: 112.53 },
      { name: 'Trawas', lat: -7.66, lng: 112.59 },
      { name: 'Puri', lat: -7.52, lng: 112.45 },
      { name: 'Sooko', lat: -7.485, lng: 112.415 },
    ],
  },
  {
    name: 'Kota Magelang',
    province: 'Jawa Tengah',
    lat: -7.4706,
    lng: 110.2178,
    kecamatans: [
      { name: 'Magelang Selatan', lat: -7.49, lng: 110.22 },
      { name: 'Magelang Tengah', lat: -7.47, lng: 110.218 },
      { name: 'Magelang Utara', lat: -7.45, lng: 110.216 },
    ],
  },
  {
    name: 'Kabupaten Magelang',
    province: 'Jawa Tengah',
    lat: -7.5833,
    lng: 110.2333,
    kecamatans: [
      { name: 'Mertoyudan', lat: -7.515, lng: 110.225 },
      { name: 'Borobudur', lat: -7.605, lng: 110.205 },
      { name: 'Mungkid', lat: -7.575, lng: 110.245 },
      { name: 'Muntilan', lat: -7.585, lng: 110.28 },
      { name: 'Salaman', lat: -7.58, lng: 110.15 },
      { name: 'Secang', lat: -7.395, lng: 110.25 },
    ],
  },
  {
    name: 'Kota Medan',
    province: 'Sumatera Utara',
    lat: 3.5952,
    lng: 98.6722,
    kecamatans: [
      { name: 'Medan Kota', lat: 3.578, lng: 98.688 },
      { name: 'Medan Barat', lat: 3.605, lng: 98.665 },
      { name: 'Medan Baru', lat: 3.575, lng: 98.655 },
      { name: 'Medan Petisah', lat: 3.595, lng: 98.665 },
      { name: 'Medan Sunggal', lat: 3.57, lng: 98.62 },
      { name: 'Medan Helvetia', lat: 3.615, lng: 98.64 },
      { name: 'Medan Denai', lat: 3.56, lng: 98.715 },
      { name: 'Medan Tembung', lat: 3.6, lng: 98.715 },
      { name: 'Medan Selayang', lat: 3.535, lng: 98.63 },
      { name: 'Medan Johor', lat: 3.525, lng: 98.665 },
    ],
  },
  {
    name: 'Kota Makassar',
    province: 'Sulawesi Selatan',
    lat: -5.1477,
    lng: 119.4327,
    kecamatans: [
      { name: 'Ujung Pandang', lat: -5.138, lng: 119.412 },
      { name: 'Makassar', lat: -5.145, lng: 119.425 },
      { name: 'Panakkukang', lat: -5.148, lng: 119.45 },
      { name: 'Tamalate', lat: -5.18, lng: 119.415 },
      { name: 'Rappocini', lat: -5.168, lng: 119.435 },
      { name: 'Bontoala', lat: -5.128, lng: 119.425 },
      { name: 'Manggala', lat: -5.165, lng: 119.485 },
      { name: 'Tamalanrea', lat: -5.135, lng: 119.495 },
      { name: 'Biringkanaya', lat: -5.105, lng: 119.525 },
    ],
  },
  {
    name: 'Kota Manado',
    province: 'Sulawesi Utara',
    lat: 1.4748,
    lng: 124.8421,
    kecamatans: [
      { name: 'Wenang', lat: 1.485, lng: 124.845 },
      { name: 'Malalayang', lat: 1.455, lng: 124.825 },
      { name: 'Sario', lat: 1.468, lng: 124.835 },
      { name: 'Tikala', lat: 1.482, lng: 124.86 },
      { name: 'Wanea', lat: 1.462, lng: 124.85 },
      { name: 'Mapanget', lat: 1.53, lng: 124.89 },
    ],
  },
  {
    name: 'Kota Mataram',
    province: 'Nusa Tenggara Barat',
    lat: -8.5833,
    lng: 116.1167,
    kecamatans: [
      { name: 'Mataram', lat: -8.585, lng: 116.105 },
      { name: 'Ampenan', lat: -8.575, lng: 116.075 },
      { name: 'Cakranegara', lat: -8.585, lng: 116.135 },
      { name: 'Sandubaya', lat: -8.595, lng: 116.155 },
      { name: 'Selaparang', lat: -8.565, lng: 116.115 },
      { name: 'Sekarbela', lat: -8.605, lng: 116.085 },
    ],
  },
  {
    name: 'Kota Surabaya',
    province: 'Jawa Timur',
    lat: -7.2575,
    lng: 112.7521,
    kecamatans: [
      { name: 'Gubeng', lat: -7.275, lng: 112.755 },
      { name: 'Tegalsari', lat: -7.27, lng: 112.738 },
      { name: 'Wonokromo', lat: -7.3, lng: 112.735 },
      { name: 'Rungkut', lat: -7.32, lng: 112.775 },
      { name: 'Sukolilo', lat: -7.29, lng: 112.795 },
      { name: 'Genteng', lat: -7.26, lng: 112.745 },
    ],
  },
  {
    name: 'Kota Yogyakarta',
    province: 'DI Yogyakarta',
    lat: -7.7956,
    lng: 110.3695,
    kecamatans: [
      { name: 'Danurejan', lat: -7.792, lng: 110.375 },
      { name: 'Gedongtengen', lat: -7.79, lng: 110.36 },
      { name: 'Gondokusuman', lat: -7.785, lng: 110.38 },
      { name: 'Kraton', lat: -7.808, lng: 110.362 },
      { name: 'Umbulharjo', lat: -7.815, lng: 110.385 },
      { name: 'Kotagede', lat: -7.825, lng: 110.395 },
    ],
  },
  {
    name: 'Kota Semarang',
    province: 'Jawa Tengah',
    lat: -6.9667,
    lng: 110.4167,
    kecamatans: [
      { name: 'Semarang Tengah', lat: -6.98, lng: 110.42 },
      { name: 'Semarang Barat', lat: -6.985, lng: 110.385 },
      { name: 'Semarang Timur', lat: -6.975, lng: 110.445 },
      { name: 'Banyumanik', lat: -7.065, lng: 110.415 },
      { name: 'Tembalang', lat: -7.055, lng: 110.455 },
      { name: 'Candisari', lat: -7.015, lng: 110.425 },
    ],
  },
  {
    name: 'Kota Denpasar',
    province: 'Bali',
    lat: -8.6705,
    lng: 115.2126,
    kecamatans: [
      { name: 'Denpasar Barat', lat: -8.66, lng: 115.195 },
      { name: 'Denpasar Timur', lat: -8.65, lng: 115.235 },
      { name: 'Denpasar Selatan', lat: -8.695, lng: 115.215 },
      { name: 'Denpasar Utara', lat: -8.625, lng: 115.21 },
    ],
  },
];

