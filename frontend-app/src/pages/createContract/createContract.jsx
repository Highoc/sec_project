import React, { Component } from 'react';
import {
  Avatar, Button, CssBaseline, FormControl, Paper, Typography, OutlinedInput, InputLabel,
} from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import withStyles from '@material-ui/core/styles/withStyles';
import { connect } from 'react-redux';
import styles from './createContract.styles';
import createRSApair from "../../helpers/crypto/createRSApair";
import { withRouter } from 'react-router-dom';
import RequestResolver from "../../helpers/RequestResolver/RequestResolver";

const BlindSignature = require('blind-signatures');
const NodeRSA = require('node-rsa');

class CreateContract extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      isValid: true,
    };
    this.backend = RequestResolver.getBackend();
  }

  async submitHandler(event) {
    event.preventDefault();
    const electionId = this.props.id;
    console.log(electionId);
    let voterId, blindedVote, blindedCheck;
    let MaskVote, MaskCheck;
    const keyPairs = await this.getKeyPairs(); // сгенерировали пары ключей
    const passportNumber = document.getElementById('passportNumber');
    const passportSeries = document.getElementById('passportSeries');

    const name = document.getElementById('name');
    const secondName = document.getElementById('second_name');
    const patronymic = document.getElementById('patronymic');
    const FIO = { name: name.value, second_name: secondName.value, patronymic: patronymic.value };


    const data = {
      passport_series: passportSeries.value,
      passport_number: passportNumber.value,
      first_name: name.value,
      last_name: secondName.value,
      patronymic: patronymic.value,
    };

    try {
      const result = await this.backend({ 'Content-Type': 'application/json' }).post(
        `election/${electionId}/register/`, data);
      voterId = result.data.id;
    }  catch (error) {
      this.setState({isLoaded: false});
      console.log(error);
    }

    // строим контракт
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
    }
    // отправляем замаскированный message для подписания избиркомом
    try {
      const result = await this.backend({ 'Content-Type': 'application/json' }).post(
        `election/${electionId}/voter/${voterId}/sign/election_private_key/`,
        { election_private_key: blindedVote.toString() });
      MaskVote.signed = result.data; // замаскированный секретным множит ключи, подписанный избиркомом
    }  catch (error) {
      this.setState({isLoaded: false});
      console.log(error);
    }
    // собираем K1
    const K1 = {i: FIO, vote: blindedVote.toString(), check: blindedCheck.toString(), signed: MaskVote.signed };
    console.log(K1);
    //this.props.history.push(`/election/${id}/candidate`);
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
              <InputLabel htmlFor="name">Имя</InputLabel>
              <OutlinedInput id="name" name="name" autoFocus labelWidth={0} />
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="second_name">Фамилия</InputLabel>
              <OutlinedInput id="second_name" name="second_name" autoFocus labelWidth={0} />
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="patronymic">Отчество</InputLabel>
              <OutlinedInput id="patronymic" name="patronymic" autoFocus labelWidth={0} />
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="passportSeries">Серия паспорта</InputLabel>
              <OutlinedInput id="passportSeries" name="passportSeries" autoFocus labelWidth={0} />
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="passportNumber">Номер паспорта</InputLabel>
              <OutlinedInput id="passportNumber" name="passportNumber" autoFocus labelWidth={0} />
            </FormControl>
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
});

const mapStateToProps = state => ({
  id: state.election.id,
});


export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(withRouter(CreateContract)));