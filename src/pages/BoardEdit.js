import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Select, Input, Tag } from 'antd';
import '../css/BoardDetailcss.css'; // 기존 CSS 사용

const { Option } = Select;

const BoardEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [categories, setCategories] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [files, setFiles] = useState(Array(5).fill(null));
  const [deletedImageUrls, setDeletedImageUrls] = useState([]);
  const [fileNames, setFileNames] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: null,
    hashtags: [],
    imageUrls: [],
  });

  // 이미지 URL 삭제 핸들러
  const handleDeleteImage = async (fullImageUrl) => {
    const s3ImageKey = fullImageUrl.split('/').pop();
    const payload = {
      dbImageUrl: fullImageUrl,
      s3ImageKey: `board-image/${s3ImageKey}`,
    };

    try {
      const response = await axios.delete(
        `http://localhost:8080/api/boards/images`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          data: payload,
        }
      );

      // 이미지가 성공적으로 삭제되면 상태를 업데이트
      if (response.status === 200) {
        // 삭제된 이미지 URL을 상태에서 제거
        const updatedImageUrls = formData.imageUrls.filter(
          (url) => url !== fullImageUrl
        );
        setFormData({
          ...formData,
          imageUrls: updatedImageUrls,
        });

        // 삭제된 이미지 파일 이름 목록을 업데이트합니다.
        setFileNames(
          fileNames.filter(
            (name) =>
              `https://testbucket975.s3.ap-northeast-2.amazonaws.com/board-image/${name}` !==
              fullImageUrl
          )
        );
        setDeletedImageUrls([...deletedImageUrls, fullImageUrl]);
        console.log('이미지가 성공적으로 삭제되었습니다.');
      }
    } catch (error) {
      console.error('이미지 삭제 중 오류가 발생했습니다:', error.response.data);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 기존 게시글 데이터 불러오기
        const { data: boardData } = await axios.get(
          `http://localhost:8080/api/boards/${id}`
        );

        const extractedFileNames = boardData.imageUrls.map((url) =>
          url.substring(url.lastIndexOf('/') + 1)
        );
        setFileNames(extractedFileNames); // 파일 이름 배열을 상태에 저장합니다.

        setFormData((prevFormData) => ({
          ...prevFormData,
          title: boardData.title,
          content: boardData.content,
          categoryId: boardData.categoryId,
          // hashtags가 정의되지 않은 경우 빈 배열을 사용
          hashtags: boardData.hashtags
            ? boardData.hashtags.map((tag) => tag.name)
            : [],
        }));

        setHashtags(
          boardData.hashtags ? boardData.hashtags.map((tag) => tag.name) : []
        );

        // 카테고리 데이터 불러오기
        const { data: categoriesData } = await axios.get(
          'http://localhost:8080/api/category'
        );
        setCategories(categoriesData);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (value) => {
    setFormData({ ...formData, categoryId: value });
  };

  const handleHashtagInputChange = (e) => {
    setHashtagInput(e.target.value);
  };

  const handleHashtagEnter = (e) => {
    if (e.key === 'Enter' && hashtagInput && !hashtags.includes(hashtagInput)) {
      setHashtags([...hashtags, hashtagInput]);
      setHashtagInput('');
      e.preventDefault();
    }
  };

  const removeHashtag = (index) => {
    setHashtags(hashtags.filter((_, idx) => idx !== index));
  };

  // 파일 선택 처리
  const handleFileSelect = (index) => (e) => {
    const newFiles = [...files];
    newFiles[index] = e.target.files[0];
    setFiles(newFiles);
  };

  // 파일 이름을 렌더링하는 새로운 함수
  const renderFileNames = () => {
    return fileNames.map((name, index) => (
      <div key={index} style={{ marginBottom: '10px' }}>
        <span>{name}</span> {/*  */}
        <button
          type="button"
          onClick={() =>
            handleDeleteImage(
              `https://testbucket975.s3.ap-northeast-2.amazonaws.com/board-image/${name}`
            )
          }
        >
          삭제
        </button>
      </div>
    ));
  };

  const renderFileInputs = () => {
    return files.map((file, index) => (
      <div key={index} style={{ marginBottom: '10px' }}>
        <input type="file" onChange={handleFileSelect(index)} />
      </div>
    ));
  };

  // 게시글 수정 요청 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryId) {
      console.error('카테고리가 선택되지 않았습니다.');
      return;
    }

    // 해시태그 상태를 formData에 추가
    const updatedFormData = {
      ...formData,
      hashtags: hashtags.map((tag) => ({ name: tag })),
      imageUrls: formData.imageUrls.filter(
        (url) => !deletedImageUrls.includes(url)
      ),
    };

    // FormData 객체 생성
    const multipartFormData = new FormData();
    multipartFormData.append(
      'board',
      new Blob([JSON.stringify(updatedFormData)], { type: 'application/json' })
    );
    files.forEach((file) => {
      if (file) {
        multipartFormData.append('file', file);
      }
    });

    // 삭제할 이미지 URL 목록을 FormData에 추가
    multipartFormData.append(
      'deletedImageUrls',
      JSON.stringify(deletedImageUrls)
    );

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:8080/api/boards/${id}`,
        multipartFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        console.log('수정 데이터 전송', updatedFormData);
        alert('게시글이 수정되었습니다.');
        setDeletedImageUrls([]); // 삭제된 이미지 URL 목록 초기화
        navigate(`/board/${id}`); // 게시글 상세 페이지로 이동
      }
    } catch (error) {
      console.error('게시글 수정 중 오류 발생:', error);
      alert('게시글 수정 중 문제가 발생했습니다.');
    }
  };

  return (
    <div className="detail-container">
      <h2 className="form-heading">게시글 수정</h2>
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
            value={hashtagInput}
            onChange={handleHashtagInputChange}
            onKeyPress={handleHashtagEnter}
          />
          <div className="hashtag-container">
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

          <div className="input-group"></div>

          <div className="input-group">{renderFileNames()}</div>
        </div>

        {/* 파일 업로드 폼 */}
        <div className="input-group">{renderFileInputs()}</div>

        <button type="submit" className="submit-btn">
          수정하기
        </button>
      </form>
    </div>
  );
};

export default BoardEdit;
