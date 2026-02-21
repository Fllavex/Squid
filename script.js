document.addEventListener("DOMContentLoaded", () => {
  //перша гра

  const showGameBtn = document.querySelector("#showGameBtn");
  const gameSection = document.querySelector("#gameSection");
  const restartBtn = document.querySelector("#restartBtn");
  const backMenuBtn = document.querySelector("#backMenuBtn");
  const statusText = document.querySelector("#status");
  const cells = document.querySelectorAll(".cell");
  const subtitle = document.querySelector(".subtitle");
  //друга гра

  const card2 = document.querySelector('.card2')

  function TikTokToe(){

     let board = Array(9).fill("");
     let currentPlayer = "X";
     let gameActive = false;
   
     const wins = [
       [0, 1, 2],
       [3, 4, 5],
       [6, 7, 8],
       [0, 3, 6],
       [1, 4, 7],
       [2, 5, 8],
       [0, 4, 8],
       [2, 4, 6]
     ];
   
     function startGame() {
       card2.classList.add("hidden");
       gameSection.classList.remove("hidden");
       showGameBtn.classList.add('hidden');
       subtitle.classList.add("hidden");
       resetGame();
     }
   
     function backToMenu() {
       card2.classList.remove("hidden");
       gameSection.classList.add("hidden");
       showGameBtn.classList.remove("hidden");
       subtitle.classList.remove("hidden");
       resetGame();
     }
   
     function resetGame() {
       board = Array(9).fill("");
       currentPlayer = "X";
       gameActive = true;
       statusText.textContent = "Хід: X";
   
       cells.forEach((cell) => {
         cell.textContent = "";
         cell.classList.remove("win");
         cell.disabled = false;
       });
     }
   
     function checkWinner() {
       for (const [a, b, c] of wins) {
         if (board[a] && board[a] === board[b] && board[a] === board[c]) {
           cells[a].classList.add("win");
           cells[b].classList.add("win");
           cells[c].classList.add("win");
           return board[a];
         }
       }
       return null;
     }
   
     function handleCellClick(event) {
       const cell = event.target;
       const index = Number(cell.dataset.index);
   
       if (!gameActive || board[index]) return;
   
       board[index] = currentPlayer;
       cell.textContent = currentPlayer;
   
       const winner = checkWinner();
   
       if (winner) {
         statusText.textContent = `Переміг: ${winner}`;
         gameActive = false;
         cells.forEach((c) => (c.disabled = true));
         return;
       }
   
       if (!board.includes("")) {
         statusText.textContent = "Нічия";
         gameActive = false;
         return;
       }
   
       currentPlayer = currentPlayer === "X" ? "O" : "X";
       statusText.textContent = `Хід: ${currentPlayer}`;
     }
   
     showGameBtn.addEventListener("click", startGame);
     restartBtn.addEventListener("click", resetGame);
     backMenuBtn.addEventListener("click", backToMenu);
     cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
   };

   showGameBtn.addEventListener('click', TikTokToe);
});
