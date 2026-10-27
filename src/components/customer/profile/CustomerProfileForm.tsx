import React from 'react';
import { ChevronDown } from 'lucide-react';
import { DatePicker } from '../../common/DatePicker';

export interface CustomerProfileFormProps {
  name: string;
  setName: (name: string) => void;
  birthDate: string;
  setBirthDate: (date: string) => void;
  email: string;
  gender: 'Laki-laki' | 'Perempuan';
  setGender: (gender: 'Laki-laki' | 'Perempuan') => void;
  phone: string;
  setPhone: (phone: string) => void;
  isSaving: boolean;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function CustomerProfileForm({
  name,
  setName,
  birthDate,
  setBirthDate,
  email,
  gender,
  setGender,
  phone,
  setPhone,
  isSaving,
  onSave,
  onCancel,
}: CustomerProfileFormProps) {
  return (
    <form onSubmit={onSave} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="customer-nama" className="text-xs font-bold text-gray-700">
          Nama Lengkap
        </label>
        <input
          type="text"
          id="customer-nama"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-black transition-colors shadow-2xs"
          placeholder="Reza Pratama"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="customer-dob" className="text-xs font-bold text-gray-700">
          Tanggal Lahir
        </label>
        <DatePicker
          id="customer-dob"
          value={birthDate}
          onChange={setBirthDate}
          placeholder="Pilih Tanggal Lahir"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="customer-email" className="text-xs font-bold text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="customer-email"
          value={email}
          readOnly
          disabled
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/80 text-sm text-gray-500 cursor-not-allowed shadow-2xs select-none"
          placeholder="reza.pratama@email.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="customer-gender" className="text-xs font-bold text-gray-700">
          Jenis Kelamin
        </label>
        <div className="relative flex items-center">
          <select
            id="customer-gender"
            value={gender}
            onChange={(e) => setGender(e.target.value as 'Laki-laki' | 'Perempuan')}
            className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-black transition-colors shadow-2xs appearance-none cursor-pointer"
          >
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
          <ChevronDown className="absolute right-3.5 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="customer-phone" className="text-xs font-bold text-gray-700">
          Nomor Telepon
        </label>
        <input
          type="tel"
          id="customer-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-black transition-colors shadow-2xs"
          placeholder="+62 812 3456 7890"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-bold text-gray-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-[#1F4D36] hover:bg-[#163b29] text-white text-sm font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
        >
          {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
}
