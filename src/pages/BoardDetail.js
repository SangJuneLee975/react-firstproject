import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserInfoFromToken } from '../components/parsejwt';
import { List, Button, Input, Typography, Tag } from 'antd';
import '../css/BoardDetailcss.css';
import CommentList from './CommentList';
import CommentForm from './CommentForm';

const { TextArea } = Input;

const BoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState({});
  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [comments, setComments] = useState([]); // 댓글 목록 상태 추가
  const [activeReplyForm, setActiveReplyForm] = useState(null); // 대댓글 폼
  const [editableHashtags, setEditableHashtags] = useState([]); //해시태그 수정
  const [originalHashtags, setOriginalHashtags] = useState([]); // 기존의 해시태그 내용

  const token = localStorage.getItem('token');
  const userInfo = getUserInfoFromToken(token);
  const userNickname = userInfo?.nickname;

  const date = new Date(board.date);
  const formattedDate = date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // 게시글 상세 정보를 가져오는 함수
  const fetchBoardDetails = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/boards/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBoard(response.data);
      setEditedTitle(response.data.title);
      setEditedContent(response.data.content);
    } catch (error) {
      console.error('게시판 상세 정보를 가져오는 중 에러:', error);
    }
  }, [id, token]);

  // 게시글에 연결된 해시태그 데이터를 가져오는 함수
  const fetchBoardHashtags = useCallback(async () => {
    try {
      const hashtagsResponse = await axios.get(
        `http://localhost:8080/api/hashtags/board/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (hashtagsResponse.data) {
        const hashtags = hashtagsResponse.data.map((tag) => tag.name);
        setEditableHashtags(hashtags);
        setOriginalHashtags(hashtags); // 원래 해시태그를 복사해 저장
      }
    } catch (error) {
      console.error('해시태그 정보를 가져오는 중 에러:', error);
    }
  }, [id, token]);

  // 댓글 목록을 업데이트하는 함수
  const updateComments = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/comments/board/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(response.data);
    } catch (error) {
      console.error('댓글을 가져오는 중 에러:', error);
    }
  }, [id, token]);

  // 댓글 목록을 가져오는 함수
  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/comments/board/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('댓글을 가져오는 중 에러:', error);
    }
  }, [id, token]);

  // 컴포넌트 마운트 시 게시글 상세 정보와 댓글 목록을 가져오기
  useEffect(() => {
    fetchBoardDetails();
    fetchComments();
    fetchBoardHashtags();
  }, [fetchBoardDetails, id, token, fetchComments, fetchBoardHashtags]);

  // 이전, 다음 게시글로 네비게이션하는 함수
  const handlePrevNextNavigation = (direction) => {
    const newId =
      direction === 'prev' ? parseInt(id, 10) - 1 : parseInt(id, 10) + 1;
    navigate(`/board/${newId}`);
  };

  // 편집 모드를 토글하는 함수
  const handleEditToggle = () => {
    if (userNickname === board.writer) {
      setEditing(!editing);
      // 편집 모드 진입 시 원본 해시태그 상태 저장
      setOriginalHashtags(editableHashtags.slice());
    } else {
      // 편집 모드 취소 시 원본 해시태그로 되돌림
      setEditableHashtags(originalHashtags.slice());
      alert('작성자만 수정할 수 있습니다.');
    }
  };

  // 해시태그 변경 핸들러
  const handleHashtagChange = (event, index) => {
    const newHashtags = [...editableHashtags];
    newHashtags[index] = event.target.value;
    setEditableHashtags(newHashtags);
  };

  // 해시태그 추가 핸들러
  const handleAddHashtag = () => {
    setEditableHashtags([...editableHashtags, '']);
  };

  // 해시태그 삭제 핸들러
  const handleRemoveHashtag = (index) => {
    const newHashtags = editableHashtags.filter((_, idx) => idx !== index);
    setEditableHashtags(newHashtags);
  };

  const HashtagInput = ({ onEnter }) => {
    const [input, setInput] = useState('');

    const handleInputChange = (e) => {
      setInput(e.target.value);
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && input.trim()) {
        onEnter(input.trim());
        setInput('');
        e.preventDefault(); // 폼 제출 방지
      }
    };

    return (
      <Input
        value={input}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="해시태그 입력 후 Enter"
        style={{ width: 'auto', marginBottom: 8 }}
      />
    );
  };

  const handleHashtagEnter = (newTag) => {
    if (!editableHashtags.includes(newTag)) {
      setEditableHashtags([...editableHashtags, newTag]);
    } else {
      alert('이미 추가된 해시태그입니다.');
    }
  };

  // 게시글을 수정하는 함수
  const handleEditSubmit = async () => {
    const updatedData = {
      title: editedTitle,
      content: editedContent,
      hashtags: editableHashtags
        .filter((tag) => tag.trim() !== '')
        .map((name) => ({ name })),
    };
    try {
      await axios.put(`http://localhost:8080/api/boards/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditing(false);
      fetchBoardDetails(); // 수정 후 데이터 새로고침
    } catch (error) {
      console.error('게시글 수정 중 오류 발생:', error);
    }
  };

  // 대댓글 폼을 표시하고 숨기는 함수
  const toggleReplyForm = (commentId) => {
    setActiveReplyForm(activeReplyForm === commentId ? null : commentId);
  };

  return (
    <div>
      <List
        className="board-detail-container"
        header={
          <div>
            <Typography.Title level={4}>{board.title}</Typography.Title>
            {}
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
        {/* 게시글 내용과 수정 폼 */}
        <List.Item className="board-meta-container">
          <span>작성자: {board.writer}</span>
          <span>작성일: {formattedDate}</span>
        </List.Item>
        {/* 해시태그 보여주는 폼 */}
        <List.Item>
          <div className="hashtag-container">
            {editableHashtags.map((name, idx) => (
              <Tag key={idx} color="blue" style={{ marginRight: '5px' }}>
                #{name}
              </Tag>
            ))}
          </div>
        </List.Item>
        {/* 해시태그 수정 UI */}
        <List.Item>
          {editing ? (
            <>
              <div className="editable-hashtag-container">
                {editableHashtags.map((tag, index) => (
                  <div key={index} className="editable-hashtag">
                    <Tag color="blue">#{tag}</Tag>
                    <button
                      className="delete-tag-btn"
                      onClick={() => handleRemoveHashtag(index)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
              <HashtagInput onEnter={handleHashtagEnter} />
            </>
          ) : (
            board.hashtags?.map((tag, idx) => (
              <Tag key={idx} color="blue">
                #{tag.name}
              </Tag>
            ))
          )}
        </List.Item>

        {/* 게시글 content & 게시글 수정 폼 */}
        {!editing ? (
          <>
            <div dangerouslySetInnerHTML={{ __html: board.content }} />
            {/* 이미지를 표시 */}
            {board.imageUrls &&
              board.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Uploaded ${index}`}
                  style={{ maxWidth: '100%', marginTop: '10px' }}
                />
              ))}
            {board.files &&
              board.files.map((file, index) => (
                <img
                  key={index}
                  src={file.filePath} // S3 이미지 URL
                  alt="Uploaded"
                  style={{ maxWidth: '100%', marginTop: '10px' }}
                />
              ))}
          </>
        ) : (
          // 게시글 수정 폼
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
      {/* 댓글 리스트 */}
      <CommentList
        boardId={id}
        token={token}
        comments={comments}
        updateComments={updateComments} // 댓글 목록을 갱신하는 함수를 props로 전달
        onToggleReplyForm={toggleReplyForm} // 대댓글 폼 토글 함수를 props로 전달
      />
      {/* 대댓글폼 */}

      {/* 댓글폼 */}
      <CommentForm boardId={id} token={token} onCommentAdded={updateComments} />
    </div>
  );
};

export default BoardDetail;
