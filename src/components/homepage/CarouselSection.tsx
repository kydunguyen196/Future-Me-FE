import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import "./carousel.css";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BoxReveal } from "@/components/ui/magic/BoxReveal";
import { motion, AnimatePresence } from "framer-motion";

export function CarouselSection() {
  const { t } = useTranslation();
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideKey, setSlideKey] = useState(0); // Key to trigger BoxReveal animations

  const defaultItems = [
    {
      title: "Sẵn Sàng Nâng Cao Điểm SAT?",
      description: "Thực hành ngay hôm nay và theo dõi sự tiến bộ của bạn!"
    },
    {
      title: "Luyện Tập Mỗi Ngày",
      description: "Nâng cao kỹ năng và đạt điểm số mục tiêu của bạn"
    },
    {
      title: "Theo Dõi Tiến Độ",
      description: "Xem sự phát triển và đạt được mục tiêu học tập"
    }
  ];

  const translatedItems = t("homePage.carousel", { returnObjects: true }) as any;
  const carouselItems = Array.isArray(translatedItems) && translatedItems.length > 0 
    ? translatedItems 
    : defaultItems;

  const assetsUrl = import.meta.env.VITE_ASSETS_URL || '';
  
  // Enhanced image preloading
  useEffect(() => {
    const imageUrls = carouselItems.map((_, index) => 
      `${assetsUrl}/assets/images/homepage/bg-${index + 1}.jpg`
    );
    
    let loadedCount = 0;
    const totalImages = imageUrls.length;
    
    const imagePromises = imageUrls.map(url => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load image: ${url}`);
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
          resolve();
        };
        img.src = url;
      });
    });
    
    Promise.all(imagePromises).catch(console.error);
  }, [assetsUrl, carouselItems]);

  // Auto-slide functionality with animation reset
  useEffect(() => {
    if (!imagesLoaded) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        const newSlide = (prev + 1) % carouselItems.length;
        setSlideKey(prevKey => prevKey + 1); // Trigger new BoxReveal animations
        return newSlide;
      });
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [carouselItems.length, imagesLoaded]);

  // Loading skeleton
  if (!imagesLoaded) {
    return (
      <div className="carousel-container-full-width">
        <div className="carousel-loading">
          <Skeleton className="w-full h-[600px] rounded-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="carousel-container-full-width">
      <div className="custom-carousel">
        {/* Carousel slides */}
        <div className="carousel-slides">
          {carouselItems.map((item, index) => {
            const imageUrl = `${assetsUrl}/assets/images/homepage/bg-${index + 1}.jpg`;
            const isActive = index === currentSlide;
            
            return (
              <div
                key={index}
                className={`carousel-slide ${isActive ? 'active' : ''}`}
              >
                <div className="carousel-slide-inner-full">
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="carousel-image-full"
                  />
                  
                  {/* Enhanced overlay with gradient and blur effects */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute inset-0 backdrop-blur-[0.5px]" />
                  
                  <div className="carousel-content-full">
                    <div className="carousel-content-inner relative z-10">
                      <AnimatePresence mode="wait">
                        {isActive && (
                          <motion.div
                            key={`${index}-${slideKey}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                          >
                            {/* Title with BoxReveal */}
                            <BoxReveal
                              boxColor="#3b82f6"
                              duration={0.8}
                              delay={0.2}
                              className="mb-4"
                            >
                              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                                {item.title}
                              </h2>
                            </BoxReveal>

                            {/* Description with BoxReveal */}
                            <BoxReveal
                              boxColor="#8b5cf6"
                              duration={0.6}
                              delay={1.2}
                              className="mb-6"
                            >
                              <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl">
                                {item.description}
                              </p>
                            </BoxReveal>

                            {/* Button with smooth transition and hover effects */}
                            <motion.div
                              initial={{ opacity: 0, y: 20, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ 
                                delay: 2.0, 
                                duration: 0.8,
                                type: "spring",
                                bounce: 0.4
                              }}
                              className="inline-block"
                            >
                              <div className="button-experience">
                                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-blue-500/30">
                                  {t("homePage.carouselButton")}
                                </Button>
                              </div>
                            </motion.div>

                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}