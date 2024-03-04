import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, Button, Input, message } from 'antd';
import { getUserInfoFromToken } from '../components/parsejwt';

const { TextArea } = Input;

const CommentsList = ({ boardId, token, comments, updateComments }) => {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const userInfo = getUserInfoFromToken(token);

  useEffect(() => {
    // 댓글 가져오기
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/comments/board/${boardId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        updateComments();
      } catch (error) {
        console.error('댓글을 가져오는 중 에러:', error);
      }
    };

    fetchComments();
  }, [boardId, token]);

  // 댓글을 삭제하는 함수
  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:8080/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // 댓글 목록 갱신
      updateComments(); // 부모 컴포넌트로부터 전달받은 함수 호출
    } catch (error) {
      console.error('댓글 삭제 중 오류 발생:', error);
    }
  };

  // 댓글 편집하는 함수
  const startEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditedContent(comment.content);
  };

  // 댓글 편집 취소하는 함수
  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditedContent('');
  };

  // 댓글을 수정하는 함수
  const submitEdit = async (commentId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/comments/${commentId}`,
        { content: editedContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      cancelEdit(); // 편집 상태 취소
      updateComments(); // 부모 컴포넌트로부터 전달받은 함수 호출
      message.success('댓글이 수정되었습니다.');
    } catch (error) {
      message.error('댓글을 수정하는데 실패했습니다.');
    }
  };

  return (
    <List
      dataSource={comments}
      header={`${comments.length} 댓글`}
      itemLayout="horizontal"
      locale={{ emptyText: ' ' }} //  No data 숨기기
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
