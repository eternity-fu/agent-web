import React, { useState } from 'react';
import styled from 'styled-components';
import Markdown from 'react-markdown';
import { Collapse, message } from 'antd';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { UserOutlined, RobotOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';

const MessageContainer = styled.div`
  background: ${({ isUser }) => (isUser ? '#007bff' : '#f1f1f1')};
  color: ${({ isUser }) => (isUser ? '#fff' : '#333')};
  border-radius: 8px;
  padding: 10px 15px;
  margin: 5px 0;
  max-width: 70%;
  align-self: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
`;

const MessageHeader = styled.div`
  display: flex;
  margin-bottom: 8px;
  justify-content: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};
`;

const AIHeader = styled.div`
  display: flex;
  align-items: center;
`;

const UserHeader = styled.div`
  display: flex;
  align-items: center;
`;

const UserIcon = styled(UserOutlined)`
  font-size: 20px;
  margin-right: 8px;
`;

const AIIcon = styled(RobotOutlined)`
  font-size: 20px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const MessageType = styled.span`
  font-size: 16px;
  color: black;
  padding: 2px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  margin-right: 8px;
`;

const ToggleButton = styled.button`
  font-size: 12px;
  color: #666;
  background: #e0e0e0;
  padding: 2px 6px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background: #d0d0d0;
  }
`;

const SearchResultContainer = styled.div`
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  margin: 5px 0;
  max-width: 100%;
`;

const SearchResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SearchResultTitle = styled.div`
  font-weight: bold;
  color: #007bff;
  cursor: pointer;
`;

const SearchResultUrl = styled.div`
  color: #555;
  font-size: 0.9em;
  word-break: break-all;
`;

const SearchResultScore = styled.div`
  color: #888;
  font-size: 0.85em;
`;

const SearchResultContent = styled.div`
  margin-top: 10px;
  color: #333;
`;

const CodeBlockContainer = styled.div`
  margin: 10px 0;
  background: #d3d3d3;
  border-radius: 8px;
  overflow: hidden;
`;

const CodeBlockHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #000;
  color: #fff;
  padding: 5px 10px;
  font-size: 0.9em;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`;

const CodeBlockLanguage = styled.span`
  font-weight: bold;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 0.9em;
  padding: 2px 8px;
  border-radius: 4px;
  width: 60px;
  text-align: center;
  &:hover {
    background: #444;
  }
`;

const CodeBlockContent = styled.div`
  background: #1e1e1e;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  overflow: hidden;
`;

const ImageContainer = styled.div`
  margin: 10px 0;
  background: #d3d3d3;
  border-radius: 8px;
  padding: 8px;
  display: inline-block;
`;

const StyledImage = styled.img`
  max-width: 100%;
  border-radius: 4px;
  display: block;
`;

const ImageError = styled.div`
  color: #ff4d4f;
  font-size: 0.9em;
`;

const Message = ({ text, isUser, type }) => {
  const [isCollapsed, setIsCollapsed] = useState(false); // 添加折叠状态

  // 尝试解析 text 是否为 JSON 格式（搜索结果）
  let parsedData = null;
  try {
    parsedData = JSON.parse(text);
  } catch (e) {
    // 如果不是 JSON，则按普通文本处理
  }

  // 如果是搜索结果（数组且包含 title, url, content, score）
  if (Array.isArray(parsedData) && parsedData[0]?.title && parsedData[0]?.url && parsedData[0]?.content) {
    return (
      <MessageContainer isUser={isUser}>
        <MessageHeader isUser={isUser}>
          {/* AI消息：图标、type和折叠按钮在左上角 */}
          {!isUser && (
            <AIHeader>
              <AIIcon />
              {type && <MessageType>{type}</MessageType>}
              <ToggleButton onClick={() => setIsCollapsed(!isCollapsed)}>
                {isCollapsed ? <UpOutlined /> : <DownOutlined />}
              </ToggleButton>
            </AIHeader>
          )}
          {/*/!* 用户消息：图标和折叠按钮在右上角 *!/*/}
          {/*{isUser && (*/}
          {/*  <UserHeader>*/}
          {/*    <UserIcon />*/}
          {/*    <ToggleButton onClick={() => setIsCollapsed(!isCollapsed)}>*/}
          {/*      {isCollapsed ? <UpOutlined /> : <DownOutlined />}*/}
          {/*    </ToggleButton>*/}
          {/*  </UserHeader>*/}
          {/*)}*/}
        </MessageHeader>
        {/* 根据折叠状态显示或隐藏搜索结果 */}
        {!isCollapsed && (
          <SearchResultContainer>
            {parsedData.map((result, index) => (
              <Collapse
                key={index}
                defaultActiveKey={['0']}
                items={[
                  {
                    key: index.toString(),
                    label: (
                      <SearchResultHeader>
                        <SearchResultTitle>{result.title}</SearchResultTitle>
                        <SearchResultScore>score: {result.score}</SearchResultScore>
                      </SearchResultHeader>
                    ),
                    children: (
                      <>
                        <SearchResultUrl>{result.url}</SearchResultUrl>
                        <SearchResultContent>
                          <Markdown>{result.content}</Markdown>
                        </SearchResultContent>
                      </>
                    ),
                  },
                ]}
              />
            ))}
          </SearchResultContainer>
        )}
      </MessageContainer>
    );
  }

  // 自定义图片组件，带错误处理
  const ImageWithErrorHandling = ({ src, alt, ...props }) => {
    const [error, setError] = useState(false);
    return (
      <ImageContainer>
        {error ? (
          <ImageError>图片加载失败：{alt || '未知图片'}</ImageError>
        ) : (
          <StyledImage
            src={src}
            alt={alt}
            onError={() => setError(true)}
            {...props}
          />
        )}
      </ImageContainer>
    );
  };

  // 普通消息，使用 Markdown 渲染，并自定义代码块和图片
  return (
    <MessageContainer isUser={isUser}>
      <MessageHeader isUser={isUser}>
        {/* AI消息：图标、type和折叠按钮在左上角 */}
        {!isUser && (
          <AIHeader>
            <AIIcon />
            {type && <MessageType>{type}</MessageType>}
            <ToggleButton onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? <UpOutlined /> : <DownOutlined />}
            </ToggleButton>
          </AIHeader>
        )}
        {/* 用户消息：图标和折叠按钮在右上角 */}
        {isUser && (
          <UserHeader>
            <UserIcon />
            <ToggleButton onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? <UpOutlined /> : <DownOutlined />}
            </ToggleButton>
          </UserHeader>
        )}
      </MessageHeader>
      {/* 根据折叠状态显示或隐藏消息内容 */}
      {!isCollapsed && (
        <Markdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : 'text';

              if (inline) {
                return <code className={className} {...props}>{children}</code>;
              }

              const handleCopy = () => {
                navigator.clipboard.writeText(String(children)).then(() => {
                  message.success('代码已复制到剪贴板！');
                }).catch(() => {
                  message.error('复制失败，请手动复制！');
                });
              };

              return (
                <CodeBlockContainer>
                  <CodeBlockHeader>
                    <CodeBlockLanguage>{language}</CodeBlockLanguage>
                    <CopyButton onClick={handleCopy}>复制</CopyButton>
                  </CodeBlockHeader>
                  <CodeBlockContent>
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={language}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        padding: '10px',
                        background: '#1e1e1e',
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </CodeBlockContent>
                </CodeBlockContainer>
              );
            },
            img({ node, ...props }) {
              return <ImageWithErrorHandling {...props} />;
            },
          }}
        >
          {text}
        </Markdown>
      )}
    </MessageContainer>
  );
};

export default Message;