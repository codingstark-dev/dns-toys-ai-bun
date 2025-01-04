import type { DnsRequest as Packet } from "dns2";
import { Packet as DNSPacket } from "dns2";

export class SudokuService {
  async handleQuery(domain: string, request: Packet, send: Function) {
    const puzzle = domain.replace(".sudoku", "").split(".");
    if (puzzle.length !== 9) {
      this.sendResponse(request, send, "Invalid puzzle format");
      return;
    }

    const grid = puzzle.map(row => [...row].map(Number));
    if (this.solveSudoku(grid)) {
      this.sendResponse(request, send, grid.map(row => row.join("")).join("."));
    } else {
      this.sendResponse(request, send, "No solution exists");
    }
  }

  private solveSudoku(grid: number[][]): boolean {
    const empty = this.findEmpty(grid);
    if (!empty) return true;

    const [row, col] = empty;
    for (let num = 1; num <= 9; num++) {
      if (this.isValid(grid, row, col, num)) {
        grid[row][col] = num;
        if (this.solveSudoku(grid)) return true;
        grid[row][col] = 0;
      }
    }
    return false;
  }

  private isValid(grid: number[][], row: number, col: number, num: number): boolean {
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false;
    }
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[boxRow + i][boxCol + j] === num) return false;
      }
    }
    return true;
  }

  private findEmpty(grid: number[][]): [number, number] | false {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] === 0) return [i, j];
      }
    }
    return false;
  }

  private sendResponse(request: Packet, send: Function, text: string) {
    const response = DNSPacket.createResponseFromRequest(request);
    response.answers.push({
      name: request.questions[0].name,
      type: DNSPacket.TYPE.TXT,
      class: DNSPacket.CLASS.IN,
      ttl: 300,
      data: text,
    });
    send(response);
  }
}
