import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Loader2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import ShawnBot from '../components/icons/ShawnBot';
import { useChat } from 'ai/react';

interface ExampleCategory {
  title: string;
  questions: string[];
}

const EXAMPLE_QUESTIONS: ExampleCategory[] = [
  {
    title: 'Technical Details',
    questions: [
      'What are the specifications for the Venture Modular Carpet - Linear Pattern?',
      'What is the recommended pile height for commercial installations?',
      'What backing systems are available for broadloom products?',
      'What is the standard width for carpet tiles?'
    ]
  },
  {
    title: 'Installation Guidelines',
    questions: [
      'What are the acclimation requirements before installation?',
      'What adhesive should be used for carpet tiles on raised floors?',
      'What is the recommended temperature range during installation?',
      'How should seams be handled in broadloom installations?'
    ]
  },
  {
    title: 'Warranty Information',
    questions: [
      'What is covered under the standard warranty?',
      'How long is the warranty period for commercial installations?',
      'What conditions void the product warranty?',
      'How do I submit a warranty claim?'
    ]
  },
  {
    title: 'Maintenance Guidance',
    questions: [
      'What is the recommended cleaning schedule for high-traffic areas?',
      'Which cleaning products are approved for use?',
      'How should spills be handled immediately?',
      'What is the proper procedure for deep cleaning?'
    ]
  }
];

const SmartChatPage: React.FC = () => {
  const [showExamples, setShowExamples] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleExampleClick = (question: string) => {
    const fakeEvent = {
      target: { value: question }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(fakeEvent);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-[calc(100vh-6rem)]">
      <div className="flex gap-6 h-full">
        {/* Examples Panel */}
        <div className="w-80 bg-white rounded-lg shadow-sm overflow-hidden flex-shrink-0">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <HelpCircle className="mr-2 text-corporate-secondary" />
              <h2 className="font-medium">Example Questions</h2>
            </div>
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="text-gray-500 hover:text-corporate-secondary transition-colors"
            >
              {showExamples ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          {showExamples && (
            <div className="p-4 space-y-6">
              {EXAMPLE_QUESTIONS.map((category, index) => (
                <div key={index}>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">{category.title}</h3>
                  <ul className="space-y-2">
                    {category.questions.map((question, qIndex) => (
                      <li key={qIndex}>
                        <button
                          onClick={() => handleExampleClick(question)}
                          className="text-left text-sm text-gray-600 hover:text-corporate-secondary hover:bg-gray-50 p-2 rounded-md w-full transition-colors"
                        >
                          {question}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <div className="flex-1 bg-white rounded-lg shadow-sm flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold flex items-center">
              <ShawnBot className="w-6 h-6 mr-2 text-corporate-secondary" />
              Shawn-Bot
            </h1>
            <p className="text-sm text-gray-500">
              Your friendly bearded assistant for technical details, installation, warranty, or maintenance
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-corporate-secondary text-white' 
                        : 'bg-corporate-light text-corporate-secondary'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User size={16} />
                    ) : (
                      <ShawnBot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-corporate-secondary text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-corporate-light text-corporate-secondary">
                    <ShawnBot className="w-4 h-4" />
                  </div>
                  <div className="rounded-lg p-3 bg-gray-100">
                    <Loader2 className="w-5 h-5 animate-spin text-corporate-secondary" />
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
                <p className="font-medium">Error occurred:</p>
                <p className="text-sm">{error.message || "Failed to connect to the AI service. Please try again later."}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
            <div className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask Shawn-Bot about products, installation, warranty, or maintenance..."
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-secondary focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-corporate-secondary text-white rounded-md hover:bg-corporate-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SmartChatPage;