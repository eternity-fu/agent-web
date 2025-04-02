import React, { useState } from 'react';
import styled from 'styled-components';

// 样式定义
const InputContainer = styled.div`
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 8px;
  width: calc(100% - 20px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InputField = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 4px 8px;
  background: transparent;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const UploadButton = styled.div`
  cursor: pointer;
  padding: 4px;
  font-size: 20px;
  color: #666;
  &:hover {
    color: #000;
  }
`;

const VoiceButton = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  padding: 4px;
  font-size: 20px;
  color: #666;
  &:hover {
    color: #000;
  }
`;

const SendButton = styled.button`
  border: none;
  background: #000;
  color: #fff;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  &:hover {
    background: #333;
  }
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  width: fit-content; /* 让容器宽度适应内容 */
  max-width: 200px; /* 限制最大宽度，防止过长 */
`;

const FileIcon = styled.span`
  margin-right: 4px;
  font-size: 16px;
`;

const FileName = styled.span`
  display: inline-block;
  width: 2500px; /* 固定宽度 */
  overflow: hidden;
  text-overflow: ellipsis; /* 超出部分显示省略号 */
  white-space: nowrap; /* 防止换行 */
  font-size: 14px;
  color: #333;
`;

const RemoveButton = styled.button`
  border: none;
  margin-right: 0px;
  background: none;
  cursor: pointer;
  font-size: 16px;
  padding: 0 4px;
  color: #666;
  &:hover {
    color: #ff0000;
  }
`;

const PreviewContainer = styled.div`
  margin-top: 8px;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 8px;
`;

const PreviewText = styled.div`
  margin-bottom: 8px;
  font-size: 14px;
`;

const PreviewButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ConfirmButton = styled.button`
  border: none;
  background: #000;
  color: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #333;
  }
`;

const CancelButton = styled.button`
  border: 1px solid #e0e0e0;
  background: none;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #f0f0f0;
  }
`;

// 输入框组件
const InputBox = ({ value, onChange, onSend }) => {
  const [isListening, setIsListening] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('你的浏览器不支持语音识别功能。');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPreviewText(transcript);
      setIsPreviewVisible(true);
      recognition.stop();
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('语音识别错误:', event.error);
      recognition.stop();
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        file: file,
      });
    }
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
  };

  const handleConfirm = () => {
    onChange({ target: { value: previewText } });
    setIsPreviewVisible(false);
    setPreviewText('');
  };

  const handleCancel = () => {
    setIsPreviewVisible(false);
    setPreviewText('');
  };

  return (
    <InputContainer>
      {uploadedFile && (
        <FilePreview>
          <FileIcon>📄</FileIcon>
          <FileName>{uploadedFile.name}</FileName>
          <RemoveButton onClick={handleFileRemove}>×</RemoveButton>
        </FilePreview>
      )}
      <InputWrapper>
        <InputField
          type="text"
          value={value}
          onChange={onChange}
          placeholder="输入消息..."
        />
        <ButtonGroup>
          <label htmlFor="file-upload">
            <UploadButton>📎</UploadButton>
          </label>
          <input
            id="file-upload"
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <VoiceButton onClick={handleVoiceInput}>
            {isListening ? '🎙️' : '🎤'}
          </VoiceButton>
          <SendButton onClick={onSend}>↑</SendButton>
        </ButtonGroup>
      </InputWrapper>
      {isPreviewVisible && (
        <PreviewContainer>
          <PreviewText>{previewText}</PreviewText>
          <PreviewButtonGroup>
            <ConfirmButton onClick={handleConfirm}>确定</ConfirmButton>
            <CancelButton onClick={handleCancel}>取消</CancelButton>
          </PreviewButtonGroup>
        </PreviewContainer>
      )}
    </InputContainer>
  );
};
export default InputBox;