import * as actionTypes from '../actionTypes';

export const setElectionId = (id) => ({
  type: actionTypes.SET_ELECTION_ID,
  payload: id,
});

export const setK1Data = (data) => ({
  type: actionTypes.SET_K1_DATA,
  payload: data,
});

export const setMVote = (m) => ({
  type: actionTypes.SET_M_VOTE,
  payload: m,
});

export const setMCheck = (m) => ({
  type: actionTypes.SET_M_CHECK,
  payload: m,
});

export const setKeys = (keys) => ({
  type: actionTypes.SET_CHECK_AND_VOTE_KEYS,
  payload: keys,
});

export const setPrivateKey = (key) => ({
  type: actionTypes.SET_E_PRIVATE,
  payload: key,
});

export const setContract= (data) => ({
  type: actionTypes.SET_CONTRACT,
  payload: data,
});

export const setVoterId = (id) => ({
  type: actionTypes.SET_VOTER_ID,
  payload: id,
});

export const setVoterPrivateKeySigned = (key) => ({
  type: actionTypes.SET_VOTER_PRIVATE_KEY_SIGNED,
  payload: key,
});