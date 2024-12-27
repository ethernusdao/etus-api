const express = require("express");
const axios = require("axios");

const app = express();

// Configuração do contrato do token e da API do PolygonScan
const CONTRACT_ADDRESS = "0x4cfe63294dac27ce941d42a778a37f2b35fea21b";
const API_KEY = process.env.POLYGONSCAN_API_KEY; // Configure esta variável no .env

// Rota para Total Supply
app.get("/total-supply", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.polygonscan.com/api?module=stats&action=tokensupply&contractaddress=${CONTRACT_ADDRESS}&apikey=${API_KEY}`
    );
    const totalSupply = parseInt(response.data.result, 10);
    res.send(totalSupply.toString()); // Retorna apenas o valor numérico
  } catch (error) {
    console.error("Erro ao obter o Total Supply:", error);
    res.status(500).send("Erro ao obter Total Supply.");
  }
});

// Rota para Circulating Supply
app.get("/circulating-supply", async (req, res) => {
  try {
    const totalSupplyResponse = await axios.get(
      `https://api.polygonscan.com/api?module=stats&action=tokensupply&contractaddress=${CONTRACT_ADDRESS}&apikey=${API_KEY}`
    );
    const totalSupply = parseInt(totalSupplyResponse.data.result, 10);

    // Lista de endereços bloqueados (substitua pelos endereços reais)
    const blockedAddresses = [
      "0xBlockedAddress1",
      "0xBlockedAddress2"
    ];

    // Calcula os tokens bloqueados
    let blockedTokens = 0;
    for (const address of blockedAddresses) {
      try {
        const balanceResponse = await axios.get(
          `https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${CONTRACT_ADDRESS}&address=${address}&apikey=${API_KEY}`
        );
        blockedTokens += parseInt(balanceResponse.data.result, 10);
      } catch (error) {
        console.error(`Erro ao obter saldo do endereço ${address}:`, error);
      }
    }

    // Calcula o Circulating Supply
    const circulatingSupply = totalSupply - blockedTokens;
    res.send(circulatingSupply.toString()); // Retorna apenas o valor numérico
  } catch (error) {
    console.error("Erro ao calcular o Circulating Supply:", error);
    res.status(500).send("Erro ao calcular Circulating Supply.");
  }
});

// Configuração da porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
