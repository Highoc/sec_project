import axios from 'axios/index';
import { backend as backendURL } from './urls';

export default class RequestResolver {
  static getBackend() {
    return headers => axios.create({
      baseURL: backendURL,
      timeout: 50000,
      headers,
    });
  }

  static getGuest() {
    return headers => axios.create({
      baseURL: backendURL,
      timeout: 50000,
      headers,
    });
  }
}