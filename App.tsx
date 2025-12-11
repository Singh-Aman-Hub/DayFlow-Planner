
import React, { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TimerView from './components/TimerView';
import HistoryView from './components/HistoryView';
import NotesView from './components/NotesView';
import { Plan, AppView, HistoryEntry } from './types';

const STORAGE_KEY_PLAN = 'dayflow_current_plan';
const STORAGE_KEY_HISTORY = 'dayflow_history';
const STORAGE_KEY_VIEW = 'dayflow_view';
const STORAGE_KEY_NOTES = 'dayflow_notes';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('PLANNER');
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [loaded, setLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedPlan = localStorage.getItem(STORAGE_KEY_PLAN);
      const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      const savedView = localStorage.getItem(STORAGE_KEY_VIEW);
      const savedNotes = localStorage.getItem(STORAGE_KEY_NOTES);

      if (savedPlan) {
        setCurrentPlan(JSON.parse(savedPlan));
      }
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      if (savedNotes) {
        setNotes(savedNotes);
      }
      if (savedView === 'TIMER' && savedPlan) {
        // Only restore timer view if there is a plan
        setView('TIMER');
      }
    } catch (e) {
      console.error("Failed to load state", e);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Persistence helpers
  const savePlan = (plan: Plan) => {
    setCurrentPlan(plan);
    localStorage.setItem(STORAGE_KEY_PLAN, JSON.stringify(plan));
  };

  const saveHistory = (newEntry: HistoryEntry) => {
    const updatedHistory = [...history, newEntry];
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updatedHistory));
  };

  const saveNotes = (content: string) => {
    setNotes(content);
    localStorage.setItem(STORAGE_KEY_NOTES, content);
  };

  const changeView = (newView: AppView) => {
    setView(newView);
    localStorage.setItem(STORAGE_KEY_VIEW, newView);
  };

  const handleStart = (plan: Plan) => {
    savePlan(plan);
    
    // Check if this plan ID already exists in history (update it) or is new
    const existingIndex = history.findIndex(h => h.id === plan.id);
    let newHistory = [...history];
    
    if (existingIndex >= 0) {
       newHistory[existingIndex] = plan;
       setHistory(newHistory);
       localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(newHistory));
    } else {
       saveHistory(plan);
    }

    changeView('TIMER');
  };

  const handleUpdatePlan = (updatedPlan: Plan) => {
    savePlan(updatedPlan);
    
    // Also update history entry if it exists
    const existingIndex = history.findIndex(h => h.id === updatedPlan.id);
    if (existingIndex >= 0) {
       const newHistory = [...history];
       newHistory[existingIndex] = updatedPlan;
       setHistory(newHistory);
       localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(newHistory));
    }
  };

  if (!loaded) return null; // Or a loading spinner

  return (
    <div className="h-full bg-darker text-slate-100">
      {view === 'PLANNER' && (
        <TaskForm 
          initialPlan={currentPlan}
          onStart={handleStart}
          onOpenHistory={() => changeView('HISTORY')}
          onOpenNotes={() => changeView('NOTES')}
        />
      )}
      
      {view === 'TIMER' && currentPlan && (
        <TimerView 
          plan={currentPlan}
          onBack={() => changeView('PLANNER')}
          onUpdatePlan={handleUpdatePlan}
        />
      )}

      {/* Fallback if in timer view but no plan exists */}
      {view === 'TIMER' && !currentPlan && (
         <div className="h-full flex items-center justify-center text-slate-400">
            <p>Error: No plan found.</p>
            <button onClick={() => changeView('PLANNER')} className="ml-4 text-primary hover:text-white transition-colors">Go Home</button>
         </div>
      )}

      {view === 'HISTORY' && (
        <HistoryView 
          history={history}
          onBack={() => changeView('PLANNER')}
        />
      )}

      {view === 'NOTES' && (
        <NotesView 
          initialContent={notes}
          onBack={(content) => {
            saveNotes(content);
            changeView('PLANNER');
          }}
        />
      )}
    </div>
  );
};

export default App;
