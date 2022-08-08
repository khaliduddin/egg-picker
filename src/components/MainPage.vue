<template>
    <div class="row" style="margin: 64px;">
        <!--
        <div class="col-9">
            <h2>Welcome to the Game of Eggs!!  </h2>
        </div>        -->
        <div class="col-4">
            <button class="btn btn-warning btn-large" @click="toggleGameRules">Game Play</button>
        </div>
        <div class="col-4">
            <button 
                class="btn btn-success btn-large" 
                :disabled="!isWalletConnected || gameFeeCollected <= 0" 
                @click="this.$router.push({name: 'game', params: {player: connectedAddress}})">
                Start Game
            </button>
            <br/>
            <span style="font-size: 12px;color: red;" v-if="!isWalletConnected">Connect your Wallet</span>
            <span style="font-size: 12px;color: red;" v-if="isWalletConnected && gameFeeCollected <= 0">Game Fee not received</span>
        </div>
        <div class="col-4">
            <button class="btn btn-info btn-large" @click="connectWallet" v-if="!isWalletConnected">Connect Wallet</button>
            <button class="btn btn-info btn-large" @click="connectWallet" v-else>Disconnect Wallet</button>
        </div>
    </div>
    
    <div class="row">
        <div v-if="showGameRules" class="col-4" style="text-align: left;background-color: lightyellow;">
            <ol  style="margin: 20px; padding: 10px;">
                <li>Game is played in 5 rounds & Each Round lasts for 5 seconds</li>                
                <li>One Random Egg is picked every 5 seconds</li>
                <li>Each round will give 10 points maximum</li>
                <li>Player score points by clicking on the Egg yellow indicated in the Egg Number section</li>
                <li>Players with a Score of 30 points or above wins the game</li>                
            </ol>
        </div>
        <div v-else class="col-4"></div>
        <div class="col-4" style="margin-top: 42px; color: slateblue;">
            <h3>{{gameTitleWelcome}}</h3>
            <h1>
                {{gameTitleDesc}} 
                <span><img src="../assets/icons8-egg-64.png" /> </span> 
            </h1>
        </div>
        <div class="col-4" style="text-align: center;background-color: lightcyan; height: fit-content;">
            <h4>Wallet Status</h4>
            <div v-if="$store.state.walletAvailable">                
                <div class="p-1 m-1">Wallet Address: {{showFormattedAddress()}}</div>
                <div class="p-1 m-1">Wallet Balance: {{walletBalance}}</div>
                
                <button class="btn btn-success p-2 m-2" type="button" @click="payGameFee" :disabled="isPaymentInProgress || !isWalletConnected || gameFeeCollected >= fixedGameFee">
                    <span v-if="isPaymentInProgress" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span v-if="isPaymentInProgress">Payment in Progress...</span>
                    <span v-if="!isPaymentInProgress">Pay Game Fee</span>
                </button>
                <div class="p-1 m-1">
                    Game Fee Paid: {{gameFeeCollected}}                
                </div>
                <div class="p-1 m-1">
                    Rewards Balance: {{playerRewards}}                
                </div>
            </div>
            <div v-else style="color:red;">
                {{walletMessage}}
            </div>
            <div v-if="isWalletLocked" style="color:red;">
                {{walletLockMessage}}
            </div>
        </div>
    </div>

   <main-page-instructions />

</template>

<script>
import {ref} from 'vue'
//import {ethers} from 'ethers'
//import Web3 from 'web3'
//import EggsGameContract from '../../build/contracts/EggsGameContract.json'
//import MainSubPage from './MainSubPage.vue'
import MainPageInstructions from './MainPageInstructions.vue'
import store from '../store/index'

