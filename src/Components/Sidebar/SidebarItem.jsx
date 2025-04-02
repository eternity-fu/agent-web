import React from 'react';
import './Sidebar.css';
import { CommentOutlined, ProductOutlined, RobotOutlined } from '@ant-design/icons'; // 引入图标

const SidebarItem = ({ icon, text, isActive, onClick, isExpanded }) => {
  // 根据传入的 icon 类型渲染对应的图标
  const renderIcon = () => {
    switch (icon) {
      case 'Session':
        return <RobotOutlined />;
      case 'Gallery':
        return <ProductOutlined />;
      default:
        return null;
    }
  };
  return (
    <div
      className={`sidebar-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
      title={!isExpanded ? text : ''}
    >
      <span className="icon">{renderIcon()}</span>
      {isExpanded && <span className="text">{text}</span>}
      {!isExpanded && <span className="tooltip">{text}</span>} {/* 自定义提示框 */}
    </div>
  );
};

export default SidebarItem;