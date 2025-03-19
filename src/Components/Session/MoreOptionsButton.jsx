//更多操作按钮及下拉菜单
import React, {useState, useEffect, useRef} from "react";
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

// 样式组件（使用 styled-components）
const OptionsContainer = styled.div`
  position: relative;
  margin-left: auto;
`;

const MoreButton = styled.button`
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  color: #666;
  font-size: 18px;
  position: relative; // 相对定位
  &:hover {
    color: #333;
  }
`;

const OptionsMenu = styled.div`
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 1000;
  ${({ position }) => `
    top: ${position.top}px;
    left: ${position.left}px;
  `}
`;

const OptionItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #f5f5f5;
  }
`;

// const ConversationTitle = styled.div`
//   flex-grow: 1;
//   overflow: hidden;
//   text-overflow: ellipsis;
// `;
//



const MoreOptionsButton = ({ onDelete, onRename }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  // 点击外部区域关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calculatePosition = (buttonRect) => {
    const MENU_HEIGHT = 82; // 根据实际菜单高度调整
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // 计算初始位置（向下展开）
    let top = buttonRect.bottom + scrollY;
    let left = buttonRect.left + scrollX - 60; // 向左偏移

    // 检测是否需要向上展开
    const viewportSpaceBelow = window.innerHeight - buttonRect.bottom;
    if (viewportSpaceBelow < MENU_HEIGHT) {
      top = buttonRect.top + scrollY - MENU_HEIGHT;
    }

    return { top, left };
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition(calculatePosition(rect));
    setIsMenuOpen(!isMenuOpen);
  };


  return (
    <OptionsContainer ref={menuRef}>
      <MoreButton onClick={handleButtonClick}>•••</MoreButton>

      {isMenuOpen && (
        <OptionsMenu position={menuPosition}>
          <OptionItem
            onClick={(e) => {
              e.stopPropagation();
              onRename();
              setIsMenuOpen(false);
            }}
          >
            <FontAwesomeIcon icon={faPen} /> Rename
          </OptionItem>
          <OptionItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setIsMenuOpen(false);
            }}
          >
            <FontAwesomeIcon icon={faTrash} /> Delete
          </OptionItem>
        </OptionsMenu>
      )}
    </OptionsContainer>
  );
};

export default MoreOptionsButton;