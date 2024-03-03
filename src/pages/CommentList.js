import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, Button, Input, message } from 'antd';

const { TextArea } = Input;

const CommentsList = ({ boardId, token, userInfo }) => {
  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [boardId, token]);

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

  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:8080/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComments();
      message.success('댓글이 삭제되었습니다.');
    } catch (error) {
      console.error('댓글 삭제 중 오류 발생:', error);
      message.error('댓글을 삭제하는데 실패했습니다.');
    }
  };

  const startEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditedContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditedContent('');
  };

  const submitEdit = async (commentId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/comments/${commentId}`,
        { content: editedContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cancelEdit(); // 편집 상태 취소
      fetchComments(); // 댓글 목록 새로고침
      console.log('User ID from token:', userInfo?.userId);
      message.success('댓글이 수정되었습니다.');
    } catch (error) {
      console.error('댓글 수정 중 오류 발생:', error);
      console.log('User ID from token:', userInfo?.userId);
      message.error('댓글을 수정하는데 실패했습니다.');
    }
  };

  return (
    <List
      dataSource={comments}
      header={`${comments.length} 댓글`}
      itemLayout="horizontal"
      renderItem={(item) => (
        <List.Item
          actions={[
            editingCommentId === item.id ? (
              <>
                <Button key="cancel" onClick={cancelEdit}>
                  취소
                </Button>
                <Button
                  key="save"
                  type="primary"
                  onClick={() => submitEdit(item.id)}
                >
                  저장
                </Button>
              </>
            ) : (
              <>
                <Button key="edit" onClick={() => startEdit(item)}>
                  수정
                </Button>
                <Button key="delete" onClick={() => deleteComment(item.id)}>
                  삭제
                </Button>
              </>
            ),
          ]}
        >
          {editingCommentId === item.id ? (
            <TextArea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              autoSize
            />
          ) : (
            <List.Item.Meta
              title={
                <span>
                  {item.userId} - {item.date}
                </span>
              }
              description={item.content}
            />
          )}
        </List.Item>
      )}
    />
  );
};

export default CommentsList;
