import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { isLoggedInState } from '../recoil/atoms';
import { Button } from 'antd';

const Login = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  });
  const navigate = useNavigate();

  const setIsLoggedIn = useSetRecoilState(isLoggedInState);

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
    <div className="container">
      <div className="form-box">
        <div className="header-form">
          <h4 className="text-primary text-center">
            <i className="fa fa-user-circle" style={{ fontSize: '110px' }}></i>
          </h4>
          <div className="image"></div>
        </div>
        <div className="body-form">
          <form onSubmit={handleSubmit}>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="fa fa-user"></i>
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Username"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
              />
            </div>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="fa fa-lock"></i>
                </span>
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-block">
              LOGIN
            </button>
            <div className="message"></div>
          </form>
          <div className="social"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
