import React, { useState } from 'react';
import styled from 'styled-components';
import Markdown from 'react-markdown';
import { Collapse, message } from 'antd';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MessageContainer = styled.div`
  background: ${({ isUser }) => (isUser ? '#007bff' : '#f1f1f1')};
  color: ${({ isUser }) => (isUser ? '#fff' : '#333')};
  border-radius: 8px;
  padding: 10px 15px;
  margin: 5px 0;
  max-width: 70%;
  align-self: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
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
  background: #d3d3d3; // 与代码块容器背景一致
  border-radius: 8px; // 圆角矩形
  padding: 8px; // 内边距
  display: inline-block; // 适应图片大小
`;

const StyledImage = styled.img`
  max-width: 100%; // 确保图片不会超出容器
  border-radius: 4px; // 图片本身也有圆角
  display: block; // 避免图片下方的空白
`;

const ImageError = styled.div`
  color: #ff4d4f;
  font-size: 0.9em;
`;

const Message = ({ text, isUser }) => {
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
      <Markdown
        components={{
          // 自定义代码块渲染
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
          // 自定义图片渲染
          img({ node, ...props }) {
            return <ImageWithErrorHandling {...props} />;
          },
        }}
      >
        {text}
      </Markdown>
    </MessageContainer>
  );
};

export default Message;