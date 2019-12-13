import * as actionTypes from '../actionTypes';

const initialState = {
  id: 0,
};

const setElectionId = (state, action) => {
  return {
    id: action.payload,
  };
};


const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_ELECTION_ID: return setElectionId(state, action);
    default: return state;
  }
};

export default reducer;