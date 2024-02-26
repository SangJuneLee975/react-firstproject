import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BoardCreate = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const navigate = useNavigate();

  // spread연산자. 객체나 배열을 확장하거나, 함수 호출 시 인자 목록을 확장하는 데 사용
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // API를 호출하여 게시글을 생성
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('토큰이 없습니다.');
      }
      console.log('토큰:', token);
      await axios.post('http://localhost:8080/api/boards/new', formData, {
        headers: {
          Authorization: `Bearer ${token}`, // 토큰을 헤더에 포함하여 보내기
        },
      });

      console.log('게시글 작성 요청이 성공했습니다.');
      navigate('/board'); // 게시글 목록 페이지로 리다이렉트
    } catch (error) {
      console.error('게시글 작성 중 오류 발생:', error);
    }
  };

  return (
    <div>
      <h2>게시글 작성</h2>
      <form onSubmit={handleSubmit}>
        <label>
          제목:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </label>
        <label>
          내용:
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
          />
        </label>
        <button type="submit">작성하기</button>
      </form>
    </div>
  );
};

export default BoardCreate;
