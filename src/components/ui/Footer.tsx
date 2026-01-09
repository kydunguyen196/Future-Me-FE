import { default as Link } from "@/components/ui/CustomLink"
import { Facebook, Twitter, Mail, Phone} from "lucide-react";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-gradient-to-b from-slate-300 to-slate-400 text-slate-800 dark:from-slate-800 dark:to-slate-900 dark:text-slate-200 shadow-lg">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Logo Section */}
          <div className="flex flex-col">
            <div className="mb-6">
              <Link to="/" className="flex items-center group">
                <img
                  src={`${import.meta.env.VITE_ASSETS_URL}/assets/images/header_logo.png`}
                  alt="Future Me"
                  className="h-14 w-auto transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            </div>
          </div>

          {/* Customer Care Section */}
          <div className="flex flex-col">
            <h3 className="font-bold text-lg mb-4 text-indigo-900 dark:text-indigo-300 border-b border-indigo-200 dark:border-indigo-800 pb-2">
              {t('footer.customerCare')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/dich-vu"
                  className="hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center"
                >
                  <span className="mr-2 text-xs">›</span>
                  {t('footer.services')}
                </Link>
              </li>
              <li>
                <Link
                  to="/cau-hoi-thuong-gap"
                  className="hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center"
                >
                  <span className="mr-2 text-xs">›</span>
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link
                  to="/chinh-sach-bao-mat"
                  className="hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center"
                >
                  <span className="mr-2 text-xs">›</span>
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  to="/dieu-khoan-su-dung"
                  className="hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center"
                >
                  <span className="mr-2 text-xs">›</span>
                  {t('footer.termsOfUse')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us Section */}
          <div className="flex flex-col">
            <h3 className="font-bold text-lg mb-4 text-indigo-900 dark:text-indigo-300 border-b border-indigo-200 dark:border-indigo-800 pb-2">
              {t('footer.followUs')}
            </h3>
            <div className="flex justify-center md:justify-center space-x-5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-all duration-300 flex items-center justify-center"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full hover:bg-sky-500 hover:text-white dark:hover:bg-sky-600 transition-all duration-300 flex items-center justify-center"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://reddit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full hover:bg-orange-500 hover:text-white dark:hover:bg-orange-600 transition-all duration-300 flex items-center justify-center"
                aria-label="Reddit"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="9" r="3" />
                  <path d="M6.5 14.5c0-2.5 2.5-4.5 5.5-4.5s5.5 2 5.5 4.5" />
                  <path d="M18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M6 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full hover:bg-blue-700 hover:text-white dark:hover:bg-blue-800 transition-all duration-300 flex items-center justify-center"
                aria-label="LinkedIn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Contact Section */}
          <div className="flex flex-col">
            <h3 className="font-bold text-lg mb-4 text-indigo-900 dark:text-indigo-300 border-b border-indigo-200 dark:border-indigo-800 pb-2">
              {t('footer.contact')}
            </h3>
            <div className="rounded-lg bg-white/50 dark:bg-slate-800/50 p-4 shadow-sm mb-4">
              <p className="mb-3 text-sm">{t('footer.address')}</p>
              <div className="flex items-center mb-3">
                <Mail size={16} className="mr-2 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm">
                  <span className="font-medium">{t('footer.email')}:</span> dunghoang@gmail.com
                </span>
              </div>
              <div className="flex items-center mb-3">
                <Phone size={16} className="mr-2 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm">
                  <span className="font-medium">{t('footer.phone')}:</span> 0981357037
                </span>
              </div>
            </div>
            
            {/* Google Maps */}
            <div className="rounded-lg overflow-hidden shadow-sm h-48">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3738.6597430055206!2d105.52293851534289!3d21.013347885926976!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135abc60e7d3f19%3A0x2be9d7d0b5abcbf4!2sFPT%20University!5e0!3m2!1sen!2s!4v1682431234567!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="FPT University Location"
                className="opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="w-full py-4 text-center border-t border-slate-500/30 bg-slate-400/50 dark:bg-slate-900/80">
        <p className="text-sm">{t('footer.copyright')}</p>
      </div>
    </footer>
  );
}
