import React from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const ListPage = ({ items, itemName, openModal, deleteItem, modalFields }) => {
  return (
    <>
      {/* 显示数量 */}
      <div className="item-count">
        {items.length} {itemName}
      </div>

      {/* 添加按钮 */}
      <div className="add-item">
        <button onClick={() => openModal()}>Add {itemName}</button>
      </div>

      {/* 列表 */}
      <div className="item-list-container" >
        <div className="item-list">
          {items.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-info">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                {/* 如果是 Models，显示 API 字段 */}
                {modalFields.includes('api') && <p>API: {item.api}</p>}
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