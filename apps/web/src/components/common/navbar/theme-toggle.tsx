import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle({
  iconColor,
  onThemeToggle,
  isDarkMode,
}: {
  iconColor: string;
  onThemeToggle: () => void;
  isDarkMode: boolean;
}) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={`inline-flex cursor-pointer transition-colors ${iconColor}`}
        onClick={onThemeToggle}
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    </>
  );
}
