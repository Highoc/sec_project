import React, { Component } from "react";
import styles from './votePage.styles';
import withStyles from "@material-ui/core/styles/withStyles";
import RequestResolver from "../../helpers/RequestResolver/RequestResolver";
import {connect} from "react-redux";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Paper from "@material-ui/core/Paper";

const BlindSignature = require('blind-signatures');
const NodeRSA = require('node-rsa');

class votePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      isLoaded: false,
    };
    this.backend = RequestResolver.getBackend();
  }
  async componentDidMount() {
    let voter;
    const { id } = this.props;
    // получаем свой id (голосуем)
    try {
      const result = await this.backend().get(`election/${id}/candidate/`);
      voter = result.data;
    } catch (error) {
      console.log(error);
    }
  }

  handleVote = (event) => {
    event.preventDefault();
    console.log(event.target.value);
    console.log();
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
                <TableCell>Имя</TableCell>
                <TableCell>Фамилия</TableCell>
                <TableCell>Отчество</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Действие</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(row => (
                <TableRow key={row.name}>
                  <TableCell component="th" scope="row">
                      {row.first_name}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row.last_name}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row.patronymic}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row.description}
                  </TableCell>
                  <TableCell component="th" scope="row" onClick={this.handleVote}>
                    Проголосовать за кандидата {row.id}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper> :
      <div>
        Данные не загрузились
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
});

const mapStateToProps = state => ({
  id: state.election.id,
});


export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(votePage));