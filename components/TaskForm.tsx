
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, History, Clock, FileText } from 'lucide-react';
import { Task, Plan, TimeInput } from '../types';
import { generateId, validateTasks, sortTasks, getCurrentTimeInput, minutesToTimeInput, toMinutes, addMinutes, getNowMinutes } from '../utils/time';
import TimePicker from './TimePicker';

interface TaskFormProps {
  initialPlan: Plan | null;
  onStart: (plan: Plan) => void;
  onOpenHistory: () => void;
  onOpenNotes: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ initialPlan, onStart, onOpenHistory, onOpenNotes }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPlan) {
      setTasks(initialPlan.tasks);
    } else {
      // Default to starting NOW
      const now = getCurrentTimeInput();
      const end = addMinutes(now, 60); // Default 1 hour duration
      setTasks([{ id: generateId(), name: '', start: now, end: end }]);
    }
  }, [initialPlan]);

  const addTask = () => {
    const lastTask = tasks[tasks.length - 1];
    let newStart = getCurrentTimeInput();
    
    // Suggest next start time based on last task's end time
    if (lastTask) {
        newStart = { ...lastTask.end };
    }

    setTasks([
      ...tasks,
      { 
        id: generateId(), 
        name: '', 
        start: newStart, 
        end: addMinutes(newStart, 60) 
      }
    ]);
  };

  const removeTask = (id: string) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const updateTask = (id: string, field: keyof Task, value: any) => {
    setTasks(tasks.map(t => (t.id === id ? { ...t, [field]: value } : t)));
    setError(null);
  };

  const updateTime = (id: string, field: 'start' | 'end', subField: keyof TimeInput, value: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          [field]: { ...t[field], [subField]: value }
        };
      }
      return t;
    }));
    setError(null);
  };

  const handleStart = () => {
    // 1. Sort first
    let currentTasks = sortTasks(tasks);

    // 2. "Start Process Now" logic
    if (currentTasks.length > 0) {
      const nowMin = getNowMinutes();
      const firstTaskStartMin = toMinutes(currentTasks[0].start);
      
      if (firstTaskStartMin > nowMin) {
        // Calculate duration to preserve it
        const duration = toMinutes(currentTasks[0].end) - firstTaskStartMin;
        
        // Update first task
        const newStart = minutesToTimeInput(nowMin);
        const newEnd = minutesToTimeInput(nowMin + duration);
        
        currentTasks[0] = {
          ...currentTasks[0],
          start: newStart,
          end: newEnd
        };
      }
    }

    // 3. Validate
    const validationError = validateTasks(currentTasks);
    if (validationError) {
      setError(validationError);
      return;
    }

    const newPlan: Plan = {
      id: initialPlan?.id || generateId(),
      savedAt: new Date().toISOString(),
      tasks: currentTasks
    };

    onStart(newPlan);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 h-full flex flex-col bg-darker">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">DayFlow Planner</h1>
          <p className="text-slate-400">Design your perfect day.</p>
        </div>
        <div className="flex gap-4">
            <button 
            onClick={onOpenNotes}
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-primary transition-colors"
            >
            <FileText className="w-4 h-4" />
            Notes
            </button>
            <button 
            onClick={onOpenHistory}
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-primary transition-colors"
            >
            <History className="w-4 h-4" />
            History
            </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pr-2 pb-20 space-y-4">
        {tasks.map((task, index) => (
          <div key={task.id} className="bg-card rounded-xl shadow-lg border border-slate-800 p-4 md:p-6 transition-all hover:border-primary/50 group">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-primary/80 uppercase tracking-wider mb-1">
                  Task Name
                </label>
                <input
                  type="text"
                  value={task.name}
                  onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                  placeholder="e.g. Deep Work"
                  className="w-full text-lg font-medium bg-darker border-b-2 border-slate-800 focus:border-primary text-white outline-none py-2 px-3 rounded-t-md transition-colors placeholder:text-slate-700"
                />
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                <TimePicker 
                  label="Start"
                  value={task.start}
                  onChange={(f, v) => updateTime(task.id, 'start', f, v)}
                />
                
                <div className="self-end pb-3 text-slate-600 hidden md:block">→</div>

                <TimePicker 
                  label="End"
                  value={task.end}
                  onChange={(f, v) => updateTime(task.id, 'end', f, v)}
                />
              </div>

              <button 
                onClick={() => removeTask(task.id)}
                className="p-2 text-slate-600 hover:text-primary hover:bg-primary/10 rounded-full transition-all self-end md:self-center"
                title="Remove task"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        <button 
          onClick={addTask}
          className="w-full py-6 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex justify-center items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Task Block
        </button>
      </div>

      <div className="sticky bottom-0 bg-darker/95 backdrop-blur-sm pt-4 pb-6 border-t border-slate-900">
        {error && (
          <div className="mb-4 p-3 bg-red-950/30 text-red-400 rounded-lg text-sm font-medium flex items-center justify-center border border-red-900/50">
            {error}
          </div>
        )}
        <button
          onClick={handleStart}
          className="w-full bg-primary hover:bg-rose-600 text-white text-xl font-bold py-4 rounded-xl shadow-lg shadow-rose-900/20 transition-all transform active:scale-[0.99] flex justify-center items-center gap-3"
        >
          <Clock className="w-6 h-6" />
          Start My Day
        </button>
      </div>
    </div>
  );
};

export default TaskForm;
