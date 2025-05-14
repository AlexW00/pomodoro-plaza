import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { TimerProvider } from '@/contexts/TimerContext';
import { Dashboard } from '@/components/dashboard/Dashboard';

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <TimerProvider>
        <div className="min-h-screen w-full bg-[#f5f5f5] p-4 md:p-6">
          <Dashboard />
          <Toaster />
        </div>
      </TimerProvider>
    </ThemeProvider>
  );
}

export default App;