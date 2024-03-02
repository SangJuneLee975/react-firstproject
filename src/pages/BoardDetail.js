import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserInfoFromToken } from '../components/parsejwt';
import { List, Button, Input, Typography } from 'antd';
import '../css/BoardDetailcss.css';
import CommentList from './CommentList.js';
import CommentForm from './CommentForm.js';

const { TextArea } = Input;

const BoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState({});
  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [comments, setComments] = useState([]);

  const token = localStorage.getItem('token');
  const userInfo = getUserInfoFromToken(token);
  const userNickname = userInfo?.nickname;

  const fetchBoardDetails = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/boards/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBoard(response.data);
      setEditedTitle(response.data.title);
      setEditedContent(response.data.content);
    } catch (error) {
      console.error('게시판 상세 정보를 가져오는 중 에러:', error);
    }
  }, [id, token]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/comments/board/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(response.data);
    } catch (error) {
      console.error('댓글을 가져오는 중 에러:', error);
    }
  }, [id, token]);

  useEffect(() => {
    fetchBoardDetails();
    fetchComments();
  }, [fetchBoardDetails, fetchComments]);

  const handlePrevNextNavigation = (direction) => {
    const newId =
      direction === 'prev' ? parseInt(id, 10) - 1 : parseInt(id, 10) + 1;
    navigate(`/board/${newId}`);
  };

  const handleEditToggle = () => {
    if (userNickname === board.writer) {
      setEditing(!editing);
    } else {
      alert('작성자만 수정할 수 있습니다.');
    }
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/boards/${id}`,
        {
          title: editedTitle,
          content: editedContent,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchBoardDetails();
      setEditing(false);
    } catch (error) {
      console.error('게시글 수정 중 오류 발생:', error);
    }
  };

  return (
    <div>
      <List
        className="board-detail-container"
        header={
          <div>
            <Typography.Title level={4}>{board.title}</Typography.Title>
          </div>
        }
        footer={
          <div className="navigation-buttons">
            <Button onClick={() => handlePrevNextNavigation('prev')}>
              이전
            </Button>
            <Button onClick={() => handlePrevNextNavigation('next')}>
              다음
            </Button>
            {userNickname === board.writer && (
              <Button onClick={handleEditToggle} style={{ marginLeft: 8 }}>
                수정
              </Button>
            )}
          </div>
        }
      >
        <List.Item className="board-meta-container">
          <span>작성자: {board.writer}</span>
          <span>작성일: {board.date}</span>
        </List.Item>
        {!editing ? (
          <List.Item>{board.content}</List.Item>
        ) : (
          <>
            <List.Item>
              제목:{' '}
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
            </List.Item>
            <List.Item>
              내용:{' '}
              <TextArea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />
            </List.Item>
            <List.Item>
              <Button onClick={handleEditSubmit}>수정 완료</Button>
            </List.Item>
          </>
        )}
      </List>

      <CommentList boardId={id} token={token} />
      <CommentForm boardId={id} token={token} />
    </div>
  );
};

export default BoardDetail;
