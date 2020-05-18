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
import { setVoterPrivateKeySigned } from "../../store/actions/election";
const BlindSignature = require('blind-signatures');
const NodeRSA = require('node-rsa');

class votePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      isLoaded: false,
      isSent: false,
    };
    this.backend = RequestResolver.getBackend();
  }
  async componentDidMount() {
    let voter;
    const { Id } = this.props;
    // получаем свой id (голосуем)
    try {
      const result = await this.backend().get(`election/${Id}/candidate/`);
      voter = result.data;
      console.log(voter);
      this.setState({
        data: result.data,
        isLoaded: true,
      })
    } catch (error) {
      console.log(error);
    }
  }

  handleVote = async (event) => {
    const { Id, MVote, VoteKeys, CheckKeys, Contract, voterId } = this.props;
    const choice = event.target.id;
    if (Contract.k.vote_private_key_masked_signed && Contract){
      const signedFromIzbirkom = Contract.k.vote_private_key_masked_signed;
      console.log(signedFromIzbirkom);
      console.log('r');
      console.log(MVote.r.toString());
      const unblinded = BlindSignature.unblind({
        signed: signedFromIzbirkom,
        N: MVote.N,
        r: MVote.r,
      });
      const votePublicKey = new NodeRSA(VoteKeys.privateKey);
      console.log(votePublicKey);
      console.log('masked');
      console.log(Contract.k.vote_private_key_masked);
      // подписываем голос
      const signedChoice = votePublicKey.sign(choice, 'base64', 'utf8');
      const vote = {
        vote_private_key: VoteKeys.privateKey,
        check_public_key: CheckKeys.publicKey,
        vote_private_key_signed: unblinded.toString(),
        candidate: choice,
        candidate_crypted: signedChoice,
        vote_private_key_masked: Contract.k.vote_private_key_masked,
      };
      this.props.setVoterPrivateKeySigned(unblinded.toString());
      console.log('vote');
      console.log(vote);
      try {
        const result = await this.backend({ 'Content-Type': 'application/json' }).post(
          `election/${Id}/vote/create/`, vote);
        console.log(result.data);
        localStorage.setItem(`vote-${Id}-myId${voterId}`, result.data.id);
        this.setState({ isSent: true });
        this.props.history.push(`/elections`);
      }  catch (error) {
        console.log(error);
      }
    }

    event.preventDefault();

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
                <TableCell align="center">Имя</TableCell>
                <TableCell align="center">Фамилия</TableCell>
                <TableCell align="center">Отчество</TableCell>
                <TableCell align="center">Описание</TableCell>
                <TableCell align="center">Действие</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(row => (
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
                    {row.description}
                  </TableCell>
                  <TableCell component="th" scope="row" id={row.id} onClick={this.handleVote} align="center">
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
  setVoterPrivateKeySigned: key => dispatch(setVoterPrivateKeySigned(key)),
});

const mapStateToProps = state => ({
  Id: state.election.id,
  MVote: state.election.mVote,
  VoteKeys: state.election.voteKeys,
  CheckKeys: state.election.checkKeys,
  Contract: state.election.contract,
  voterId: state.election.voterId,
});


export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(votePage));