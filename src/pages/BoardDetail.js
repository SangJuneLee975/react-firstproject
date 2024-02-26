import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserInfoFromToken } from '../components/parsejwt';

const BoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState({});
  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');

  const token = localStorage.getItem('token');
  const userInfo = getUserInfoFromToken(token);
  const userNickname = userInfo?.nickname; // 토큰에서 사용자 정보 추출

  useEffect(() => {
    const fetchBoardDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/boards/${id}`
        );
        setBoard(response.data);
        setEditedTitle(response.data.title);
        setEditedContent(response.data.content);
      } catch (error) {
        console.error('게시판 상세 정보를 가져오는 중 에러:', error);
      }
    };

    fetchBoardDetails();
  }, [id]);

  //이전 다음 버튼
  const handlePrevNextNavigation = async (direction) => {
    const newId =
      direction === 'prev' ? parseInt(id, 10) - 1 : parseInt(id, 10) + 1;
    try {
      const response = await axios.get(
        `http://localhost:8080/api/boards/${newId}`
      );
      navigate(`/board/${newId}`);
      setBoard(response.data);
      setEditedTitle(response.data.title);
      setEditedContent(response.data.content);
    } catch (error) {
      console.error(`${direction} 게시글 불러오기 에러:`, error);
    }
  };

  const handleEditToggle = () => {
    // 로그인한 사용자가 게시글의 작성자인 경우에만 수정 모드로 전환
    if (userNickname === board.writer) {
      setEditing(!editing);
    } else {
      alert('작성자만 수정할 수 있습니다.');
    }
  };

  const handleEditSubmit = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/boards/${id}`,
        { title: editedTitle, content: editedContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('게시글 수정 성공:', response.data);
      setEditing(false);
      navigate(`/board/${id}`); // 수정 후 상세 페이지로 리다이렉트
    } catch (error) {}
  };

  return (
    <div className="board-detail-container">
      {!editing ? (
        <>
          <h1>{board.title}</h1>
          <p>{board.content}</p>
          {userNickname === board.writer && (
            <>
              <button onClick={handleEditToggle}>수정</button>
              {/* 삭제 버튼 등 다른 UI 요소 */}
            </>
          )}
          <button onClick={() => handlePrevNextNavigation('prev')}>이전</button>
          <button onClick={() => handlePrevNextNavigation('next')}>다음</button>
        </>
      ) : (
        // 수정 모드 UI
        <div>
          <label>
            제목:
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
          </label>
          <label>
            내용:
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
          </label>
          <button onClick={handleEditSubmit}>수정 완료</button>
        </div>
      )}
    </div>
  );
};

export default BoardDetail;
