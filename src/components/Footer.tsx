import { MessageCircle, Phone, Mail } from 'lucide-react';
import { getWhatsAppLink, getTelLink } from '../utils/phone';

export default function Footer() {
  const contactPhone = '+201002275857';
  const contactEmail = 'mohanad.gaber@bold-routes.com';

  return (
    <footer className="bg-brand-fg text-brand-bg section mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-3 sm:mb-4">
              <img 
                src="/images/logo.png" 
                alt="Bold Routes Partners logo" 
                className="h-10 sm:h-12 w-auto mr-3 filter brightness-0 invert"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <h3 className="text-lg sm:text-xl font-bold text-brand-bg hidden">
                Bold Routes Partners
              </h3>
            </div>
            <p className="text-brand-bg opacity-80 text-sm sm:text-base leading-relaxed">
              Empowering small & medium brokerages to close bigger deals with better commission rates.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-brand-bg text-sm sm:text-base">Quick Links</h4>
            <nav className="space-y-2" aria-label="Footer navigation">
              <a 
                href="/launches" 
                className="block text-brand-bg opacity-70 hover:text-brand-bg hover:opacity-100 transition-colors duration-200 text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bg rounded"
              >
                New Launches
              </a>
              <a 
                href="/commissions" 
                className="block text-brand-bg opacity-70 hover:text-brand-bg hover:opacity-100 transition-colors duration-200 text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bg rounded"
              >
                Commission Rates
              </a>
              <a 
                href="/close-deal" 
                className="block text-brand-bg opacity-70 hover:text-brand-bg hover:opacity-100 transition-colors duration-200 text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bg rounded"
              >
                Close a Deal
              </a>
              <a 
                href="/apply" 
                className="block text-brand-bg opacity-70 hover:text-brand-bg hover:opacity-100 transition-colors duration-200 text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bg rounded"
              >
                Partner Application
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-brand-bg text-sm sm:text-base">Contact Us</h4>
            <div className="space-y-3">
              <a 
                href={getWhatsAppLink(contactPhone, 'Hi Bold Routes, I\'d like to know more about your partnership program.')}
                className="flex items-center space-x-2 text-brand-bg opacity-70 hover:text-brand-bg hover:opacity-100 transition-colors duration-200 text-sm sm:text-base min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bg rounded"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact us on WhatsApp"
              >
                <MessageCircle size={16} aria-hidden="true" />
                <span>WhatsApp</span>
              </a>
              <a 
                href={getTelLink(contactPhone)}
                className="flex items-center space-x-2 text-brand-bg opacity-70 hover:text-brand-bg hover:opacity-100 transition-colors duration-200 text-sm sm:text-base min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bg rounded"
                aria-label="Call us"
              >
                <Phone size={16} aria-hidden="true" />
                <span>Call Us</span>
              </a>
              <a 
                href={`mailto:${contactEmail}`}
                className="flex items-center space-x-2 text-brand-bg opacity-70 hover:text-brand-bg hover:opacity-100 transition-colors duration-200 text-sm sm:text-base min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bg rounded"
                aria-label="Send us an email"
              >
                <Mail size={16} aria-hidden="true" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>

        <div className="divider mt-6 sm:mt-8"></div>
        <div className="mt-6 sm:mt-8 text-center text-brand-bg opacity-60 text-xs sm:text-sm">
          <p>&copy; 2024 Bold Routes Partners. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
