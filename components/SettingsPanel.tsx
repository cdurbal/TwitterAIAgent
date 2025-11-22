import React, { useState } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import { DEFAULT_SYSTEM_INSTRUCTION } from '../constants';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentInstruction: string;
  onSave: (instruction: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, currentInstruction, onSave }) => {
  const [text, setText] = useState(currentInstruction);

  if (!isOpen) return null;

  const handleReset = () => {
    setText(DEFAULT_SYSTEM_INSTRUCTION);
  };

  const handleSave = () => {
    onSave(text);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="w-full md:w-[480px] h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Coach Configuration</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            System Instruction (Persona)
          </label>
          <p className="text-xs text-slate-500 mb-4">
            Define how the AI should behave, its tone, and its expertise.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-[60vh] bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-mono leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium px-3 py-2 rounded-md transition-colors"
          >
            <RotateCcw size={16} />
            Reset Default
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-600/20 transition-all"
          >
            <Save size={18} />
            Save & Restart
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
