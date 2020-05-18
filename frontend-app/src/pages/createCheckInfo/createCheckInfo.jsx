import React, { Component } from 'react';
import styles from './createCheckInfo.styles';
import withStyles from "@material-ui/core/styles/withStyles";
import RequestResolver from "../../helpers/RequestResolver/RequestResolver";
import {connect} from "react-redux";
const BlindSignature = require('blind-signatures');
const NodeRSA = require('node-rsa');

class createCheckInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      isLoaded: false,
      noChecker: false,
      noCheckerInfo: false,
      FIO: '',
      success: false,
      decryptedObject: {},
      createdCheck: false,
    };
    this.backend = RequestResolver.getBackend();
  }
  async componentDidMount() {
    const { id } = this.props.location.aboutProps;
    const { voterId, i, m, privateKey, vote_private_key_signed, myCheckKey } = this.props;
    const voteId = localStorage.getItem(`vote-${id}-myId${voterId}`);
    console.log(voteId);
    let myVoice = undefined;
    let checkVoice= undefined;
    try {
      const result = await this.backend().get(`election/${id}/vote/`);
      console.log('+data');
      console.log(result.data);
      console.log('voteId');
      console.log(voteId);
      for (let i = 0; i < result.data.length; i++){
        if (result.data[i].id === Number(voteId)){
          myVoice = result.data[i];
          if (i % 2 === 0){
            checkVoice = result.data[i+1];
          } else {
            if (i + 1 <= result.data.length){
              checkVoice = result.data[i-1];
            }
          }
        }
      }

      console.log(checkVoice);
      console.log(myVoice);

    } catch (error) {
      this.setState({ isLoaded: false });
      console.log(error);
    }
    if (!checkVoice){
      this.setState({
        noChecker: true,
      });
      return;
    }
    console.log('i');
    console.log(i);
    const keyPrivate = new NodeRSA(privateKey);
    const signedIM = keyPrivate.sign(JSON.stringify({i, m}), 'base64', 'utf8');
    const checkerPublicKey = checkVoice.check_public_key;
    const publicKeyCheck = new NodeRSA(checkerPublicKey);
    const cryptedChecker = publicKeyCheck.encrypt(JSON.stringify({ i, m, signedIM }), 'base64', 'utf8');

    const sendData = { v: { vote_id: voteId, vote_private_key_signed: vote_private_key_signed }, check_info_crypted: cryptedChecker};
    if (!localStorage.getItem(`vote-${voteId}Check`)){
      try {
        const result = await this.backend({ 'Content-Type': 'application/json' }).post(
          `election/${id}/check/`,
          sendData);
        const CheckSigned = result.data; // получен Check
        console.log(CheckSigned);
        localStorage.setItem(`vote-${voteId}Check`, 'было');
      }  catch (error) {
        console.log(error);
        return;
      }
    }

    let checkFoundVoice = undefined;
    try {
      const result = await this.backend().get(`election/${id}/check/list/`);
      for (let i = 0; i < result.data.length; i++){
        if (result.data[i].v.id === checkVoice.id){
          checkFoundVoice = result.data[i];
        }
      }
    } catch (error) {
      this.setState({ isLoaded: false });
      console.log(error);
    }
    if (!checkFoundVoice){
      this.setState({
        noCheckerInfo: true,
      });
      return ;
    }
    console.log('--');
    const checkInfoCrypted = checkFoundVoice.check_info_crypted;
    const myCheckKeyRsa = new NodeRSA(myCheckKey);
    const decryptedInfo = myCheckKeyRsa.decrypt(checkInfoCrypted, 'utf8' );

    const decryptedObject = JSON.parse(decryptedInfo);
    console.log(decryptedObject);
    this.setState({
      FIO: decryptedObject.i,
      success: true,
      decryptedObject
    });
  }
  handleApprove = async (status) => {
    const { id } = this.props.location.aboutProps;
    const { voterId, privateKey } = this.props;
    const voteId = localStorage.getItem(`vote-${id}-myId${voterId}`);
    const keyPrivate = new NodeRSA(privateKey);
    const signedVoterId = keyPrivate.sign(voterId.toString(), 'base64', 'utf8');
    const sendData = {
      vote_id: voteId.toString(),
      status,
      voter_id: voterId.toString(),
      voter_id_signed: signedVoterId.toString(),
    };
    try {
      const result = await this.backend({ 'Content-Type': 'application/json' }).post(
        `election/${id}/vote/check/`,
        sendData);
      const sent = result.data; // получен Check
      console.log(sent);
      this.props.history.push(`/elections`);
    }  catch (error) {
      console.log(error);
    }
  };

  render() {
    const { noChecker, noCheckerInfo, success, FIO } = this.state;
    return (
      <div>
        { noChecker && <div>Для вас нет проверяющего, обратитесь к избиркому</div>}
        { noCheckerInfo && <div>Проверяемый еще не предоставил данные для проверки</div>}
        { success && <div>
          Проверьте, что данный пользователь существует в публичном репозитории:
          <br/>
          {FIO}
          <br />
          <a onClick={() => this.handleApprove(true)}>
            Подтвердить существование
          </a>
          <br />
          <a onClick={() => this.handleApprove(false)}>
            Не существует
          </a>
        </div>}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  voterId: state.election.voterId,
  i: state.election.K1.info,
  m: state.election.mVote.r,
  privateKey: state.election.ePrivate,
  vote_private_key_signed: state.election.vote_private_key_signed,
  myCheckKey: state.election.checkKeys.privateKey,
});

export default withStyles(styles)(connect(mapStateToProps)((createCheckInfo)));

