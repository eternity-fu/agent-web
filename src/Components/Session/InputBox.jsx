import React, { useState } from 'react';
import styled from 'styled-components';


const InputContainer = styled.div`
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: sticky;
  bottom: 0;
  background: #fff;
  box-sizing: border-box;
  border-top: 1px solid #ddd;
`;

const InputField = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 20px;
  width: 500px;
`;

const VoiceButton = styled.button`
  width: 100px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 10px;
  font-size: 16px;
  cursor: pointer;
  margin-left: 10px;
  transition: background 0.2s ease-in-out;
  
  &:hover {
    background: #0056b3;
  }
`;

const SendButton = styled.button`
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 17px;
  font-size: 16px;
  cursor: pointer;
  margin-left: 10px;
  transition: background 0.2s ease-in-out;
  width: 70px;

  &:hover {
    background: #0056b3;
  }
`;


// 输入框组件
const InputBox = ({ value, onChange, onSend }) => {
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support speech recognition.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US'; // 设置语言
    recognition.interimResults = false; // 是否返回临时结果
    recognition.maxAlternatives = 1; // 返回的最大结果数量

    recognition.start(); // 开始语音识别
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript; // 获取识别结果
      onChange({ target: { value: transcript } }); // 更新输入框内容
      recognition.stop(); // 停止识别
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      recognition.stop();
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  return (
    <InputContainer>
      <InputField
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Type a message..."
      />
      <VoiceButton onClick={handleVoiceInput}>
        {isListening ? 'Listening...' : '🎤'}
      </VoiceButton>
      <SendButton onClick={onSend}>Send</SendButton>
    </InputContainer>
  );
};

export default InputBox;