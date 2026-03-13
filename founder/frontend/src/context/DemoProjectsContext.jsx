import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const DemoProjectsContext = createContext(null);

export function DemoProjectsProvider({ children }) {
  const { user } = useAuth();
  const [demoProjects, setDemoProjects] = useState([]);

  const addDemoProject = useCallback((project) => {
    const newProject = {
      ...project,
      tags: project.tags || ['project'],
      projectId: `demo-user-${Date.now()}`,
      ownerId: user?.userId || 'demo-user',
      ownerName: user?.name || 'You',
      ownerAvatarS3Key: null,
      likesCount: 0,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    setDemoProjects((prev) => [newProject, ...prev]);
    return newProject;
  }, [user?.userId, user?.name]);

  const value = { demoProjects, addDemoProject };

  return (
    <DemoProjectsContext.Provider value={value}>
      {children}
    </DemoProjectsContext.Provider>
  );
}

export function useDemoProjects() {
  const ctx = useContext(DemoProjectsContext);
  if (!ctx) throw new Error('useDemoProjects must be used within DemoProjectsProvider');
  return ctx;
}
