 ### Install Dependencies
  ``` npm install ```
 ### To start dApp 
 1. Deploy Contracts -- 
  ```truffle migrate --network development```

 2. Start frontend --  
    2. 1 Navigate to frontend directory
    ``` cd frontend ```
    2. 2 Run the following command
    ``` npm start ```
 3. To run load_test.js add ```"type": "module"``` in package.json. 
 However if this line is present, actual react app wont run. 
 Only add  ``` "type": "module"``` iff load test is the objective  

