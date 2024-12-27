const express = require("express");
const axios = require("axios");

const app = express();

// Configuração do contrato do token e da API do PolygonScan
const CONTRACT_ADDRESS = "0x4cfe63294dac27ce941d42a778a37f2b35fea21b";
const API_KEY = process.env.POLYGONSCAN_API_KEY;

// Rota para Total Supply
app.get("/total-supply", async (req, res) => {
  try {
    // Chama a API do PolygonScan para obter o Total Supply
    const response = await axios.get(
      `https://api.polygonscan.com/api?module=stats&action=tokensupply&contractaddress=${CONTRACT_ADDRESS}&apikey=${API_KEY}`
    );
    const totalSupply = parseInt(response.data.result, 10);
    res.send(totalSupply.toString()); // Retorna apenas o valor numérico
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao obter o Total Supply.");
  }
});

// Rota para Circulating Supply
app.get("/circulating-supply", async (req, res) => {
  try {
    // Obtem Total Supply
    const totalSupplyResponse = await axios.get(
      `https://api.polygonscan.com/api?module=stats&action=tokensupply&contractaddress=${CONTRACT_ADDRESS}&apikey=${API_KEY}`
    );
    const totalSupply = parseInt(totalSupplyResponse.data.result, 10);

    // Lista de endereços bloqueados
    const blockedAddresses = [
      "0xBlockedAddress1",
      "0xBlockedAddress2"
    ];

    // Calcula os tokens bloqueados
    let blockedTokens = 0;
    for (const address of blockedAddresses) {
      const balanceResponse = await axios.get(
        `https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${CONTRACT_ADDRESS}&address=${address}&apikey=${API_KEY}`
      );
      blockedTokens += parseInt(balanceResponse.data.result, 10);
    }

    // Calcula o Circulating Supply
    const circulatingSupply = totalSupply - blockedTokens;
    res.send(circulatingSupply.toString()); // Retorna apenas o valor numérico
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao calcular o Circulating Supply.");
  }
});

// Configuração da porta
app.listen(3000, () => {
  console.log("API rodando na porta 3000");
});
