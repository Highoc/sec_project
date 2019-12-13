import React, { Component } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import styles from './electionsTable.styles';
import withStyles from "@material-ui/core/styles/withStyles";
import {NavLink} from "react-router-dom";
import RequestResolver from "../../helpers/RequestResolver/RequestResolver";

const moment = require('moment');

class electionsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      isLoaded: false,
    };
    this.backend = RequestResolver.getBackend();
  }
  async componentDidMount() {
    try {
      const result = await this.backend().get(`election/`);
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
              <TableCell>Название голосования</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell>Начало голосования</TableCell>
              <TableCell>Конец голосования</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(row => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  <NavLink to={{
                    pathname: `/electionPage/${row.id}`,
                    aboutProps: {
                      name: row.name,
                      id: row.id,
                    }
                  }}>
                    {row.name}
                  </NavLink>
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.description}
                </TableCell>
                <TableCell component="th" scope="row">
                  {moment(row.start_date).format('YYYY-MM-DD HH:mm:ss')}
                </TableCell>
                <TableCell component="th" scope="row">
                  {moment(row.end_date).format('YYYY-MM-DD HH:mm:ss')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper> : <div>Не удалось загрузить данные</div>
    )
  }
}

export default withStyles(styles)(electionsTable);

