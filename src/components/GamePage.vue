<template>
  <!--
  <div>
    <h3>GAME PAGE</h3>
    <button
      class="btn btn-warning"
      @click="this.$router.push({ name: 'home' })"
    >
      Go Back
    </button>
  </div>
  -->
  <div class="container" style="margin-top: 40px;">
    <table>
      <tr>
      <td>
    <v-stage id="stage1"
      :config="{
        //container: 'container',
        width: 1320,
        height: stageHeight,
        //verticalAlign: 'middle'
      }"
    >
      <v-layer>
        <v-ellipse
          v-for="(egg, i) in eggs"
          :key="i + 1"
          :config="{
            x: (i+1 > rowLimit) ? xPos * ((i + 1) - rowLimit) : xPos * (i + 1),
            y: (i+1 > rowLimit) ? 300 : 100,
            radius: {
              x: 56,
              y: 75,
            },
            fill: 'white',
            shadowBlur: 4,
          }"
        />
        <v-circle
          @click="eggPicker(eggNumbers[i])"
          v-for="(egg, i) in eggs"
          :key="eggNumbers[i]"
          :config="{
            x: (i+1 > rowLimit) ? xPos * ((i + 1) - rowLimit) : xPos * (i + 1),
            y: (i+1 > rowLimit) ? 300 : 100,
            radius: 35,
            //fill: (i+1) == randomEgg ? eggColor : fillColor,
            fill: eggColor,
            shadowBlur: 6,
          }"
        />
        <v-text          
          v-for="(egg, i) in eggs"
          :key="i"
          :config="{
            x: (i+1 > rowLimit) ? (xPos-3) * ((i + 1) - rowLimit) : (xPos-3) * (i + 1),
            y: (i+1 > rowLimit) ? 342 : 142,
            //x: (xPos-3) * (i + 1),
            //y: 85,
            text: eggNumbers[i], //i+1,
            fontSize: 30,
            fontFamily: 'Calibri',
            fill: 'green',
            //verticalAlign: 'middle'
          }"
        />
      </v-layer>
      <v-layer>
      <v-text                    
          :config="{
            x: xPos,
            y: 450,
            text: 'Round ' + roundNum + ' / 5',
            fontSize: 30,
            fontFamily: 'Calibri',
            fill: 'green',
            //background: 'yellow'
          }"
        />
        <v-text                    
          :config="{
            x: xPos * rowLimit /2,
            y: 520,
            text: 'Timer ' + timerCount,
            fontSize: 50,
            fontFamily: 'Calibri',
            fill: 'green',
          }"
        />
        <v-text                    
          :config="{
            x: xPos * (rowLimit-1),
            y: 450,
            text: 'Score ' + score + ' / 50',
            fontSize: 30,
            fontFamily: 'Calibri',
            fill: 'green',
          }"
        />
        <v-text          
          :config="{
            x: xPos * rowLimit /2,
            y: 450,
            text: 'Pick Egg Number ' + randomEgg,
            fontSize: 30,
            fontFamily: 'Calibri',
            fill: 'green',
          }"
        />
        <!--
        <v-arrow
          :config="{
            x: stageWidth / 4,
            y: stageHeight / 4,
            points: [0, 0, stageWidth / 2, stageHeight / 2],
            pointerLength: 20,
            pointerWidth: 20,
            fill: 'black',
            stroke: 'black',
            strokeWidth: 4,
          }" />-->
        </v-layer>
    </v-stage>
    </td>
      </tr>
    </table>
    <!--
    <div>{{randomEgg}}</div>
    -->
<!--
    <v-stage :config="{
        width: stageWidth,
        height: stageHeight,
      }">
      <v-layer>
        <v-text          
          :config="{
            x: 400,
            y: 15,
            text: randomEgg,
            fontSize: 30,
            fontFamily: 'Calibri',
            fill: 'green',
          }"
        />
       
      </v-layer>
    </v-stage>
     
     <div v-if="isGameCompleted" style="position: fixed; bottom:150px;">{{gameCompleteMessage}}</div>
     -->
  </div>
  <div class="container" v-if="isGameCompleted" style="position: fixed; bottom:90px; color: orange; font-size: 30px;">
      <span class="spinner-border spinner-border" role="status" aria-hidden="true"></span>
      <span>&nbsp;&nbsp;&nbsp;</span>
      <span>{{gameCompleteMessage}}</span>
  </div>
  <!--
  <div>
    <h4>Round {{ roundNum }} / 5</h4>
    <h4>Timer {{ timerCount }}</h4>
    <h4>Score {{ score }}</h4>
  </div>
-->
</template>

