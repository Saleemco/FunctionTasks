import React, { createContext, useContext, useState, useEffect } from 'react';
import { termService, Term } from '../services/term.service';
import { sessionService, Session } from '../services/session.service';

interface TermContextType {
  selectedTerm: Term | null;
  setSelectedTerm: (term: Term | null) => void;
  selectedSession: Session | null;
  setSelectedSession: (session: Session | null) => void;
  terms: Term[];
  sessions: Session[];
  activeTerm: Term | null;
  activeSession: Session | null;
  isLoading: boolean;
  refreshTerms: () => void;
  refreshSessions: () => void;
}

const TermContext = createContext<TermContextType | undefined>(undefined);

export const TermProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTerm, setActiveTerm] = useState<Term | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Loading sessions and terms...');
      
      // Load sessions
      const sessionsData = await sessionService.getAll();
      console.log('📊 Sessions loaded:', sessionsData.length);
      setSessions(sessionsData);
      
      // Get active session
      const activeSessionData = sessionsData.find(s => s.isActive);
      setActiveSession(activeSessionData || null);
      
      // Set selected session
      if (!selectedSession && activeSessionData) {
        console.log('📌 Setting selected session to active session:', activeSessionData.name);
        setSelectedSession(activeSessionData);
      } else if (!selectedSession && sessionsData.length > 0) {
        console.log('📌 Setting selected session to first session:', sessionsData[0].name);
        setSelectedSession(sessionsData[0]);
      }
      
      // Load terms for the selected session
      const sessionId = selectedSession?.id || activeSessionData?.id;
      if (sessionId) {
        console.log('📖 Loading terms for session ID:', sessionId);
        const termsData = await termService.getAll(sessionId);
        console.log('📋 Terms loaded:', termsData.length);
        setTerms(termsData);
        
        // Get active term
        const activeTermData = termsData.find(t => t.isActive);
        setActiveTerm(activeTermData || null);
        
        // Set selected term
        if (!selectedTerm && activeTermData) {
          console.log('📌 Setting selected term to active term:', activeTermData.name);
          setSelectedTerm(activeTermData);
        } else if (!selectedTerm && termsData.length > 0) {
          console.log('📌 Setting selected term to first term:', termsData[0].name);
          setSelectedTerm(termsData[0]);
        }
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load terms when session changes
  useEffect(() => {
    if (selectedSession) {
      const loadTermsForSession = async () => {
        console.log('🔄 Session changed to:', selectedSession.name, selectedSession.id);
        const termsData = await termService.getAll(selectedSession.id);
        console.log('📋 Terms loaded for session:', termsData.length);
        setTerms(termsData);
        
        const activeTermData = termsData.find(t => t.isActive);
        setActiveTerm(activeTermData || null);
        
        // Only set a new term if we don't have one or the current one isn't in the new list
        if (!selectedTerm) {
          const newTerm = activeTermData || termsData[0] || null;
          console.log('📌 Setting selected term to:', newTerm?.name);
          setSelectedTerm(newTerm);
        } else if (!termsData.find(t => t.id === selectedTerm.id)) {
          // Current term not found in new list, select the first one
          const newTerm = activeTermData || termsData[0] || null;
          console.log('📌 Current term not found, switching to:', newTerm?.name);
          setSelectedTerm(newTerm);
        }
      };
      loadTermsForSession();
    }
  }, [selectedSession?.id]);

  const refreshTerms = () => {
    loadData();
  };
  
  const refreshSessions = () => {
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <TermContext.Provider value={{
      selectedTerm,
      setSelectedTerm,
      selectedSession,
      setSelectedSession,
      terms,
      sessions,
      activeTerm,
      activeSession,
      isLoading,
      refreshTerms,
      refreshSessions
    }}>
      {children}
    </TermContext.Provider>
  );
};

export const useTerm = () => {
  const context = useContext(TermContext);
  if (context === undefined) {
    throw new Error('useTerm must be used within a TermProvider');
  }
  return context;
};