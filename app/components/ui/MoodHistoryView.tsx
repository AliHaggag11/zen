'use client';

import { useState } from 'react';
import { cn } from '@/app/lib/utils';
import { MOOD_DATA, MoodEntry, MoodLevel } from '@/app/lib/types';
import { motion } from 'framer-motion';

interface MoodHistoryViewProps {
  entries: MoodEntry[];
  className?: string;
  isLoading?: boolean;
  viewType?: 'calendar' | 'chart' | 'list';
  onEntryClick?: (entry: MoodEntry) => void;
}

export default function MoodHistoryView({
  entries,
  className,
  isLoading = false,
  viewType = 'calendar',
  onEntryClick
}: MoodHistoryViewProps) {
  const [selectedView, setSelectedView] = useState<'calendar' | 'chart' | 'list'>(viewType);
  
  // Format date for display
  const formatDate = (dateString: string, format: 'short' | 'medium' | 'long' = 'medium') => {
    const date = new Date(dateString);
    if (format === 'short') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (format === 'medium') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };
  
  // Group entries by date for calendar view
  const groupEntriesByDate = () => {
    const grouped: Record<string, MoodEntry[]> = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.created_at);
      const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(entry);
    });
    
    return grouped;
  };
  
  // Calculate average mood for a group of entries
  const getAverageMood = (entries: MoodEntry[]): MoodLevel => {
    if (entries.length === 0) return 3;
    
    const sum = entries.reduce((acc, entry) => acc + entry.mood_level, 0);
    const avg = Math.round(sum / entries.length);
    return avg as MoodLevel;
  };
  
  // Get recent entries for calendar view (last 7 days)
  const getRecentDays = () => {
    const days = [];
    const groupedEntries = groupEntriesByDate();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      
      days.push({
        date,
        entries: groupedEntries[dateKey] || [],
        averageMood: groupedEntries[dateKey] ? getAverageMood(groupedEntries[dateKey]) : null
      });
    }
    
    return days;
  };
  
  // Empty state renderer
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">No mood data yet</h3>
      <p className="text-foreground/70 max-w-sm mx-auto">
        Start tracking your mood daily to see patterns and insights here. Your emotional journey begins with a single entry.
      </p>
    </div>
  );
  
  // Loading state renderer
  const renderLoadingState = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
  
  // Calendar view renderer
  const renderCalendarView = () => {
    const recentDays = getRecentDays();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-7 gap-3 mb-4">
          {recentDays.map((day, index) => {
            const hasEntry = day.entries.length > 0;
            const moodData = hasEntry ? MOOD_DATA[day.averageMood as MoodLevel] : null;
            
            return (
              <div key={index} className="flex flex-col items-center group">
                <span className="text-xs font-medium text-foreground/60 mb-2">
                  {formatDate(day.date.toISOString(), 'short')}
                </span>
                
                <div 
                  className={cn(
                    "w-full h-32 rounded-lg relative overflow-hidden transition-all duration-300 border",
                    hasEntry 
                      ? "cursor-pointer hover:shadow-md" 
                      : "bg-foreground/5 border-foreground/10"
                  )}
                  style={hasEntry ? { background: moodData?.lightColor } : {}}
                  onClick={() => hasEntry && day.entries.length === 1 && onEntryClick && onEntryClick(day.entries[0])}
                >
                  {hasEntry && (
                    <>
                      <div
                        className="absolute bottom-0 left-0 right-0 transition-all duration-300"
                        style={{
                          height: `${(day.averageMood as number / 5) * 100}%`,
                          backgroundColor: moodData?.color
                        }}
                      ></div>
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl z-10">{moodData?.emoji}</span>
                        {day.entries.length > 1 && (
                          <span className="text-xs font-medium text-white bg-foreground/40 rounded-full px-2 py-0.5 mt-1 backdrop-blur-sm">
                            {day.entries.length} entries
                          </span>
                        )}
                      </div>
                    </>
                  )}
                  
                  {!hasEntry && (
                    <div className="absolute inset-0 flex items-center justify-center text-foreground/30">
                      <span className="text-xs">No data</span>
                    </div>
                  )}
                </div>
                
                <span className="text-xs text-foreground/60 mt-2">
                  {formatDate(day.date.toISOString(), 'medium')}
                </span>
              </div>
            );
          })}
        </div>
        
        <p className="text-foreground/70 text-sm">
          {entries.length > 0 
            ? `Your mood has been tracked for the past ${entries.length} day${entries.length !== 1 ? 's' : ''}. Keep logging daily to see more insights.`
            : 'Start tracking your mood daily to see your emotional patterns over time.'}
        </p>
      </div>
    );
  };
  
  // Chart view renderer
  const renderChartView = () => {
    // Get the last 30 entries (or fewer if we don't have 30)
    const recentEntries = [...entries].slice(0, 30).reverse();
    
    return (
      <div className="space-y-6">
        <div className="h-64 flex items-end justify-between">
          {recentEntries.map((entry, index) => {
            const moodData = MOOD_DATA[entry.mood_level];
            const height = `${(entry.mood_level / 5) * 100}%`;
            
            return (
              <div 
                key={index} 
                className="flex-1 flex flex-col items-center group"
                onClick={() => onEntryClick && onEntryClick(entry)}
              >
                <div 
                  className="w-full rounded-t-lg cursor-pointer transition-all hover:opacity-80"
                  style={{ 
                    height, 
                    backgroundColor: moodData.color,
                    maxWidth: '30px'
                  }}
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-foreground/90 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {formatDate(entry.created_at, 'long')}
                  </div>
                </div>
                {index % 5 === 0 && (
                  <span className="text-[10px] text-foreground/50 mt-1 rotate-90 origin-left translate-y-6 absolute bottom-0">
                    {formatDate(entry.created_at, 'medium')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between items-center pt-6 border-t border-foreground/10">
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-foreground/70">Average Mood</span>
            <span className="text-lg font-bold text-foreground/90">
              {entries.length > 0 
                ? (entries.reduce((acc, entry) => acc + entry.mood_level, 0) / entries.length).toFixed(1)
                : '-'}
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-foreground/70">Total Entries</span>
            <span className="text-lg font-bold text-foreground/90">{entries.length}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-foreground/70">Most Common</span>
            {entries.length > 0 ? (
              <div className="flex items-center">
                <span className="text-lg mr-1">
                  {(() => {
                    // Get most common mood
                    const counts: Record<number, number> = {};
                    entries.forEach(entry => {
                      counts[entry.mood_level] = (counts[entry.mood_level] || 0) + 1;
                    });
                    
                    const mostCommonMood = Object.entries(counts)
                      .sort((a, b) => b[1] - a[1])
                      .map(entry => parseInt(entry[0]))[0] as MoodLevel;
                      
                    return MOOD_DATA[mostCommonMood].emoji;
                  })()}
                </span>
                <span className="text-sm font-bold text-foreground/90">
                  {(() => {
                    // Get most common mood
                    const counts: Record<number, number> = {};
                    entries.forEach(entry => {
                      counts[entry.mood_level] = (counts[entry.mood_level] || 0) + 1;
                    });
                    
                    const mostCommonMood = Object.entries(counts)
                      .sort((a, b) => b[1] - a[1])
                      .map(entry => parseInt(entry[0]))[0] as MoodLevel;
                      
                    return MOOD_DATA[mostCommonMood].name;
                  })()}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-foreground/90">-</span>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // List view renderer
  const renderListView = () => {
    return (
      <div className="space-y-4">
        {entries.slice(0, 10).map((entry, index) => {
          const moodData = MOOD_DATA[entry.mood_level];
          
          return (
            <motion.div 
              key={entry.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 border border-foreground/10 rounded-lg bg-background hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => onEntryClick && onEntryClick(entry)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xl mr-2">{moodData.emoji}</span>
                  <span className="font-medium" style={{ color: moodData.color }}>{moodData.name}</span>
                </div>
                <span className="text-xs text-foreground/60">{formatDate(entry.created_at, 'long')}</span>
              </div>
              
              {entry.notes && (
                <p className="text-sm text-foreground/80 line-clamp-2 mb-2">
                  {entry.notes}
                </p>
              )}
              
              <div className="flex flex-wrap gap-1">
                {entry.activities && entry.activities.length > 0 && entry.activities.map((activity, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                    {activity}
                  </span>
                ))}
                
                {entry.tags && entry.tags.length > 0 && entry.tags.map((tag, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-foreground/10 text-foreground/80 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
        
        {entries.length > 10 && (
          <div className="text-center pt-2">
            <span className="text-sm text-primary cursor-pointer hover:underline">
              View all {entries.length} entries
            </span>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={cn("bg-background rounded-lg p-6 border border-primary/10", className)}>
      {/* View selector */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium text-foreground">Mood History</h3>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setSelectedView('calendar')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              selectedView === 'calendar'
                ? "bg-primary text-white"
                : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
            )}
          >
            Calendar
          </button>
          
          <button 
            onClick={() => setSelectedView('chart')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              selectedView === 'chart'
                ? "bg-primary text-white"
                : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
            )}
          >
            Chart
          </button>
          
          <button 
            onClick={() => setSelectedView('list')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              selectedView === 'list'
                ? "bg-primary text-white"
                : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
            )}
          >
            List
          </button>
        </div>
      </div>
      
      {isLoading ? (
        renderLoadingState()
      ) : entries.length === 0 ? (
        renderEmptyState()
      ) : (
        <div>
          {selectedView === 'calendar' && renderCalendarView()}
          {selectedView === 'chart' && renderChartView()}
          {selectedView === 'list' && renderListView()}
        </div>
      )}
    </div>
  );
} 