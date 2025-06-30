import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, FileText, Lightbulb, Calculator, Globe, Code, Palette, Music, Brain } from 'lucide-react';

export const ChatSidePanel: React.FC = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      icon: BookOpen,
      title: 'Study Help',
      description: 'Get structured learning materials',
      color: 'from-blue-500 to-cyan-500',
      prompt: 'Help me create a study plan for'
    },
    {
      icon: FileText,
      title: 'Essay Writing',
      description: 'Assistance with writing tasks',
      color: 'from-green-500 to-emerald-500',
      prompt: 'Help me write an essay about'
    },
    {
      icon: Calculator,
      title: 'Math Problems',
      description: 'Solve complex equations',
      color: 'from-purple-500 to-pink-500',
      prompt: 'Help me solve this math problem:'
    },
    {
      icon: Code,
      title: 'Programming',
      description: 'Code help and debugging',
      color: 'from-orange-500 to-red-500',
      prompt: 'Help me with this programming question:'
    },
    {
      icon: Lightbulb,
      title: 'Creative Ideas',
      description: 'Brainstorm and innovate',
      color: 'from-yellow-500 to-orange-500',
      prompt: 'Help me brainstorm ideas for'
    },
    {
      icon: Globe,
      title: 'Research',
      description: 'Find and analyze information',
      color: 'from-indigo-500 to-purple-500',
      prompt: 'Help me research information about'
    }
  ];

  const recentTopics = [
    'JavaScript Fundamentals',
    'Machine Learning Basics',
    'Essay Structure Tips',
    'Calculus Problems',
    'Creative Writing',
    'Data Structures'
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">LearnStack AI</h2>
        </div>
        <p className="text-sm text-gray-600">
          Your AI learning assistant for studies, homework, and creative projects
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Quick Learning Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200 text-left group"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                      {action.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Topics */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Popular Learning Topics</h3>
          <div className="space-y-2">
            {recentTopics.map((topic, index) => (
              <button
                key={index}
                className="w-full p-3 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Learning Tip</h4>
              <p className="text-xs text-gray-600">
                Be specific in your questions for better, more targeted learning assistance from LearnStack AI.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Powered by Advanced AI Learning
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Always learning, always improving
          </p>
        </div>
      </div>
    </div>
  );
};