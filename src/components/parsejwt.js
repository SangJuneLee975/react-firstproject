export const getUserInfoFromToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1]; // ���̷ε� �κи� ����
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    return payload;
  } catch (error) {
    console.error('��ū ���ڵ� ����:', error);
    return null;
  }
};
