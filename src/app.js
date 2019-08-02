// Import lit-html
import {html, render} from './../node_modules/lit-html/lit-html.js';
import {classMap} from 'lit-html/directives/class-map.js';
import "./styles/app.css";

class cowsBulls {
	constructor(){
		this.gameLevel = 0;
		this.startGame = false;
		this.currScore = 0;
		this.currInput = '';
		this.randomNumber = [];
		this.previousGuessess = [];
		this.timer;
		this.totalSeconds = 0;
		this.foundNumber = false;
	}

	selectLevel(level) {
		this.gameLevel = level;
		this.previousGuessess = [];
		this.startGame = true;
		var maxNum = 900 * ((this.gameLevel === 1) ? 1 : (this.gameLevel === 2) ? 10 : 100);
		var minNum = 100 * ((this.gameLevel === 1) ? 1 : (this.gameLevel === 2) ? 10 : 100);
		this.randomNumber = Math.floor(Math.random() * maxNum + minNum).toString().split('');
		this.renderPage();
		var minutesLabel = document.getElementById("minutes");
		var secondsLabel = document.getElementById("seconds");
		this.timer = setInterval(() => {
			++this.totalSeconds;
			secondsLabel.innerHTML = this.pad(this.totalSeconds % 60);
			minutesLabel.innerHTML = this.pad(parseInt(this.totalSeconds / 60));
		}, 1000);
	}

	onInputValue(event) {
		this.currInput = event.target.value;
		this.renderPage()
	}

	onKeyDown(event) {
		if (event.target.value.length >= this.gameLevel + 2 && event.keyCode >= 48 && event.keyCode <= 57) {
			event.preventDefault()
			event.stopPropagation();
		}
	}

	pad(val) {
	  var valString = val + "";
	  if (valString.length < 2) {
	    return "0" + valString;
	  } else {
	    return valString;
	  }
	}

	findBullsAndCows() {
		var visitedIndex = [];
		var userInput = this.currInput.split('');
		var result = {
			cows: 0,
			bulls: 0
		}

		if (!userInput.length) {
			alert("please enter number to guess");
			return;
		} else if (this.randomNumber.length !== userInput.length) {
			this.currInput = '';
			this.renderPage();
			alert("please enter " + (this.gameLevel + 2) + " digit number");
			return;
		}
		userInput.forEach((guessNumber, guessIndex) => {
			var bullFound = false;
			var cowFound = false;
			this.randomNumber.some((randomNum, randomIndex) => {
				if (guessNumber === randomNum) {
					if (guessIndex === randomIndex) {
						cowFound = true;
						return true;
						visitedIndex[randomIndex] = 1;
					} else if (!visitedIndex[randomIndex] && this.randomNumber[randomIndex] !== userInput[randomIndex]) {
						bullFound = true;
						visitedIndex[randomIndex] = 1;
					}
				}
				return false;
			})
			if (cowFound) {
				result["cows"] = result["cows"] + 1;	
			} else if (bullFound) {
				result["bulls"] = result["bulls"] + 1;
			}
		});
		this.previousGuessess.unshift({[this.currInput]: result});
		this.currInput = '';
		this.currScore++;
		if (this.gameLevel === 1 && result["cows"] === 3 || this.gameLevel === 2 && result["cows"] === 4 || this.gameLevel === 3 && result["cows"] === 5) {
			this.foundNumber = true;
			clearInterval(this.timer);
		} else {
			document.getElementsByClassName('guessing-number')[0].focus();
		}
		this.renderPage()
	}

	resetState() {
		this.startGame = this.foundNumber =false;
		this.currScore = this.gameLevel = 0;
		this.renderPage()
	}

	gameWinTemplate() {
		const mergedClasses = {'show': this.foundNumber, 'game-win-wrapper':true}
		return html `
		<div class=${classMap(mergedClasses)}> 
			<div class="game-win">
				<div class="win-header"> 
					<div class="congrats"> Congrats <img src="images/congrats.png" class="congrats-icon" width=24px height=24px></div>
					<div class="message"> You have guessed the number ${this.randomNumber.join('')} !! </div>
				</div>
				<div class="score-wrapper">
					<div class="no-of-attempts">No of attempts: ${this.currScore} </div>
					<div class="time-taken"> Time: ${this.pad(parseInt(this.totalSeconds / 60))} : ${this.pad(this.totalSeconds % 60)} </div>
				</div>
				<div class="play-again" @click=${this.resetState.bind(this)}> Play Again </div>
			</div>
		</div>`
	}

	playGameTemplate() {
		return html`
		<div class="play-template">
			<div class="guess-number-wrapper">
				<div class="title"> Find the hidden ${this.gameLevel + 2} digit number </div>
				<input type=number .value=${this.currInput} @input=${this.onInputValue.bind(this)} @keydown=${this.onKeyDown} class="guessing-number"></input>
				<div class="guess" @click=${this.findBullsAndCows.bind(this)}> GUESS </div>
			</div>
			${this.previousGuessess.length ? 
			html `<div class="table-wrapper">
				<table class="table">
					<thead>
						<tr>
							<td> Guessed Number ! </td>
							<td> Cows </td>
							<td> Bulls </td>
						</tr>
					</thead>
					<tbody class="table-body">
						${this.previousGuessess.map((resultObj) => 
							html `<tr><td>${Object.keys(resultObj)[0]}</td>
							<td>${Object.values(resultObj)[0]["cows"]}</td>
							<td>${Object.values(resultObj)[0]["bulls"]}</td></tr>`
						)}
					</tbody>
				</table>
			</div>` : ''}
		</div>`;
	}

	homeTemplate() {
		return html`
		<div class="game-wrapper">
			<div class="game-level">
				<h3 class="select-difficulty"> Choose Level & Play </h3>
				<div class="easy" @click=${this.selectLevel.bind(this, 1)}>
					<span class="level-text"> EASY </span>
					<img src="images/play-button.png" class="play-icon" width=20px height=23px> 
				</div>
				<div class="medium" @click=${this.selectLevel.bind(this, 2)}>
					<span class="level-text"> MEDIUM </span>
					<img src="images/play-button.png" class="play-icon" width=20px height=23px> 
				</div>
				<div class="hard" @click=${this.selectLevel.bind(this, 3)}> 
					<span class="level-text"> HARD </span>
					<img src="images/play-button.png" class="play-icon" width=20px height=23px> 
				</div>
			</div>
		</div>`;
	}

	mainTemplate() {
		return html`
			<div class="cows-bulls">
				<div class="page-title"> 
					<h1> Cows & Bulls </h1>
					${!this.startGame ? html `<img src="images/cows-bulls.png" class="cows-bulls-icon" width=120px height=120px>` : ''}
				</div>
				${this.startGame ? html`<div class="score-details">
					<div class="attempts"> # of attempts: ${this.currScore} </div>
					<div class='time-wrapper'>
						<span class="timer"> Time: <label id="minutes">00</label>:<label id="seconds">00</label> </span>
					</div>
				</div>`
				: ''}
				${this.startGame ? this.playGameTemplate() : this.homeTemplate()}
				${this.gameWinTemplate()}
			</div>`;
	}

	renderPage() {
		render(this.mainTemplate(), document.body);
	}
}
window["cowsBulls"] = new cowsBulls();
