import * as actionTypes from '../actionTypes';
import RequestResolver from "../../helpers/RequestResolver/RequestResolver";

export const loginStart = () => ({
  type: actionTypes.LOGIN_START,
});

export const loginSuccess = (user) => ({
  type: actionTypes.LOGIN_SUCCESS,
  payload: user,
});

export const loginFailed = error => ({
  type: actionTypes.LOGIN_FAILED,
  error,
});

export const logout = () => {
  return {
    type: actionTypes.LOGOUT,
  };
};

export const login = (username, password) => (dispatch) => {
  dispatch(loginStart());
  dispatch(loginSuccess('tester'));
  /*RequestResolver.getGuest()().post('auth/login/', { username, password })
    .then((result) => {
      const { token, user } = result.data;
      pprint('login', user);
      localStorage.setItem('jwt-token', token);
      dispatch(loginSuccess(token, user));
    })
    .catch((error) => {
      console.log(error);
      dispatch(loginFailed(error));
    });*/

};

