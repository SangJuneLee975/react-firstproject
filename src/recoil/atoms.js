// atoms.js
import { atom } from 'recoil';

export const isLoggedInState = atom({
  key: 'isLoggedInState',
  default: localStorage.getItem('token') ? true : false, // 토큰이 있으면 로그인 상태 유지
});

export const boardListState = atom({
  key: 'boardListState',
  default: [],
});
