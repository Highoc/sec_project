import * as actionTypes from '../actionTypes';

const initialState = {
  id: 0,
  K1: {},
  voteKeys: {},
  checkKeys: {},
  mVote: {},
  mCheck: {},
  ePrivate: '',
  contract: {},
  voterId: 0,
  vote_private_key_signed: '',
};

const setElectionId = (state, action) => {
  return {
    ...state,
    id: action.payload,
  };
};

const setMVote = (state, action) => {
  return {
    ...state,
    mVote: action.payload,
  };
};

const setMCheck = (state, action) => {
  return {
    ...state,
    mCheck: action.payload,
  };
};

const setKeys = (state, action) => {
  const { vote, check } = action.payload;
  return {
    ...state,
    voteKeys: vote,
    checkKeys: check,
  };
};

const setK1 = (state, action) => {
  return {
    ...state,
    K1: action.payload,
  };
};

const setEPrivate = (state, action) => {
  return {
    ...state,
    ePrivate: action.payload,
  };
};

const setContract = (state, action) => {
  return {
    ...state,
    contract: action.payload,
  }
};

const setVoterId = (state, action) => {
  return {
    ...state,
    voterId: action.payload,
  }
};

const setVoterPrivateKeySigned = (state, action) => {
  return {
    ...state,
    vote_private_key_signed: action.payload,
  }
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_ELECTION_ID: return setElectionId(state, action);
    case actionTypes.SET_M_VOTE: return setMVote(state, action);
    case actionTypes.SET_M_CHECK: return setMCheck(state, action);
    case actionTypes.SET_CHECK_AND_VOTE_KEYS: return setKeys(state,action);
    case actionTypes.SET_K1_DATA: return setK1(state,action);
    case actionTypes.SET_E_PRIVATE: return setEPrivate(state, action);
    case actionTypes.SET_CONTRACT: return setContract(state,action);
    case actionTypes.SET_VOTER_ID: return setVoterId(state,action);
    case actionTypes.SET_VOTER_PRIVATE_KEY_SIGNED: return setVoterPrivateKeySigned(state, action);
    default: return state;
  }
};

export default reducer;