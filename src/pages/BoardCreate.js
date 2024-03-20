import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Select, Input, Tag, Tooltip, Button } from 'antd';
import '../css/BoardCreatecss.css';

const { Option } = Select;

const BoardCreate = () => {
  const [categories, setCategories] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [selectedHashtags, setSelectedHashtags] = useState([]);
  const [hashtagInput, setHashtagInput] = useState('');
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

        const BasicCategory = data.find((category) => category.name === '잡담');
        if (BasicCategory) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            categoryId: BasicCategory.id,
          }));
        }
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

  // 해시태그 입력 핸들러
  const handleHashtagEnter = (e) => {
    if (e.key === 'Enter') {
      const newHashtag = e.target.value.trim();
      if (newHashtag && !hashtags.includes(newHashtag)) {
        setHashtags([...hashtags, newHashtag]);
        setHashtagInput(''); // 입력 필드 초기화
      }
      e.preventDefault();
    }
  };

  // 해시태그 입력 필드 변경 핸들러
  const handleHashtagInputChange = (e) => {
    setHashtagInput(e.target.value);
  };

  // 해시태그를 제거하는 함수
  const removeHashtag = (index) => {
    setHashtags(hashtags.filter((_, idx) => idx !== index));
  };

  // API를 호출하여 게시글을 생성
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      console.error('카테고리가 선택되지 않았습니다.');
      return;
    }
    // 해시태그 문자열 배열을 객체 배열로 변환
    const hashtagsObjArray = hashtags.map((tag) => ({ name: tag }));

    // 게시글 데이터에 해시태그 객체 배열 포함
    const updatedFormData = {
      ...formData,
      hashtags: hashtagsObjArray,
    };
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('토큰이 없습니다.');
      }
      console.log('토큰:', token);
      await axios.post(
        'http://localhost:8080/api/boards/new',
        updatedFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // 토큰을 헤더에 포함하여 보내기
          },
        }
      );

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
            placeholder="해시태그 입력 후 Enter"
            value={hashtagInput} // 입력 필드와 상태 바인딩
            onChange={handleHashtagInputChange} // 입력 변경 핸들러 추가
            onKeyPress={handleHashtagEnter}
          />
          <div>
            {hashtags.map((tag, index) => (
              <Tag
                color="blue"
                closable
                onClose={() => removeHashtag(index)}
                key={tag}
              >
                #{tag}
              </Tag>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-btn">
          작성하기
        </button>
      </form>
    </div>
  );
};

export default BoardCreate;
