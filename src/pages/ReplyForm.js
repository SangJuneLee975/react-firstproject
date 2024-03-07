import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button } from 'antd';
import '../css/Reply.css';

const { TextArea } = Input;

const ReplyForm = ({ boardId, token, onReplyAdded, parentId }) => {
  const [replyContent, setReplyContent] = useState('');

  const handleReplySubmit = async () => {
    const url = `http://localhost:8080/api/comments/${parentId}/reply`;

    try {
      await axios.post(
        url,
        { content: replyContent, boardId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyContent('');
      onReplyAdded();
    } catch (error) {
      console.error('대댓글 작성 중 오류 발생:', error);
    }
  };

  return (
    <div className="reply-input">
      <TextArea
        rows={4}
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        placeholder="대댓글 대댓글을 작성하세요"
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
