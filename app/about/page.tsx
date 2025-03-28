'use client';

import { useTheme } from '../lib/themeContext';
import Link from 'next/link';

export default function About() {
  const { currentTheme } = useTheme();

  return (
    <main className="min-h-screen bg-background">
      <section className="py-20 md:py-28 relative overflow-hidden">
        {/* Abstract decorative elements with theme-sensitive colors */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute top-40 right-20 w-80 h-80 rounded-full bg-secondary/20 blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-96 h-96 rounded-full bg-accent/10 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-1">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full mb-6 font-medium text-sm">About Zen Space</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Emotional <span className="text-primary">Intelligence</span> in Design
            </h1>
            <p className="text-xl text-foreground/80 mb-10 leading-relaxed">
              Learn about our approach to mental wellness through mood-sensitive design and AI assistance.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-background rounded-lg shadow-lg p-8 mb-12 border border-primary/10">
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Mood-Based Theme System</h2>
              <p className="text-foreground/80 mb-6 leading-relaxed">
                At Zen Space, we believe that digital environments should adapt to your emotional state, not the other way around. 
                That's why we've developed a unique mood-based theme system that responds to how you're feeling.
              </p>
              <p className="text-foreground/80 mb-6 leading-relaxed">
                Our interface uses color psychology and design principles to create visual environments that complement different emotional states:
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white mt-1">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-foreground">Reflective (Sad)</h4>
                    <p className="text-foreground/70">Gentle, muted colors that provide a calm, non-stimulating environment when you're feeling low</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white mt-1">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-foreground">Calm</h4>
                    <p className="text-foreground/70">Soothing blues and gentle contrasts to maintain a relaxed state</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white mt-1">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-foreground">Neutral</h4>
                    <p className="text-foreground/70">Balanced teal tones for an emotionally steady experience</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white mt-1">
                    <span className="text-xs font-bold">4</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-foreground">Happy</h4>
                    <p className="text-foreground/70">Warm amber hues that enhance and sustain positive feelings</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white mt-1">
                    <span className="text-xs font-bold">5</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-foreground">Energetic</h4>
                    <p className="text-foreground/70">Vibrant pink tones that celebrate and channel your enthusiasm</p>
                  </div>
                </li>
              </ul>
              <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-foreground/90 italic">
                  Currently experiencing: <strong className="text-primary">{currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} Theme</strong>
                </p>
              </div>
            </div>
            
            <div className="text-center mb-16">
              <Link 
                href="/dashboard" 
                className="bg-primary text-white px-8 py-4 rounded-xl text-center hover:bg-primary/90 transition shadow-md hover:shadow-xl transform hover:-translate-y-1 font-medium"
              >
                Try the Mood Theme Experience
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="bg-primary/5 py-8 border-t border-primary/10">
        <div className="container mx-auto px-4 text-center text-foreground/70">
          <p>© {new Date().getFullYear()} Zen Space. All rights reserved.</p>
          <p className="mt-2">Designed for mental well-being</p>
        </div>
      </footer>
    </main>
  );
} 