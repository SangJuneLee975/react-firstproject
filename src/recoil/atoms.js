// atoms.js
import { atom } from 'recoil';

export const isLoggedInState = atom({
  key: 'isLoggedInState',
  default: localStorage.getItem('token') ? true : false, // ��ū�� ������ �α��� ���� ����
});

export const boardListState = atom({
  key: 'boardListState',
  default: [],
});
