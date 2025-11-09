import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  className?: string;
}

export function AchievementBadge({
  icon,
  title,
  description,
  unlocked,
  className,
}: AchievementBadgeProps) {
  return (
    <Card
      className={cn(
        "p-4 transition-all duration-300",
        unlocked
          ? "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20"
          : "bg-muted/50 opacity-60 grayscale",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm">{title}</h4>
            {unlocked && (
              <Badge variant="secondary" className="text-xs">
                Unlocked
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
}
