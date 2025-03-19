import React from "react";
import styled from 'styled-components';

// 模态框样式
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const RenameModal = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;

  input {
    width: 100%;
    padding: 8px;
    margin-bottom: 16px;
    transform: translateX(-10px); /* 向左移动 10px */
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 32px;
  justify-content: flex-end;

  button {
    padding: 4px 16px;
    cursor: pointer;
    transform: translateX(-55px); /* 向左移动 10px */
  }
`;

const Rename = ({ newTitle, onTitleChange, onConfirm, onCancel }) => {
  return (
    <ModalOverlay>
      <RenameModal>
        <input
          value={newTitle}
          onChange={onTitleChange}
          placeholder="Enter new title"
        />
        <ModalButtons>
          <button onClick={onConfirm}>Confirm</button>
          <button onClick={onCancel}>Cancel</button>
        </ModalButtons>
      </RenameModal>
    </ModalOverlay>
  );
};

export default Rename;