<template>
    <div class="row" style="margin: 64px;">
        <!--
        <div class="col-9">
            <h2>Welcome to the Game of Eggs!!  </h2>
        </div>        -->
        <div class="col-4">
            <button class="btn btn-warning btn-large" @click="toggleGameRules">Game Rules</button>
        </div>
        <div class="col-4">
            <button 
                class="btn btn-success btn-large" 
                :disabled="!isWalletConnected || gameFeeCollected <= 0" 
                @click="this.$router.push({name: 'game', params: {web3: web3, addr: connectedAddress}})">
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
        <div class="col-4" style="text-align: left;">
            <ol v-if="showGameRules" style=" background-color: lightyellow;margin-left: 10px;">
                <li>Game is played in 5 rounds & Each round will give 10 points maximum</li>
                <li>Player score points by clicking on the egg indicated in the Egg Number section</li>
                <li>One Random Egg is picked every 3 seconds</li>
                <li>Each round will give 10 points maximum & Players with Score 30 or above win the game</li>
            </ol>
        </div>
        <div class="col-4" style="margin-top: 128px; color: slateblue;">
            <h3>Welcome to the </h3>
            <h1>Game of Eggs!!</h1>
        </div>
        <div class="col-4" style="text-align: center;background-color: lightcyan;">
            <h4>Wallet Status</h4>
            <div>Wallet Address: {{showFormattedAddress()}}</div>
            <div>Wallet Balance: {{walletBalance}}</div>
            <!--
            <div>
                <button class="btn btn-success p-2 m-2" @click="payGameFee" :disabled="!isWalletConnected || gameFeeCollected > 10">Pay Game Fee</button>
            </div>
            -->
            <button class="btn btn-success p-2 m-2" type="button" @click="payGameFee" :disabled="isPaymentInProgress || !isWalletConnected || gameFeeCollected >= fixedGameFee">
                <span v-if="isPaymentInProgress" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span v-if="isPaymentInProgress">Payment in Progress...</span>
                <span v-if="!isPaymentInProgress">Pay Game Fee</span>
            </button>
            <div>
                Game Fee Paid: {{gameFeeCollected}}
                <!--<button class="btn btn-success" @click="transferFunds">Transfer Funds</button>-->
            </div>
        </div>
    </div>
</template>

<script>
import {ref} from 'vue'
//import {ethers} from 'ethers'
import Web3 from 'web3'
import EggsGameContract from '../../build/contracts/EggsGameContract.json'

export default {
    setup () {
        const FIXED_GAME_FEE = 0.01;
        let showGameRules = ref(false);
        let isWalletConnected = ref(false);
        let balance = ref(0);
        let connectedAddress = ref("None");
        let gameContract;
        let gameFeeCollected = ref(0);
        let isPaymentInProgress = ref(false);
        let eggsGameContractAbi = EggsGameContract.abi;
        let eggsGameContractAddress = EggsGameContract.networks[80001].address;

        let web3;// = new Web3(Web3.givenProvider || 'ws://localhost:8545');

        const toggleGameRules = ()=> {
            showGameRules.value = !showGameRules.value;
        }

        const connectWallet = async () => {
            if(!isWalletConnected.value) {
                web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
                console.log(web3);
                
                await web3.eth.getAccounts(function (error, result) {
                    connectedAddress.value = result[0];
                    isWalletConnected.value = !isWalletConnected.value;
                });
                console.log(connectedAddress.value);
                
                //balance.value = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(connectedAddress.value))).toFixed(2);
                //console.log(balance.value);
                //console.log(web3.utils.fromWei(balance.value));
                //const ethersProvider = new ethers.providers.JsonRpcProvider();
                //console.log(ethersProvider);

                console.log(eggsGameContractAddress);
                console.log(eggsGameContractAbi);

                gameContract = new web3.eth.Contract(eggsGameContractAbi, eggsGameContractAddress);
                //console.log('name of contract -> ' + await gameContract.methods.name().call());
                //console.log('symbol of contract -> ' + await gameContract.methods.symbol().call());
                //console.log('Fee Collected -> ' + await gameContract.methods.feeCollection().call());

                //payGameFee(gameContract);

                console.log('balance of contract (web3) -> ' + web3.utils.fromWei(await web3.eth.getBalance(eggsGameContractAddress)));

                await updatePlayerData();

                //console.log('balance of contract (contract)-> ' + await gameContract.methods.balanceOf(eggsGameContractAddress).call());
                //gameFeeCollected.value = parseFloat(web3.utils.fromWei(await gameContract.methods.feeCollection(connectedAddress.value).call())).toFixed(2);
                //console.log('Fee Collected -> ' + gameFeeCollected.value);
                //console.log('Game Status of this player -> ' + await gameContract.methods.gameStatus(connectedAddress.value).call());
            } else {
                web3 = null;
                console.log(web3);

                connectedAddress.value = "None";
                balance.value = "0";

                if(isWalletConnected.value) {
                    isWalletConnected.value = !isWalletConnected.value;
                }                

                if(isPaymentInProgress.value) {
                    isPaymentInProgress.value = !isPaymentInProgress.value;
                }                
            }
        }
        
        window.ethereum.on('accountsChanged', async () => {
            console.log('Account change Event -> ' + isWalletConnected.value);
            if(isWalletConnected.value) {
                isWalletConnected.value = !isWalletConnected.value;
            }
            connectWallet();
        });

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
                .then(async (receipt) => { 
                    console.log(receipt); 
                    await updatePlayerData();     
                    isPaymentInProgress.value = !isPaymentInProgress.value;
                });
                /*
            console.log(
                        'pay game participation fee -> ' 
                        + 
                        );*/
        }

        async function updatePlayerData() {
            balance.value = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(connectedAddress.value))).toFixed(2);
            console.log(balance.value);
            gameFeeCollected.value = parseFloat(web3.utils.fromWei(await gameContract.methods.feeCollection(connectedAddress.value).call())).toFixed(2);
            console.log('Fee Collected -> ' + gameFeeCollected.value);
            console.log('Game Status of this player -> ' + await gameContract.methods.gameStatus(connectedAddress.value).call());
        }

        const showFormattedAddress = () => {
            if(connectedAddress.value > 0) {
                return connectedAddress.value.substring(0, 4) + '....' + connectedAddress.value.substring(connectedAddress.value.length-4);
            }
            else {
                return connectedAddress.value;
            }
        }
/*
        async function transferFunds() {
            console.log(
                        'transfer balance between smart contracts -> ' 
                        + await gameContract.methods.transfer(eggsGameContractAddress, web3.utils.toWei('0.1', 'ether'))
                            .send(
                                { 
                                    from: connectedAddress, 
                                    //value: web3.utils.toWei('0.1', 'ether'), 
                                    gas: 500000
                                }
                            )
                            .then((receipt) => { console.log(receipt) })
                        );
        }*/

        return {
            showGameRules: showGameRules,
            isWalletConnected: isWalletConnected,
            walletBalance: balance,
            connectedAddress: connectedAddress,
            gameFeeCollected: gameFeeCollected,
            isPaymentInProgress: isPaymentInProgress,
            fixedGameFee: FIXED_GAME_FEE,
            toggleGameRules: toggleGameRules,
            connectWallet: connectWallet,
            payGameFee: payGameFee,
            showFormattedAddress: showFormattedAddress,
            //transferFunds: transferFunds
        }
    },
    props: {
        msg: String
    }
}
</script>

<style lang="scss" scoped>

</style>