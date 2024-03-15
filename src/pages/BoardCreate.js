import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Select, Input, Tag, Tooltip } from 'antd';
import '../css/BoardCreatecss.css';

const { Option } = Select;

const BoardCreate = () => {
  const [categories, setCategories] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [selectedHashtags, setSelectedHashtags] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: null,
    hashtags: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    // 카테고리 데이터 불러오기
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('http://localhost:8080/api/category');
        setCategories(data);
      } catch (error) {
        console.error('카테고리 로딩 실패:', error);
      }
    };

    fetchCategories();
  }, []);

  // spread연산자. 객체나 배열을 확장하거나, 함수 호출 시 인자 목록을 확장하는 데 사용
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (value) => {
    setFormData({ ...formData, categoryId: value });
  };

  const handleHashtagsChange = (e) => {
    // 쉼표로 구분된 문자열을 배열로 변환해주고, 앞뒤 공백을 제거함
    const tags = e.target.value.split(',').map((tag) => tag.trim());
    setFormData({ ...formData, hashtags: tags.map((tag) => ({ name: tag })) });
  };

  // API를 호출하여 게시글을 생성
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      console.error('카테고리가 선택되지 않았습니다.');
      return;
    }
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
    <div className="create-container">
      <h2 className="form-heading">게시글 작성</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="input-group">
          <label htmlFor="title" className="form-label">
            제목
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="text-input"
          />
        </div>
        <div className="input-group">
          <label htmlFor="content" className="form-label">
            내용
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="text-area"
          />
        </div>
        <div className="input-group">
          <label htmlFor="category" className="form-label">
            카테고리
          </label>
          <Select
            showSearch
            style={{ width: '100%' }}
            placeholder="카테고리 선택"
            onChange={handleCategoryChange}
            value={formData.categoryId}
          >
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </div>
        <div className="input-group">
          <label htmlFor="hashtags">해시태그</label>
          <Input
            placeholder="해시태그 입력, 쉼표로 구분"
            onChange={handleHashtagsChange}
          />
        </div>
        <button type="submit" className="submit-btn">
          작성하기
        </button>
      </form>
    </div>
  );
};

export default BoardCreate;
