import React, { Component } from "react";
import RequestResolver from "../../helpers/RequestResolver/RequestResolver";


class testPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      isLoaded: false,
    };
    this.backend = RequestResolver.getBackend();
  }
  /*
  async componentDidMount() {
    let Alice, Bob;
    try {
      const result = await this.backend().get(`public_key/`);

      const publicKeyPEM = result.data.public_key;
      const publicKey = new NodeRSA(publicKeyPEM);

      Bob = {
        key: publicKey,
        blinded: null,
        unblinded: null,
        message: null,
      };

      Alice = {
        message: 'Hello Chaum!',
        N: publicKey.keyPair.n.toString(),
        E: publicKey.keyPair.e.toString(),
        r: null,
        signed: null,
        unblinded: null,
      };

    } catch (error) {
      this.setState({isLoaded: false});
      console.log(error);
    }

    const { blinded, r } = BlindSignature.blind({
      message: Alice.message,
      N: Alice.N,
      E: Alice.E,
    });

    Alice.r = r;
    Bob.blinded = blinded;

    let privBob;
    try {
      const result = await this.backend().get(`private_key/`);
      //console.log(result.data);
      const privateKeyPEM = result.data.private_key;
      privBob = new NodeRSA(privateKeyPEM);
    }  catch (error) {
      console.log(error);
    }
    const signed = BlindSignature.sign({
       blinded: Bob.blinded,
       key: privBob,
    });

    console.log(signed.toString());
    // Alice.signed = signed;
    try {
      const result = await this.backend({ 'Content-Type': 'application/json' }).post(
        `election/1/voter/1/sign/election_private_key/`,
        { election_private_key: blinded.toString() });
      console.log(result.data);
    }  catch (error) {
      this.setState({isLoaded: false});
      console.log(error);
    }
  }*/
  render() {
    return (
        <div>
          Данные не загрузились
        </div>
    )
  }
}



export default testPage;