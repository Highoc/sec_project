import React, { Component } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import styles from './contractsTable.styles';
import withStyles from "@material-ui/core/styles/withStyles";
import RequestResolver from "../../helpers/RequestResolver/RequestResolver";


class contractsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      isLoaded: false,
    };
    this.backend = RequestResolver.getBackend();
  }
  async componentDidMount() {
    const { id } = this.props.location.aboutProps;
    try {
      const result = await this.backend().get(`election/${id}/contract/`);
      console.log(result.data);
      this.setState({
        data: result.data,
        isLoaded: true,
      });
    } catch (error) {
      this.setState({ isLoaded: false });
      console.log(error);
    }
  }

  render() {
    const { classes } = this.props;
    const { isLoaded, data } = this.state;
    return (
      isLoaded ?
        <Paper className={classes.root}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Контракт</TableCell>
                <TableCell align="center">Контракт подписанный избиркомом</TableCell>
                <TableCell align="center">Контракт подписанный избирателем</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(row => (
                <TableRow key={row.k_signed_by_voter}>
                  <TableCell component="th" scope="row" align="center">
                    ФИО: {row.k.info}
                    <br/>
                    Приватный ключ голосования маскированный: {String(row.k.vote_private_key_masked)}
                    <br/>
                    Публичный ключ проверки маскированный: {String(row.k.check_public_key_masked)}
                    <br/>
                    Приватный ключ голосования маскированный: {String(row.k.vote_private_key_masked)}
                    <br/>
                    Приватный ключ голосования маскированный и подписанный: {String(row.k.vote_private_key_masked_signed)}
                  </TableCell>
                  <TableCell component="th" scope="row" align="center">
                    {String(row.k_signed_by_election)}
                  </TableCell>
                  <TableCell component="th" scope="row" align="center">
                    {String(row.k_signed_by_voter)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper> : <div>Не удалось загрузить данные</div>
    )
  }
}

export default withStyles(styles)(contractsTable);

