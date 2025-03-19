import React, { createContext, useState } from  'react';

// 创建 Contexts
export const DataContext = createContext();

// Contexts Provider 组件
export const DataProvider = ({ children }) => {
  const [agents, setAgents] = useState([]); // 存储所有 Agent
  const [tools, setTools] = useState([]); // 存储所有 Tools
  const [models, setModels] = useState([]); // 存储所有 Models
  const [teams, setTeams] = useState([]); // 存储所有 Team
  const [conversations, setConversations] = useState([]); // 存储所有对话

  return (
    <DataContext.Provider value={{ agents, setAgents, tools, setTools, models, setModels, teams, setTeams, conversations, setConversations}}>
      {children}
    </DataContext.Provider>
  );
};