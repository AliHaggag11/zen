'use client';

import { useState } from 'react';
import { useTheme } from './lib/themeContext';
import Link from "next/link";
import MoodTracker from './components/ui/MoodTracker';

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const { setThemeBasedOnMood } = useTheme();
  
  const handleMoodSelected = (moodLevel: number) => {
    setSelectedMood(moodLevel);
    setThemeBasedOnMood(moodLevel);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        {/* Abstract decorative elements with theme-sensitive colors */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute top-40 right-20 w-80 h-80 rounded-full bg-secondary/20 blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-96 h-96 rounded-full bg-accent/10 blur-3xl"></div>
          
          {/* Animated subtle floating circles */}
          <div className="absolute top-1/4 left-1/4 w-10 h-10 rounded-full bg-primary/20 animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-6 h-6 rounded-full bg-accent/20 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-8 h-8 rounded-full bg-secondary/20 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between relative z-1">
          <div className="md:w-1/2 mb-16 md:mb-0 md:pr-8">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full mb-6 font-medium text-sm">Your Mental Wellness Journey Starts Here</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Inner Peace</span> with AI-Guided Support
            </h1>
            <p className="text-xl text-foreground/80 mb-10 leading-relaxed">
              Zen Space combines advanced AI technology with evidence-based practices to provide personalized mental wellness support when you need it most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/register" 
                className="bg-primary text-white px-8 py-4 rounded-xl text-center hover:bg-primary/90 transition shadow-md hover:shadow-xl transform hover:-translate-y-1 font-medium"
              >
                Begin Your Journey
              </Link>
              <Link 
                href="/about" 
                className="bg-background text-foreground border border-foreground/20 px-8 py-4 rounded-xl text-center hover:bg-primary/5 transition shadow-sm hover:shadow-md font-medium"
              >
                Learn More
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-10 flex items-center space-x-6">
              <div className="flex items-center">
                <div className="text-yellow-400 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm text-foreground/70">4.9/5 from 2,300+ users</span>
              </div>
              <div className="h-8 border-l border-foreground/20"></div>
              <div className="text-foreground/70 text-sm">Trusted by 25,000+ members</div>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Decorative layers */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-lg transform rotate-6"></div>
              <div className="absolute inset-0 bg-background rounded-3xl shadow-xl transform -rotate-3"></div>
              
              {/* Main content area */}
              <div className="relative bg-background overflow-hidden rounded-2xl shadow-lg border border-primary/10 p-6">
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-5 mb-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-foreground">Zen Assistant</h3>
                      <p className="text-xs text-foreground/50">Always here to help</p>
                    </div>
                  </div>
                  <div className="bg-background rounded-lg p-3 shadow-sm mb-3">
                    <p className="text-foreground/70 text-sm">How are you feeling today? I'm here to listen and provide support.</p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-3 shadow-sm text-right">
                    <p className="text-primary text-sm">I've been feeling a bit anxious about my upcoming presentation.</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Your Mood Tracker</h4>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className={`h-12 rounded-md ${
                        i < 3 ? 'bg-primary/10' : 
                        i < 5 ? 'bg-primary/20' : 
                        'bg-primary/30'
                      }`}></div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-foreground/50">
                    <span>Monday</span>
                    <span>Sunday</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background/50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full mb-4 font-medium text-sm">Comprehensive Support</div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Nurture Your Mental Well-being</h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
              Our thoughtfully designed tools and resources support your journey to better mental health and emotional balance.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="group bg-background p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] border border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-md relative z-10">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-3">AI Conversations</h3>
              <p className="text-foreground/70 leading-relaxed mb-6">
                Engage in meaningful dialogue with our AI assistant, designed to provide empathetic support and guidance whenever you need it.
              </p>
              
              <div className="pt-4 border-t border-primary/10">
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-foreground/70">
                    <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Available 24/7 for support
                  </li>
                  <li className="flex items-center text-sm text-foreground/70">
                    <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Personalized to your needs
                  </li>
                  <li className="flex items-center text-sm text-foreground/70">
                    <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Evidence-based techniques
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="group bg-background p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] border border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6 shadow-md relative z-10">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-3">Mood Tracking</h3>
              <p className="text-foreground/70 leading-relaxed mb-6">
                Monitor your emotional patterns with our intuitive tracking tools, gaining insights to help you build awareness and resilience.
              </p>
              
              <div className="pt-4 border-t border-primary/10">
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-foreground/70">
                    <svg className="w-5 h-5 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Visual trend analysis
                  </li>
                  <li className="flex items-center text-sm text-foreground/70">
                    <svg className="w-5 h-5 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Customizable journaling
                  </li>
                  <li className="flex items-center text-sm text-foreground/70">
                    <svg className="w-5 h-5 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Pattern recognition
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="group bg-background p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] border border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/20 to-accent/10 rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6 shadow-md relative z-10">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-3">Community Connection</h3>
              <p className="text-foreground/70 leading-relaxed mb-6">
                Join a supportive community of like-minded individuals sharing experiences and insights on the path to emotional well-being.
              </p>
              
              <div className="pt-4 border-t border-primary/10">
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-foreground/70">
                    <svg className="w-5 h-5 mr-2 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Moderated safe spaces
                  </li>
                  <li className="flex items-center text-sm text-foreground/70">
                    <svg className="w-5 h-5 mr-2 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Group support sessions
                  </li>
                  <li className="flex items-center text-sm text-foreground/70">
                    <svg className="w-5 h-5 mr-2 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Peer-to-peer connections
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Mood-Based Design */}
      <section className="py-16 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full mb-4 font-medium text-sm">Interactive Experience</div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Experience Mood-Based Design</h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
              Our interface adapts to your emotional state, providing a personalized experience that responds to your needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <MoodTracker 
              className="h-full"
              onMoodSelected={handleMoodSelected}
            />
            
            <div className="bg-background rounded-lg shadow p-8 flex flex-col justify-center border border-primary/10">
              <h3 className="text-2xl font-bold text-foreground mb-4">Try It Now</h3>
              <p className="text-foreground/80 mb-6">
                Select different mood levels in the tracker to see how our interface adapts to your emotional state. 
                Colors, tones, and interactions shift to create an environment that resonates with how you feel.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
              </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-foreground">Emotional Resonance</h4>
                    <p className="text-foreground/70">Our color schemes adapt to match and complement your current emotional state</p>
            </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
              </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-foreground">Visual Comfort</h4>
                    <p className="text-foreground/70">Experience an interface designed to support your emotional journey</p>
            </div>
                </li>
              </ul>
              <div className="mt-8">
            <Link 
                  href="/dashboard" 
                  className="inline-flex items-center text-primary font-medium hover:underline"
            >
                  View full dashboard experience
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-background relative overflow-hidden">        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-10 md:p-16 shadow-xl border border-primary/10">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Begin Your Path to Inner Peace</h2>
              <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
                Join thousands who have discovered the power of mindful technology in nurturing mental well-being.
              </p>
              
              <div className="mb-10 grid grid-cols-3 gap-6 max-w-lg mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">25k+</div>
                  <div className="text-sm text-foreground/60">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-1">4.9</div>
                  <div className="text-sm text-foreground/60">User Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-1">92%</div>
                  <div className="text-sm text-foreground/60">Success Rate</div>
                </div>
              </div>
              
              <Link 
                href="/register" 
                className="bg-primary text-white px-10 py-4 rounded-xl text-center hover:bg-primary/90 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium inline-block"
              >
                Start Free Today
              </Link>
              
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center text-sm text-foreground/60 space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  No credit card required
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Secure and private
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Cancel anytime
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary/5 py-8 border-t border-primary/10">
        <div className="container mx-auto px-4 text-center text-foreground/70">
            <p>© {new Date().getFullYear()} Zen Space. All rights reserved.</p>
          <p className="mt-2">Designed for mental well-being</p>
        </div>
      </footer>
    </div>
  );
}

