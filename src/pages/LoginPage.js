import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { isLoggedInState } from '../recoil/atoms';

const Login = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  });
  const navigate = useNavigate();
  const [setIsLoggedIn] = useRecoilState(isLoggedInState);

  // // spread연산자. 객체나 배열을 확장하거나, 함수 호출 시 인자 목록을 확장하는 데 사용
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:8080/user/login',
        formData
      );
      const { token } = response.data; // 응답에서 토큰과 닉네임을 추출

      localStorage.setItem('token', token); // 토큰 저장

      setIsLoggedIn(true); // Recoil 상태 업데이트

      navigate('/'); // 홈 페이지로 이동
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      // 에러 처리 로직
    }
  };

  return (
    <div>
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <label>
          아이디:
          <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
          />
        </label>
        <label>
          비밀번호:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </label>
        <button type="submit">로그인</button>
      </form>
    </div>
  );
};

export default Login;
