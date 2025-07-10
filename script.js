const apiKeyInput = document.getElementById("apiKey");
const gameSelect = document.getElementById("gameSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const form = document.getElementById("form");
const aiResponse = document.getElementById("aiResponse");

// Função para converter Markdown em HTML
const markdownToHTML = (text) => {
  // A biblioteca showdown precisa estar carregada no HTML para isso funcionar
  const converter = new showdown.Converter(); // Usar Converter com "C" maiúsculo é a prática mais moderna
  return converter.makeHtml(text); // e makeHtml com "H" maiúsculo
};

const perguntarIA = async (question, game, apiKey) => {
  // CORREÇÃO: Usando um nome de modelo válido e atual
  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const perguntaLOL = `
      ## Especialidade
      
      Você é uma especialista assistente de meta para o jogo ${game}

    ## Tarefa
      
      Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas

    ## Regras

      Considere a data atual ${new Date().toLocaleDateString()}

       -Faça pesquisas atualizadas sobre o patch atual baseada no dia de hoje.
       
       -Se você não sabe a resposta, Diga que não sabe e não tente invertar uma resposta

       -Se a pergunta não esta relacionada ao jogo, diga que 'não esta relacionada ao jogo selecionado'

       -não coloque o nome dos itens diferente da linguagem do texto.

       - sempre coloque qual o patch entre parenteses
       
       -verifique se o patch é o mesmo que o atual.

       -Nunca se refira a coisas que nao tem certeza que tem no patch atual.

     ## Resposta

       -Economize na resposta, seja direto e responda no máximo 200 caracteres

       -Responda em markdown

       -Não Precisa dizer a data

       - nao precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário esta querendo.

    ## Exemplo de Pergunta

       pergunta do usuario: Melhor build da katarina mid

       resposta: A build do patch (coloque o patch aqui) é: \n\n **itens:**\n\n coloque os itens aqui na forma de lista. \n\n**Runas:**\n\n exemplo de runas\n\n

       pergunta do usuario: melhores combos de agentes para defender lotus 

       ---
       Aqui está a pergunta do usuário${question}
  `;
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: pergunta,
        },
      ],
    },
  ];

  const tools = [
    {
      google_search: {},
    },
  ];

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      tools,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Erro da API: ${errorData.error.message}`);
  }

  const data = await response.json();
  const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textResponse) {
    throw new Error("A API não retornou um texto na resposta.");
  }
  return textResponse;
};

const enviarFormulario = async (event) => {
  event.preventDefault();
  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;

  if (apiKey === "" || game === "" || question === "") {
    alert("Preencha todos os campos para continuar");
    return;
  }

  askButton.disabled = true;
  askButton.textContent = "Perguntando...";
  askButton.classList.add("loading");
  aiResponse.querySelector(".response-content").innerHTML = "";

  try {
    const text = await perguntarIA(question, game, apiKey);
    // Ótima ideia usar o conversor de markdown aqui!
    aiResponse.querySelector(".response-content").innerHTML =
      markdownToHTML(text);
    aiResponse.classList.remove('hidden')
  } catch (error) {
    console.error("Falha ao se comunicar com a IA:", error);
    alert(`Ocorreu um erro: ${error.message}`);
  } finally {
    askButton.disabled = false;
    askButton.textContent = "Perguntar";
    askButton.classList.remove("loading");
  }
};

form.addEventListener("submit", enviarFormulario);
