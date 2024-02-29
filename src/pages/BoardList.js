import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getUserInfoFromToken } from '../components/parsejwt';
import { Pagination, Button } from 'antd';
import '../css/Boardcss.css';

const BoardList = () => {
  const [boards, setBoards] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [pageSize] = useState(5); // 페이지당 게시글 수
  const [totalBoards, setTotalBoards] = useState(0); // 총 게시글 수
  const token = localStorage.getItem('token');
  const userInfo = getUserInfoFromToken(token);
  const userNickname = userInfo?.nickname; // 토큰에서 사용자 정보 추출

  const fetchBoards = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/boards/paged?page=${currentPage}&size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBoards(response.data.content);
      setTotalBoards(response.data.totalElements); // 총 게시글 수 설정
    } catch (error) {
      console.error('게시판을 불러오는 중에 오류가 발생:', error);
    }
  }, [currentPage, pageSize, token]); // 의존성 배열에 사용되는 변수들을 추가합니다.

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]); // fetchBoards 함수를 의존성 배열에 추가합니다.

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/boards/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchBoards(); // 게시글 삭제 후 목록을 다시 불러옵니다.
    } catch (error) {
      console.error('게시판 삭제 중 오류 발생:', error);
      alert('삭제할 권한이 없습니다.');
    }
  };

  // 페이지 번호를 렌더링하기 위한 함수
  const renderPageNumbers = () => {
    const totalPages = Math.ceil(totalBoards / pageSize);
    const pages = [];
    for (let i = 0; i < totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          disabled={currentPage === i}
        >
          {i + 1}
        </button>
      );
    }
    return pages;
  };

  return (
    <div>
      <h1>게시글 목록</h1>
      <table className="board-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>작업</th>
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
                  <Button type="default" onClick={() => handleDelete(board.id)}>
                    삭제
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        current={currentPage + 1} // Ant Design Pagination은 1부터 시작
        onChange={(page) => setCurrentPage(page - 1)} // API 호출을 위해 페이지 번호를 0부터 시작
        total={totalBoards}
        pageSize={pageSize}
      />
      <Link to="/board/new">
        <Button type="default">글쓰기</Button>
      </Link>
    </div>
  );
};

export default BoardList;