export default {
    components: { MainPageInstructions },
    setup () {
        const FIXED_GAME_FEE = 0.01;
        const WALLET_AVAILABILITY_MESSAGE = 'Metamask wallet is not available in this browser. Please refer instructions at the bottom.';
        const WALLET_LOCKED_MESSAGE = 'Metamask wallet might be locked. Please login into the wallet and try connecting again.';
        const GAME_TITLE_WELCOME = 'Welcome to the Game of';
        const GAME_TITLE_DESCRIPTION = 'Picking Eggs!!';
        let showGameRules = ref(false);
        let isWalletConnected = ref(false);
        let isWalletLocked = ref(false);
        let balance = ref(0);
        let connectedAddress = ref("None");
        let gameContract;        
        let gameFeeCollected = ref(0);
        let playerRewards = ref(0);
        let isPaymentInProgress = ref(false);
        let eggsGameContractAbi = store.state.eggsGameContractAbi;// EggsGameContract.abi;
        let eggsGameContractAddress = store.state.eggsGameContractAddress;// EggsGameContract.networks[80001].address;

        let web3;// = new Web3(Web3.givenProvider || 'ws://localhost:8545');

        const toggleGameRules = ()=> {
            showGameRules.value = !showGameRules.value;
        }

        const connectWallet = async () => {
            await window.ethereum.enable();

            /*const ethereum = window.ethereum;
            const web3Instance = new Web3(ethereum);
            //const enabledWeb3 = 
            await ethereum.enable();
            const account = await web3Instance.eth.getAccounts();
            const accountAddress = await account[0];
            console.log(accountAddress);
            */

            if(!isWalletConnected.value) {
                
                if(store.state.walletAvailable) {
                    //walletMessage.value = '';
                    store.commit('connectWallet');
                    //web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
                    web3 = store.state.web3;
                    //console.log(web3);

                    /*var account0;
                    await web3.eth.getAccounts().then(function(result){
                        account0 = result[0];
                    });

                    console.log(account0);*/
                    
                    await web3.eth.getAccounts(function (error, result) {
                        console.log('result check ->', result.length);
                        //console.log(result[0]);
                        //console.log(error);
                        if(result.length === 0) {
                            //console.log('wallet is locked');    
                            isWalletLocked.value = true;                        
                        } else {
                            connectedAddress.value = result[0];
                            isWalletConnected.value = !isWalletConnected.value;
                            isWalletLocked.value = false;
                        }                        
                    });
                    
                    if(!isWalletLocked.value) {
                        //console.log('this is me the player ->', connectedAddress.value);                    
                        //console.log(eggsGameContractAddress);
                        //console.log(eggsGameContractAbi);

                        gameContract = new web3.eth.Contract(eggsGameContractAbi, eggsGameContractAddress);
                        
                        //console.log('balance of contract (web3) -> ' + web3.utils.fromWei(await web3.eth.getBalance(eggsGameContractAddress)));

                        await updatePlayerData();
                    }
                } else {
                    store.state.walletAvailable = false;                    
                }

            } else {
                store.commit('disconnectWallet');
                web3 = store.state.web3;
                //console.log(web3);

                connectedAddress.value = "None";
                balance.value = 0;
                gameFeeCollected.value = 0;

                if(isWalletConnected.value) {
                    isWalletConnected.value = !isWalletConnected.value;
                }                

                if(isPaymentInProgress.value) {
                    isPaymentInProgress.value = !isPaymentInProgress.value;
                }                
            }
        }

        if(window.ethereum) {
            window.ethereum.on('accountsChanged', async () => {
                //console.log('Account change Event -> ' + isWalletConnected.value);
                if(isWalletConnected.value) {
                    isWalletConnected.value = !isWalletConnected.value;
                }
                connectWallet();
            });
        } else {
            //console.log('Wallet not found');
            store.state.walletAvailable = false;
        }

        async function payGameFee() {            
            isPaymentInProgress.value = !isPaymentInProgress.value;
            await gameContract.methods.payGameFee(connectedAddress.value)
                .send(
                    { 
                        from: connectedAddress.value, 
                        value: web3.utils.toWei('0.01', 'ether'), 
                        gas: 800000
                    }
                )
                .then(async () => { //async (receipt) => {
                    //console.log(receipt); 
                    await updatePlayerData();     
                    isPaymentInProgress.value = !isPaymentInProgress.value;
                });
        }

        async function updatePlayerData() {
            balance.value = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(connectedAddress.value))).toFixed(2);
            //console.log(balance.value);
            gameFeeCollected.value = parseFloat(web3.utils.fromWei(await gameContract.methods.feeCollection(connectedAddress.value).call())).toFixed(2);
            //console.log('Fee Collected -> ' + gameFeeCollected.value);
            //console.log('Game Status of this player -> ' + await gameContract.methods.gameStatus(connectedAddress.value).call());
            playerRewards.value = parseFloat(web3.utils.fromWei(await gameContract.methods.rewards(connectedAddress.value).call())).toFixed(2);
            //console.log('Rewards Balance of this player -> ' + playerRewards.value);
            //console.log('Game purse -> ' + web3.utils.fromWei(await gameContract.methods.gamePurse().call()));
        }

        const showFormattedAddress = () => {
            if(connectedAddress.value > 0) {
                return connectedAddress.value.substring(0, 4) + '....' + connectedAddress.value.substring(connectedAddress.value.length-4);
            }
            else {
                return connectedAddress.value;
            }
        }

        return {
            web3: web3,
            showGameRules: showGameRules,
            isWalletConnected: isWalletConnected,
            isWalletLocked: isWalletLocked,
            walletBalance: balance,
            connectedAddress: connectedAddress,
            gameFeeCollected: gameFeeCollected,
            playerRewards: playerRewards,
            isPaymentInProgress: isPaymentInProgress,
            gameTitleWelcome: GAME_TITLE_WELCOME,
            gameTitleDesc: GAME_TITLE_DESCRIPTION,
            fixedGameFee: FIXED_GAME_FEE,
            walletMessage: WALLET_AVAILABILITY_MESSAGE,
            walletLockMessage: WALLET_LOCKED_MESSAGE,
            toggleGameRules: toggleGameRules,
            connectWallet: connectWallet,
            payGameFee: payGameFee,
            showFormattedAddress: showFormattedAddress,
        }
    },
    props: {
        msg: String
    }
}
</script>

<style lang="scss" scoped>

</style>