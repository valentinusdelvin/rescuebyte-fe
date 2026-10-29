import { CheckCircle, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/date';

export interface AccountInfoCardProps {
  createdAt?: string;
  location?: string;
  onLocationChange?: (newLocation: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export function AccountInfoCard({
  createdAt,
}: AccountInfoCardProps) {
  return (
    <div className="bg-[#f4f3f0] border border-[#e6e4df] rounded-2xl p-4 sm:p-5 w-full sm:w-[320px] shrink-0 flex flex-col gap-2.5 shadow-2xs">
      <span className="text-xs font-bold text-gray-800 block">Informasi Akun</span>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-gray-500">
          <CheckCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>Status Akun</span>
        </span>
        <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] text-[11px] font-bold">
          Aktif
        </span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-gray-500">
          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>Tanggal Bergabung</span>
        </span>
        <span className="font-semibold text-gray-700">
          {formatDate(createdAt)}
        </span>
      </div>
    </div>
  );
}
