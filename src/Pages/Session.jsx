import React, {useContext, useEffect, useState} from 'react';
import './Session.css'; // 引入样式文件
import {DownOutlined} from '@ant-design/icons';
import {Button, Dropdown, message, Space} from 'antd';
import {DataContext} from "../Contexts/DataContext";
import MoreOptionsButton from "../Components/Session/MoreOptionsButton";
import styled from "styled-components";
import Message from "../Components/Session/Message";
import InputBox from "../Components/Session/InputBox";

// 样式组件
const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f9f9f9;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;

`;

const Session = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const {teams, conversations, setConversations} = useContext(DataContext); // 获取全局teams
    const [selectedTeam, setSelectedTeam] = useState(teams.length > 0 ? teams[0] : null);
    const [selectedConversationIndex, setSelectedConversationIndex] = useState(null); // 当前选中的对话索引
    const [currentConversation, setCurrentConversation] = useState([]); // 当前对话的消息
    const [inputValue, setInputValue] = useState('');

    // 从 localStorage 加载对话历史
    useEffect(() => {
        const savedConversations = localStorage.getItem('conversations');
        if (savedConversations) {
            const parsedConversations = JSON.parse(savedConversations);
            setConversations(parsedConversations);
            if (parsedConversations.length > 0) {
                setSelectedConversationIndex(parsedConversations.length - 1); // 默认选中最后一个对话
                setCurrentConversation(parsedConversations[parsedConversations.length - 1].messages);
            }
        }
    }, []);

    // 当对话历史更新时，保存到 localStorage
    useEffect(() => {
        localStorage.setItem('conversations', JSON.stringify(conversations));
    }, [conversations]);

    console.log(selectedConversationIndex)

    // 切换边栏伸缩
    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // 处理team选择
    const handleTeamSelect = ({key}) => {
        const team = teams[key];
        setSelectedTeam(team);
        message.info(`选中了: ${team.name}`);
    };

    // 创建新对话
  const handleCreateConversation = () => {
    if (!selectedTeam) {
      message.warning('请先选择一个团队');
      return;
    }

    const newConversation = {
      title: `对话 ${new Date().toLocaleTimeString()}`, // 对话名称
      messages: [], // 初始消息
      team: selectedTeam.name, // 选中的team
    };

    // 将新对话添加到对话列表中
    setConversations([...conversations, newConversation]);
    message.success(`新对话已创建，团队: ${selectedTeam.name}`);
    console.log('新对话:', newConversation);

    // 自动选中新创建的对话
    setSelectedConversationIndex(conversations.length);
    setCurrentConversation(newConversation.messages);
  };

    // 动态生成下拉菜单
    const teamMenuItems = teams.map((team, index) => ({
        label: team.name,
        key: index,
    }));

    const menuProps = {
        items: teamMenuItems,
        onClick: handleTeamSelect,
    };

    // 切换到指定对话
    const handleSwitchConversation = (index) => {
        // 保存当前对话
        if (currentConversation.length > 0) {
            const updatedConversations = conversations.map((conversation, i) =>
                i === selectedConversationIndex
                    ? {...conversation, messages: currentConversation}
                    : conversation
            );
            setConversations(updatedConversations);
        }

        // 切换到新对话
        setCurrentConversation(conversations[index].messages);
        setSelectedConversationIndex(index);
    };

    // 删除对话
    const handleDeleteConversation = (index) => {
        const updatedConversations = conversations.filter((_, i) => i !== index);
        setConversations(updatedConversations);
        if (index === selectedConversationIndex) {
            // 如果删除的是当前选中的对话
            setCurrentConversation([]); // 清空对话框内容
            setSelectedConversationIndex(null); // 设置为没有选中的对话
        } else if (index < selectedConversationIndex) {
            // 如果删除的对话在当前选中对话的前面
            // 需要调整选中的索引，因为删除后列表长度减少了
            setSelectedConversationIndex(selectedConversationIndex - 1);
        }
        // 如果删除的不是当前选中的对话，且删除的对话在当前选中对话的后面，则不需要做任何操作

    };

    // 重命名对话
    const handleRenameConversation = (index) => {
        const newTitle = prompt('请输入新的对话名称');
        if (newTitle) {
            const updatedConversations = conversations.map((conversation, i) =>
                i === index ? {...conversation, title: newTitle} : conversation
            );
            setConversations(updatedConversations);
            message.success('对话已重命名');
        }
    };

    // 发送消息
  const handleSend = () => {
    if (inputValue.trim() === '') {
      message.warning('消息不能为空');
      return;
    }

    // 用户发送的消息
    const userMessage = {
      text: inputValue,
      isUser: true,
    };

    // 更新当前对话的消息列表
    const updatedCurrentConversation = [...currentConversation, userMessage];
    setCurrentConversation(updatedCurrentConversation);

    // 同步更新 conversations
    const updatedConversations = conversations.map((conversation, index) =>
      index === selectedConversationIndex
        ? { ...conversation, messages: updatedCurrentConversation }
        : conversation
    );
    setConversations(updatedConversations);

    // 清空输入框
    setInputValue('');

    // 模拟系统回复
    setTimeout(() => {
      const systemMessage = {
        text: '这是系统的回复',
        isUser: false, // 系统发送的消息
      };
      // 更新当前对话的消息列表
      const updatedCurrentConversationWithReply = [...updatedCurrentConversation, systemMessage];
      setCurrentConversation(updatedCurrentConversationWithReply);

      // 同步更新 conversations
      const updatedConversationsWithReply = conversations.map((conversation, index) =>
        index === selectedConversationIndex
          ? { ...conversation, messages: updatedCurrentConversationWithReply }
          : conversation
      );
      setConversations(updatedConversationsWithReply)
    }, 1000);
  };

    return (
        <div className="session-container">
            {/* 边栏 */}
            <div className={`session-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <Button className="session-sidebar-button" onClick={toggleSidebar}>
                    {sidebarCollapsed ? '>' : '<'}
                </Button>

                {/* 下拉菜单按钮 */}
                {!sidebarCollapsed && (
                    <Dropdown menu={menuProps} disabled={teams.length === 0}>
                        <Button className="session-team-dropdown">
                            <Space>
                                {selectedTeam ? selectedTeam.name : '选择团队'}
                                <DownOutlined/>
                            </Space>
                        </Button>
                    </Dropdown>
                )}

                {/* 当前团队信息 */}
                {!sidebarCollapsed && (
                    <div className="session-team-name">
                        {selectedTeam ? `当前团队: ${selectedTeam.name}` : '未选择团队'}
                    </div>
                )}

                {/* 创建新对话按钮 */}
                <div className="new-con-container">
                    <Button
                        onClick={handleCreateConversation}
                        disabled={!selectedTeam}
                        type="primary"
                    >
                        {sidebarCollapsed ? '+' : 'New Conversation'}
                    </Button>
                    {/* 提示框 */}
                    {sidebarCollapsed && <div className="new-con-tooltip">New Conversation</div>}
                </div>

                {/* 对话列表 */}
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

            {/* 主内容区域 */}
            {selectedConversationIndex === null ? (
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
                    paddingLeft: '200px'}}>
                        <div className="no-con-selected">
                            Select a conversation from the sidebar or create a new one
                        </div>
                    </div>
            ):(
                <MainContent>
                <MessagesContainer>
                    {currentConversation.map((msg, index) => (
                        <Message key={index} text={msg.text} isUser={msg.isUser}/>
                    ))}
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