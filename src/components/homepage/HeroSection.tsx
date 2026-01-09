import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { RainbowButton } from "@/components/ui/magic/RainbowButton";
import { AnimatedGradientText } from "@/components/ui/magic/AnimatedGradientText";
import { MagicCard } from "@/components/ui/magic/MagicCard";

export function HeroSection() {
    const { t } = useTranslation();
    const assetsUrl = import.meta.env.VITE_ASSETS_URL || '';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const featureVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
    };

    return (
        <section className="my-16 text-center lg:text-left relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-indigo-50/50 dark:from-blue-900/20 dark:via-purple-900/10 dark:to-indigo-900/20 rounded-3xl" />
            
            <div className="container mx-auto relative z-10">
                <motion.div 
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-items-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Left side */}
                    <motion.div className="px-4 lg:px-0" variants={itemVariants}>
                        <motion.h2 
                            className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
                            variants={itemVariants}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            {t('homePage.heroSection.title')}{" "}
                            <AnimatedGradientText 
                                gradient="from-yellow-400 via-orange-500 to-red-500"
                                className="text-4xl lg:text-6xl font-extrabold"
                            >
                                {t('homePage.heroSection.title2')}
                            </AnimatedGradientText>{" "}
                            <br />
                            {t('homePage.heroSection.title3')}
                        </motion.h2>
                        
                        <motion.p 
                            className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8"
                            variants={itemVariants}
                            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                        >
                            {t('homePage.heroSection.description')}
                        </motion.p>
                        
                        <motion.div 
                            className="space-y-4"
                            variants={itemVariants}
                        >
                            <RainbowButton className="text-lg font-semibold shadow-lg">
                                {t('homePage.heroSection.buttonText', 'Xem chi tiết')}
                            </RainbowButton>
                            
                            <motion.div 
                                className="flex items-center justify-center lg:justify-start space-x-4 text-sm text-gray-500 dark:text-gray-400"
                                variants={itemVariants}
                            >
                                <span className="flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Free to start
                                </span>
                                <span className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    No credit card required
                                </span>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Right side: features list */}
                    <motion.div 
                        className="px-4 lg:px-0 w-full"
                        variants={containerVariants}
                    >
                        <motion.ul 
                            className="flex flex-col gap-6 list-none justify-center"
                            variants={containerVariants}
                        >
                            <motion.li variants={featureVariants}>
                                <MagicCard 
                                    className="p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
                                    gradientColor="#3b82f6"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0 transition-transform duration-200 hover:scale-110 hover:rotate-3">
                                    <img
                                        src={`${assetsUrl}/assets/icons/exam-icon.svg`}
                                        alt={t('homePage.heroSection.feature1.alt', 'Đề thi chọn lọc')}
                                                className="w-6 h-6 flex-shrink-0"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = "/assets/images/header_logo.png";
                                        }}
                                    />
                                </div>
                                        <div className="flex-1">
                                            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    {t('homePage.heroSection.feature1.title', 'Đề thi chọn lọc từ các chuyên gia')}
                                </h5>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                Curated by education experts with years of experience
                                            </p>
                                        </div>
                                    </div>
                                </MagicCard>
                            </motion.li>
                            
                            <motion.li variants={featureVariants}>
                                <MagicCard 
                                    className="p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
                                    gradientColor="#8b5cf6"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 flex items-center justify-center bg-purple-100 dark:bg-purple-900 rounded-full flex-shrink-0 transition-transform duration-200 hover:scale-110 hover:-rotate-3">
                                    <img
                                        src={`${assetsUrl}/assets/icons/online-test-icon.svg`}
                                        alt={t('homePage.heroSection.feature2.alt', 'Môi trường thi chân thật')}
                                                className="w-6 h-6 flex-shrink-0"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = "/assets/images/header_logo.png";
                                        }}
                                    />
                                </div>
                                        <div className="flex-1">
                                            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    {t('homePage.heroSection.feature2.title', 'Môi trường thi chân thật')}
                                </h5>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                Authentic testing environment that mirrors the real SAT
                                            </p>
                    </div>
                </div>
                                </MagicCard>
                            </motion.li>
                        </motion.ul>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
} 