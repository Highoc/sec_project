import React, { Component } from 'react';
import {
  Avatar, Button, CssBaseline, FormControl, Paper, Typography, OutlinedInput, InputLabel,
} from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import withStyles from '@material-ui/core/styles/withStyles';
import { connect } from 'react-redux';
import { registration } from '../../store/actions/register';
import styles from './register.styles';

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      isValid: true,
    };
  }

  submitHandler(event) {
    event.preventDefault();
    const { onRegister } = this.props;
    let isValid = false;

    const passwordInput1 = document.getElementById('password1');
    const passwordInput2 = document.getElementById('password2');
    const loginInput = document.getElementById('username');

    if (passwordInput1.value === passwordInput2.value) {
      isValid = true;
    }

    if (isValid) {
      const data = {
        username: loginInput.value,
        password1: passwordInput1.value,
        password2: passwordInput2.value,
      };
      onRegister(data);
    } else {
      this.setState({ isValid: isValid });
    }
  }

  render() {
    const { classes, error } = this.props;
    const { isValid } = this.state;
    let errorList = <div />;
    if (error) {
      const errors = JSON.parse(error.request.response)
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
            Регистрация
          </Typography>
          <form className={classes.form}>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="username">Серия и номер паспорта</InputLabel>
              <OutlinedInput id="username" name="username" autoFocus labelWidth={0} />
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="password">Пароль</InputLabel>
              <OutlinedInput name="password1" type="password" id="password1" autoComplete="current-password" labelWidth={0} />
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="password">Подтвердите пароль</InputLabel>
              <OutlinedInput name="password2" type="password" id="password2" autoComplete="current-password" labelWidth={0} />
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
              Зарегистрироваться
            </Button>
          </form>
        </Paper>
      </main>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  onRegister: data => dispatch(registration(data)),
});

const mapStateToProps = state => ({
  loading: state.reg.loading,
  error: state.reg.error,
});


export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Register));