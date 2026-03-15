"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <CardTitle className="text-base">Appearance</CardTitle>
        </div>
        <CardDescription>Choose how SyncroMind AI looks for you.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3" role="radiogroup" aria-label="Theme preference">
          {themes.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant="outline"
              role="radio"
              aria-checked={theme === value}
              onClick={() => setTheme(value)}
              className={cn(
                "flex-1 flex-col h-auto py-4 gap-2",
                theme === value && "border-primary bg-primary/5"
              )}
              aria-label={`${label} theme`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
