import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// React 와 react-router-dom에서 필요한 모듈들을 가져오기

import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import BoardDetail from './pages/BoardDetail';
import BoardList from './pages/BoardList';
import BoardCreate from './pages/BoardCreate';
import Home from './pages/Home';

// 컴포넌트들을 가져오기

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/board" element={<BoardList />} />
        <Route path="/board/new" element={<BoardCreate />} />
        <Route path="/board/:id" element={<BoardDetail />} />
      </Routes>
    </Router>
  );
}
// Router 라우팅 활성화
// Routes 라우팅 경로를 설정하고 경로에 해당하는 컴포넌트를 렌더링함
// Route 경로와 연결된 페에지 컴퍼넌트를 정의

export default App;
