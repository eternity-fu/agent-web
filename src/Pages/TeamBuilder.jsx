import React, {useContext, useState} from 'react';
import './TeamBuilder.css'; // 引入样式文件
import {DeleteOutlined, PlusOutlined, SaveOutlined} from '@ant-design/icons';
import {DataContext} from "../Contexts/DataContext";

const TeamBuilder = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null); // 当前选中的团队
    const [selectedAgent, setSelectedAgent] = useState(null); // 当前选中的 agent
    const [showAgentModal, setShowAgentModal] = useState(false); // 是否显示弹窗
    const [showToolModal, setShowToolModal] = useState(false); // 是否显示 tool 弹窗
    const [showModelModal, setShowModelModal] = useState(false); // 是否显示 model 弹窗
    const {agents, tools, models, teams, setTeams} = useContext(DataContext); // 获取全局的 agents
    const [editedTeamName, setEditedTeamName] = useState(''); // 编辑中的团队名称
    const [localAgents, setLocalAgents] = useState([]); // 本地 agents（未保存的临时状态）


    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // 新建团队
    const handleNewTeam = () => {
        const newTeam = {
            id: Date.now(), // 使用时间戳作为唯一 ID
            name: `Team ${teams.length + 1}`,
            agents: [], // 初始 agents 为空
        };
        setTeams([...teams, newTeam]);
    };

    // 选择团队
    const handleSelectTeam = (team) => {
        setSelectedTeam(team);
        setEditedTeamName(team.name); // 初始化编辑名称
        setLocalAgents([...team.agents]); // 初始化本地 agents
        setSelectedAgent(null); // 清空选中的 agent
    };

    // 删除团队
    const handleDeleteTeam = (team) => {
        const updatedTeams = teams.filter((t) => t.id !== team.id);
        setTeams(updatedTeams);

        // 如果删除的是当前选中的团队，清空选中状态
        if (selectedTeam && selectedTeam.id === team.id) {
            setSelectedTeam(null);
            setEditedTeamName('');
            setLocalAgents([]); // 清空本地 agents
            setSelectedAgent(null); // 清空选中的 agent
        }
    };

    // 添加 Agent 到当前团队（临时状态）
    const handleAddAgent = (agent) => {
        const updatedAgents = [...localAgents, {...agent, tools: [], model: null}]; // 初始化 agent 的 tools 和 model
        setLocalAgents(updatedAgents); // 更新本地 agents
        setShowAgentModal(false); // 关闭弹窗
    };

    // 移除 Agent 从当前团队（临时状态）
    const handleRemoveAgent = (agent) => {
        setLocalAgents(localAgents.filter((a) => a.id !== agent.id)); // 更新本地 agents
        if (selectedAgent && selectedAgent.id === agent.id) {
            setSelectedAgent(null); // 清空选中的 agent
        }
    };

    // 选择 Agent
    const handleSelectAgent = (agent) => {
        setSelectedAgent(agent);
    };

    // 获取未选择的 Agents
    const getUnselectedAgents = () => {
        return agents.filter((agent) => !localAgents.some((a) => a.id === agent.id));
    };

    // 获取未选择的 tools
    const getUnselectedTools = () => {
        return tools.filter((tool) => !selectedAgent.tools.some((t) => t.id === tool.id));
    };

    // 添加 Tool 到当前 Agent（临时状态）
    const handleAddTool = (tool) => {
        const updatedAgents = localAgents.map((agent) =>
            agent.id === selectedAgent.id
                ? {...agent, tools: [...agent.tools, tool]} // 更新当前 agent 的 tools
                : agent
        );
        setLocalAgents(updatedAgents); // 更新本地 agents
        // 同步更新 selectedAgent
        const updatedSelectedAgent = updatedAgents.find((agent) => agent.id === selectedAgent.id);
        setSelectedAgent(updatedSelectedAgent);
        setShowToolModal(false); // 关闭弹窗
    };

