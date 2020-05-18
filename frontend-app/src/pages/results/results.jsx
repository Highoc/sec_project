import React, { Component } from 'react';
import { Typography } from '@material-ui/core';
import RequestResolver from "../../helpers/RequestResolver/RequestResolver";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import styles from './results.styles';
import withStyles from "@material-ui/core/styles/withStyles";
import {connect} from "react-redux";

class results extends Component{
  constructor(props) {
    super(props);
    this.state = {
      results: {},
      isLoaded: false,
      candidates: {},
    };
    this.backend = RequestResolver.getBackend();
  }

  async componentDidMount() {
    const { id } = this.props.location.aboutProps;
    let results = undefined;

    try {
      const result = await this.backend().get(`election/${id}/finish/checking/`);
      console.log(result.data);
      results = result.data;
      this.setState({
        results,
      });
    } catch (error) {
      console.log(error);
    }


    try {
      const result = await this.backend().get(`election/${id}/candidate/`);

      console.log(result.data);
      this.setState({
        candidates: result.data,
        isLoaded: true,
      })
    } catch (error) {
      console.log(error);
    }
  }
  render() {
    const { isLoaded, candidates, results } = this.state;
    const { classes } = this.props;

    const { name } = this.props.location.aboutProps;
    return (
      isLoaded ? <Paper className={classes.root}>
        <Typography variant="h3"> {name}</Typography>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Имя</TableCell>
              <TableCell align="center">Фамилия</TableCell>
              <TableCell align="center">Отчество</TableCell>
              <TableCell align="center">Голосов</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map(row => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row" align="center">
                  {row.first_name}
                </TableCell>
                <TableCell component="th" scope="row" align="center">
                  {row.last_name}
                </TableCell>
                <TableCell component="th" scope="row" align="center">
                  {row.patronymic}
                </TableCell>
                <TableCell component="th" scope="row" align="center">
                  {results[row.id]}
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

export default withStyles(styles)(results);