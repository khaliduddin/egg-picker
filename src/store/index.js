import { createStore } from 'vuex'
import Web3 from 'web3'
import EggsGameContract from '../../build/contracts/EggsGameContract.json'

export default createStore({
  state: {
    web3: null,
    walletAvailable: true,
    //walletLocked: false,
    eggsGameContractAbi: EggsGameContract.abi,
    eggsGameContractAddress: EggsGameContract.networks[80001].address,
  },
  getters: {
  },
  mutations: {
    connectWallet(state) {
      if(window.ethereum) {
        //await window.ethereum.enable();
        state.web3 = new Web3(Web3.givenProvider  || 'ws:://localhost:8545');
        //state.web3 = new Web3(Web3.givenProvider);
        //state.web3 = new Web3(Web3.currentProvider);
        state.walletAvailable = true;
      } else {
        state.walletAvailable = false;
      }       
      //window.ethereum.enable();
    },
    disconnectWallet(state) {
      state.web3 = null;
    }
  },
  actions: {
  },
  modules: {
  }
})
