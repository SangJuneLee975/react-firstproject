import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button, message } from 'antd';

const { TextArea } = Input;

const CommentForm = ({ boardId, token, onCommentAdded, parentId = null }) => {
  const [commentContent, setCommentContent] = useState('');

  // 댓글 제출 시 호출되는 함수
  const handleCommentSubmit = async () => {
    if (!commentContent.trim()) {
      // 입력 내용이 비어있으면 메시지를 중앙 상단에 표시합니다.
      message.error('내용을 입력해주세요', 2.5); // 2.5초간 표시
      return;
    }

    // 댓글 제출
    try {
      const url = `http://localhost:8080/api/comments/board/${boardId}`;
      const payload = {
        content: commentContent,
        boardId,
        ...(parentId && { parentId }), // parentId가 있으면 payload에 추가합니다.
      };
      await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommentContent(''); // 입력 필드 초기화
      onCommentAdded(); // 댓글 목록 업데이트 콜백 함수 호출
    } catch (error) {
      console.error('댓글 작성 중 오류 발생:', error);
      message.error('댓글 작성 중 오류가 발생했습니다.', 2.5);
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
