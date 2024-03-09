import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button, message } from 'antd';
import '../css/Reply.css';

const { TextArea } = Input;

const ReplyForm = ({ boardId, token, onReplyAdded, parentId }) => {
  const [replyContent, setReplyContent] = useState('');

  // 대댓글 제출 시 호출되는 함수
  const handleReplySubmit = async () => {
    if (!replyContent.trim()) {
      message.error('내용을 입력해주세요', 2.5); // 2.5초간 표시
      return;
    }

    // 대댓글 제출
    try {
      const url = `http://localhost:8080/api/comments/board/${boardId}`;
      const payload = {
        content: replyContent,
        boardId,
        parentId,
      };
      await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReplyContent('');
      onReplyAdded();
    } catch (error) {
      console.error('대댓글 작성 중 오류 발생:', error);
      message.error('대댓글 작성 중 오류가 발생했습니다.', 2.5);
    }
  };

  return (
    <div className="reply-input">
      <TextArea
        rows={4}
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        placeholder="대댓글을 작성하세요"
      />
      <Button
        type="primary"
        onClick={handleReplySubmit}
        style={{ marginTop: 8 }}
      >
        작성
      </Button>
    </div>
  );
};

export default ReplyForm;
