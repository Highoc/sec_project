import React, { Component } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import styles from './electionsTable.styles';
import withStyles from "@material-ui/core/styles/withStyles";
import { NavLink } from "react-router-dom";
import RequestResolver from "../../helpers/RequestResolver/RequestResolver";
import {withRouter} from 'react-router-dom';

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
  handleEnvVote = async (id) => {
    try {
      const result = await this.backend().get(`election/${id}/finish/voting/`);
      console.log(result.data);
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
    } catch (error) {
      console.log(error);
    }
  };

  handleEnvElections = async (id) => {
    try {
      const result = await this.backend().get(`election/${id}/finish/checking/`);
      console.log(result.data);
      alert(``);
      localStorage.setItem('results', JSON.stringify(result.data));
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const { classes } = this.props;
    const { isLoaded, data } = this.state;
    return (
      isLoaded ?
      <Paper className={classes.root}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Название голосования</TableCell>
              <TableCell align="center">Описание</TableCell>
              <TableCell align="center">Начало голосования</TableCell>
              <TableCell align="center">Конец голосования</TableCell>
              <TableCell align="center">Открытый репозиторий</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(row => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row" align="center">
                    {row.name}
                </TableCell>
                <TableCell component="th" scope="row" align="center">
                    {row.description}
                </TableCell>
                <TableCell component="th" scope="row" align="center">
                  {moment(row.start_date).format('YYYY-MM-DD HH:mm:ss')}
                </TableCell>
                <TableCell component="th" scope="row" align="center">
                  {moment(row.end_date).format('YYYY-MM-DD HH:mm:ss')}
                </TableCell>
                <TableCell align="center">
                  <NavLink to={{
                    pathname: `/electionPage/${row.id}`,
                    aboutProps: {
                      name: row.name,
                      id: row.id,
                    }
                  }}>
                    К списку голосов
                  </NavLink>
                  <br/>
                  <NavLink to={{
                    pathname: `/election/${row.id}/contracts`,
                    aboutProps: {
                      name: row.name,
                      id: row.id,
                    }
                  }}>
                    К списку контрактов
                  </NavLink>
                  <br/>
                  { row.is_finished && <NavLink to={{
                    pathname: `/election/${row.id}/checks`,
                    aboutProps: {
                      name: row.name,
                      id: row.id,
                    }
                  }}>
                    К списку проверочной информации
                  </NavLink> }
                </TableCell>
                <TableCell align="center">
                  <div className={classes.button}>
                    {!row.is_finished && <NavLink to={{
                      pathname: `/createContract`,
                      aboutProps: {
                        name: row.name,
                        id: row.id,
                      }
                    }}>
                      Участвовать в голосовании
                    </NavLink>}
                    {row.is_finished && !row.is_checked && <NavLink to={{
                      pathname: `/election/${row.id}/createCheckInfo`,
                      aboutProps: {
                        name: row.name,
                        id: row.id,
                      }
                    }}>
                      Участвовать в проверке
                    </NavLink>}
                    <br/>
                    {!row.is_finished && <a onClick={() => this.handleEnvVote(row.id)}>
                      Закончить голосование
                    </a>}
                    <br/>
                    {row.is_finished && !row.is_checked && <a onClick={() => this.handleEnvElections(row.id)}>
                      Закончить выборы
                    </a>}
                    <br/>
                    {row.is_checked && <NavLink to={{
                      pathname: `/election/${row.id}/results`,
                      aboutProps: {
                        name: row.name,
                        id: row.id,
                      }
                    }}>
                      Посмотреть результаты
                    </NavLink>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper> : <div>Не удалось загрузить данные</div>
    )
  }
}

export default withStyles(styles)(withRouter(electionsTable));

