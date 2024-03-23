export const userLiquidityQuery = `{
  user(id: "$ACCOUNT_ADDRESS") {
    liquidityPositions {
      liquidityTokenBalance
      pair {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
        reserve0
        reserve1
        totalSupply
      }
    }
  }
}`;
