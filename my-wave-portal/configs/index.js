const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL
const WALLET_PRIVATE_ACCOUNT_KEY = process.env.WALLET_PRIVATE_ACCOUNT_KEY

if (!ALCHEMY_API_URL) {
  throw 'Alchemy API key is required'
}

if (!WALLET_PRIVATE_ACCOUNT_KEY) {
  throw 'Wallet private account key is required'
}

module.exports = {
  ALCHEMY_API_URL,
  WALLET_PRIVATE_ACCOUNT_KEY
}
