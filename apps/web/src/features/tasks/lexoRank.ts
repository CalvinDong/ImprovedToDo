export class LexoRank {
  private static readonly alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  private static readonly base = LexoRank.alphabet.length;

  static between(
    left?: string | null, 
    right?: string | null
  ): string {
    
    left ??= "";
    right ??= "";

    let result = "";
    let index = 0;

    while (true) {
      const leftValue = LexoRank.getCharValue(left, index, 0);
      const rightValue = LexoRank.getCharValue(right, index, LexoRank.base - 1);

      if (rightValue - leftValue > 1) {
        const mid = Math.floor((leftValue + rightValue) / 2);
        return result + LexoRank.alphabet[mid];
      }

      result += LexoRank.alphabet[leftValue];
      index++;
    }
  }

  private static getCharValue(
    rank: string,
    index: number,
    defaultValue: number
  ): number {
    if (index >= rank.length) {
      return defaultValue;
    }

    return LexoRank.alphabet.indexOf(rank[index]);
  }
}