// 移除 Tool 从当前 Agent（临时状态）
    const handleRemoveTool = (tool) => {
        const updatedAgents = localAgents.map((agent) =>
            agent.id === selectedAgent.id
                ? {...agent, tools: agent.tools.filter((t) => t.id !== tool.id)} // 移除当前 agent 的 tool
                : agent
        );
        setLocalAgents(updatedAgents); // 更新本地 agents
        // 同步更新 selectedAgent
        const updatedSelectedAgent = updatedAgents.find((agent) => agent.id === selectedAgent.id);
        setSelectedAgent(updatedSelectedAgent);
    };

    // 选择 Model 到当前 Agent（临时状态）
    const handleSelectModel = (model) => {
        const updatedAgents = localAgents.map((agent) =>
            agent.id === selectedAgent.id
                ? {...agent, model} // 更新当前 agent 的 model
                : agent
        );
        setLocalAgents(updatedAgents); // 更新本地 agents
        // 同步更新 selectedAgent
        const updatedSelectedAgent = updatedAgents.find((agent) => agent.id === selectedAgent.id);
        setSelectedAgent(updatedSelectedAgent);
        setShowModelModal(false); // 关闭弹窗
    };

// 删除 Model 从当前 Agent（临时状态）
    const handleRemoveModel = () => {
        const updatedAgents = localAgents.map((agent) =>
            agent.id === selectedAgent.id
                ? {...agent, model: null} // 清空当前 agent 的 model
                : agent
        );
        setLocalAgents(updatedAgents); // 更新本地 agents
        // 同步更新 selectedAgent
        const updatedSelectedAgent = updatedAgents.find((agent) => agent.id === selectedAgent.id);
        setSelectedAgent(updatedSelectedAgent);
    };

    // 保存团队配置
    const handleSaveTeam = () => {
        const updatedTeams = teams.map((team) =>
            team.id === selectedTeam.id
                ? {
                    ...team,
                    name: editedTeamName,
                    agents: localAgents,// 更新团队的所有 agents
                }
                : team
        );
        setTeams(updatedTeams);
        alert('Team configuration saved!');
    };

    // 关闭弹窗
    const handleCloseModal = (e) => {
        if (e.target === e.currentTarget) {
            setShowAgentModal(false);
            setShowToolModal(false);
            setShowModelModal(false);// 点击背景层时关闭弹窗
        }
    };

    return (
        <div className="team-builder">
            {/* 新增的 TeamBuilder 边栏 */}
            <div className={`team-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <button onClick={toggleSidebar} className="team-toggle-button">
                    {sidebarCollapsed ? '>' : '<'}
                </button>
                {/* 新建团队按钮 */}
                <div className="new-team-container">
                    <button onClick={handleNewTeam} className="team-new-team-button">
                        {sidebarCollapsed ? '+' : 'New Team'}
                    </button>
                    {/* 提示框 */}
                    {sidebarCollapsed && <div className="new-team-tooltip">New Team</div>}
                </div>
                {/* 团队列表 */}
                {!sidebarCollapsed && (
                    <div className="team-list-container">
                        <ul>
                            {teams.map((team) => (
                                <li
                                    key={team.id}
                                    className={`team-item ${selectedTeam && selectedTeam.id === team.id ? 'selected' : ''}`}
                                    onClick={() => handleSelectTeam(team)}
                                >
                                    {team.name}
                                    {/* 删除按钮 */}
                                    <div className='team-action'>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // 阻止事件冒泡，避免触发团队选中
                                                handleDeleteTeam(team);
                                            }}>
                                            <DeleteOutlined style={{color: 'red'}}/>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* 主内容区域 */}
            <div className="team-main-content">
                {!selectedTeam ? (
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
                    paddingLeft: '200px'}}>
                        <div className="no-team-selected">
                            Select a team from the sidebar or create a new one
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Team 卡片 */}
                        <div className="team-card">
                            <div className="agent-label">
                                <span>Name</span>
                            </div>
                            {/* 团队名称（可编辑） */}
                            <input
                                type="text"
                                value={editedTeamName}
                                onChange={(e) => setEditedTeamName(e.target.value)}
                                className="team-name-input"
                            />

                            {/* Agent 标签 */}
                            <div className="agent-label">
                                <span>Agents</span>
                            </div>

                            {/* 已有的 Agents */}
                            {localAgents.length > 0 ? (
                                <div className="existing-agents">
                                    {localAgents.map((agent) => (
                                        <div
                                            key={agent.id}
                                            className={`agent-item ${selectedAgent && selectedAgent.id === agent.id ? 'selected' : ''}`}
                                            onClick={() => handleSelectAgent(agent)}
                                        >
                                            {agent.name}
                                            <div className='remove-action'>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // 阻止事件冒泡，避免触发 agent 选中
                                                        handleRemoveAgent(agent);
                                                    }}
                                                >
                                                    <DeleteOutlined style={{color: 'red'}}/>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-agents">No agents added yet.</div>
                            )}

                            {/* 添加 Agent 的虚线框 */}
                            <div className="add-agent-box" onClick={() => setShowAgentModal(true)}>
                                <PlusOutlined/>
                            </div>

                            {/* Save 按钮 */}
                            <button className="save-button" onClick={handleSaveTeam}>
                                <SaveOutlined/> Save
                            </button>
                        </div>

                        {/* Agent 卡片 */}
                        {selectedAgent && (
                            <div className="agent-card">
                                <div className="agent-label">
                                    <span>Agent: {selectedAgent.name}</span>
                                </div>

                                {/* Tools 标签 */}
                                <div className="agent-label">
                                    <span>Tools</span>
                                </div>

                                {/* 已有的 Tools */}
                                {selectedAgent.tools.length > 0 ? (
                                    <div className="existing-tools">
                                        {selectedAgent.tools.map((tool) => (
                                            <div key={tool.id} className="tool-item">
                                                {tool.name}
                                                <div className='remove-action'>
                                                    <button
                                                        onClick={() => handleRemoveTool(tool)}
                                                    >
                                                        <DeleteOutlined style={{color: 'red'}}/>
                                                    </button>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-tools">No tools added yet.</div>
                                )}

                                {/* 添加 Tool 的虚线框 */}
                                <div className="add-tool-box" onClick={() => setShowToolModal(true)}>
                                    <PlusOutlined/>
                                </div>

                                {/* Model 标签 */}
                                <div className="agent-label">
                                    <span>Model</span>
                                </div>

                                {/* 已选的 Model */}
                                {selectedAgent.model ? (
                                    <div className="selected-model">
                                        {selectedAgent.model.name}
                                        <div className='remove-action'>
                                            <button
                                                onClick={handleRemoveModel}
                                            >
                                                <DeleteOutlined style={{color: 'red'}}/>
                                            </button>
                                        </div>

                                    </div>
                                ) : (
                                    <div className="add-model-box" onClick={() => setShowModelModal(true)}>
                                        <PlusOutlined/>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* 添加 Agent 的弹窗 */}
            {showAgentModal && (
                <div className="agent-modal" onClick={handleCloseModal}>
                    <div className="agent-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Select an Agent</h3>
                        <ul>
                            {getUnselectedAgents().map((agent) => (
                                <li
                                    key={agent.id}
                                    onClick={() => handleAddAgent(agent)}
                                >
                                    {agent.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* 添加 Tool 的弹窗 */}
            {showToolModal && (
                <div className="tool-modal" onClick={handleCloseModal}>
                    <div className="tool-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Select a Tool</h3>
                        <ul>
                            {getUnselectedTools().map((tool) => (
                                <li
                                    key={tool.id}
                                    onClick={() => handleAddTool(tool)}
                                >
                                    {tool.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* 选择 Model 的弹窗 */}
            {showModelModal && (
                <div className="model-modal" onClick={handleCloseModal}>
                    <div className="model-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Select a Model</h3>
                        <ul>
                            {models.map((model) => (
                                <li
                                    key={model.id}
                                    onClick={() => handleSelectModel(model)}
                                >
                                    {model.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamBuilder;