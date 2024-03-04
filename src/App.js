import React, { useState } from 'react';
import NavigationHandler from './Menu/NavigationHandler';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from 'react-router-dom';
import { Layout, Menu, Breadcrumb } from 'antd';
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';

import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import BoardDetail from './pages/BoardDetail';
import BoardList from './pages/BoardList';
import BoardCreate from './pages/BoardCreate';
import Home from './pages/Home';

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  getItem('옵션 1', '1', <PieChartOutlined />),
  getItem('게시판', '2', <DesktopOutlined />),
  getItem('사용자', 'sub1', <UserOutlined />, [
    getItem('Tom', '3'),
    getItem('Bill', '4'),
    getItem('Alex', '5'),
  ]),
  getItem('팀', 'sub2', <TeamOutlined />, [
    getItem('팀 1', '6'),
    getItem('팀 2', '8'),
  ]),
  getItem('파일', '9', <FileOutlined />),
];

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  let navigateFunction;

  // 로그인 상태를 변경하는 함수
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // 로그아웃 상태를 변경하는 함수
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const onMenuClick = (e) => {
    switch (e.key) {
      case '2':
        if (navigateFunction) {
          navigateFunction('/board');
        }
        break;
      // 다른 케이스들을 필요에 따라 추가
      default:
        // 기본 동작
        break;
    }
  };

  return (
    <Router>
      <NavigationHandler
        onNavigate={(navigate) => {
          navigateFunction = navigate;
        }}
      />
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <div className="logo" />
          <Menu
            theme="dark"
            defaultSelectedKeys={['1']}
            mode="inline"
            items={items}
            onClick={onMenuClick}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              padding: 0,
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <div>
              {isLoggedIn ? (
                <a onClick={handleLogout} style={{ color: 'white' }}>
                  로그아웃
                </a>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={handleLogin}
                    style={{ color: 'white', marginRight: 20 }}
                  >
                    로그인
                  </Link>
                  <Link to="/signup" style={{ color: 'white' }}>
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </Header>
          <Content style={{ margin: '0 16px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              {/* Breadcrumb 아이템 */}
            </Breadcrumb>
            <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/board" element={<BoardList />} />
                <Route path="/board/new" element={<BoardCreate />} />
                <Route path="/board/:id" element={<BoardDetail />} />
              </Routes>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Footer</Footer>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
