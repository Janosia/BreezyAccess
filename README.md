# 🔮 BreezyAccess 🔮

## ✨ Prerequisites ✨

To run the project, requirements are:

- [Node.js](https://nodejs.org/) 
- [npm](https://www.npmjs.com/) 
- [Truffle](https://trufflesuite.com/) framework
- [Ganache](https://trufflesuite.com/ganache/) for local blockchain development

## 🛠️ Installation 🛠️

1. **Clone the repository**
   ```bash
   git clone <https://github.com/Janosia/BreezyAccess.git>
   cd <BreezyAccess>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

##  🎉🌌 Set-UP 🎉🌌

### 1. Deploy Smart Contracts

Deploy smart contracts on development network:

```bash
truffle migrate --network development
```

**Note:** Ensure Ganache is running on local machine before deployment.

### 2. Start the Frontend Application

Navigate to frontend directory and start application:

```bash
cd frontend
npm start
```

3. **Important:** Remove line `"type": "module"` from `package.json` after load testing to ensure dApp runs properly.

## 📁 Project Structure

```
├── contracts/          # Smart contracts
├── migrations/         # Truffle migration files
├── frontend/           # React frontend application
├── test/               # Contract tests, Load testing script
├── truffle-config.js   # Truffle configuration
└── package.json        # Project dependencies
```

##  Configuration

### 🍫 Truffle Configuration 🍫

Truffle is used for smart contract development. Configuration can be found in `truffle-config.js`.

### Network Configuration

- **Development Network**: Local Ganache instance
- **Port**: Default Ganache port (7545 or 8545)

## 📊 Testing 📊

Run the smart contract tests:

```bash
truffle test
```
### Load Testing

To run load tests:

1. **Enable module support** by adding the following to your `package.json`:
   ```json
   {
     "type": "module"
   }
   ```

2. **Run the load test**:
   ```bash
   node load_test.js
   ```

## 🔍🧠 Common Issues 🔍🧠

- **Contract deployment fails**: Ensure Ganache is running and the network configuration is correct
- **Frontend won't start**: Check that all dependencies are installed and no conflicting `"type": "module"` entry exists in package.json
- **Load test issues**: Verify `"type": "module"` is added to package.json before running load tests


