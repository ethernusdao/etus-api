const express = require("express");
const axios = require("axios");

const app = express();

// Configuração do contrato do token e da API do PolygonScan
const CONTRACT_ADDRESS = "0x4cfe63294dac27ce941d42a778a37f2b35fea21b";
const API_KEY = process.env.POLYGONSCAN_API_KEY; // Configure no .env

// Endpoint dinâmico para Total Supply e Circulating Supply
app.get("/api", async (req, res) => {
  try {
    // Obtém o parâmetro "supply" da URL
    const supplyType = req.query.supply;

    // Obter Total Supply
    const totalSupplyResponse = await axios.get(
      `https://api.polygonscan.com/api?module=stats&action=tokensupply&contractaddress=${CONTRACT_ADDRESS}&apikey=${API_KEY}`
    );
    const totalSupply = parseInt(totalSupplyResponse.data.result, 10);

    if (supplyType === "total") {
      // Retorna Total Supply
      return res.send(totalSupply.toString());
    }

    if (supplyType === "circulating") {
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
      return res.send(circulatingSupply.toString());
    }

    // Se o parâmetro for inválido
    res.status(400).send("Parâmetro inválido. Use 'supply=total' ou 'supply=circulating'.");
  } catch (error) {
    console.error("Erro ao obter os dados:", error);
    res.status(500).send("Erro ao processar a requisição.");
  }
});

// Configuração da porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
// Forçando novo deploy
