
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Coffee, X, Check, Bell, FastForward, Clock, Plus, Maximize2, Minimize2 } from 'lucide-react';
import { Plan, Task, TimeInput } from '../types';
import { toMinutes, formatMinutesToTime, generateId, addMinutes, minutesToTimeInput, shiftSchedule, getNowMinutes, sortTasks } from '../utils/time';
import { playSound } from '../utils/sound';
import TimePicker from './TimePicker';

interface TimerViewProps {
  plan: Plan;
  onBack: () => void;
  onUpdatePlan: (plan: Plan) => void;
}

const MOTIVATIONAL_QUOTES = [
  "Consistency is the key to achieving your dreams.",
  "Focus on being productive instead of busy.",
  "Small daily improvements are the key to staggering long-term results.",
  "The secret of your future is hidden in your daily routine.",
  "Don't watch the clock; do what it does. Keep going.",
  "Discipline is choosing between what you want now and what you want most.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Your direction is more important than your speed.",
  "The only way to do great work is to love what you do.",
  "Action is the foundational key to all success."
];

// Modal for adding new tasks
const AddTaskModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; start: TimeInput; end: TimeInput }) => void;
  referenceTask?: Task;
}> = ({ isOpen, onClose, onSubmit, referenceTask }) => {
  const [name, setName] = useState('');
  const [start, setStart] = useState<TimeInput>({ hours: '09', minutes: '00', ampm: 'AM' });
  const [end, setEnd] = useState<TimeInput>({ hours: '10', minutes: '00', ampm: 'AM' });

  useEffect(() => {
    if (isOpen) {
      setName('');
      // Intelligent defaults based on reference task
      if (referenceTask) {
           setStart({ ...referenceTask.end });
           setEnd(addMinutes(referenceTask.end, 60));
      } else {
          // Default to now if no tasks
          const now = new Date();
          const currentMins = now.getHours() * 60 + now.getMinutes();
          setStart(minutesToTimeInput(currentMins));
          setEnd(minutesToTimeInput(currentMins + 60));
      }
    }
  }, [isOpen, referenceTask]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-white mb-4">
          Add Task to End
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Name</label>
            <input 
              autoFocus
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-primary transition-colors"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Task Name"
            />
          </div>
          <div className="flex gap-4">
            <TimePicker label="Start" value={start} onChange={(k, v) => setStart(p => ({...p, [k]: v}))} />
            <TimePicker label="End" value={end} onChange={(k, v) => setEnd(p => ({...p, [k]: v}))} />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 text-zinc-400 hover:text-white transition-colors">Cancel</button>
          <button 
            onClick={() => onSubmit({ name, start, end })}
            className="flex-1 py-2 bg-primary text-white font-bold rounded-lg hover:bg-rose-600 transition-colors"
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal for setting up a break
const BreakSetupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onStartBreak: (minutes: number) => void;
}> = ({ isOpen, onClose, onStartBreak }) => {
  const [duration, setDuration] = useState(10);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
                <Coffee className="w-6 h-6" />
                Take a Break
            </h3>

            <div className="grid grid-cols-3 gap-3 mb-6">
                {[5, 10, 15, 20, 30, 45].map(min => (
                    <button 
                        key={min}
                        onClick={() => setDuration(min)}
                        className={`py-2 rounded-lg font-bold border transition-all ${duration === min ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}
                    >
                        {min}m
                    </button>
                ))}
            </div>

            <div className="mb-6">
                 <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Custom Duration (min)</label>
                 <input 
                    type="number" 
                    value={duration} 
                    onChange={e => setDuration(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-center font-mono text-xl outline-none focus:border-blue-500"
                 />
            </div>

            <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 text-zinc-400 hover:text-white font-medium">Cancel</button>
                <button 
                    onClick={() => onStartBreak(duration)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20"
                >
                    Start Break
                </button>
            </div>
        </div>
    </div>
  );
};

const TimerView: React.FC<TimerViewProps> = ({ plan, onBack, onUpdatePlan }) => {
  const [now, setNow] = useState(new Date());
  const [activeTaskIndex, setActiveTaskIndex] = useState<number>(-1);
  const [status, setStatus] = useState<'WAITING' | 'ACTIVE' | 'COMPLETED'>('WAITING');
  const [remainingSecs, setRemainingSecs] = useState(0);
  const [remainingPct, setRemainingPct] = useState(0);
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sound Tracking
  const prevActiveTaskIndexRef = useRef<number>(-1);

  // Break State
  const [showBreakSetup, setShowBreakSetup] = useState(false);
  const [breakEndTime, setBreakEndTime] = useState<Date | null>(null);
  const [breakStatus, setBreakStatus] = useState<'NONE' | 'RUNNING' | 'FINISHED'>('NONE');

  // Sidebar/Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const activeTaskRef = useRef<HTMLDivElement>(null);
  
  // Modal State for Tasks
  const [modal, setModal] = useState<{
    isOpen: boolean;
    taskId: string;
  }>({ isOpen: false, taskId: '' });

  // Quote Rotation
  useEffect(() => {
     const interval = setInterval(() => {
        setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
     }, 300000); // 5 mins
     return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Audio effect for Break
  useEffect(() => {
      if (breakStatus === 'FINISHED') {
          playSound('BREAK');
      }
  }, [breakStatus]);

  // Audio effect for Task Transitions
  useEffect(() => {
    // If active index changes, and the new index is valid and greater than previous, it means a task just finished/switched.
    if (activeTaskIndex !== prevActiveTaskIndexRef.current) {
        if (prevActiveTaskIndexRef.current !== -1 && activeTaskIndex > prevActiveTaskIndexRef.current) {
             playSound('COMPLETE');
        } else if (activeTaskIndex === -1 && prevActiveTaskIndexRef.current !== -1 && status === 'COMPLETED') {
             playSound('COMPLETE');
        }
        prevActiveTaskIndexRef.current = activeTaskIndex;
    }
  }, [activeTaskIndex, status]);

  // Auto-scroll sidebar
  useEffect(() => {
      if (activeTaskRef.current) {
          activeTaskRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  }, [activeTaskIndex]);

  // Handle Fullscreen changes listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Break Logic
  useEffect(() => {
    if (breakEndTime) {
        if (now >= breakEndTime) {
            setBreakStatus('FINISHED');
        } else {
            setBreakStatus('RUNNING');
        }
    } else {
        setBreakStatus('NONE');
    }
  }, [now, breakEndTime]);

  // Sync active task logic
  useEffect(() => {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentSeconds = currentMinutes * 60 + now.getSeconds();
    
    let foundIndex = -1;
    for (let i = 0; i < plan.tasks.length; i++) {
      const task = plan.tasks[i];
      const startMin = toMinutes(task.start);
      const endMin = toMinutes(task.end);
      
      if (currentMinutes >= startMin && currentMinutes < endMin) {
        foundIndex = i;
        const startSec = startMin * 60;
        const endSec = endMin * 60;
        const durationSec = endSec - startSec;
        const elapsedSec = currentSeconds - startSec;
        const rem = Math.max(0, endSec - currentSeconds);
        
        setRemainingSecs(rem);
        // Calculate remaining percentage (100 -> 0)
        setRemainingPct(Math.min(100, Math.max(0, (rem / durationSec) * 100)));
        break;
      }
    }

    setActiveTaskIndex(foundIndex);

    if (foundIndex !== -1) {
        setStatus('ACTIVE');
    } else {
      setRemainingPct(0);
      setRemainingSecs(0);
      if (plan.tasks.length > 0) {
        const sorted = sortTasks(plan.tasks);
        const firstStart = toMinutes(sorted[0].start);
        const lastEnd = toMinutes(sorted[sorted.length - 1].end);
        
        if (currentMinutes < firstStart) {
          setStatus('WAITING');
        } else if (currentMinutes >= lastEnd) {
          setStatus('COMPLETED');
        } else {
            setStatus('WAITING');
        }
      }
    }
  }, [now, plan]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(e => console.error(e));
    } else {
        document.exitFullscreen().catch(e => console.error(e));
    }
  };

  const activeTask = activeTaskIndex !== -1 ? plan.tasks[activeTaskIndex] : null;
  const nextTask = (() => {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const sorted = sortTasks(plan.tasks);
      return sorted.find(t => toMinutes(t.start) > currentMinutes) || null;
  })();

  const handleEditTime = (id: string, field: 'start' | 'end', subField: keyof TimeInput, value: string) => {
    const newTasks = plan.tasks.map(t => {
      if (t.id === id) {
        return { ...t, [field]: { ...t[field], [subField]: value } };
      }
      return t;
    });
    onUpdatePlan({ ...plan, tasks: sortTasks(newTasks) });
  };

  const handleModalSubmit = (data: { name: string; start: TimeInput; end: TimeInput }) => {
    const newTask: Task = { id: generateId(), name: data.name, start: data.start, end: data.end };
    const newTasks = [...plan.tasks, newTask];
    onUpdatePlan({ ...plan, tasks: sortTasks(newTasks) });
    setModal({ ...modal, isOpen: false });
  };

  const handleStartBreak = (minutes: number) => {
      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + minutes);
      setBreakEndTime(endTime);
      setShowBreakSetup(false);
  };

  const handleDelay = (minutes: number) => {
      if (activeTaskIndex === -1) return;
      const newTasks = shiftSchedule(plan.tasks, activeTaskIndex, minutes);
      onUpdatePlan({ ...plan, tasks: newTasks });
  };

  const handleFinishEarly = () => {
      if (activeTaskIndex === -1) return;
      const nowMin = getNowMinutes();
      const taskEndMin = toMinutes(activeTask.end);
      const earlyBy = taskEndMin - nowMin;
      
      if (earlyBy > 0) {
          const newTasks = shiftSchedule(plan.tasks, activeTaskIndex, -earlyBy);
          newTasks[activeTaskIndex].end = minutesToTimeInput(nowMin);
           if (activeTaskIndex + 1 < newTasks.length) {
              newTasks[activeTaskIndex + 1].start = minutesToTimeInput(nowMin);
           }
          onUpdatePlan({ ...plan, tasks: newTasks });
      }
  };

  const formatCountdown = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const CircularTimer = ({ pct, timeText, color = 'primary' }: { pct: number, timeText: string, color?: 'primary' | 'blue' }) => {
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    // Calculation: pct is remaining (100 -> 0).
    const strokeDashoffset = circumference - (pct / 100) * circumference;
    const strokeColor = color === 'blue' ? 'text-blue-500' : 'text-primary';

    return (
      <div className="relative flex items-center justify-center">
        <svg className="transform -rotate-90 w-[280px] h-[280px] md:w-[350px] md:h-[350px]">
          <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
          <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className={`${strokeColor} transition-all duration-1000 ease-linear`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-5xl md:text-7xl font-bold font-mono text-white tracking-tighter">{timeText}</span>
          <span className="text-zinc-500 text-xs md:text-sm font-semibold uppercase tracking-widest mt-2">Remaining</span>
        </div>
      </div>
    );
  };

  if (breakStatus === 'RUNNING' && breakEndTime) {
      const totalBreakSecs = (breakEndTime.getTime() - now.getTime()) / 1000;
      return (
          <div className="fixed inset-0 z-50 bg-darker flex flex-col items-center justify-center animate-in fade-in duration-300">
               <div className="text-blue-500 mb-8 animate-pulse">
                   <Coffee className="w-16 h-16" />
               </div>
               <h2 className="text-4xl font-bold text-white mb-2">Break Time</h2>
               <p className="text-zinc-400 mb-10">Relax and recharge.</p>
               <CircularTimer pct={100} timeText={formatCountdown(Math.max(0, Math.floor(totalBreakSecs)))} color="blue" />
               <button onClick={() => setBreakEndTime(null)} className="mt-12 px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold transition-colors border border-zinc-700">End Break Early</button>
          </div>
      );
  }

  if (breakStatus === 'FINISHED') {
    return (
        <div className="fixed inset-0 z-50 bg-blue-950/90 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
             <div className="bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-blue-500/50 flex flex-col items-center max-w-sm w-full mx-4 text-center">
                 <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-6 text-white shadow-lg shadow-blue-500/50 animate-bounce">
                     <Bell className="w-10 h-10" />
                 </div>
                 <h2 className="text-3xl font-bold text-white mb-2">Break Over!</h2>
                 <p className="text-zinc-400 mb-8">Time to get back to your plan.</p>
                 <button onClick={() => setBreakEndTime(null)} className="w-full py-4 bg-white text-blue-900 font-bold rounded-xl hover:bg-zinc-200 transition-colors">Resume Work</button>
             </div>
        </div>
    );
  }

  const displayTasks = sortTasks([...plan.tasks]);

  return (
    <div className="h-full flex flex-col md:flex-row bg-darker text-slate-100 overflow-hidden">
      
      {/* Main Content (Timer) */}
      <div className="flex-1 flex flex-col relative order-2 md:order-1 h-full overflow-hidden">
        <div className="absolute top-0 left-0 p-6 z-10 w-full flex justify-between items-start">
          <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-medium text-sm group bg-zinc-900/50 px-3 py-2 rounded-full backdrop-blur-sm border border-white/5">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Plan
          </button>

          <button 
            onClick={toggleFullscreen} 
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-medium text-sm group bg-zinc-900/50 px-3 py-2 rounded-full backdrop-blur-sm border border-white/5"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          
          {status === 'ACTIVE' && activeTask && (
            <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-500 z-0 w-full">
              {/* Pass remainingPct instead of progress */}
              <CircularTimer pct={remainingPct} timeText={formatCountdown(remainingSecs)} />
              
              <div className="mt-8 text-center max-w-2xl w-full">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full mb-4 animate-pulse border border-primary/20">Now Active</span>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 text-center truncate px-4">{activeTask.name}</h1>
                <div className="flex items-center justify-center gap-4 text-xl font-bold text-zinc-500 mb-8">
                  <span className="text-zinc-300">{formatMinutesToTime(toMinutes(activeTask.start))}</span>
                  <span>-</span>
                  <span className="text-zinc-300">{formatMinutesToTime(toMinutes(activeTask.end))}</span>
                </div>

                <div className="flex gap-4 justify-center">
                    <button onClick={() => handleDelay(5)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 border border-zinc-700 hover:border-zinc-500">
                        <Clock className="w-4 h-4" />
                        +5m Delay
                    </button>
                    <button onClick={handleFinishEarly} className="px-4 py-2 bg-zinc-800 hover:bg-primary hover:text-white text-zinc-300 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 border border-zinc-700 hover:border-primary">
                        <FastForward className="w-4 h-4" />
                        Done Early
                    </button>
                </div>
              </div>
            </div>
          )}

          {status === 'WAITING' && (
             <div className="flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 text-primary animate-pulse border border-zinc-800">
                   <Play className="w-8 h-8 ml-1" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Waiting for next task...</h2>
                {nextTask ? (
                     <div className="text-zinc-500">
                         <p>Up next: <span className="text-white font-bold">{nextTask.name}</span></p>
                         <p className="text-xs mt-1">Starts at {formatMinutesToTime(toMinutes(nextTask.start))}</p>
                     </div>
                ) : (
                    <p className="text-zinc-500">No upcoming tasks scheduled.</p>
                )}
             </div>
          )}

          {status === 'COMPLETED' && (
             <div className="text-center">
                <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center mb-6 text-green-500 mx-auto border border-green-900/50">
                   <Check className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">All Done!</h2>
                <p className="text-zinc-500">You've completed your plan for the day.</p>
             </div>
          )}
          
          <div className="absolute bottom-24 md:bottom-12 w-full text-center px-4">
              <p className="text-zinc-500 text-sm font-medium italic opacity-70 transition-opacity duration-1000">"{quote}"</p>
          </div>

          <div className="absolute bottom-8 right-6 md:right-10 z-20">
              <button 
                onClick={() => setShowBreakSetup(true)}
                className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-blue-400 px-5 py-3 rounded-full font-bold shadow-lg border border-blue-500/20 transition-all hover:scale-105"
              >
                  <Coffee className="w-5 h-5" />
                  Take a Break
              </button>
          </div>

        </div>
      </div>

      <div className="w-full md:w-96 bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800 flex flex-col order-1 md:order-2 h-1/2 md:h-full z-20 shadow-2xl">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
           <div>
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 Timeline
                 <span className="text-xs font-bold text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">{plan.tasks.length}</span>
               </h3>
               <p className="text-xs text-zinc-500 mt-1">Double-click to edit</p>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative">
           <div className="absolute left-8 top-0 bottom-0 w-px bg-zinc-800 z-0 hidden md:block" />

           {displayTasks.map((task, index) => {
             const isActive = activeTaskIndex === index;
             const isPast = activeTaskIndex > index || (activeTaskIndex === -1 && status === 'COMPLETED');
             
             return (
             <div 
                key={task.id}
                ref={isActive ? activeTaskRef : null}
                className="relative pl-4 md:pl-10 transition-all"
             >
                <div className={`absolute left-2.5 top-6 w-3 h-3 rounded-full z-10 hidden md:block ${isActive ? 'bg-primary ring-4 ring-primary/20' : isPast ? 'bg-zinc-700' : 'bg-zinc-800 border-2 border-zinc-600'}`} />

                <div className={`group relative rounded-xl border p-3 transition-all ${
                    isActive 
                    ? 'bg-gradient-to-r from-zinc-900 to-zinc-900/50 border-primary/50 shadow-lg' 
                    : isPast 
                        ? 'bg-transparent border-transparent opacity-50 hover:opacity-80' 
                        : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
                }`}>
                   <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                          {editingId === task.id ? (
                            <div className="space-y-3 animate-in fade-in duration-200 bg-black/50 p-2 rounded">
                              <input 
                                value={task.name} 
                                onChange={(e) => {
                                  const newTasks = plan.tasks.map(t => t.id === task.id ? { ...t, name: e.target.value } : t);
                                  onUpdatePlan({ ...plan, tasks: sortTasks(newTasks) });
                                }}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-2 text-sm text-white focus:border-primary outline-none"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                  <TimePicker compact label="Start" value={task.start} onChange={(k, v) => handleEditTime(task.id, 'start', k, v)} />
                                  <TimePicker compact label="End" value={task.end} onChange={(k, v) => handleEditTime(task.id, 'end', k, v)} />
                              </div>
                              <button onClick={() => setEditingId(null)} className="text-xs bg-primary text-white px-3 py-1 rounded font-bold hover:bg-rose-600 w-full">Done</button>
                            </div>
                          ) : (
                            <div onDoubleClick={() => setEditingId(task.id)} className="cursor-pointer">
                              <div className="flex justify-between items-start">
                                <p className={`font-bold text-sm truncate pr-2 ${isActive ? 'text-primary' : isPast ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                                    {task.name || <span className="text-zinc-600 italic">Untitled Task</span>}
                                </p>
                              </div>
                              <p className={`text-xs font-mono mt-1 ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                                {formatMinutesToTime(toMinutes(task.start))} - {formatMinutesToTime(toMinutes(task.end))}
                              </p>
                            </div>
                          )}
                      </div>

                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditingId(editingId === task.id ? null : task.id)}
                            className="text-zinc-500 hover:text-white p-1 rounded hover:bg-white/10"
                          >
                            <span className="sr-only">Edit</span>
                            {editingId === task.id ? <X className="w-3 h-3"/> : <span className="text-[10px] font-bold uppercase tracking-wider">Edit</span>}
                          </button>
                      </div>
                   </div>
                </div>
             </div>
           )})}
           
           <div className="pl-4 md:pl-10 pt-2 pb-10">
               <button 
                onClick={() => setModal({ isOpen: true, taskId: displayTasks[displayTasks.length-1]?.id })}
                className="w-full py-3 border border-dashed border-zinc-800 rounded-xl text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all flex items-center justify-center gap-2 text-sm font-medium"
               >
                   <Plus className="w-4 h-4" />
                   Add Task to End
               </button>
           </div>
        </div>
      </div>

      <AddTaskModal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onSubmit={handleModalSubmit}
        referenceTask={displayTasks.find(t => t.id === modal.taskId)}
      />

      <BreakSetupModal
        isOpen={showBreakSetup}
        onClose={() => setShowBreakSetup(false)}
        onStartBreak={handleStartBreak}
      />
    </div>
  );
};

export default TimerView;
