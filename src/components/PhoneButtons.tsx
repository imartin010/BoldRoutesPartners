import { Phone, MessageCircle } from 'lucide-react';
import { getTelLink, getWhatsAppLink } from '../utils/phone';

interface PhoneButtonsProps {
  phone: string;
  whatsappMessage?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PhoneButtons({ phone, whatsappMessage, size = 'md' }: PhoneButtonsProps) {
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs sm:text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <div className="flex gap-1.5 sm:gap-2 flex-wrap">
      <a
        href={getTelLink(phone)}
        className={`${sizeClasses[size]} bg-black text-white rounded-lg hover:bg-gray-elegant-800 transition-all duration-300 flex items-center gap-1.5 font-medium shadow-elegant hover:shadow-elegant-lg`}
      >
        <Phone size={iconSizes[size]} />
        <span className="hidden xs:inline">Call</span>
        <span className="xs:hidden">📞</span>
      </a>
      <a
        href={getWhatsAppLink(phone, whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${sizeClasses[size]} bg-gray-elegant-700 text-white rounded-lg hover:bg-gray-elegant-600 transition-all duration-300 flex items-center gap-1.5 font-medium shadow-elegant hover:shadow-elegant-lg`}
      >
        <MessageCircle size={iconSizes[size]} />
        <span className="hidden xs:inline">WhatsApp</span>
        <span className="xs:hidden">💬</span>
      </a>
    </div>
  );
}
