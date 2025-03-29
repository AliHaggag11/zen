import React from 'react';
import Card from '../../components/ui/Card';

const tips = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Write Regularly",
    content: "Set aside time each day or week for journaling. Consistency helps build the habit and provides better insights over time."
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: "Be Honest",
    content: "Write authentically about your thoughts and feelings. Your journal is a private space for self-reflection without judgment."
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Ask Questions",
    content: "Use prompts like 'How did I feel today?' or 'What am I grateful for?' to guide your writing and deepen your reflections."
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Review Past Entries",
    content: "Periodically look back at your previous journal entries to notice patterns, track growth, and gain insights into your thoughts and behaviors."
  }
];

export default function JournalTips() {
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-6">Tips for Effective Journaling</h2>
      <Card className="p-6">
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="flex">
              <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full mr-4">
                <div className="text-primary">
                  {tip.icon}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-1">{tip.title}</h3>
                <p className="text-foreground/70 text-sm">{tip.content}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 