
import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import { Message, Role } from '../types';

declare global {
  interface Window {
    MathJax: {
      typeset(elements?: HTMLElement[]): void;
    }
  }
}

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

const ChatMessage = ({ message, isStreaming = false }: ChatMessageProps) => {
  const isUser = message.role === Role.USER;
  const contentRef = useRef<HTMLDivElement>(null);

  const createMarkup = (text: string) => {
    const rawMarkup = marked.parse(text);
    return { __html: rawMarkup };
  };

  useEffect(() => {
    // Only run MathJax when streaming is finished for this message.
    if (!isStreaming && contentRef.current && window.MathJax) {
      window.MathJax.typeset([contentRef.current]);
    }
  }, [message.text, isStreaming]);


  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div 
        ref={contentRef}
        className={`max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl shadow-md ${isUser ? 'bg-violet-600 text-white rounded-br-none' : 'bg-teal-900 text-slate-200 rounded-bl-none'}`}
      >
        <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={createMarkup(message.text)} />
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ChatMessage;
