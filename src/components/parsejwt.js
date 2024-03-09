export const getUserInfoFromToken = (token) => {
  if (!token) {
    return null;
  }
  try {
    const base64Url = token.split('.')[1]; // 페이로드 부분만 추출
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));

    return {
      userId: payload.sub,
      name: payload.name,
      nickname: payload.nickname,
    };
  } catch (error) {
    return null;
  }
};
