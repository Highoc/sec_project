import React, {Component} from 'react';
import {
  Avatar,
  Button,
  CssBaseline,
  FormControl,
  InputLabel,
  OutlinedInput,
  Paper,
  Typography,
} from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import withStyles from '@material-ui/core/styles/withStyles';
import {connect} from 'react-redux';
import styles from './createContract.styles';
import createRSApair from "../../helpers/crypto/createRSApair";
import {withRouter} from 'react-router-dom';
import RequestResolver from "../../helpers/RequestResolver/RequestResolver";
import {setContract, setK1Data, setKeys, setMCheck, setMVote, setPrivateKey, setElectionId, setVoterId} from "../../store/actions/election";

const BlindSignature = require('blind-signatures');
const NodeRSA = require('node-rsa');
let privateKeyUserPem = '';

class CreateContract extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      isValid: true,
      url: '',
    };
    this.backend = RequestResolver.getBackend();
  }

  checkData = (data) => {
    let isValid = true;
    Object.values(data).forEach((elem) => {
      if (elem === ''){
        isValid = false;
      }
    });
    return isValid;
  };

  async submitHandler(event) {
    event.preventDefault();
    const { id } = this.props.location.aboutProps;
    const electionId = id;
    this.props.setElectionId(electionId);
    console.log(electionId);
    let voterId, blindedVote, blindedCheck;
    let MaskVote, MaskCheck;
    const keyPairs = await this.getKeyPairs(); // сгенерировали пары ключей
    const passportNumber = document.getElementById('passportNumber');
    const passportSeries = document.getElementById('passportSeries');

    const name = document.getElementById('name');
    const secondName = document.getElementById('second_name');
    const patronymic = document.getElementById('patronymic');
    const FIO = `${secondName.value} ${name.value} ${patronymic.value} **** ****${passportNumber.value.slice(4)}`;
    console.log(FIO);
    const data = {
      passport_series: passportSeries.value,
      passport_number: passportNumber.value,
      first_name: name.value,
      last_name: secondName.value,
      patronymic: patronymic.value,
    };
    if (!this.checkData(data) || privateKeyUserPem === ''){
      alert('Заполните все поля!');
      return;
    }
    const keyPrivate = new NodeRSA(privateKeyUserPem);
    data.passport_number_signed = keyPrivate.sign(passportNumber.value, 'base64', 'utf8');
    console.log(data);

    // получили public_key избиркома, чтоьы узнать N и e
    try {
      const result = await this.backend().get(`public_key/`);

      const publicKeyPEM = result.data.public_key;
      const publicKey = new NodeRSA(publicKeyPEM);

      MaskVote = {
        message: keyPairs.vote.privateKey, // d голосования
        N: publicKey.keyPair.n.toString(),
        E: publicKey.keyPair.e.toString(),
        r: null,
        signed: null,
        unblinded: null,
      };
      MaskCheck = {
        message: keyPairs.check.publicKey, // е проверочный
        N: publicKey.keyPair.n.toString(),
        E: publicKey.keyPair.e.toString(),
        r: null,
        signed: null,
        unblinded: null,
      };
      blindedVote = this.getBlindedVote(MaskVote).blindedVote;
      blindedCheck = this.getBlindedCheck(MaskCheck).blindedCheck;
    } catch (error) {
      console.log(error);
      return;
    }

    try {
      const result = await this.backend({ 'Content-Type': 'application/json' }).post(
        `election/${electionId}/register/`, data);
      voterId = result.data.id;
      this.props.setVoterId(voterId);
      if (result.data.k){
        const KSigned = result.data; // полученный контракт K
        this.props.setContract(KSigned);
        this.props.setKeys(keyPairs);
        this.props.setMVote(MaskVote);
        this.props.setMCheck(MaskCheck);
        this.props.setPrivateKey(privateKeyUserPem);
        this.props.history.push(`/election/${electionId}/candidate`);
        return;
      }
    }  catch (error) {
      this.setState({isLoaded: false});
      console.log(error);
    }
    const voterIdSigned = keyPrivate.sign(voterId.toString(), 'base64', 'utf8');
    // строим контракт

    // отправляем замаскированный message для подписания избиркомом
    try {
      const result = await this.backend({ 'Content-Type': 'application/json' }).post(
        `election/${electionId}/contract/sign/`,
        {
          election_private_key: blindedVote.toString(),
          voter_id: voterId,
          voter_id_signed: voterIdSigned,
        });
      MaskVote.signed = result.data; // замаскированный секретным множит ключи, подписанный избиркомом
    }  catch (error) {
      this.setState({isLoaded: false});
      console.log(error);
      return;
    }
    // собираем K1

    const K1 = {
      info: FIO,
      vote_private_key_masked: blindedVote.toString(),
      check_public_key_masked: blindedCheck.toString(),
      vote_private_key_masked_signed: MaskVote.signed.signed_election_private_key.toString(),
    };

    const signedK1 = keyPrivate.sign(JSON.stringify(K1), 'base64', 'utf8');
    console.log('json');
    console.log(JSON.stringify(K1));

    const dataK = {
      k: K1,
      k_signed_by_voter: signedK1,
      credentials: { passport_series: passportSeries.value, passport_number: passportNumber.value },
      json: JSON.stringify(K1),
    };
    console.log(dataK);
    // закидываем все в redux
    this.props.setK1Info(K1);
    this.props.setKeys(keyPairs);
    this.props.setMVote(MaskVote);
    this.props.setMCheck(MaskCheck);
    this.props.setPrivateKey(privateKeyUserPem);
    try {
      const result = await this.backend({ 'Content-Type': 'application/json' }).post(
        `election/${electionId}/contract/create/`,
        dataK);
      const KSigned = result.data; // полученный контракт K
      this.props.setContract(KSigned);
      console.log(KSigned);
    }  catch (error) {
      console.log(error);
      return;
    }
    console.log(electionId);
    this.props.history.push(`/election/${electionId}/candidate`);
  }

  getBlindedVote = (MaskVote) => {
    const { blinded, r } = BlindSignature.blind({
      message: MaskVote.message,
      N: MaskVote.N,
      E: MaskVote.E,
    });
    // blinded - замаскированный секретным множителем избирателя ключ для голосования
    MaskVote.r = r;
    return { blindedVote: blinded };
  };

  getBlindedCheck = (MaskCheck) => {
    const { blinded, r } = BlindSignature.blind({
      message: MaskCheck.message,
      N: MaskCheck.N,
      E: MaskCheck.E,
    });
    // blinded - замаскированный секретным множителем избирателя ключ для проверки
    MaskCheck.r = r;
    return { blindedCheck: blinded };
  };

  getKeyPairs = async () => {
    const vote = {};
    const check = {};
    await createRSApair()
      .then( (key) => {
      // now you get the JWK public and private keys
      console.log(key.publicKey);
      vote.publicKey = key.publicKey;
      vote.privateKey = key.privateKey;
    })
      .catch(err => {
        console.log(err);
      });
    await createRSApair()
      .then( (key) => {
        // now you get the JWK public and private keys

        check.publicKey = key.publicKey;
        check.privateKey = key.privateKey;
      })
      .catch(err => {
        console.log(err);
      });
    return { vote, check };
  };

  handleChange = (event) => {
    const reader = new FileReader();
    reader.onload = function() {

      const arrayBuffer = this.result,
        array = new Uint8Array(arrayBuffer);
      privateKeyUserPem = String.fromCharCode.apply(null, array);

    };
    reader.readAsArrayBuffer(event.target.files[0]);
    const url = URL.createObjectURL(event.target.files[0]);
    this.setState({url: url});
    event.preventDefault();

  };


  render() {
    const { classes, error } = this.props;
    const { isValid } = this.state;
    let errorList = <div />;
    if (error) {
      const errors = JSON.parse(error.request.response);
      errorList = Object.keys(errors).map(key => <Typography variant="h2" color="error">{`${key}: ${errors[key]}`}</Typography>);
    }
    if (!isValid) {
      errorList = <Typography variant="h2" color="error">Не совпадают пароли</Typography>;
    }

    return (
      <main className={classes.main}>
        <CssBaseline />
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Создание контракта
          </Typography>
          <form className={classes.form}>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="name" variant="filled">Имя</InputLabel>
              <OutlinedInput id="name" name="name" autoFocus labelWidth={0}/>
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="second_name" variant="filled">Фамилия</InputLabel>
              <OutlinedInput id="second_name" name="second_name" autoFocus labelWidth={0}/>
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="patronymic" variant="filled">Отчество</InputLabel>
              <OutlinedInput id="patronymic" name="patronymic" autoFocus labelWidth={0}/>
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="passportSeries" variant="filled">Серия паспорта</InputLabel>
              <OutlinedInput id="passportSeries" name="passportSeries" autoFocus labelWidth={0}/>
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="passportNumber" variant="filled">Номер паспорта</InputLabel>
              <OutlinedInput id="passportNumber" name="passportNumber" autoFocus labelWidth={0}/>
            </FormControl>
            <div>
              <label htmlFor="file_upload">Choose your privateKey.pem to upload (PEM)</label>
              <input type="file" id="file" name="file_upload" accept=".pem" onChange={ this.handleChange}/>
            </div>
            {errorList}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={event => this.submitHandler(event)}
            >
              Создать контракт
            </Button>
          </form>
        </Paper>
      </main>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  setK1Info: data => dispatch(setK1Data(data)),
  setMVote: m => dispatch(setMVote(m)),
  setMCheck: m => dispatch(setMCheck(m)),
  setKeys: keys => dispatch(setKeys(keys)),
  setContract: data => dispatch(setContract(data)),
  setPrivateKey: key => dispatch(setPrivateKey(key)),
  setElectionId: id => dispatch(setElectionId(id)),
  setVoterId: id => dispatch(setVoterId(id)),
});

const mapStateToProps = state => ({
  id: state.election.id,
});


export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(withRouter(CreateContract)));