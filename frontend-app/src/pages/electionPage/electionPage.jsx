import React, { Component } from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Paper from "@material-ui/core/Paper";
import styles from './electionsPage.styles';
import withStyles from "@material-ui/core/styles/withStyles";
import { Typography, Button } from "@material-ui/core";

function createData(name, surname, thirdName, status, action) {
  return { name, surname, thirdName, status, action };
}

const rows = [
  createData('Иван', 'Иванович', 'Иванов', 'подтверждено', ''),
  createData('Петр', 'Петрович', 'Петров', 'не подтверждено', 'проверить'),
  createData('Сергей', 'Сергеевич', 'Сергов', 'не подтверждено', 'проверить'),
  createData('Настя', 'Петрович', 'Артуровна', 'не подтверждено', 'проверить'),
  createData('Петрок', 'Николаевич', 'Петровна', 'подтверждено', ''),
];

class electionPage extends Component {
  render() {
    const { name } = this.props.location.aboutProps;
    const { classes } = this.props;
    return (
      <div>
        <div className={classes.headerText}>
          <Typography component="h1" variant="h5">
            Список проголосовавших: {name}
          </Typography>
        </div>
        <Paper className={classes.root}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Имя</TableCell>
                <TableCell align="right">Отчество</TableCell>
                <TableCell align="right">Фамилия</TableCell>
                <TableCell align="right">Статус</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.name}>
                  <TableCell component="th" scope="row">
                      {row.name}
                  </TableCell>
                  <TableCell align="right">{row.surname}</TableCell>
                  <TableCell align="right">{row.thirdName}</TableCell>
                  <TableCell align="right">{row.status}</TableCell>
                  <TableCell align="right">{row.action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <div className={classes.button}>
          <Button color="primary" size="medium" variant="outlined">Участвовать в голосовании</Button>
        </div>

      </div>
    )
  }
}

export default withStyles(styles)(electionPage);