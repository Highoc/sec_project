import * as actionTypes from '../actionTypes';

const initialState = {
  username: 'Guest',
  isAuthorized: false,
  loading: false,
  error: null,
};

const loginStart = (state, action) => ({
  ...state,
  loading: true,
  error: null,
});


const loginSuccess = (state, action) => ({
  ...state,
  username: action.payload,
  isAuthorized: true,
  loading: false,
  error: null,
});

const loginFail = (state, action) => ({
  ...state,
  loading: false,
  error: action.error,
});

const logout = (state, action) => ({
  ...state,
  isAuthorized: false,
  username: 'Guest',
});


const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_START: return loginStart(state, action);
    case actionTypes.LOGIN_SUCCESS: return loginSuccess(state, action);
    case actionTypes.LOGIN_FAILED: return loginFail(state, action);
    case actionTypes.LOGOUT: return logout(state, action);
    default: return state;
  }
};

export default reducer;