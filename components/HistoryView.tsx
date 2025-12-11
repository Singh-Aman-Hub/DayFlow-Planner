import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, ChevronRight } from 'lucide-react';
import { Plan, HistoryEntry } from '../types';
import { toMinutes, formatMinutesToTime } from '../utils/time';

interface HistoryViewProps {
  history: HistoryEntry[];
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onBack }) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  if (selectedPlan) {
    return (
      <div className="h-full flex flex-col p-4 md:p-8 bg-darker">
        <button 
          onClick={() => setSelectedPlan(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 self-start font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </button>
        
        <div className="bg-card rounded-2xl shadow-lg border border-slate-800 overflow-hidden flex-1 flex flex-col max-w-3xl mx-auto w-full">
            <div className="bg-slate-900/50 p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-1">
                    {new Date(selectedPlan.savedAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h2>
                <p className="text-slate-400 flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    Saved at {new Date(selectedPlan.savedAt).toLocaleTimeString()}
                </p>
            </div>
            
            <div className="overflow-y-auto p-0">
                {selectedPlan.tasks.map((task, idx) => (
                    <div key={task.id} className="flex items-center p-4 md:p-6 border-b border-slate-700/50 last:border-none hover:bg-slate-800/50 transition-colors">
                        <div className="w-32 flex-shrink-0">
                            <div className="text-sm font-bold text-white">{formatMinutesToTime(toMinutes(task.start))}</div>
                            <div className="text-xs text-slate-500 font-medium">{formatMinutesToTime(toMinutes(task.end))}</div>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-slate-200 text-lg">{task.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full bg-darker">
      <div className="flex items-center justify-between mb-8">
        <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white font-medium transition-colors"
        >
            <ArrowLeft className="w-4 h-4" />
            Back to Planner
        </button>
        <h1 className="text-2xl font-bold text-white">History</h1>
      </div>

      {history.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
              <Calendar className="w-16 h-16 mb-4 opacity-20" />
              <p>No history yet.</p>
          </div>
      ) : (
          <div className="grid gap-4">
            {history.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()).map(entry => (
                <button
                    key={entry.id}
                    onClick={() => setSelectedPlan(entry)}
                    className="bg-card rounded-xl p-6 shadow-md border border-slate-800 hover:border-primary/50 hover:bg-slate-800 transition-all text-left group flex justify-between items-center"
                >
                    <div>
                        <h3 className="text-lg font-bold text-slate-200 group-hover:text-primary transition-colors">
                            {new Date(entry.savedAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">
                            {entry.tasks.length} tasks • Saved {new Date(entry.savedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                    <ChevronRight className="text-slate-600 group-hover:text-primary" />
                </button>
            ))}
          </div>
      )}
    </div>
  );
};

export default HistoryView;