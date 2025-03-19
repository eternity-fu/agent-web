import React from 'react';
import styled from 'styled-components';

const MessageContainer = styled.div`
  background: ${({ isUser }) => (isUser ? '#007bff' : '#f1f1f1')};
  color: ${({ isUser }) => (isUser ? '#fff' : '#333')};
  border-radius: 8px;
  padding: 10px 15px;
  margin: 5px 0;
  max-width: 70%;
  align-self: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
`;

const Message = ({ text, isUser }) => {
  return <MessageContainer isUser={isUser}>{text}</MessageContainer>;
};

export default Message;