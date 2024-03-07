import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button } from 'antd';

const { TextArea } = Input;

const CommentForm = ({ boardId, token, onCommentAdded, parentId = null }) => {
  const [commentContent, setCommentContent] = useState('');

  const handleCommentSubmit = async () => {
    const url = `http://localhost:8080/api/comments/board/${boardId}`;
    try {
      await axios.post(
        url,
        { content: commentContent, boardId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentContent('');
      onCommentAdded(); // 댓글 목록 업데이트 콜백 함수 호출
    } catch (error) {
      console.error('댓글 작성 중 오류 발생:', error);
    }
  };

  return (
    <div className="comment-input">
      {/* 댓글 입력 폼 */}
      <TextArea
        rows={4}
        value={commentContent}
        onChange={(e) => setCommentContent(e.target.value)}
        placeholder="댓글을 작성하세요"
      />
      {/* 댓글 작성 버튼 */}
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
