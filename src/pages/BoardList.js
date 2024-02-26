import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getUserInfoFromToken } from '../components/parsejwt';

const BoardList = () => {
  const [boards, setBoards] = useState([]);
  const token = localStorage.getItem('token');
  const userInfo = getUserInfoFromToken(token);
  const userNickname = userInfo?.nickname; // 토큰에서 사용자 정보 추출

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/boards')
      .then((response) => {
        setBoards(response.data);
      })
      .catch((error) => {
        console.error('게시판을 불러오는 중에 오류가 발생:', error);
      });
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/boards/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBoards(boards.filter((board) => board.id !== id));
    } catch (error) {
      console.error('게시판 삭제중 오류발생:', error);
      alert('삭제할 권한이 없습니다.');
    }
  };

  return (
    <div>
      <h1>게시글 목록</h1>
      <table className="board-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {boards.map((board) => (
            <tr key={board.id}>
              <td>{board.id}</td>
              <td>
                <Link to={`/board/${board.id}`}>{board.title}</Link>
              </td>
              <td>{board.writer}</td>
              <td>{new Date(board.date).toLocaleDateString()}</td>
              <td>
                {userNickname === board.writer && (
                  <>
                    <button onClick={() => handleDelete(board.id)}>삭제</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/board/new">
        <button>글쓰기</button>
      </Link>
    </div>
  );
};

export default BoardList;
