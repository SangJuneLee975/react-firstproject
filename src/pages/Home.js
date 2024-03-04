import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import axios from 'axios';
import { isLoggedInState } from '../recoil/atoms';
import { Button } from 'antd';

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useRecoilState(isLoggedInState);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      setIsLoggedIn(true);
    }
  }, [setIsLoggedIn]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8080/user/logout');
      localStorage.removeItem('token'); // 'token' 키를 사용하여 토큰 제거
      localStorage.removeItem('nickname');
      setIsLoggedIn(false); // Recoil 상태 업데이트
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  return (
    <div>
      <h1>홈 화면</h1>

      {isLoggedIn ? (
        <div>
          <p>환영합니다!</p>
        </div>
      ) : (
        <div>
          <Link to="/login">로그인</Link>
          <Link to="/signup">회원가입</Link>
        </div>
      )}
    </div>
  );
};

export default Home;
