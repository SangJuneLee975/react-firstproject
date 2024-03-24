import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Select, Input, Tag, Tooltip, Button } from 'antd';
import '../css/BoardCreatecss.css';

const { Option } = Select;

const BoardCreate = () => {
  const [categories, setCategories] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [file, setFile] = useState(null); // 단일 파일 상태
  const [fileUrl, setFileUrl] = useState(''); // 단일 파일 URL 상태

  const [files, setFiles] = useState(Array(5).fill(null)); // 여러 파일 상태를 관리하는 배열
  const [fileUrls, setFileUrls] = useState(Array(5).fill('')); // 업로드된 여러 파일 URL을 관리하는 배열

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

  // 파일 선택 핸들러
  const handleFileSelect = (index) => (e) => {
    const newFiles = [...files];
    newFiles[index] = e.target.files[0];
    setFiles(newFiles);
  };

  // API를 호출하여 게시글을 생성
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryId) {
      console.error('카테고리가 선택되지 않았습니다.');
      return;
    }

    // 파일 업로드 로직
    const uploadPromises = files.map((file) => {
      if (!file) return Promise.resolve('');
      const formData = new FormData();
      formData.append('file', file);
      return axios
        .post('http://localhost:8080/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((res) => res.data);
    });

    try {
      // 파일을 모두 업로드하고 URL을 저장
      const uploadedFileUrls = await Promise.all(uploadPromises);

      // 빈 문자열을 제외한 URL만 필터링
      const validUrls = uploadedFileUrls.filter((url) => url !== '');

      // 해시태그가 없는 경우, 해시태그 필드를 제외하고 서버로 전송할 최종 formData 구성
      const updatedHashtags = hashtags.map((tag) => ({ name: tag }));
      const updatedFormData = {
        ...formData,
        hashtags: updatedHashtags,
        imageUrls: validUrls, // 업로드된 파일 URL 배열
      };

      // JSON 형태로 변환하여 서버로 전송할 수 있도록 준비
      const jsonFormData = JSON.stringify(updatedFormData);
      const blob = new Blob([jsonFormData], { type: 'application/json' });

      // 서버로 전송할 전체 FormData 구성
      const multipartFormData = new FormData();
      multipartFormData.append('board', blob);

      // 인증 토큰 헤더 설정
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      };

      // 서버에 게시글 생성 요청
      await axios.post(
        'http://localhost:8080/api/boards/new',
        multipartFormData,
        { headers }
      );

      alert('게시글이 작성되었습니다.');
      navigate('/board'); // 성공 시 게시글 목록 페이지로 리다이렉트
    } catch (error) {
      console.error('게시글 작성 또는 파일 업로드 중 오류 발생:', error);
      alert('게시글 작성 중 문제가 발생했습니다.');
    }
  };

  // 파일 선택 폼을 렌더링하는 함수
  const renderFileInputs = () => {
    return files.map((file, index) => (
      <div key={index} style={{ marginBottom: '10px' }}>
        <input type="file" onChange={handleFileSelect(index)} />
      </div>
    ));
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
        {/* 파일 업로드 폼 */}
        <div className="input-group">{renderFileInputs()}</div>

        <button type="submit" className="submit-btn">
          작성하기
        </button>
      </form>
    </div>
  );
};

export default BoardCreate;
