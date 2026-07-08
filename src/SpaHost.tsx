import { useEffect, useState } from "react";

/**
 * Client-only host for the react-router-dom SPA.
 * TanStack Start handles SSR shell; the entire app routing happens here.
 */
export function SpaHost() {
  const [App, setApp] = useState<React.ComponentType | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing...");

  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout;
    let currentProgress = 0;

    // Simulate progressive loading with realistic steps
    const startLoading = async () => {
      // Status messages for different phases
      const statusMessages = [
        { progress: 10, text: "Starting application..." },
        { progress: 25, text: "Loading modules..." },
        { progress: 40, text: "Connecting to services..." },
        { progress: 55, text: "Initializing components..." },
        { progress: 70, text: "Building UI..." },
        { progress: 85, text: "Finalizing setup..." },
        { progress: 95, text: "Almost ready..." },
        { progress: 100, text: "Ready!" },
      ];

      // Update progress incrementally
      interval = setInterval(() => {
        if (!mounted) return;
        
        currentProgress += Math.floor(Math.random() * 3) + 1;
        if (currentProgress > 95) {
          currentProgress = 95; // Cap at 95 until actual load completes
        }
        setProgress(currentProgress);

        // Update status text based on progress
        const currentStatus = statusMessages.reduce((prev, curr) => {
          if (curr.progress <= currentProgress) return curr;
          return prev;
        }, statusMessages[0]);
        
        if (currentStatus) {
          setStatusText(currentStatus.text);
        }
      }, 120);

      // Actually load the app
      try {
        const module = await import("./App");
        if (mounted) {
          setProgress(100);
          setStatusText("Ready!");
          // Small delay to show 100% before rendering
          setTimeout(() => {
            if (mounted) setApp(() => module.default);
          }, 400);
        }
      } catch (error) {
        console.error("Failed to load app:", error);
        if (mounted) {
          setStatusText("Error loading application");
          setProgress(0);
        }
      }
    };

    startLoading();

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, []);

  if (!App) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-800">
        <div className="w-full max-w-md px-6">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-brand/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>

          {/* Progress Container */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-xl p-8 border border-stone-200 dark:border-stone-700">
            {/* Status Text */}
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
                {statusText}
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                {progress}% complete
              </p>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="overflow-hidden h-3 rounded-full bg-stone-100 dark:bg-stone-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand/70 to-brand transition-all duration-300 ease-out"
                  style={{ 
                    width: `${progress}%`,
                    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </div>
              
              {/* Progress Percentage Label */}
              <div className="absolute -top-6 right-0 text-xs font-mono font-bold text-brand dark:text-brand-light">
                {progress}%
              </div>
            </div>

            {/* Loading Dots Animation */}
            <div className="flex justify-center mt-6 gap-1">
              {[0, 0.2, 0.4].map((delay, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-brand/40"
                  style={{
                    animation: 'pulse-dot 1.4s ease-in-out infinite',
                    animationDelay: `${delay}s`
                  }}
                />
              ))}
            </div>

            {/* Tip/Message */}
            <div className="mt-4 text-center">
              <p className="text-xs text-stone-400 dark:text-stone-500">
                {progress < 30 && "Preparing your workspace..."}
                {progress >= 30 && progress < 60 && "Loading your data..."}
                {progress >= 60 && progress < 90 && "Almost there..."}
                {progress >= 90 && "Finalizing..."}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-stone-400 dark:text-stone-500">
              BELMON BILINGUAL HIGH SCHOOL
            </p>
          </div>
        </div>

        {/* Keyframe Animation */}
        <style>{`
          @keyframes pulse-dot {
            0%, 80%, 100% {
              opacity: 0.3;
              transform: scale(0.8);
            }
            40% {
              opacity: 1;
              transform: scale(1.2);
            }
          }
        `}</style>
      </div>
    );
  }

  return <App />;
}