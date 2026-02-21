document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector("#gamesPage");
  const card1 = document.querySelector("#card-tictactoe");
  const gameSection = document.querySelector("#gameSection1");
  const statusText = document.querySelector("#status1");
  const showGameBtn = card1?.querySelector("[data-open-game]");
  const closeGameBtn = card1?.querySelector("[data-close-game]");
  const restartBtn = document.querySelector("#restartBtn");
  const subtitle = card1?.querySelector(".subtitle");
  const cells = document.querySelectorAll("#gameSection1 .cell");

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

  function resetGame() {
    board = Array(9).fill("");
    currentPlayer = "X";
    gameActive = true;
    if (statusText) statusText.textContent = "Хід: X";

    cells.forEach((cell) => {
      cell.textContent = "";
      cell.classList.remove("win");
      cell.disabled = false;
    });
  }

  function openGame() {
    card1?.classList.add("is-active");
    page?.classList.add("has-active");
    gameSection?.classList.remove("hidden");
    showGameBtn?.classList.add("hidden");
    subtitle?.classList.add("hidden");
    resetGame();
  }

  function closeGame() {
    card1?.classList.remove("is-active");
    page?.classList.remove("has-active");
    gameSection?.classList.add("hidden");
    showGameBtn?.classList.remove("hidden");
    subtitle?.classList.remove("hidden");
    resetGame();
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
    const cell = event.currentTarget;
    const index = Number(cell.dataset.index);

    if (!gameActive || board[index]) return;

    board[index] = currentPlayer;
    cell.textContent = currentPlayer;

    const winner = checkWinner();
    if (winner) {
      if (statusText) statusText.textContent = `Переможець: ${winner}`;
      gameActive = false;
      cells.forEach((c) => (c.disabled = true));
      return;
    }

    if (!board.includes("")) {
      if (statusText) statusText.textContent = "Нічия";
      gameActive = false;
      return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    if (statusText) statusText.textContent = `Хід: ${currentPlayer}`;
  }

  showGameBtn?.addEventListener("click", openGame);
  closeGameBtn?.addEventListener("click", closeGame);
  restartBtn?.addEventListener("click", resetGame);
  cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
});
