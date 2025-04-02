import React, { useState } from 'react';
import SidebarItem from './SidebarItem';
import './Sidebar.css';


const Sidebar = ({activePage, onItemClick}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };


    return (
    <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button onClick={toggleSidebar}>
        {isExpanded ? '<<' : '>>'}
      </button>
      <SidebarItem
        icon="Session"
        text="数据分析小助手"
        isActive={activePage === 'Session'}
        onClick={() => onItemClick('Session')}
        isExpanded={isExpanded}
      />
      <SidebarItem
        icon="Gallery"
        text="管理"
        isActive={activePage === 'Gallery'}
        onClick={() => onItemClick('Gallery')}
        isExpanded={isExpanded}
      />
    </div>
  );
};

export default Sidebar;