import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List } from 'antd';

const CommentsList = ({ boardId, token }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/comments/board/${boardId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setComments(response.data);
      } catch (error) {
        console.error('댓글을 가져오는 중 에러:', error);
      }
    };

    fetchComments();
  }, [boardId, token]);

  return (
    <List
      dataSource={comments}
      header={`${comments.length} 댓글`}
      itemLayout="horizontal"
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            title={
              <span>
                {item.userId} - {item.date}
              </span>
            }
            description={item.content}
          />
        </List.Item>
      )}
    />
  );
};

export default CommentsList;
