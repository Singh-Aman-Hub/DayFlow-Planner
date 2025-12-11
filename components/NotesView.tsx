
import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

interface NotesViewProps {
  initialContent: string;
  onBack: (content: string) => void;
}

const NotesView: React.FC<NotesViewProps> = ({ initialContent, onBack }) => {
  const [content, setContent] = useState(initialContent);

  const handleBack = () => {
    onBack(content);
  };

  return (
    <div className="h-full flex flex-col bg-darker text-slate-100">
      <header className="p-4 md:p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium text-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back & Save
        </button>
        <div className="flex items-center gap-2 text-primary font-bold">
            <span className="text-xs uppercase tracking-widest text-zinc-500">Scratchpad</span>
            <Save className="w-4 h-4" />
        </div>
      </header>
      
      <div className="flex-1 relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your thoughts, ideas, or meeting notes here..."
          className="w-full h-full bg-darker p-6 md:p-8 text-lg leading-relaxed text-slate-200 outline-none resize-none placeholder:text-zinc-700 font-mono"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default NotesView;
