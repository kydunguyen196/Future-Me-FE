import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Marquee } from "@/components/ui/magic/Marquee";
import { AnimatedGradientText } from "@/components/ui/magic/AnimatedGradientText";
import { Star } from "lucide-react";

interface Testimonial {
  id: number;
  nameKey: string;
  roleKey: string;
  avatar: string;
  contentKey: string;
  rating: number;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    nameKey: "testimonial1.name",
    roleKey: "testimonial1.role",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=64&h=64&fit=crop&crop=face",
    contentKey: "testimonial1.content",
    rating: 5,
    date: "2024-01-15"
  },
  {
    id: 2,
    nameKey: "testimonial2.name",
    roleKey: "testimonial2.role",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
    contentKey: "testimonial2.content",
    rating: 5,
    date: "2024-01-20"
  },
  {
    id: 3,
    nameKey: "testimonial3.name",
    roleKey: "testimonial3.role",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
    contentKey: "testimonial3.content",
    rating: 5,
    date: "2024-02-05"
  },
  {
    id: 4,
    nameKey: "testimonial4.name",
    roleKey: "testimonial4.role",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
    contentKey: "testimonial4.content",
    rating: 5,
    date: "2024-02-10"
  },
  {
    id: 5,
    nameKey: "testimonial5.name",
    roleKey: "testimonial5.role",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face",
    contentKey: "testimonial5.content",
    rating: 5,
    date: "2024-02-12"
  },
  {
    id: 6,
    nameKey: "testimonial6.name",
    roleKey: "testimonial6.role",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face",
    contentKey: "testimonial6.content",
    rating: 5,
    date: "2024-02-18"
  }
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { t } = useTranslation();
  
  const name = t(`homePage.testimonials.${testimonial.nameKey}`);
  const role = t(`homePage.testimonials.${testimonial.roleKey}`);
  const content = t(`homePage.testimonials.${testimonial.contentKey}`);

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 max-w-sm mx-4 flex-shrink-0"
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <img
          src={testimonial.avatar}
          alt={name}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=48`;
          }}
        />
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-left">{name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-left">{role}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < testimonial.rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
        "{content}"
      </p>
      
      <p className="text-xs text-gray-500 dark:text-gray-500">
        {new Date(testimonial.date).toLocaleDateString(t('common.locale', 'en-US'), {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const { t } = useTranslation();

  const firstRow = testimonials.slice(0, Math.ceil(testimonials.length / 2));
  const secondRow = testimonials.slice(Math.ceil(testimonials.length / 2));

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      <div className="container mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <AnimatedGradientText
            gradient="from-blue-600 via-purple-600 to-indigo-600"
            className="text-4xl lg:text-5xl font-bold mb-4"
          >
            {t('homePage.testimonials.title')}
          </AnimatedGradientText>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            {t('homePage.testimonials.subtitle')}
          </p>
        </motion.div>

        <div className="relative">
          {/* First row - scrolling left to right */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Marquee pauseOnHover className="py-4" speed={60}>
              {firstRow.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </Marquee>
          </motion.div>

          {/* Second row - scrolling right to left */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Marquee reverse pauseOnHover className="py-4" speed={50}>
              {secondRow.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </Marquee>
          </motion.div>
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {t('homePage.testimonials.cta')}
          </p>
        </motion.div>
      </div>
    </section>
  );
} 