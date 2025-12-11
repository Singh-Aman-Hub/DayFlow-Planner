import React from 'react';
import { TimeInput, AmPm } from '../types';

interface TimePickerProps {
  label: string;
  value: TimeInput;
  onChange: (field: keyof TimeInput, value: string) => void;
  compact?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({ label, value, onChange, compact = false }) => {
  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (val.length > 2) val = val.slice(0, 2);
    onChange('minutes', val);
  };

  const handleBlur = () => {
     let val = parseInt(value.minutes || '0', 10);
     if (isNaN(val)) val = 0;
     if (val < 0) val = 0;
     if (val > 59) val = 59;
     onChange('minutes', val.toString().padStart(2, '0'));
  };

  return (
    <div className="flex flex-col">
      {!compact && (
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      )}
      <div className={`flex bg-slate-900 rounded-lg border border-slate-700 ${compact ? 'p-0.5 text-xs' : 'p-1'}`}>
        <select 
          value={value.hours}
          onChange={(e) => onChange('hours', e.target.value)}
          className="bg-transparent text-white font-mono font-semibold outline-none text-center appearance-none cursor-pointer hover:bg-slate-800 rounded px-1 transition-colors"
        >
          {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => (
            <option key={h} value={h} className="bg-slate-900">{h}</option>
          ))}
        </select>
        <span className="text-slate-500 mx-0.5 flex items-center">:</span>
        <input 
          type="text"
          inputMode="numeric"
          value={value.minutes}
          onChange={handleMinuteChange}
          onBlur={handleBlur}
          placeholder="00"
          className="bg-transparent text-white font-mono font-semibold outline-none text-center w-8 hover:bg-slate-800 rounded px-1 transition-colors focus:bg-slate-800"
        />
        <select 
          value={value.ampm}
          onChange={(e) => onChange('ampm', e.target.value as AmPm)}
          className="bg-transparent text-primary font-bold outline-none text-center appearance-none cursor-pointer hover:bg-slate-800 rounded px-0.5 ml-0.5 transition-colors"
        >
          <option value="AM" className="bg-slate-900">AM</option>
          <option value="PM" className="bg-slate-900">PM</option>
        </select>
      </div>
    </div>
  );
};

export default TimePicker;