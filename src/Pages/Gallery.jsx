import React, {useState, useContext} from 'react';
import ListPage from "../Components/Gallery/ListPage";
import './Gallery.css';
import { DataContext} from "../Contexts/DataContext";

const Gallery = () => {
    const [activeTab, setActiveTab] = useState('Agents'); // 当前选中的选项卡
    const [isModalOpen, setIsModalOpen] = useState(false); // 控制弹窗显示
    const [currentItem, setCurrentItem] = useState(null); // 当前正在编辑的项

    // 从 Context 中获取状态和函数
    const { agents, setAgents, tools, setTools, models, setModels } = useContext(DataContext);

    // 处理选项卡点击
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    // 打开弹窗
    const openModal = (item = null) => {
        setCurrentItem(item); // 如果传入 item，则是编辑模式
        setIsModalOpen(true);
    };

    // 关闭弹窗
    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null); // 清空当前编辑的 item
    };

    // 处理创建或更新 item
    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const name = formData.get('name');
        const description = formData.get('description');
        const api = formData.get('api');//仅models页面需要

        const newItem = {
            id: Date.now(),//使用时间戳作为唯一id
            name,
            description,
            ...(activeTab === 'Models' && {api}),//如果是models页面，添加api字段
        };

        if (currentItem) {
            // 更新项
            const updateItems = (prevItems) =>
                prevItems.map((item) =>
                    item.id === currentItem.id ? {...item, ...newItem} : item
                );
            if (activeTab === 'Agents') setAgents(updateItems);
            if (activeTab === 'Tools') setTools(updateItems);
            if (activeTab === 'Models') setModels(updateItems);
        } else {
            // 新建项
            if (activeTab === 'Agents') setAgents((prev) => [...prev, newItem]);
            if (activeTab === 'Tools') setTools((prev) => [...prev, newItem]);
            if (activeTab === 'Models') setModels((prev) => [...prev, newItem]);
        }

        closeModal();
    };

    // 删除项
    const deleteItem = (id) => {
        const deleteItems = (prevItems) => prevItems.filter((item) => item.id !== id);
        if (activeTab === 'Agents') setAgents(deleteItems);
        if (activeTab === 'Tools') setTools(deleteItems);
        if (activeTab === 'Models') setModels(deleteItems);
    };

    // 根据 activeTab 获取当前页面的数据和配置
    const getPageConfig = () => {
        switch (activeTab) {
            case 'Agents':
                return {
                    items: agents,
                    itemName: 'Agents',
                    modalFields: ['name', 'description'], // Agent 弹窗字段
                };
            case 'Tools':
                return {
                    items: tools,
                    itemName: 'Tools',
                    modalFields: ['name', 'description'], // Tools 弹窗字段
                };
            case 'Models':
                return {
                    items: models,
                    itemName: 'Models',
                    modalFields: ['name', 'description', 'api'], // Models 弹窗字段
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

    return (
        <div className="gallery" >
            {/* 头部导航 */}
            <div className="header">
                <button
                    className={activeTab === 'Agents' ? 'active' : ''}
                    onClick={() => handleTabClick('Agents')}
                >
                    Agents({agents.length})
                </button>
                <button
                    className={activeTab === 'Tools' ? 'active' : ''}
                    onClick={() => handleTabClick('Tools')}
                >
                    Tools({tools.length})
                </button>
                <button
                    className={activeTab === 'Models' ? 'active' : ''}
                    onClick={() => handleTabClick('Models')}
                >
                    Models({models.length})
                </button>
            </div>

            {/* 内容区域 */}
            <div className="content" >
                <ListPage
                    items={items}
                    itemName={itemName}
                    openModal={openModal}
                    deleteItem={deleteItem}
                    modalFields={modalFields}
                />
            </div>

            {/* 弹窗 */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{currentItem ? `Edit ${itemName}` : `Add ${itemName}`}</h2>
                        <form onSubmit={handleSubmit}>
                            <label>
                                Name:
                                <input
                                    type="text"
                                    name="name"
                                    defaultValue={currentItem ? currentItem.name : ''}
                                    required
                                />
                            </label>
                            <label>
                                Description:
                                <textarea
                                    name="description"
                                    defaultValue={currentItem ? currentItem.description : ''}
                                    required
                                />
                            </label>
                            {/* 如果是 Models，显示 API 字段 */}
                            {modalFields.includes('api') && (
                                <label>
                                    API:
                                    <input
                                        type="text"
                                        name="api"
                                        defaultValue={currentItem ? currentItem.api : ''}
                                        required
                                    />
                                </label>
                            )}
                            <div className="modal-actions">
                                <button type="button" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit">{currentItem ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;