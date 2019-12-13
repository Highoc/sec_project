import * as actionTypes from '../actionTypes';

export const setElectionId = (id) => ({
  type: actionTypes.SET_ELECTION_ID,
  payload: id,
});