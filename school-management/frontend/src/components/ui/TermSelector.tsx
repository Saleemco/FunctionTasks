import { useTerm } from '../../context/TermContext';
import { ChevronDownIcon, CalendarIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';

export const TermSelector = () => {
  const { 
    selectedTerm, 
    setSelectedTerm, 
    selectedSession,
    setSelectedSession,
    terms, 
    sessions, 
    activeTerm, 
    activeSession,
    isLoading 
  } = useTerm();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'session' | 'term'>('session');
  const [isChangingSession, setIsChangingSession] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show loading state when data is being fetched
  if (isLoading || isChangingSession) {
    return (
      <div className="px-3 py-2 text-sm text-gray-500 animate-pulse">
        Loading...
      </div>
    );
  }

  if (!selectedSession) {
    return (
      <div className="px-3 py-2 text-sm text-gray-500">
        No session available
      </div>
    );
  }

  const handleSessionSelect = async (session: any) => {
    console.log('📌 Selecting session:', session.name);
    setIsChangingSession(true);
    setSelectedSession(session);
    setActiveTab('term');
    // Close dropdown
    setIsOpen(false);
    // Allow time for terms to load
    setTimeout(() => {
      setIsChangingSession(false);
    }, 500);
    // Reopen to show terms tab after loading
    setTimeout(() => {
      setIsOpen(true);
    }, 600);
  };

  const handleTermSelect = (term: any) => {
    console.log('📌 Selecting term:', term.name);
    setSelectedTerm(term);
    setIsOpen(false);
  };

  // Display current selection
  const displaySessionName = selectedSession?.name || 'Select Session';
  const displayTermName = selectedTerm?.name || (terms.length > 0 ? 'Select Term' : 'No terms');

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <AcademicCapIcon className="w-4 h-4 text-gray-500" />
        <span className="max-w-[120px] truncate">
          {displaySessionName}
        </span>
        <span className="text-gray-300">|</span>
        <CalendarIcon className="w-4 h-4 text-gray-500" />
        <span className="max-w-[100px] truncate">
          {displayTermName}
        </span>
        {selectedSession?.isActive && (
          <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
            Active
          </span>
        )}
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('session')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'session'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Academic Year ({sessions.length})
            </button>
            <button
              onClick={() => setActiveTab('term')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'term'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Term ({terms.length})
            </button>
          </div>

          {/* Session List */}
          {activeTab === 'session' && (
            <div className="max-h-80 overflow-y-auto p-2">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleSessionSelect(session)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedSession?.id === session.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{session.name}</span>
                      {session.isActive && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No sessions found
                </div>
              )}
            </div>
          )}

          {/* Term List */}
          {activeTab === 'term' && (
            <div className="max-h-80 overflow-y-auto p-2">
              {terms.length > 0 ? (
                terms.map((term) => (
                  <button
                    key={term.id}
                    onClick={() => handleTermSelect(term)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedTerm?.id === term.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{term.name}</span>
                      {term.isActive && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {new Date(term.startDate).toLocaleDateString()} - {new Date(term.endDate).toLocaleDateString()}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No terms available for {selectedSession?.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedSession?.name === '2025-2026' 
                      ? 'Create terms for this session in Term Management'
                      : 'Select a different session or create terms'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TermSelector;