import React, {useState, useContext, useEffect} from 'react';
import ListPage from "../Components/Gallery/ListPage";
import './Gallery.css';
import {DataContext} from "../Contexts/DataContext";
import {DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import axios from "axios";
import {message} from "antd";

const Gallery = () => {
    const [activeTab, setActiveTab] = useState('Agents'); // 当前选中的选项卡
    const [isModalOpen, setIsModalOpen] = useState(false); // 控制弹窗显示
    const [currentItem, setCurrentItem] = useState(null); // 当前正在编辑的项
    const [showToolModal, setShowToolModal] = useState(false); // 控制 Tool 选择弹窗
    const [showModelModal, setShowModelModal] = useState(false); // 控制 Model 选择弹窗
    const [loading, setLoading] = useState(false);
    const [sourceType, setSourceType] = useState(currentItem?.code ? 'code' : 'file');//跟踪source类型

    // 从 Context 中获取状态和函数
    const {agents, setAgents, tools, setTools, models, setModels} = useContext(DataContext);

    const API_BASE = 'http://127.0.0.1:5000'

    // 初始化加载数据
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [agentsRes, toolsRes, llmsRes] = await Promise.all([
                    axios.get(`${API_BASE}/v1/agents/list`),
                    axios.get(`${API_BASE}/v1/tools/list`),
                    axios.get(`${API_BASE}/v1/llms/list`),
                ]);

                // 获取 Agents 并为每个 Agent 加载 Tools
                const agentsWithTools = await Promise.all(
                    agentsRes.data.map(async (agent) => {
                        const toolsRes = await axios.get(`${API_BASE}/v1/agent_tools/get/${agent.agent_id}`);
                        return {
                            id: agent.agent_id,
                            name: agent.name,
                            description: agent.description,
                            model: agent.llm_id, // 前端用 model 对应 llm_id
                            tools: toolsRes.data.map(at => at.tool_id), // 获取 Tool ID 列表
                            update_time: agent.update_time,
                        };
                    })
                );
                setAgents(agentsWithTools);

                // 映射 Tools 数据
                setTools(toolsRes.data.map(tool => ({
                    id: tool.tool_id,
                    name: tool.name,
                    description: tool.description,
                    inputs: tool.inputs,
                    output_type: tool.output_type,
                    update_time: tool.update_time,
                })));

                // 映射 Models (LLMs) 数据
                setModels(llmsRes.data.map(llm => ({
                    id: llm.llm_id,
                    name: llm.llm_name,
                    api_key: llm.api_key,
                    url: llm.base_url, // 前端用 url 对应后端的 base_url
                    update_time: llm.update_time,
                })));
            } catch (error) {
                message.error('Failed to load data');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [setAgents, setTools, setModels]);

    // 移除 Tool
    const handleRemoveTool = (toolId) => {
        const updatedTools = currentItem.tools.filter((id) => id !== toolId);
        setCurrentItem({...currentItem, tools: updatedTools});
    };

// 移除 Model
    const handleRemoveModel = () => {
        setCurrentItem({...currentItem, model: null});
    };

    // 处理选项卡点击
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    // 打开弹窗
    const openModal = (item = null) => {
        setCurrentItem(item || {
            tools: [],
            model: null,
            name: '',
            description: '',
            code: '',
            api_key: '',
            url: '',
            inputs: '',
            output_type: '',
        }); // 初始化 currentItem
        setIsModalOpen(true);
    };

    // 关闭弹窗
    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null); // 清空当前编辑的 item
    };

    // 创建或更新项
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!currentItem) return;

        setLoading(true);
        const formData = new FormData(event.target);
        try {
            if (activeTab === 'Agents') {
                const agentPayload = {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    llm_id: currentItem.model,
                    ...(currentItem.id && {agent_id: currentItem.id}),
                };
                const toolsPayload = {
                    agent_id: currentItem.id || null,
                    tools: currentItem.tools || [],
                };

                let agentId;
                if (currentItem.id) {
                    // 更新 Agent
                    const response = await axios.post(`${API_BASE}/v1/agents/update`, agentPayload);
                    agentId = response.data.agent_id;

                    // 更新 Tools 关联：先删除旧的，再添加新的
                    await axios.post(`${API_BASE}/v1/agent_tools/delete/${agentId}`);
                    if (toolsPayload.tools.length > 0) {
                        await axios.post(`${API_BASE}/v1/agent_tools/add`, {
                            ...toolsPayload,
                            agent_id: agentId,
                        });
                    }

                    setAgents(prev => prev.map(item => item.id === agentId ? {
                        ...item,
                        name: agentPayload.name,
                        description: agentPayload.description,
                        model: agentPayload.llm_id,
                        tools: toolsPayload.tools,
                    } : item));
                    message.success('Agent updated successfully');
                } else {
                    // 创建 Agent
                    const response = await axios.post(`${API_BASE}/v1/agents/add`, agentPayload);
                    agentId = response.data.agent_id;

                    // 添加 Tools 关联
                    if (toolsPayload.tools.length > 0) {
                        await axios.post(`${API_BASE}/v1/agent_tools/add`, {
                            ...toolsPayload,
                            agent_id: agentId,
                        });
                    }

                    setAgents(prev => [...prev, {
                        id: agentId,
                        name: agentPayload.name,
                        description: agentPayload.description,
                        model: agentPayload.llm_id,
                        tools: toolsPayload.tools,
                    }]);
                    message.success('Agent created successfully');
                }
            } else if (activeTab === 'Tools') {
                deleteItem(currentItem.id)
                const payload = new FormData();
                payload.append('name', formData.get('name'));
                payload.append('description', formData.get('description'));
                payload.append('inputs', formData.get('inputs'));
                payload.append('output_type', formData.get('output_type'));
                const sourceType = formData.get('source_type');
                if (sourceType === 'code') {
                    payload.append('code', formData.get('code'));
                } else if (sourceType === 'file') {
                    payload.append('file', formData.get('file'));
                }
                const response = await axios.post(`${API_BASE}/v1/tools/add`, payload, {
                    headers: {'Content-Type': 'multipart/form-data'},
                });
                setTools(prev => [...prev, {
                    id: response.data.tool_id,
                    name: payload.get('name'),
                    description: payload.get('description'),
                    inputs: payload.get('inputs'),
                    output_type: payload.get('output_type'),
                    ...(sourceType === 'code' && { code: payload.get('code') }),
                    ...(sourceType === 'file' && { file: payload.get('file') }),
                }]);
                message.success('Tool created successfully');
            } else if (activeTab === 'Models') {
                const modelPayload = {
                    name: formData.get('name'),
                    api_key: formData.get('api_key'),
                    base_url: formData.get('url'),
                    ...(currentItem.id && {llm_id: currentItem.id}),
                };

                let modelId;
                if (currentItem.id) {
                    // 更新 Model
                    const response = await axios.put(`${API_BASE}/v1/llm/update/${currentItem.id}`, modelPayload);
                    modelId = response.data.llm_id;
                    setModels(prev => prev.map(item => item.id === modelId ? {
                        ...item,
                        name: modelPayload.name,
                        api_key: modelPayload.api_key,
                        url: modelPayload.base_url,
                    } : item));
                    message.success('Model updated successfully');
                } else {
                    // 创建 Model
                    const response = await axios.post(`${API_BASE}/v1/llm/add`, modelPayload);
                    modelId = response.data.llm_id;
                    setModels(prev => [...prev, {
                        id: modelId,
                        name: modelPayload.name,
                        api_key: modelPayload.api_key,
                        url: modelPayload.base_url,
                    }]);
                    message.success('Model created successfully');
                }
            }
            closeModal();
        } catch (error) {
            message.error(`Failed to ${currentItem.id ? 'update' : 'create'} ${activeTab}`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // 删除项
    const deleteItem = async (id) => {
        setLoading(true);
        try {
            if (activeTab === 'Agents') {
                // 先删除 Tools 关联，再删除 Agent
                await axios.post(`${API_BASE}/v1/agent_tools/delete/${id}`);
                await axios.get(`${API_BASE}/v1/agents/delete/${id}`);
                setAgents(prev => prev.filter(item => item.id !== id));
                message.success('Agent deleted successfully');
            } else if (activeTab === 'Tools') {
                await axios.post(`${API_BASE}/v1/tools/delete/${id}`);
                // 更新所有引用该 Tool 的 Agents
                setAgents(prev => prev.map(agent => {
                    if (agent.tools && agent.tools.includes(id)) {
                        return {
                            ...agent,
                            tools: agent.tools.filter(toolId => toolId !== id)
                        };
                    }
                    return agent;
                }));
                setTools(prev => prev.filter(item => item.id !== id));
                message.success('Tool deleted successfully');
            } else if (activeTab === 'Models') {
                await axios.post(`${API_BASE}/v1/llm/delete/${id}`);
                setModels(prev => prev.filter(item => item.id !== id));
                message.success('Model deleted successfully');
            }
        } catch (error) {
            message.error(`Failed to delete ${activeTab}`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // 根据 activeTab 获取当前页面的数据和配置
    const getPageConfig = () => {
        switch (activeTab) {
            case 'Agents':
                return {
                    items: agents,
                    itemName: '智能体',
                    modalFields: ['name', 'description', 'tools', 'model'], // Agent 弹窗字段
                };
            case 'Tools':
                return {
                    items: tools,
                    itemName: '工具',
                    modalFields: ['name', 'description', 'inputs', 'output_type', 'source'], // Tools 弹窗字段
                };
            case 'Models':
                return {
                    items: models,
                    itemName: '大模型',
                    modalFields: ['name', 'api_key', 'url'], // Models 弹窗字段
                };
            default:
                return {
                    items: [],
                    itemName: '',
                    modalFields: [],
                };
        }
    };

    const {items, itemName, modalFields} = getPageConfig();
    console.log("data:", items);

    return (
        <div className="gallery">
            {/* 头部导航 */}
            <div className="header">
                <button
                    className={activeTab === 'Agents' ? 'active' : ''}
                    onClick={() => handleTabClick('Agents')}
                >
                    智能体({agents.length})
                </button>
                <button
                    className={activeTab === 'Tools' ? 'active' : ''}
                    onClick={() => handleTabClick('Tools')}
                >
                    工具({tools.length})
                </button>
                <button
                    className={activeTab === 'Models' ? 'active' : ''}
                    onClick={() => handleTabClick('Models')}
                >
                    大模型({models.length})
                </button>
            </div>

            {/* 内容区域 */}
            <div className="content">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <ListPage
                        items={items}
                        itemName={itemName}
                        openModal={openModal}
                        deleteItem={deleteItem}
                        modalFields={modalFields}
                    />
                )}
            </div>

            {/* 弹窗 */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{currentItem.id ? `编辑 ${itemName}` : `新建 ${itemName}`}</h2>
                        <form onSubmit={handleSubmit}>
                            <label>
                                名称:
                                <input
                                    type="text"
                                    name="name"
                                    defaultValue={currentItem ? currentItem.name : ''}
                                    required
                                />
                            </label>
                            {modalFields.includes('description') && (
                                <label>
                                    描述:
                                    <textarea
                                        name="description"
                                        defaultValue={currentItem ? currentItem.description : ''}
                                        required
                                    />
                                </label>
                            )}


                            {/* 如果是 Agents，显示 tools 和 model 字段 */}
                            {modalFields.includes('tools') && (
                                <div className="tm-card">
                                    <div className="tm-label">
                                        <span>工具</span>
                                    </div>

                                    {/* 已有的 Tools */}
                                    {currentItem?.tools?.length > 0 ? (
                                        <div className="existing-tools">
                                            {currentItem.tools.map((toolId) => {
                                                const tool = tools.find((t) => t.id === toolId);
                                                return (
                                                    <div key={toolId} className="selected-tool-item">
                                                        {tool?.name}
                                                        <div className="remove-action">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveTool(toolId)}
                                                            >
                                                                <DeleteOutlined style={{color: 'red'}}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="no-tools">请选择工具</div>
                                    )}

                                    {/* 添加 Tool 的虚线框 */}
                                    <div
                                        className="add-tool-box"
                                        onClick={() => setShowToolModal(true)} // 打开 Tool 选择弹窗
                                    >
                                        <PlusOutlined/>
                                    </div>
                                </div>
                            )}

                            {modalFields.includes('model') && (
                                <div className="tm-card">
                                    <div className="tm-label">
                                        <span>大模型</span>
                                    </div>

                                    {/* 已选的 Model */}
                                    {currentItem?.model ? (
                                        <div className="selected-model">
                                            {models.find((m) => m.id === currentItem.model)?.name}
                                            <div className="remove-action">
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveModel}
                                                >
                                                    <DeleteOutlined style={{color: 'red'}}/>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="add-model-box"
                                            onClick={() => setShowModelModal(true)} // 打开 Model 选择弹窗
                                        >
                                            <PlusOutlined/>
                                        </div>
                                    )}
                                </div>
                            )}

                            {modalFields.includes('inputs') && (
                                <label>
                                    输入:
                                    <input type="text" name="inputs" defaultValue={currentItem.inputs} required/>
                                </label>
                            )}
                            {modalFields.includes('output_type') && (
                                <label>
                                    输出:
                                    <input type="text" name="output_type" defaultValue={currentItem.output_type}
                                           required/>
                                </label>
                            )}

                            {/* 如果是 Tools，显示 source 字段 */}
                            {modalFields.includes('source') && (
                                <>
                                    <label>
                                        代码或文件:
                                        <select
                                            name="source_type"
                                            value={sourceType}
                                            onChange={(e) => setSourceType(e.target.value)}
                                        >
                                            <option value="code">代码</option>
                                            <option value="file">文件</option>
                                        </select>
                                    </label>

                                    {sourceType === 'code' && (
                                        <label>
                                            代码:
                                            <textarea
                                                name="code"
                                                defaultValue={currentItem ? currentItem.code : ''}
                                                required
                                            />
                                        </label>
                                    )}

                                    {sourceType === 'file' && (
                                        <label>
                                            上传文件:
                                            <div className='file-container'>
                                                <input
                                                    type="file"
                                                    name="file"
                                                    // style={{display: 'block', margin: '0 auto'}}
                                                    required
                                                />
                                                <span>点击上传文件</span>
                                            </div>
                                        </label>
                                    )}
                                </>
                            )}

                            {/* 如果是 Models，显示 api 和 url 字段 */}
                            {modalFields.includes('api_key') && (
                                <label>
                                    API:
                                    <input
                                        type="text"
                                        name="api_key"
                                        defaultValue={currentItem ? currentItem.api_key : ''}
                                        required
                                    />
                                </label>
                            )}
                            {modalFields.includes('url') && (
                                <label>
                                    URL:
                                    <input
                                        type="text"
                                        name="url"
                                        defaultValue={currentItem ? currentItem.url : ''}
                                        required
                                    />
                                </label>
                            )}

                            <div className="modal-actions">
                                <button type="button" onClick={closeModal} disabled={loading}>
                                    取消
                                </button>
                                <button type="submit" disabled={loading}>
                                    {currentItem.id ? '更新' : '创建'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tool 选择弹窗 */}
            {showToolModal && (
                <div className="tm-modal-overlay">
                    <div className="tm-modal">
                        <h2>选择工具</h2>
                        <div className="tool-list">
                            {tools.map((tool) => (
                                <div
                                    key={tool.id}
                                    className={`tool-item ${currentItem?.tools?.includes(tool.id) ? 'selected' : ''}`}
                                    onClick={() => {
                                        const updatedTools = currentItem.tools?.includes(tool.id)
                                            ? currentItem.tools.filter((id) => id !== tool.id) // 如果已选中，则移除
                                            : [...(currentItem.tools || []), tool.id]; // 如果未选中，则添加
                                        setCurrentItem({...currentItem, tools: updatedTools});
                                    }}
                                >
                                    {tool.name}
                                </div>
                            ))}
                        </div>
                        <div className="tm-modal-actions">
                            <button onClick={() => setShowToolModal(false)}>
                                完成
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Model 选择弹窗 */}
            {showModelModal && (
                <div className="tm-modal-overlay">
                    <div className="tm-modal">
                        <h2>选择大模型</h2>
                        <div className="model-list">
                            {models.map((model) => (
                                <div
                                    key={model.id}
                                    className={`model-item ${currentItem?.model === model.id ? 'selected' : ''}`}
                                    onClick={() => {
                                        setCurrentItem({...currentItem, model: model.id});
                                        setShowModelModal(false);
                                    }}
                                >
                                    {model.name}
                                </div>
                            ))}
                        </div>
                        <div className="tm-modal-actions">
                            <button type="button" onClick={() => setShowModelModal(false)}>
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Gallery;