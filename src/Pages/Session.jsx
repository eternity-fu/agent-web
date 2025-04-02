import React, { useContext, useEffect, useState, useRef} from 'react';
import './Session.css';
import { Button,  message } from 'antd';
import { DataContext } from "../Contexts/DataContext";
import MoreOptionsButton from "../Components/Session/MoreOptionsButton";
import styled from "styled-components";
import Message from "../Components/Session/Message";
import InputBox from "../Components/Session/InputBox";
import { Spin } from 'antd';

// 样式组件
const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f9f9f9;
  overflow: hidden; /* 防止 MainContent 滚动 */
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LoadingMessage = styled.div`
  font-style: italic;
  color: #888;
  align-self: flex-start;
`;

const Session = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {  conversations, setConversations } = useContext(DataContext);
  // const [selectedTeam, setSelectedTeam] = useState(teams.length > 0 ? teams[0] : null);
  const [isLoading, setIsLoading] = useState(false); // 新增加载状态
  const [selectedConversationIndex, setSelectedConversationIndex] = useState(null);
  const [currentConversation, setCurrentConversation] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesContainerRef = useRef(null); // 直接绑定到 MessagesContainer

  // 从 localStorage 加载对话历史
  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      const parsedConversations = JSON.parse(savedConversations);
      setConversations(parsedConversations);
      setSelectedConversationIndex(null);
    }
  }, []);

  // 当对话历史更新时，保存到 localStorage
  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  // 每次 currentConversation 更新时，滚动到最底部并同步 conversations
  useEffect(() => {
  const timer = setTimeout(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }

    if (selectedConversationIndex !== null) {
      setConversations((prevConversations) =>
        prevConversations.map((conversation, index) =>
          index === selectedConversationIndex
            ? { ...conversation, messages: currentConversation }
            : conversation
        )
      );
    }
  }, 100); // 每 100ms 更新一次

  return () => clearTimeout(timer);
}, [currentConversation, selectedConversationIndex]);

  // 切换边栏伸缩
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // // 处理team选择
  // const handleTeamSelect = ({ key }) => {
  //   const team = teams[key];
  //   setSelectedTeam(team);
  //   message.info(`选中了: ${team.name}`);
  // };

  // 创建新对话
  const handleCreateConversation = () => {
    const newConversation = {
      title: `对话 ${new Date().toLocaleTimeString()}`, // 对话名称
      messages: [], // 初始消息
      // team: selectedTeam ? selectedTeam.name : '未指定团队', // 如果没有选择团队，使用默认值
    };

    // 将新对话添加到对话列表中
    setConversations([...conversations, newConversation]);
    message.success(`新对话已创建`);

    // 自动选中新创建的对话
    setSelectedConversationIndex(conversations.length);
    setCurrentConversation(newConversation.messages);
  };

  // // 动态生成下拉菜单
  // const teamMenuItems = teams.map((team, index) => ({
  //   label: team.name,
  //   key: index,
  // }));
  //
  // const menuProps = {
  //   items: teamMenuItems,
  //   onClick: handleTeamSelect,
  // };

  // 切换到指定对话
  const handleSwitchConversation = (index) => {
    if (currentConversation.length > 0) {
      const updatedConversations = conversations.map((conversation, i) =>
        i === selectedConversationIndex
          ? { ...conversation, messages: currentConversation }
          : conversation
      );
      setConversations(updatedConversations);
    }
    setCurrentConversation(conversations[index].messages);
    setSelectedConversationIndex(index);
  };

  // 删除对话
  const handleDeleteConversation = (index) => {
    const updatedConversations = conversations.filter((_, i) => i !== index);
    setConversations(updatedConversations);
    if (index === selectedConversationIndex) {
      setCurrentConversation([]);
      setSelectedConversationIndex(null);
    } else if (index < selectedConversationIndex) {
      setSelectedConversationIndex(selectedConversationIndex - 1);
    }
  };

  // 重命名对话
  const handleRenameConversation = (index) => {
    const newTitle = prompt('请输入新的对话名称');
    if (newTitle) {
      const updatedConversations = conversations.map((conversation, i) =>
        i === index ? { ...conversation, title: newTitle } : conversation
      );
      setConversations(updatedConversations);
      message.success('对话已重命名');
    }
  };


  // 导入 LangGraph SDK
const initializeClient = async () => {
  const { Client } = await import('@langchain/langgraph-sdk');
  return new Client({
    apiUrl: 'http://127.0.0.1:2024', // 替换为你的部署 URL
    // apiKey: 'your-langsmith-api-key', // 替换为你的 API Key
  });
};

  // 流式响应的 API 调用
