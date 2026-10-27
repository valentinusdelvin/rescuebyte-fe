import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (formattedDate: string) => void;
  placeholder?: string;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const CURRENT_YEAR = new Date().getFullYear();

export function DatePicker({ id, value, onChange, placeholder = 'Pilih Tanggal' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date from value or fallback to today
  const [viewDate, setViewDate] = useState(() => {
    const parts = value?.trim().split(/\s+/);
    if (parts?.length === 3) {
      const monthIdx = MONTHS.indexOf(parts[1]);
      if (monthIdx >= 0) {
        return new Date(Number(parts[2]), monthIdx, Number(parts[0]));
      }
    }
    return new Date();
  });

  // Close calendar popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const selectedDay = viewDate.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handleSelectDay = (day: number) => {
    const nextDate = new Date(year, month, day);
    setViewDate(nextDate);
    onChange(`${day} ${MONTHS[month]} ${year}`);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute left-3.5 p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer z-10"
          aria-label="Buka Kalender"
        >
          <Calendar className="w-4 h-4 text-gray-500" />
        </button>

        <input
          type="text"
          id={id}
          value={value}
          readOnly
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-black transition-colors shadow-2xs cursor-pointer select-none"
          placeholder={placeholder}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-40 w-full sm:w-80 p-4 bg-white rounded-2xl border border-gray-200 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
              aria-label="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 flex-1 justify-center">
              <select
                value={month}
                onChange={(e) => setViewDate(new Date(year, Number(e.target.value), 1))}
                className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-800 cursor-pointer focus:outline-black"
              >
                {MONTHS.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => setViewDate(new Date(Number(e.target.value), month, 1))}
                className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-800 cursor-pointer focus:outline-black"
              >
                {Array.from({ length: 85 }, (_, i) => CURRENT_YEAR - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
              aria-label="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-400">
            <span>Min</span>
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8 w-8" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const isSelected = d === selectedDay && value.includes(`${d} ${MONTHS[month]}`);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleSelectDay(d)}
                  className={`h-8 w-8 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${isSelected
                      ? 'bg-[#1F4D36] text-white shadow-xs'
                      : 'text-gray-700 hover:bg-[#eef8ee] hover:text-[#1F4D36]'
                    }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
