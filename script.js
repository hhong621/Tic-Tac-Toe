/**
 * Name: Tic Tac Toe
 * By: Harrison Hong
 * 
 * Description:
 * This tic tac toe game can be played alone against the computer or against another human player.
 * Easy computer chooses random spots.
 * Hard computer uses a minimax algorithm to select ideal position.
 * 
 * Followed videos from Web Dev Simplified, The Coding Train, and Sebastian Lague to create this.
 */

const X_CLASS = "x"
const O_CLASS = "o"
const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]
const cellElements = document.querySelectorAll('[data-cell]')
const board = document.getElementById('board')
const winningMessageElement = document.getElementById('winningMessage')
const restartButton = document.getElementById('restartButton')
const winningMessageTextElement = document.querySelector('[data-winning-message-text]')
const turnTextElement = document.querySelector('[data-turn-text]')
const playerSelectElement = document.getElementById('playerSelect')
const multiplayerButton = document.getElementById('multiplayerButton')
const singleplayerButton = document.getElementById('singleplayerButton') 
let oTurn
let multiplayer
let difficulty

playerSelect()

restartButton.addEventListener('click', playerSelect)

// show the player selection screen
function playerSelect() {
    winningMessageElement.classList.remove('show')
    playerSelectElement.classList.add('show')
}

// initialize and reset variables and game board, start computer's turn if single player
function startGame(multi, diff) {
    playerSelectElement.classList.remove('show')
    oTurn = false
    multiplayer = multi
    difficulty = diff
    cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS)
        cell.classList.remove(O_CLASS)
        cell.removeEventListener('click', handleClick)
        cell.addEventListener('click', handleClick, { once: true })
    })
    setBoardHoverClass()
    winningMessageElement.classList.remove('show')
    turnTextElement.innerText = `${oTurn ? 'O' : 'X'}'s Turn`

    if (!multiplayer) {
        if (difficulty == 1) {
            computerTurnEasy()
        } else if (difficulty == 2) {
            computerTurnHard()
        }
    }
}

// place mark on board where clicked and check for win or draw
function handleClick(e) {
    const cell = e.target
    const currentClass = oTurn ? O_CLASS : X_CLASS
    placeMark(cell, currentClass)
    if (checkWin(currentClass)) {
        endGame(false)
    } else if (isDraw()) {
        endGame(true)
    } else {
        swapTurns()
        if (!multiplayer && !oTurn) { // single player
            if (difficulty == 1) {
                computerTurnEasy()
            } else if (difficulty == 2) {
                computerTurnHard()
            }
        }
        setBoardHoverClass()
    }
}

// handle winning message based on game end state
function endGame(draw) {
    if (draw) {
        winningMessageTextElement.innerText = 'Draw!'
    } else {
        winningMessageTextElement.innerText = `${oTurn ? 'O' : 'X'} Wins!`
    }
    winningMessageElement.classList.add('show')
}

// check if the game is a draw
function isDraw() {
    return [...cellElements].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS)
    })
}

// helper function for computerTurnHard() to place first X at cell 0, greatly shortens processing time 
function isEmpty() {
    return [...cellElements].every(cell => {
        return !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS)
    })
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass)
}

function swapTurns() {
    oTurn = !oTurn
    turnTextElement.innerText = `${oTurn ? 'O' : 'X'}'s Turn`
}

// handles hover state for the board based on player turn
function setBoardHoverClass() {
    board.classList.remove(X_CLASS)
    board.classList.remove(O_CLASS)
    if(oTurn) {
        board.classList.add(O_CLASS)
    } else {
        board.classList.add(X_CLASS)
    }
}

// check if a player has won the game
function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combinations => {
        return combinations.every(index => {
            return cellElements[index].classList.contains(currentClass)
        })
    })
}

// find all cell that have not been marked
function findAvailable() {
    let available = []
    cellElements.forEach((cell, i) => {
        if(!cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS)) {
            available.push(i)
        }
    })

    return available
}

// randomly pick from available cells to mark
function computerTurnEasy() {
    let available = findAvailable()
    let randomIndex = Math.floor(Math.random() * available.length)
    cellElements[available[randomIndex]].click()
}

// call minimax function to find best available spot
function computerTurnHard() {
    let bestScore = Infinity
    let available = findAvailable()
    let bestMove = available[0]
    if (isEmpty()) {
        cellElements[bestMove].click()
        return
    } else {
        available.forEach((cell) => {
            cellElements[cell].classList.add(O_CLASS)
            let score = minimax(0, -Infinity, Infinity, false)
            cellElements[cell].classList.remove(O_CLASS)
            if (score < bestScore) {
                bestScore = score
                bestMove = cell
            }
            //console.log("Position: " + cell + " | Score: " + score)
        })
    }
    cellElements[bestMove].click()
    console.log("------------------------------")
}

// find best position using minimax algorithm, implements alpha beta pruning to speed up process
function minimax(depth, alpha, beta, isMaximizing) {
    // find available spots
    let available = findAvailable()
    // terminal state
    if (checkWin(X_CLASS)) {
        return 10 - depth // favors shorter wins
    } else if (checkWin(O_CLASS)) {
        return depth - 10 // favors shorter wins
    } else if (isDraw()) {
        return 0
    }

    if (isMaximizing) {
        let maxScore = -Infinity
        available.forEach((cell) => {
            cellElements[cell].classList.add(X_CLASS)
            let score = minimax(depth + 1, alpha, beta, false)
            cellElements[cell].classList.remove(X_CLASS)
            maxScore = Math.max(maxScore, score)
            alpha = Math.max(alpha, score)
            if (beta <= alpha) {
                return // beta cutoff
            }
        })
        return maxScore
    } else {
        let minScore = Infinity
        available.forEach((cell) => {
            cellElements[cell].classList.add(O_CLASS)
            let score = minimax(depth + 1, alpha, beta, true)
            cellElements[cell].classList.remove(O_CLASS)
            minScore = Math.min(minScore, score)
            beta = Math.min(beta, score)
            if (beta <= alpha) {
                return // alpha cutoff
            }
        })
        return minScore
    }
}