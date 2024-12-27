const express = require("express");
const axios = require("axios");

const app = express();

// Configuração do contrato do token e da API do PolygonScan
const CONTRACT_ADDRESS = "0x4cfe63294dac27ce941d42a778a37f2b35fea21b";
const API_KEY = process.env.POLYGONSCAN_API_KEY; // Configure esta variável no .env

// Lista de endereços bloqueados
const blockedAddresses = [
  "0x889c0E95cAc68C018Cf1E9037CeE24d3C7634849",
  "0x27d30f4062e7a81265c2B8Da3213d0064982e008",
  "0x7d74b4173b1a4AfA5E59C085499b73E677d44c43",
  "0xC81EaD786387339b72e4BEbdc4551C73b512B34f"
];

// Rota para Total Supply e Circulating Supply
app.get("/api", async (req, res) => {
  try {
    // Obtém o parâmetro "supply" da URL
    const supplyType = req.query.supply;

    // Obter Total Supply
    const totalSupplyResponse = await axios.get(
      `https://api.polygonscan.com/api?module=stats&action=tokensupply&contractaddress=${CONTRACT_ADDRESS}&apikey=${API_KEY}`
    );
    const totalSupply = BigInt(totalSupplyResponse.data.result).toString(); // Formata o Total Supply

    if (supplyType === "total") {
      // Retorna Total Supply
      return res.send(totalSupply);
    }

    if (supplyType === "circulating") {
      // Calcula os tokens bloqueados
      let blockedTokens = BigInt(0);
      for (const address of blockedAddresses) {
        try {
          const balanceResponse = await axios.get(
            `https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${CONTRACT_ADDRESS}&address=${address}&apikey=${API_KEY}`
          );
          blockedTokens += BigInt(balanceResponse.data.result);
        } catch (error) {
          console.error(`Erro ao obter saldo do endereço ${address}:`, error);
        }
      }

      // Calcula o Circulating Supply
      const circulatingSupply = BigInt(totalSupply) - blockedTokens;
      return res.send(circulatingSupply.toString());
    }

    // Se o parâmetro for inválido
    res.status(400).send("Parâmetro inválido. Use 'supply=total' ou 'supply=circulating'.");
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    res.status(500).send("Erro ao processar a requisição.");
  }
});

// Rota para a página inicial
app.get("/", (req, res) => {
  res.send("API está funcionando! Use /api?supply=total ou /api?supply=circulating.");
});

// Configuração da porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
