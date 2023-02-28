// 캔버스 요소와 컨텍스트 가져오기
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 게임 보드와 블록 크기 정의
const ROW = 20;
const COL = 10;
const BLOCK_SIZE = 30;
let lastMove = 0;
// 게임 보드 초기화
let board = [];
for (let i = 0; i < ROW; i++) {
    board[i] = [];
    for (let j = 0; j < COL; j++) {
        board[i][j] = 0;
    }
}

// 블록 클래스 정의
class Block {
    constructor(shape, color) {
        this.shape = shape;
        this.color = color;
        this.row = 0;
        this.col = 3;
    }

    // 블록 회전
    rotate() {
        let newShape = [];
        for (let i = 0; i < this.shape[0].length; i++) {
            let newRow = [];
            for (let j = this.shape.length - 1; j >= 0; j--) {
                newRow.push(this.shape[j][i]);
            }
            newShape.push(newRow);
        }
        this.shape = newShape;
    }

    // 블록 이동
    move(dir) {
        console.log(dir)
        if (dir === 'left') {
            if(this.canMoveLeft()) { this.col--};
        } else if (dir === 'right') {
            if(this.canMoveRight()) { this.col++ }  ;
        } else if (dir === 'down') {
            if(this.canMoveDown()){
                this.row++;
            }
        }
    }


    canMoveLeft() {
        for (let row = 0; row < this.shape.length; row++) {
          for (let col = 0; col < this.shape[row].length; col++) {
            if (this.shape[row][col] && (this.col + col <= 0 || board[this.row + row][this.col + col - 1])) {
              return false;
            }
          }
        }
        return true;
      }
    
      canMoveRight() {
        for (let row = 0; row < this.shape.length; row++) {
          for (let col = 0; col < this.shape[row].length; col++) {
            if (this.shape[row][col] && (this.col + col >= board[0].length - 1 || board[this.row + row][this.col + col + 1])) {
              return false;
            }
          }
        }
        return true;
      }
        
    canMoveDown() {
        for (let row = 0; row < this.shape.length; row++) {
        for (let col = 0; col < this.shape[row].length; col++) {
            if (this.shape[row][col] && (this.row + row >= board.length - 1 || board[this.row + row + 1][this.col + col])) {
            return false;
            }
        }
        }
        return true;
    }


    // 블록 그리기
    draw() {
        ctx.fillStyle = this.color;
        for (let i = 0; i < this.shape.length; i++) {
            for (let j = 0; j < this.shape[0].length; j++) {
                if (this.shape[i][j] !== 0) {
                    ctx.fillRect((this.col + j) * BLOCK_SIZE, (this.row + i) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    ctx.strokeRect((this.col + j) * BLOCK_SIZE, (this.row + i) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }
    }

    
}

// 블록 생성 함수
function createBlock() {
    // 블록 종류 및 색상을 랜덤하게 선택
    const blockTypes = [
        { shape: [[1, 1], [1, 1]], color: '#FF0000' },
        { shape: [[0, 1, 1], [1, 1, 0]], color: '#00FF00' },
        { shape: [[1, 1, 1], [0, 1, 0]], color: '#0000FF' },
        { shape: [[1, 1, 0], [0, 1, 1]], color: '#FFFF00' },
        { shape: [[0, 1, 0], [1, 1, 1]], color: '#FF00FF' },
        { shape: [[1, 0, 0], [1, 1, 1]], color: '#00FFFF' },
        { shape: [[0, 0, 1], [1, 1, 1]], color: '#FFA500' },
        { shape: [[1], [1], [1], [1]], color: '#800080' }
    ];
    const block = blockTypes[Math.floor(Math.random() * blockTypes.length)];

    return new Block(block.shape, block.color);
}
function checkFullLines(board) {
    const fullLines = [];
    // 보드판을 위에서부터 검사하여 꽉 찬 라인을 찾습니다.
    for (let i = 0; i < ROW; i++) {
      if (board[i].every(cell => cell !== 0)) {
        fullLines.push(i);
      }
    }
    // 꽉 찬 라인을 제거합니다.
    fullLines.forEach(line => {
        board.splice(line, 1);
        board.unshift(new Array(COL).fill(0));
    });
    return fullLines;
  }

// 게임 루프 함수 
function gameLoop() { // 캔버스 지우기 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 블록 그리기 
    block.draw();
    // 보드 그리기 
    for (let i = 0; i < ROW; i++) { for (let j = 0; j < COL; j++) { if (board[i][j] !== 0) { ctx.fillStyle = board[i][j]; ctx.fillRect(j * BLOCK_SIZE, i * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE); ctx.strokeRect(j * BLOCK_SIZE, i * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE); } } }
    // 블록 이동 
    if (frame % 30 === 0) {
        if (block.canMoveDown()) {
          block.move('down');
        } else {
          // 블록이 더 이상 이동할 수 없으면 보드에 추가 
          for (let i = 0; i < block.shape.length; i++) {
            for (let j = 0; j < block.shape[0].length; j++) {
              if (block.shape[i][j] !== 0) {
                board[block.row + i][block.col + j] = block.color;
              }
            }
          }
      
          // 쌓인 블록이 있을 경우 다음 블록이 내려오도록 수정
          let fullLines = checkFullLines(board);
          if (fullLines.length > 0) {
            block = createBlock();
          } else {
            if (block.row === 0) {
              alert('게임 종료!');
              clearInterval(intervalId);
            } else {
              block = createBlock();
            }
          }
        }
      }
      
    // 블록 회전 
    document.addEventListener('keydown', (event) => { if (event.keyCode === 38) { block.rotate(); } });
    // 블록 이동 

document.addEventListener('keydown', event => {
  if (event.keyCode === 37) { // 왼쪽 방향키
    if (Date.now() - lastMove > 100) {
      block.move('left');
      lastMove = Date.now();
    }
  } else if (event.keyCode === 39) { // 오른쪽 방향키
    if (Date.now() - lastMove > 100) {
      block.move('right');
      lastMove = Date.now();
    }
  } else if (event.keyCode === 38) { // 위쪽 방향키
    if (Date.now() - lastMove > 200) {
      block.rotate();
      lastMove = Date.now();
    }
  } else if (event.keyCode === 40) { // 아래쪽 방향키
    if (Date.now() - lastMove > 100) {
      block.move('down');
      lastMove = Date.now();
    }
  }
});

    // 게임 종료 체크 
    for (let i = 0; i < COL; i++) { if (board[0][i] !== 0) { alert('게임 종료!'); clearInterval(intervalId); } }
    frame++;
}
// 게임 시작 
let block = createBlock(); let frame = 0; let intervalId = setInterval(gameLoop, 1000 / 60);

