import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Sender } from '../types';
import { User, Bot, AlertCircle } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Sender.User;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600' : 'bg-emerald-600'}`}>
          {isUser ? <User size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
        </div>

        {/* Bubble */}
        <div
          className={`flex flex-col p-4 rounded-2xl shadow-sm ${
            isUser 
              ? 'bg-blue-600 text-white rounded-tr-sm' 
              : message.isError 
                ? 'bg-red-900/50 border border-red-700 text-red-200' 
                : 'bg-slate-800 text-slate-200 rounded-tl-sm'
          }`}
        >
          {message.isError ? (
             <div className="flex items-center gap-2">
               <AlertCircle size={16} />
               <span>{message.text}</span>
             </div>
          ) : (
            <div className={`markdown-content text-sm md:text-base leading-relaxed ${isUser ? 'text-white' : 'text-slate-200'}`}>
               {/* We use ReactMarkdown for generic styling of the AI response */}
               <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 mt-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-base font-bold mb-1 mt-2" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-blue-200" {...props} />,
                    code: ({node, ...props}) => <code className="bg-slate-950 px-1 py-0.5 rounded text-xs font-mono text-emerald-400" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-400 pl-3 italic my-2 text-slate-400" {...props} />
                  }}
               >
                 {message.text}
               </ReactMarkdown>
            </div>
          )}
          <span className="text-[10px] opacity-50 mt-2 block text-right">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
