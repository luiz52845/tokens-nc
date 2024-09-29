const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;
app.get('/cotacao', async (req, res) => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://pnix.exchange/nightcrows/');

        // Espera até que a página carregue os elementos desejados
        await page.waitForSelector('.css-b7t43h');  // Espera pela primeira classe

        // Extrai múltiplos valores da página
        const cotacoes = await page.evaluate(() => {
            // Defina as classes fixas
            const classes = ['css-b7t43h' ];
            const elements = classes.flatMap(cls => Array.from(document.querySelectorAll(`.${cls}`)));
            const results = [];

            // Itera pelos elementos encontrados e extrai o texto de cada um
            elements.forEach(element => {
                const cotacao = element.textContent.trim();
                results.push(cotacao);
            });

            return results;  // Retorna um array com os valores
        });

        await browser.close();

        // Verifica se encontrou alguma cotação
        if (cotacoes.length > 0) {
            res.status(200).json({
                status: 'success',
                data: {
                    timestamp: new Date().toISOString(),
                    cotacoes: cotacoes,  // Retorna todas as cotações
                }
            });
        } else {
            res.status(404).json({
                status: 'error',
                message: 'Cotações não encontradas'
            });
        }
    } catch (error) {
        console.error('Erro ao buscar cotações:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao buscar cotações',
            error: error.message
        });
    }
});


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});