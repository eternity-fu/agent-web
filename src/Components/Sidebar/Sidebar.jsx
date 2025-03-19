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
        icon="TeamBuilder"
        text="TeamBuilder"
        isActive={activePage === 'TeamBuilder'}
        onClick={() => onItemClick('TeamBuilder')}
        isExpanded={isExpanded}
      />
      <SidebarItem
        icon="Session"
        text="Session"
        isActive={activePage === 'Session'}
        onClick={() => onItemClick('Session')}
        isExpanded={isExpanded}
      />
      <SidebarItem
        icon="Gallery"
        text="Gallery"
        isActive={activePage === 'Gallery'}
        onClick={() => onItemClick('Gallery')}
        isExpanded={isExpanded}
      />
    </div>
  );
};

export default Sidebar;