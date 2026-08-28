public static class LexoRankCalculator
{
    private const string Alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    private const int Base = 62;

    public static string InitialRank() => "U";

    public static string Between(string? previousRank, string? nextRank)
    {
        previousRank ??= "";
        nextRank ??= "";

        if (previousRank.Length > 0 && nextRank.Length > 0 &&
            string.CompareOrdinal(previousRank, nextRank) >= 0)
        {
            throw new ArgumentException("previousRank must be less than nextRank.");
        }

        var result = new List<char>();
        var index = 0;

        while (true)
        {
            var previousDigit = GetDigit(previousRank, index, 0);
            var nextDigit = GetDigit(nextRank, index, Base - 1);

            if (nextDigit - previousDigit > 1)
            {
                var middleDigit = (previousDigit + nextDigit) / 2;
                result.Add(Alphabet[middleDigit]);
                return new string(result.ToArray());
            }

            result.Add(Alphabet[previousDigit]);
            index++;
        }
    }

    public static string Before(string nextRank)
    {
        return Between(null, nextRank);
    }

    public static string After(string previousRank)
    {
        return Between(previousRank, null);
    }

    private static int GetDigit(string rank, int index, int defaultValue)
    {
        if (index >= rank.Length)
            return defaultValue;

        var value = Alphabet.IndexOf(rank[index]);

        if (value < 0)
            throw new ArgumentException($"Invalid rank character: {rank[index]}");

        return value;
    }
}