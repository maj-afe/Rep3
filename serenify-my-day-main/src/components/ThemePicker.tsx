import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ThemePreset {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "default",
    name: "Lavender Bliss",
    colors: {
      primary: "280 40% 70%",
      secondary: "340 100% 92%",
      accent: "190 60% 80%",
    },
  },
  {
    id: "lavender",
    name: "Lavender Dream",
    colors: {
      primary: "270 60% 70%",
      secondary: "270 40% 95%",
      accent: "280 50% 85%",
    },
  },
  {
    id: "ocean",
    name: "Ocean Breeze",
    colors: {
      primary: "195 80% 50%",
      secondary: "195 60% 95%",
      accent: "185 70% 80%",
    },
  },
  {
    id: "forest",
    name: "Forest Calm",
    colors: {
      primary: "140 60% 45%",
      secondary: "140 40% 95%",
      accent: "150 50% 80%",
    },
  },
  {
    id: "sunset",
    name: "Sunset Glow",
    colors: {
      primary: "20 90% 60%",
      secondary: "20 60% 95%",
      accent: "30 80% 75%",
    },
  },
];

interface ThemePickerProps {
  currentTheme: string;
  onSelectTheme: (themeId: string) => void;
}

export function ThemePicker({ currentTheme, onSelectTheme }: ThemePickerProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {THEME_PRESETS.map((preset) => (
        <Card
          key={preset.id}
          className={cn(
            "p-4 cursor-pointer transition-all hover:scale-105",
            currentTheme === preset.id && "ring-2 ring-primary"
          )}
          onClick={() => onSelectTheme(preset.id)}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">{preset.name}</span>
            {currentTheme === preset.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="flex gap-2">
            <div
              className="h-8 flex-1 rounded"
              style={{ backgroundColor: `hsl(${preset.colors.primary})` }}
            />
            <div
              className="h-8 flex-1 rounded"
              style={{ backgroundColor: `hsl(${preset.colors.secondary})` }}
            />
            <div
              className="h-8 flex-1 rounded"
              style={{ backgroundColor: `hsl(${preset.colors.accent})` }}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
