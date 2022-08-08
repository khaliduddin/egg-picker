<template>
  
  <div class="container p-4">
    <!--<h3>GAME PAGE</h3>-->
    
    <div style="padding: 50px;"><h1>Game Over</h1></div>
    <div>
      <div style="font-size: 62px; font-weight: bold; color: greenyellow; padding: 30px;" v-if="isGameWon">You Win!</div>
      <div v-else style="font-size: 52px; font-weight: bold; color: red; padding: 30px;">You Lose! Try Again.</div>
      <div class="row">
        <div class="col-3" style="font-size: 22px; font-weight: bold; color: blueviolet;">Final Score: {{score}}</div>
        <div class="col-1"></div>
        <div class="col-4" style="font-size: 22px; font-weight: bold; color: blueviolet;">Available Rewards: {{playerRewards}}</div>
        <div class="col-1"></div>
        <!--<button class="btn btn-success col-2" @click="claimRewards">Claim Rewards</button> -->
        <!--<button class="btn btn-success col-2" @click="claimAllRewards" :disabled="playerRewards==0">Claim Rewards</button>-->
        <button class="btn btn-success col-2" type="button" @click="claimAllRewards" :disabled="isClaimingInProgress || playerRewards==0">
            <span v-if="isClaimingInProgress" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span v-if="isClaimingInProgress">Claiming Rewards...</span>
            <span v-if="!isClaimingInProgress">Claim Rewards</span>
        </button>
      </div>
    </div>
    
    <button
      class="btn btn-warning"
      @click="this.$router.push({ name: 'home' })"
      style="margin: 40px; padding: 20px;"
    >
      Go Back to Home
    </button>

    <div>
      <span style="color:red; font-size: 14px;">Note: Claiming rewards may take more time depending on the network congestion. Please try to refresh page after few minutes if you do not see any response within 2 minutes of claim submission</span>
    </div>
  </div>
  <!--
  <div>
    <div>Game Status -> {{gameStatus}}</div>
    <div>Game Fee -> {{gameFeeCollected}}</div>
    <div>Rewards in contract -> {{playerRewards}}</div>
  </div>
  -->
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import store from '../store/index'

export default {
  setup() {
    let route = useRoute();
    //console.log('Score -> ' + route.params.score);
    let player = route.params.player;
    //console.log('Player Address -> ' + player);
    let web3 = store.state.web3;
    //console.log('store data -> ' + web3);
    
    let score = route.params.score;
    let isGameWon = (score > 25) ? true: false;
    let isClaimingInProgress = ref(false);
    let gameFeeCollected = ref(0);
    let playerRewards = ref(0);
    let gameStatus = ref(false);
    let gameContract;

    onMounted(async () => {
      //console.log('on mounted:::::');
      //console.log('contract address -> ', store.state.eggsGameContractAddress);
      //console.log('store data -> ' + await web3);
      //console.log(parseFloat(web3.utils.fromWei(await web3.eth.getBalance(route.params.player))).toFixed(2));

      gameContract = new web3.eth.Contract(store.state.eggsGameContractAbi, store.state.eggsGameContractAddress);

      gameFeeCollected.value = parseFloat(web3.utils.fromWei(await gameContract.methods.feeCollection(player).call())).toFixed(2);
      //console.log('Fee Collected -> ' + gameFeeCollected.value);
      playerRewards.value = parseFloat(web3.utils.fromWei(await gameContract.methods.rewards(player).call())).toFixed(2);
      gameStatus.value = await gameContract.methods.gameStatus(player).call();
      //console.log('Game Status of this player -> ' + gameStatus.value);

      isClaimingInProgress.value = false;
    });

    const claimAllRewards = async () => {
      //console.log('claiming all rewards for player -> ' + player);
      
      isClaimingInProgress.value = true;

      await gameContract.methods.claimAllRewards()
          .send(
              { 
                  from: player, 
                  //value: web3.utils.toWei(playerRewards.value, 'ether'), 
                  gas: 800000
              }
          )
          .on('receipt', async () => { //async (receipt) => {
              //console.log('receipt ->' + receipt);               
              playerRewards.value = parseFloat(web3.utils.fromWei(await gameContract.methods.rewards(player).call())).toFixed(2);
              isClaimingInProgress = false;
          });/*
          .on('error', async (error) => { 
              console.log('error ->' + error);               
          });*/
    };

    return {
      score: score,
      isGameWon: isGameWon,
      gameFeeCollected: gameFeeCollected,
      playerRewards: playerRewards,
      gameStatus: gameStatus,
      isClaimingInProgress: isClaimingInProgress,
      claimAllRewards: claimAllRewards
    };
  },
};
</script>

<style lang="scss" scoped>
</style>