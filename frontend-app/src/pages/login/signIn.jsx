import React, { Component } from 'react';
import {
  Avatar, Button, CssBaseline, FormControl, Paper, Typography, InputLabel, OutlinedInput,
} from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import withStyles from '@material-ui/core/styles/withStyles';
import { connect } from 'react-redux';
import styles from './signIn.styles';
import { login } from '../../store/actions/authorization';
import {NavLink} from "react-router-dom";


class SignIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      isCorrect: true,
    };
  }

  submitHandler(event) {
    event.preventDefault();
    const { onLogin } = this.props;
    const passwordInput = document.getElementById('password');
    const loginInput = document.getElementById('username');
    const isValid = true;

    if (isValid) {
      onLogin(event, loginInput.value, passwordInput.value);
    } else {
      this.setState({ isCorrect: false });
    }
  }


  render() {
    const { classes, error } = this.props;
    let errorMessage = <div />;
    if (error){
      errorMessage = <Typography variant="h2" color="error">Неправильный логин и/или пароль</Typography>;
    }

    return (
      <main className={classes.main}>
        <CssBaseline />
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Вход/
            <NavLink to="/register">
              Регистрация
            </NavLink>
          </Typography>
          <form className={classes.form}>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="username">Серия и номер паспорта</InputLabel>
              <OutlinedInput id="username" name="username" autoFocus labelWidth={0} />
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="password">Пароль</InputLabel>
              <OutlinedInput name="password" type="password" id="password" autoComplete="current-password" labelWidth={0} />
            </FormControl>
            {errorMessage}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={event => this.submitHandler(event)}
            >
              Войти
            </Button>
          </form>
        </Paper>
      </main>
    );
  }
}

const mapStateToProps = state => ({
  isAuthorized: state.authorization.isAuthorized,
  username: state.authorization.username,
  error: state.authorization.error,
});

const mapDispatchToProps = dispatch => ({
  onLogin: (event, loginVal, passwordVal) => {
    event.preventDefault();
    dispatch(login(loginVal, passwordVal));
  },
});


export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(SignIn));