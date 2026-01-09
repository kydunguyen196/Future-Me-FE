
import { motion, type Variants } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/magic/AnimatedCounter";
import { MagicCard } from "@/components/ui/magic/MagicCard";

interface Stat {
  id: number;
  title: string;
  value: number;
  suffix: string;
  prefix?: string;
  description: string;
  icon: string;
}

export function StatsSection() {
  //@ts-ignore


  const stats: Stat[] = [
    {
      id: 1,
      title: "Active Students",
      value: 10000,
      suffix: "+",
      description: "Students learning with us",
      icon: "👨‍🎓",
    },
    {
      id: 2,
      title: "Tests Completed",
      value: 50000,
      suffix: "+",
      description: "Practice tests taken",
      icon: "📝",
    },
    {
      id: 3,
      title: "Success Rate",
      value: 95,
      suffix: "%",
      description: "Students improve their scores",
      icon: "🎯",
    },
    {
      id: 4,
      title: "Expert Tutors",
      value: 250,
      suffix: "+",
      description: "Professional instructors",
      icon: "👩‍🏫",
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Thousands
            </span>{" "}
            of Students
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Join our community of successful learners and start your journey to SAT success
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div key={stat.id} variants={itemVariants}>
              <MagicCard
                className="text-center h-full"
                gradientColor={
                  index % 4 === 0
                    ? "#3b82f6"
                    : index % 4 === 1
                    ? "#8b5cf6"
                    : index % 4 === 2
                    ? "#06b6d4"
                    : "#10b981"
                }
              >
                <div className="space-y-4">
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="space-y-2">
                    <AnimatedCounter
                      end={stat.value}
                      suffix={stat.suffix}
                      prefix={stat.prefix}
                      className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white block"
                    />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {stat.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </MagicCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 