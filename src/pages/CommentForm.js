import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button } from 'antd';

const { TextArea } = Input;

const CommentForm = ({ boardId, token, onCommentAdded }) => {
  const [newComment, setNewComment] = useState('');

  const handleCommentSubmit = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/comments/board/${boardId}`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('댓글 추가 응답 데이터:', response.data);

      setNewComment('');
      onCommentAdded(response.data); // 부모 컴포넌트에 댓글 리스트 업데이트
    } catch (error) {
      console.error('댓글 작성 중 오류 발생:', error);
    }
  };

  return (
    <div className="comment-input">
      <TextArea
        rows={4}
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="댓글을 작성하세요"
      />
      <Button
        type="primary"
        onClick={handleCommentSubmit}
        style={{ marginTop: 8 }}
      >
        작성
      </Button>
    </div>
  );
};

export default CommentForm;
