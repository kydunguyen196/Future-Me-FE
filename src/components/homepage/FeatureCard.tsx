import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn(
      "card border-0 rounded-lg transition-all duration-300 hover:translate-y-[-5px]", 
      "shadow-lg hover:shadow-xl", 
      className
    )}>
      <div className="card-body text-center p-6">
        <div className="icon mb-4" style={{ fontSize: "50px", color: "#0044cc" }}>
          {icon}
        </div>
        <h3 className="text-yellow-300 font-bold mb-2 text-xl">{description}</h3>
        <h5 className="card-title font-semibold text-gray-800 dark:text-gray-200">{title}</h5>
      </div>
    </div>
  );
} 