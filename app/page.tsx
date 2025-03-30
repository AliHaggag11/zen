'use client';

import { useState } from 'react';
import { useTheme } from './lib/themeContext';
import Link from "next/link";
import { MoodLevel, MOOD_DATA } from './lib/types';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const moodLevels = [1, 2, 3, 4, 5];
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  
  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <section className="w-full min-h-[92vh] relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
            className="absolute top-[15%] right-[15%] w-[30rem] h-[30rem] rounded-full bg-primary/10 blur-[100px]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 7, repeat: Infinity, repeatType: "reverse", delay: 1 }}
            className="absolute bottom-[10%] left-[10%] w-[35rem] h-[35rem] rounded-full bg-accent/10 blur-[100px]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.25, scale: 1 }}
            transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", delay: 2 }}
            className="absolute top-[40%] left-[30%] w-[40rem] h-[40rem] rounded-full bg-secondary/10 blur-[100px]"
          />
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px]"></div>
        </div>

        <div className="container mx-auto px-4 pt-32 pb-20 relative z-10 h-full flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="flex flex-col"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full mb-6 font-medium text-sm w-fit"
              >
                Your Personal Mental Wellness Space
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
              >
                Nurture Your Mind with 
                <span className="relative">
                  <span className="relative z-10 ml-3 text-primary">Zen Space</span>
                  <motion.span 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 1 }}
                    className="absolute bottom-2 left-0 h-3 bg-primary/20 rounded-full z-0"
                  ></motion.span>
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xl lg:text-2xl text-foreground/80 mb-10 max-w-xl"
              >
                Track moods, practice mindfulness, and find clarity through AI-guided conversations. Your journey to mental well-being starts here.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap gap-4 mb-12"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    href="/dashboard" 
                    className="bg-primary text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium inline-block relative overflow-hidden group"
                  >
                    <span className="relative z-10">Get Started</span>
                    <motion.span 
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 bg-gradient-to-r from-accent to-primary z-0"
                    ></motion.span>
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    href="/about" 
                    className="border border-primary/20 bg-background/80 backdrop-blur-sm text-foreground px-8 py-3 rounded-xl hover:bg-primary/5 transition-all duration-300 font-medium flex items-center gap-2"
                  >
                    <span>Learn More</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </motion.div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-wrap gap-8 items-center"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 + (i * 0.1) }}
                      className="w-10 h-10 rounded-full border-2 border-background overflow-hidden"
                    >
                      <img 
                        src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${20 + i}.jpg`} 
                        alt="User" 
                        className="w-full h-full object-cover" 
                      />
                    </motion.div>
                  ))}
                </div>
                <div className="text-sm text-foreground/70">
                  <span className="font-semibold text-primary">25,000+</span> people already using Zen Space
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="relative z-10"
            >
              <div className="w-full max-w-md mx-auto bg-background/70 backdrop-blur-lg rounded-2xl p-8 border border-primary/10 shadow-xl">
                <h3 className="text-lg font-medium text-foreground mb-5 text-center">How are you feeling today?</h3>
                
                <div className="flex flex-wrap justify-center gap-5 mb-6">
                  {moodLevels.map((level) => {
                    const moodData = MOOD_DATA[level as MoodLevel];
                    return (
                      <motion.button
                        key={level}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedMood(level)}
                        className={`relative p-5 rounded-xl transition-all duration-300 ${
                          selectedMood === level 
                            ? 'bg-primary/20 border-primary shadow-md' 
                            : 'bg-background hover:bg-primary/10 border-primary/10'
                        } border flex flex-col items-center w-[90px]`}
                      >
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 * level }}
                          className="mb-2"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-9 w-9 text-primary" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            {level === 1 && (
                              <>
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="8" y1="15" x2="16" y2="15"/>
                                <line x1="9" y1="9" x2="9.01" y2="9"/>
                                <line x1="15" y1="9" x2="15.01" y2="9"/>
                              </>
                            )}
                            {level === 2 && (
                              <>
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                                <line x1="9" y1="9" x2="9.01" y2="9"/>
                                <line x1="15" y1="9" x2="15.01" y2="9"/>
                              </>
                            )}
                            {level === 3 && (
                              <>
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M8 14h8"/>
                                <line x1="9" y1="9" x2="9.01" y2="9"/>
                                <line x1="15" y1="9" x2="15.01" y2="9"/>
                              </>
                            )}
                            {level === 4 && (
                              <>
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
                                <line x1="9" y1="9" x2="9.01" y2="9"/>
                                <line x1="15" y1="9" x2="15.01" y2="9"/>
                              </>
                            )}
                            {level === 5 && (
                              <>
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M8 12s2 2 4 2 4-2 4-2"/>
                                <path d="M9 9a1 0.75 0 0 1 1 -0.75"/>
                                <path d="M14 9a1 0.75 0 0 1 1 -0.75"/>
                                <path d="M8 13s1 1 4 1 4-1 4-1"/>
                              </>
                            )}
                          </svg>
                        </motion.div>
                        <span className="text-sm font-medium text-foreground/80">{moodData?.name}</span>
                        
                        {selectedMood === level && (
                          <motion.div
                            layoutId="selectedMood"
                            className="absolute inset-0 border-2 border-primary rounded-xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                
                {selectedMood ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-6"
                  >
                    <button 
                      onClick={() => router.push('/mood-tracker')}
                      className="w-full bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-xl transition-colors duration-300 font-medium flex items-center justify-center gap-2"
                    >
                      <span>Track Your Mood</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 text-center text-foreground/60 text-sm"
                  >
                    Select your current mood to begin
                  </motion.div>
                )}
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.7 }}
                  className="mt-6 pt-5 border-t border-primary/10 text-center text-xs text-foreground/50"
                >
                  Tracking your mood regularly leads to 78% better mental awareness
                </motion.div>
              </div>
              
              {/* Decorative elements */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 0.8, scale: 1, rotate: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute -top-10 -left-16 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-xl blur-xl z-0"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
                animate={{ opacity: 0.6, scale: 1, rotate: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute -bottom-14 -right-10 w-40 h-40 bg-gradient-to-br from-accent/20 to-transparent rounded-xl blur-xl z-0"
              />
            </motion.div>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-6 left-0 w-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="bg-background/70 backdrop-blur-sm p-2 rounded-full shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
            className="absolute top-40 right-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          ></motion.div>
          <motion.div 
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", delay: 1 }}
            className="absolute bottom-40 left-20 w-96 h-96 rounded-full bg-accent/10 blur-3xl"
          ></motion.div>
              </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full mb-4 font-medium text-sm">Key Features</div>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-6"
            >
              Everything You Need for Mental Wellness
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-foreground/80 max-w-3xl mx-auto"
            >
              Our platform combines mood tracking, AI conversations, and mindfulness exercises 
              in one seamless experience.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Mood Tracking",
                description: "Record and visualize your emotional patterns with our enhanced mood tracker. Gain insights into how your mood fluctuates over time.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                color: "from-purple-500/20 to-blue-500/20",
                highlight: true
              },
              {
                title: "AI Conversations",
                description: "Chat with our AI assistant for support, guidance, and reflection. Our AI learns from your interactions to provide personalized advice.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                ),
                color: "from-green-500/20 to-emerald-500/20"
              },
              {
                title: "Mindful Movement",
                description: "Practice mindfulness with guided exercises and videos. Our curated content helps you stay centered and calm throughout your day.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                color: "from-orange-500/20 to-amber-500/20"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`relative bg-background rounded-2xl p-8 shadow-xl border border-primary/10 overflow-hidden ${feature.highlight ? 'md:translate-y-[-20px]' : ''}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-30 z-0"></div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color}`}></div>
                
                <div className="relative z-10">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}
                  >
                    {feature.icon}
                  </motion.div>
                  
                  <motion.h3 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.1 }}
                    viewport={{ once: true }}
                    className="text-xl font-bold text-foreground mb-4"
                  >
                    {feature.title}
                  </motion.h3>
                  
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                    viewport={{ once: true }}
                    className="text-foreground/70"
                  >
                    {feature.description}
                  </motion.p>
                  
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                    viewport={{ once: true }}
                    className="mt-6"
                  >
                    <Link href={`/${feature.title.toLowerCase().replace(' ', '-')}`} className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all duration-300">
                      <span>Learn more</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.5 }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.4 }}
                  viewport={{ once: true }}
                  className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br opacity-10 z-0"
                  style={{
                    background: `radial-gradient(circle, ${index === 0 ? 'rgba(139, 92, 246, 0.3)' : index === 1 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(249, 115, 22, 0.3)'} 0%, transparent 70%)`
                  }}
                />
              </motion.div>
                    ))}
                  </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link 
              href="/features" 
              className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-6 py-3 rounded-xl transition-all duration-300"
            >
              <span>Explore All Features</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full mb-4 font-medium text-sm">Simple Process</div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-6"
            >
              How Zen Space Works
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-foreground/80 max-w-3xl mx-auto"
            >
              Our intuitive platform guides you through a personalized wellness journey in just a few steps.
            </motion.p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            {[
              {
                title: "Track Your Mood",
                description: "Log your emotional state using our enhanced mood tracker. Add context with activities, emotions, and personal notes.",
                icon: (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                color: MOOD_DATA[4].color
              },
              {
                title: "Gain Insights",
                description: "Visualize patterns and trends in your emotional well-being through interactive charts and personalized analytics.",
                icon: (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                ),
                color: MOOD_DATA[3].color
              },
              {
                title: "Practice Mindfulness",
                description: "Engage with our guided mindful movement exercises and meditation sessions to cultivate presence and calm.",
                icon: (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                ),
                color: MOOD_DATA[2].color
              },
              {
                title: "Transform Your Well-being",
                description: "Experience positive changes in your mental wellness through consistent practice and personalized guidance.",
                icon: (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                color: MOOD_DATA[5].color
              }
            ].map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex items-center mb-16 last:mb-0 ${index % 2 !== 0 ? 'flex-row-reverse' : ''}`}
              >
                <div className={`relative w-1/2 px-6 ${index % 2 !== 0 ? 'text-right' : ''}`}>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.2 + 0.3 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center justify-center mb-4"
                  >
                    <motion.span 
                      initial={{ scale: 0.8 }}
                      whileInView={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      viewport={{ once: true }}
                      className="flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg" 
                      style={{ backgroundColor: step.color }}
                    >
                      {step.icon}
                    </motion.span>
                    <span className="ml-4 text-4xl font-bold text-foreground/20">0{index + 1}</span>
                  </motion.div>
                  <motion.h3 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.2 + 0.4 }}
                    viewport={{ once: true }}
                    className="text-2xl font-bold text-foreground mb-3"
                  >
                    {step.title}
                  </motion.h3>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.2 + 0.5 }}
                    viewport={{ once: true }}
                    className="text-foreground/70"
                  >
                    {step.description}
                  </motion.p>
                </div>
                
                <div className="w-1/2 relative">
                  {index < 3 && (
                    <motion.div 
                      initial={{ height: 0 }}
                      whileInView={{ height: '100%' }}
                      transition={{ duration: 0.5, delay: index * 0.2 + 0.6 }}
                      viewport={{ once: true }}
                      className="absolute top-16 bottom-0 left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b"
                      style={{
                        backgroundImage: `linear-gradient(to bottom, ${step.color}, ${(index < 3) ? 
                          [MOOD_DATA[4].color, MOOD_DATA[3].color, MOOD_DATA[2].color, MOOD_DATA[5].color][index + 1] : 
                          'transparent'})`
                      }}
                    />
                  )}
                  
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, delay: index * 0.2 + 0.3 }}
                    viewport={{ once: true }}
                    className={`w-16 h-16 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 flex items-center justify-center z-10 shadow-xl border-4 border-background`}
                    style={{ backgroundColor: step.color }}
                  >
                    <span className="text-white font-bold">{index + 1}</span>
                  </motion.div>
              </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-40 right-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-accent/5 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full mb-4 font-medium text-sm">Real User Experiences</div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">What Our Community Says</h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
              Discover how Zen Space has transformed the emotional well-being of people just like you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah K.",
                role: "Graphic Designer",
                image: "https://randomuser.me/api/portraits/women/32.jpg",
                quote: "The mood tracking has helped me identify patterns I never noticed before. I've been able to make small changes that have dramatically improved my mental well-being.",
                mood: 4
              },
              {
                name: "Michael T.",
                role: "Software Engineer",
                image: "https://randomuser.me/api/portraits/men/22.jpg",
                quote: "As someone who struggles with work-related stress, the mindful movement exercises have been a game-changer. I feel more centered and focused throughout my day.",
                mood: 5
              },
              {
                name: "Aisha J.",
                role: "Healthcare Worker",
                image: "https://randomuser.me/api/portraits/women/44.jpg",
                quote: "The AI conversations feel surprisingly personal and insightful. It's like having a supportive friend available any time I need to process my thoughts.",
                mood: 3
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-background rounded-2xl shadow-lg p-8 border border-primary/10 relative"
              >
                <div 
                  className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 opacity-10"
                  style={{ 
                    background: `radial-gradient(circle, ${MOOD_DATA[testimonial.mood as MoodLevel].color} 0%, transparent 70%)` 
                  }}
                ></div>
                
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-full overflow-hidden mr-4 border-2" style={{ borderColor: MOOD_DATA[testimonial.mood as MoodLevel].color }}>
                    <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-foreground/60">{testimonial.role}</p>
              </div>
                  <div className="ml-auto flex items-center">
                    <span className="mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={MOOD_DATA[testimonial.mood as MoodLevel].color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {testimonial.mood >= 4 ? (
                          // Happy face for 4-5
                          <>
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                            <line x1="9" y1="9" x2="9.01" y2="9" />
                            <line x1="15" y1="9" x2="15.01" y2="9" />
                          </>
                        ) : testimonial.mood === 3 ? (
                          // Neutral face for 3
                          <>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="8" y1="14" x2="16" y2="14" />
                            <line x1="9" y1="9" x2="9.01" y2="9" />
                            <line x1="15" y1="9" x2="15.01" y2="9" />
                          </>
                        ) : (
                          // Thoughtful face for 1-2
                          <>
                            <circle cx="12" cy="12" r="10" />
                            <path d="M10 15.5c1 .667 3 .667 4 0" />
                            <line x1="9" y1="9" x2="9.01" y2="9" />
                            <line x1="15" y1="9" x2="15.01" y2="9" />
                          </>
                        )}
                      </svg>
                    </span>
                    <span className="text-sm font-medium" style={{ color: MOOD_DATA[testimonial.mood as MoodLevel].color }}>
                      {MOOD_DATA[testimonial.mood as MoodLevel].name}
                    </span>
                  </div>
                </div>
                
                <div className="relative">
                  <svg className="absolute -top-3 -left-2 w-8 h-8 text-primary/20" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M10,8V0H6C2.7,0,0,2.7,0,6v4h10z M22,0h-4v8h10V6C28,2.7,25.3,0,22,0z"/>
                </svg>
                  <p className="text-foreground/80 relative z-10 mb-4">{testimonial.quote}</p>
                  <svg className="absolute -bottom-3 -right-2 w-8 h-8 text-primary/20 rotate-180" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M10,8V0H6C2.7,0,0,2.7,0,6v4h10z M22,0h-4v8h10V6C28,2.7,25.3,0,22,0z"/>
                </svg>
              </div>
              
                <div className="flex items-center mt-6 pt-4 border-t border-foreground/10">
                  <div className="text-yellow-400 flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill={i < 5 ? "currentColor" : "none"} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    ))}
              </div>
                  <span className="ml-2 text-xs text-foreground/60">Joined 6 months ago</span>
            </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-background to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full mb-4 font-medium text-sm">Our Impact</div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-6"
            >
              Making a Difference
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-foreground/80 max-w-3xl mx-auto"
            >
              Join thousands who have transformed their mental well-being with Zen Space.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { 
                value: "25,000+", 
                label: "Active Users", 
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )
              },
              { 
                value: "4.9/5", 
                label: "User Rating", 
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                )
              },
              { 
                value: "92%", 
                label: "Report Improvement", 
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                )
              },
              { 
                value: "5M+", 
                label: "Mindful Minutes", 
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
            ].map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                className="text-center p-6 bg-background rounded-2xl shadow-lg border border-primary/10"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 100, delay: index * 0.1 + 0.2 }}
                  viewport={{ once: true }}
                  className="flex justify-center mb-2"
                >
                  {stat.icon}
                </motion.div>
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                  className="text-3xl font-bold text-foreground mb-1"
                >
                  {stat.value}
                </motion.div>
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
                  viewport={{ once: true }}
                  className="text-sm text-foreground/60"
                >
                  {stat.label}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
            className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          ></motion.div>
          <motion.div 
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", delay: 1 }}
            className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-accent/10 blur-3xl"
          ></motion.div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-background rounded-3xl p-10 md:p-16 shadow-xl border border-primary/10">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  <circle cx="12" cy="2" r="1" />
                </svg>
              </motion.div>
              
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-foreground mb-6"
              >
                Begin Your Path to Inner Peace
              </motion.h2>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-xl text-foreground/80 mb-8"
              >
                Join thousands who have discovered the power of mindful technology in nurturing mental well-being.
              </motion.p>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="mb-10 flex flex-wrap justify-center gap-4"
              >
                <div className="text-center px-6 py-3 border border-primary/20 rounded-xl">
                  <span className="block text-primary font-bold">Free Access</span>
                  <span className="text-sm text-foreground/60">No credit card required</span>
                </div>
                
                <div className="text-center px-6 py-3 border border-primary/20 rounded-xl">
                  <span className="block text-primary font-bold">Personal Dashboard</span>
                  <span className="text-sm text-foreground/60">Track your progress</span>
                </div>
                
                <div className="text-center px-6 py-3 border border-primary/20 rounded-xl">
                  <span className="block text-primary font-bold">AI Insights</span>
                  <span className="text-sm text-foreground/60">Personalized guidance</span>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
              <Link 
                href="/register" 
                  className="bg-primary text-white px-10 py-4 rounded-xl text-center shadow-lg font-medium inline-block relative overflow-hidden group"
                >
                  <span className="relative z-10">Create Your Free Account</span>
                  <motion.span 
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-gradient-to-r from-accent to-primary z-0"
                  ></motion.span>
              </Link>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                viewport={{ once: true }}
                className="mt-6 text-sm text-foreground/60"
              >
                Join 25,000+ members already experiencing better mental well-being
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-8 border-t border-primary/10">
        <div className="container mx-auto px-4 text-center text-foreground/70">
            <p>© {new Date().getFullYear()} Zen Space. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