const fetchStreamedResponse = async (message) => {
  const client = await initializeClient();

  const streamResponse = client.runs.stream(
    null,
    'agent',
    {
      input: {
        messages: [{ role: 'user', content: message }],
      },
      streamMode: 'messages',
    }
  );

  let fullText = '';
  let iterator = streamResponse[Symbol.asyncIterator]();
  let hasNext = true;

  const processChunk = async () => {
    if (!hasNext) return fullText;

    const { value, done } = await iterator.next();
    console.log('原始数据:', value);
    if (done) {
      hasNext = false;
      return fullText;
    }

    const chunk = value.data;
    if (typeof chunk === 'string' && chunk.startsWith('data:')) {
  const jsonData = chunk.replace('data: ', '');
  const parsedData = JSON.parse(jsonData);
  if (parsedData.content) {
    fullText += parsedData.content;
  }
}
    return fullText;
  };

  return processChunk;
};

const typeMessage = (getNextChunk, callback) => {
  let currentText = '';

  const typeNextChunk = async () => {
    const updatedText = await getNextChunk();
    if (updatedText === currentText) {
      callback();
      return;
    }

    currentText = updatedText;
    console.log('当前文本:', currentText);
    setCurrentConversation((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { text: currentText, isUser: false };
      console.log('更新后的对话:', updated);
      return updated;
    });

    setTimeout(typeNextChunk, 50);
  };

  typeNextChunk();
};

// 发送消息
  const handleSend = async () => {
    if (inputValue.trim() === '') {
      message.warning('消息不能为空');
      return;
    }

    const userMessage = { text: inputValue, isUser: true };
    const updatedCurrentConversation = [...currentConversation, userMessage];
    setCurrentConversation(updatedCurrentConversation);
    setInputValue('');

    setIsLoading(true);

    try {
      const systemMessage = { text: '', isUser: false };
      const updatedCurrentConversationWithReply = [...updatedCurrentConversation, systemMessage];
      setCurrentConversation(updatedCurrentConversationWithReply);

      const getNextChunk = await fetchStreamedResponse(inputValue);

      setIsLoading(false);
      typeMessage(getNextChunk, () => {
        console.log('流式传输完成11');
      });
    } catch (error) {
      console.error('获取流式数据失败:', error);
      setIsLoading(false);
      message.error('发送消息失败，请稍后重试');
    }
  };



  return (
    <div className="session-container">
      <div className={`session-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Button className="session-sidebar-button" onClick={toggleSidebar}>
          {sidebarCollapsed ? '>' : '<'}
        </Button>
        {/*{!sidebarCollapsed && (*/}
        {/*  <Dropdown menu={menuProps} disabled={teams.length === 0}>*/}
        {/*    <Button className="session-team-dropdown">*/}
        {/*      <Space>*/}
        {/*        {selectedTeam ? selectedTeam.name : '选择团队'}*/}
        {/*        <DownOutlined />*/}
        {/*      </Space>*/}
        {/*    </Button>*/}
        {/*  </Dropdown>*/}
        {/*)}*/}
        {/*{!sidebarCollapsed && (*/}
        {/*  <div className="session-team-name">*/}
        {/*    {selectedTeam ? `当前团队: ${selectedTeam.name}` : '未选择团队'}*/}
        {/*  </div>*/}
        {/*)}*/}
        <div className="new-con-container">
          <Button
            onClick={handleCreateConversation}
            type="primary"
          >
            {sidebarCollapsed ? '+' : '新建对话'}
          </Button>
          {sidebarCollapsed && <div className="new-con-tooltip">新建对话</div>}
        </div>
        {!sidebarCollapsed && (
          <div className="con-list-container">
            <ul>
              {conversations.map((con, index) => (
                <li
                  key={index}
                  className={`con-item ${selectedConversationIndex === index ? 'selected' : ''}`}
                  onClick={() => handleSwitchConversation(index)}
                  style={{
                    fontWeight: selectedConversationIndex === index ? 'bold' : 'normal',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{con.title}</span>
                  <MoreOptionsButton
                    onDelete={() => handleDeleteConversation(index)}
                    onRename={() => handleRenameConversation(index)}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {selectedConversationIndex === null ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            paddingLeft: '200px',
          }}
        >
          <div className="no-con-selected">
            Select a conversation from the sidebar or create a new one
          </div>
        </div>
      ) : (
        <MainContent>
          {/*<div className="con-head">*/}
          {/*  <h2>{conversations[selectedConversationIndex].title}</h2>*/}
          {/*  <p>团队: {conversations[selectedConversationIndex].team}</p>*/}
          {/*</div>*/}
          <MessagesContainer ref={messagesContainerRef}>
            {currentConversation.map((msg, index) => (
              <Message key={index} text={msg.text} isUser={msg.isUser} />
            ))}
            {isLoading && <LoadingMessage><Spin size="midle" />正在加载...</LoadingMessage>}
          </MessagesContainer>
          <InputBox
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onSend={handleSend}
          />
        </MainContent>
      )}
    </div>
  );
};

export default Session;