<script>
import { ref, watchEffect, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import store from '../store/index'

//require("dotenv").config();

export default {
  //props: ['web3'],
  setup() {
    const GAME_COMPLETE_MESSAGE = 'Please wait!! Updating game result and redirecting...';
    let isGameCompleted = ref(false);
    let router = useRouter();
    let route = useRoute();
    //let web3 = route.params.web3;
    //const p = toRefs(props);
    //console.log('received web3 obj -> ' + p.value);
    //const web3 = toRef(props, 'web3');
    //console.log('received web3 single -> ' + web3.value);
    let playerAddress = route.params.player;
    console.log('player -> ' + playerAddress);
    let web3 = store.state.web3;
    console.log('store data -> ' + web3);
/*
    await web3.eth.getAccounts(function (error, result) {
        console.log(result[0]); 
    });*/

    let eggCount = 10;
    
    let stageWidth = window.innerWidth;
    let stageHeight = window.innerHeight -25;

    let xPos = 200;

    let fillColor = ref("grey");
    let eggColor = ref("yellow");
    let randomEgg = ref(getRandomIntInclusive(1, eggCount));

    let roundNum = ref(1);
    let timerCount = ref(5);
    let score = ref(0);
    let scoreCaptured = true;

    const ROW_LIMIT = 5;
/*
    const testMethod = (id) => {
      console.log("hello, " + id);
    };*/

    function shuffle(array) {
      let currentIndex = array.length,  randomIndex;

      // While there remain elements to shuffle.
      while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];
      }

      return array;
    }


    const getEggsOrder = () => {
        let arr = [];
        for(var i = 0; i< eggCount; i++) {
          arr.push(i+1);
        }
        return shuffle(arr);
    };
    

    let eggNumbers = ref(getEggsOrder());

    const eggPicker = (i) => {
      
      //console.log("got the egg no." + i);

      if(randomEgg.value === i && timerCount.value > 0 && !scoreCaptured) {
        score.value += 10;
        scoreCaptured = !scoreCaptured;
      }
    };

    watchEffect(() => {
      var refreshIntervalId = window.setInterval(() => {
        if (roundNum.value <= 5) {
          timerCount.value--;

          eggNumbers = getEggsOrder();

          if(roundNum.value === 1) {
            scoreCaptured = !scoreCaptured;
          }
          //randomEgg.value = getRandomIntInclusive(1, eggCount);

          if (timerCount.value == 0) {
            //timerCount.value = 5
            if (roundNum.value < 5) {
              roundNum.value++;
              scoreCaptured = !scoreCaptured;
              timerCount.value = 5;
              randomEgg.value = getRandomIntInclusive(1, eggCount);
              
              //console.log(randomEgg);
            } else stopLoop();
          }
        }
      }, 1000);

      async function stopLoop() {
        //console.log('inside stop loop');
        isGameCompleted.value = true;
        clearInterval(refreshIntervalId);

        let eggsGameContractAbi = store.state.eggsGameContractAbi;
        let eggsGameContractAddress = store.state.eggsGameContractAddress;
        let gameContract = new web3.eth.Contract(eggsGameContractAbi, eggsGameContractAddress);
        if(score.value > 25) {
          //console.log('Running Player Won');          
          await playerGameResult(gameContract.methods.playerWon(playerAddress, 2));
        } else {
          //console.log('Running Player Lose');
          await playerGameResult(gameContract.methods.playerLose(playerAddress));          
        }        
        //console.log('Redirecting .....' + router);
        router.push({name: 'gameover', params: {score: score.value, player: playerAddress}});
      }
    });

    async function playerGameResult(transaction) {
      //console.log('signing txn....');
      //let abi = fs.readFileSync("YourContract.abi").toString();
      //let contract = new web3.eth.Contract(JSON.parse(abi), CONTRACT_ADDRESS);
      //let transaction = gameContract.methods.playerLose(playerAddress);

      //const OWNER_PUBLIC_KEY = '0x957588a59757656bd3b41024BBD0FE116E8896C6';
      //const OWNER_PRIVATE_KEY = 'f033351712cfb92e7b1a5298f75e21fa6a9c14a9e188f41d6a6f904ea4100bcd';

      let options = {
          to  : transaction._parent._address,
          data: transaction.encodeABI(),
          gas : await transaction.estimateGas({from: process.env.VUE_APP_OWNER_PUBLIC_KEY}),
      };

      let signedTransaction = await web3.eth.accounts.signTransaction(options, process.env.VUE_APP_OWNER_PRIVATE_KEY);
      //let transactionReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

      await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction, /*function(error, hash) {
        if (!error) {
          console.log("The hash of your transaction is: ", hash);
        } else {
          console.log("Something went wrong while submitting your transaction:", error)
        }
      }*/);

      //console.log('signed txn is complete!');
    }

    onMounted(async () => {
      //console.log('on mounted:::::');      
      if(web3 == null) {
        web3 = store.commit('connectWallet');
      }
      //console.log('store data -> ' + web3);
      //console.log(parseFloat(web3.utils.fromWei(await web3.eth.getBalance(playerAddress))).toFixed(2));
    });    

    function getRandomIntInclusive(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1) + min); //The maximum and the minimum are inclusive
    }

    return {
      eggs: eggCount,
      stageWidth: stageWidth,
      stageHeight: stageHeight,
      xPos: xPos,
      fillColor: fillColor,
      eggColor: eggColor,
      roundNum: roundNum,
      timerCount: timerCount,
      score: score,
      randomEgg: randomEgg,
      rowLimit: ROW_LIMIT,
      eggNumbers: eggNumbers,
      isGameCompleted: isGameCompleted,
      gameCompleteMessage: GAME_COMPLETE_MESSAGE,
      eggPicker: eggPicker,
    };
  },
};
</script>

<style lang="scss" scoped>
</style>