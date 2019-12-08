import * as actionTypes from '../actionTypes';

const initialState = {
  error: null,
  loading: false,
};

const registrationStart = (state, action) => {
  return {
    error: null,
    loading: true,
  };
};

const registrationSuccess = (state, action) => {
  return {
    error: null,
    loading: false,
  };
};

const registrationFail = (state, action) => {
  return {
    error: action.error,
    loading: false,
  };
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.REGISTRATION_START: return registrationStart(state, action);
    case actionTypes.REGISTRATION_SUCCESS: return registrationSuccess(state, action);
    case actionTypes.REGISTRATION_FAILED: return registrationFail(state, action);
    default: return state;
  }
};

export default reducer;