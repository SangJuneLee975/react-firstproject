import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getUserInfoFromToken } from '../components/parsejwt';
import { Pagination, Button, Table, Space } from 'antd';
import '../css/Boardcss.css';

const BoardList = () => {
  const [boards, setBoards] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // 페이지는 1부터 시작
  const [pageSize] = useState(5); // 페이지당 게시글 수
  const [totalBoards, setTotalBoards] = useState(0); // 총 게시글 수
  const token = localStorage.getItem('token');
  const userInfo = getUserInfoFromToken(token);
  const userNickname = userInfo?.nickname; // 토큰에서 사용자 정보 추출
  // 카테고리 매핑
  const categoryMapping = {
    1: '잡담',
    2: '정보',
    3: '유머',
  };

  const fetchBoards = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/boards/paged?page=${
          currentPage - 1
        }&size=${pageSize}`,
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
  }, [currentPage, pageSize, token]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

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

  const columns = [
    {
      title: '번호',
      dataIndex: 'id',
      key: 'id',
      className: 'column-id',
      width: '8%',
    },
    {
      title: '카테고리',
      dataIndex: 'categoryId',
      key: 'category',
      className: 'column-category',
      width: '15%',
      render: (categoryId) => categoryMapping[categoryId] || '',
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      className: 'column-title',
      width: '40%',
      render: (text, record) => (
        <>
          {/* 이미지 존재 여부에 따른 아이콘 표시 */}
          {record.hasImage && <span className="attach-icon">ㅁㅁ📎</span>}
          <Link to={`/board/${record.id}`} className="link-title">
            {text}
          </Link>
        </>
      ),
    },
    {
      title: '작성자',
      dataIndex: 'writer',
      key: 'writer',
      className: 'column-writer',
      width: '15%',
    },
    {
      title: '작성일',
      dataIndex: 'date',
      key: 'date',
      className: 'column-date',
      width: '15%',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: '',
      key: 'action',
      className: 'column-action',
      width: '10%',
      render: (_, record) =>
        userNickname === record.writer && (
          <Space size="middle">
            <Button type="default" onClick={() => handleDelete(record.id)}>
              삭제
            </Button>
          </Space>
        ),
    },
  ];

  return (
    <div>
      <h1>게시글 목록</h1>
      <Table
        columns={columns}
        dataSource={boards}
        pagination={false}
        rowKey="id"
        tableLayout="fixed" // 테이블 레이아웃을 고정
      />
      <Pagination
        current={currentPage}
        onChange={(page) => setCurrentPage(page)}
        total={totalBoards}
        pageSize={pageSize}
        style={{ marginTop: 8 }}
      />
      <Link to="/board/new">
        <Button type="default" style={{ marginTop: 8 }}>
          글쓰기
        </Button>
      </Link>
    </div>
  );
};

export default BoardList;
