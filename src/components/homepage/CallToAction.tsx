import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CallToAction() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-6xl px-4 my-16">
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl shadow-xl dark:shadow-indigo-900/20">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="smallGrid"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 8 0 L 0 0 0 8"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
              <pattern
                id="grid"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <rect width="80" height="80" fill="url(#smallGrid)" />
                <path
                  d="M 80 0 L 0 0 0 80"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative flex flex-col md:flex-row items-center justify-between p-8 md:p-12 z-10">
          <div className="mb-8 md:mb-0 md:pr-8 max-w-xl">
            <h2 className="text-3xl font-bold mb-3 text-white">
              {t('homePage.cta.title')}
            </h2>
            <p className="text-blue-100 text-lg">
              {t('homePage.cta.subtitle')}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-white dark:text-blue-600 dark:hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-200 px-6 py-6 h-auto font-semibold text-base"
            >
              {t('homePage.cta.button')} 
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
} 