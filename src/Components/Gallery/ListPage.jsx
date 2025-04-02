import React from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './ListPage.css'

const ListPage = ({ items, itemName, openModal, deleteItem, modalFields }) => {
    return (
        <>
            {/* 显示数量 */}
            <div className="item-count">
                {items.length} {itemName}
            </div>

            {/* 添加按钮 */}
            <div className="add-item">
                <button onClick={() => openModal()}>新增{itemName}</button>
            </div>

            {/* 列表 */}
            <div className="item-list-container">
                <div className="item-list">
                    {items.map((item) => (
                        <div key={item.id} className="item-card">
                            <div className="item-info">
                                <h3>{item.name}</h3>
                                <p>{item.description}</p>
                                {/*/!* 如果是 Agents，显示 tools 和 model *!/*/}
                                {/*{modalFields.includes('tools') && (*/}
                                {/*    <p>Tools: {item.tools.join(', ')}</p>*/}
                                {/*)}*/}
                                {/*{modalFields.includes('model') && (*/}
                                {/*    <p>Model: {item.model}</p>*/}
                                {/*)}*/}
                                {/*/!* 如果是 Tools，显示 code *!/*/}
                                {/*{modalFields.includes('code') && (*/}
                                {/*    <p>Code: {item.code}</p>*/}
                                {/*)}*/}
                                {/*/!* 如果是 Models，显示 api 和 url *!/*/}
                                {/*{modalFields.includes('api') && (*/}
                                {/*    <p>API: {item.api}</p>*/}
                                {/*)}*/}
                                {/*{modalFields.includes('url') && (*/}
                                {/*    <p>URL: {item.url}</p>*/}
                                {/*)}*/}
                            </div>
                            <div className="item-actions">
                                <button onClick={() => openModal(item)}>
                                    <EditOutlined />
                                </button>
                                <button onClick={() => deleteItem(item.id)}>
                                    <DeleteOutlined />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ListPage;