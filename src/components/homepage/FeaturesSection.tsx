import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MagicCard } from "@/components/ui/magic/MagicCard";
import { AnimatedGradientText } from "@/components/ui/magic/AnimatedGradientText";

interface WhyChooseUs {
  title: string;
  subtitle: string;
  features: Array<{
    id: number;
    icon: string;
    title: string;
    description: string;
  }>;
}

export function FeaturesSection() {
  const { t } = useTranslation();

  const whyChooseUs = t('homePage.whyChooseUs', {
    returnObjects: true
  }) as WhyChooseUs;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="my-16 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-indigo-50/30 dark:from-purple-900/10 dark:via-blue-900/5 dark:to-indigo-900/10 rounded-3xl" />
      
      <motion.div 
        className="relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="text-center mb-10" 
          variants={itemVariants}
          transition={{ duration: 0.6 }}
        >
          <AnimatedGradientText 
            gradient="from-purple-600 via-blue-600 to-indigo-600"
            className="text-3xl font-bold mb-2 inline-block"
          >
            {whyChooseUs.title}
          </AnimatedGradientText>
          <motion.p 
            className="text-center text-gray-600 dark:text-gray-400"
            variants={itemVariants}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {whyChooseUs.subtitle}
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {whyChooseUs.features.map((feature, index) => (
            <motion.div 
              key={feature.id} 
              variants={itemVariants}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <MagicCard 
                className="h-full p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
                gradientColor={index % 3 === 0 ? "#3b82f6" : index % 3 === 1 ? "#8b5cf6" : "#06b6d4"}
                gradientOpacity={0.15}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full text-4xl transition-transform duration-200 hover:scale-110">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </MagicCard>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
} 