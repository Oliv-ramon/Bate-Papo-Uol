let ondeColocaMensagens  = document.querySelector("main");
let usuario = prompt("Qual o seu nome?");
let textoInput = document.querySelector("input");
let idMantemConexao = 0;
let idMantemAtualizada = 0;
let qtdDeCarregamentos = 0;
let primeiraMensagemAmterior = []


requisiçaoDeCarregamento();
requisiçaoDeAtivos();
// setInterval(requisiçaoDeAtivos, 10000);

function requisiçaoDeCarregamento() {
    const promessa = axios.get("https://mock-api.driven.com.br/api/v4/uol/messages");

    promessa.then(carregaPagina);
    promessa.catch(alertaErro);
}

function carregaPagina(resposta) {
    qtdDeCarregamentos ++;
    const mensagens = resposta.data;
    const primeiraMensagem = mensagens[0]
    const temMensagemNova = primeiraMensagem.from !== primeiraMensagemAmterior.from || primeiraMensagem.text !== primeiraMensagemAmterior.text 
    
    if (temMensagemNova) {
        ondeColocaMensagens.innerHTML = "";
        
        for (let i = 0; i < mensagens.length; i++) {
            let mensagem = mensagens[i]
            let tipoDeMensagem = mensagem.type

            if (tipoDeMensagem === "status") {
                ondeColocaMensagens.innerHTML += `
                    <div class="mensagem de-status" data-identifier="message">
                        <span class="horario">(${mensagem.time})</span>
                        <span class="usuario">${mensagem.from}</span>
                        <span class="texto-mensagem">${mensagem.text}</span>
                    </div>
                ` 
            } else if (tipoDeMensagem === "message") {
                ondeColocaMensagens.innerHTML += `
                    <div class="mensagem publica" data-identifier="message">
                        <span class="horario">(${mensagem.time})</span>
                        <span class="usuario">${mensagem.from}</span>
                        <span class="para-quem">para<strong> ${mensagem.to}</strong></span>
                        <span class="texto-mensagem">${mensagem.text}</span>
                    </div>
                `
            } else if (tipoDeMensagem === "private_message" && usuario === mensagem.to) {
                ondeColocaMensagens.innerHTML += `
                    <div class="mensagem privada" data-identifier="message">
                        <span class="horario">(${mensagem.time})</span>
                        <span class="usuario">${mensagem.from}</span>
                        <span>reservadamente para<span class="para-quem"> ${mensagem.to}</span></span>
                        <span class="texto-mensagem">${mensagem.text}</span>
                    </div>
                `
            }
        }
        const ultimaMensgem = document.querySelector(".mensagem:last-child")
        // ultimaMensgem.scrollIntoView();
    }

    if (qtdDeCarregamentos === 1) {
        fazerCadastroNoServidor(usuario);
        mantemPaginaAtualizada();
    }

    primeiraMensagemAmterior = primeiraMensagem
}

function fazerCadastroNoServidor(usuario) {
    const promessaDeCadastro = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v4/uol/participants", {name: usuario});
    console.log("fazerCadastroNoServidor foi chamada")

    promessaDeCadastro.then(deuCerto);
    promessaDeCadastro.catch(deuErro);

}

function deuCerto(resposta) {
    console.log("deu certo");
    id = setInterval(mantemConexão, 5000, usuario);
}

function deuErro(erro) {
    console.log(erro);
    
    let novoUsuario = prompt("Este nome já está em uso, Digite um outro nome"); 
    
    while (usuario === novoUsuario) {
        novoUsuario = prompt("Este nome já está em uso, Digite um outro nome");
    }
    
    usuario = novoUsuario
    fazerCadastroNoServidor(usuario)
}

function mantemConexão(usuario) {
    const promessaDeConexao = axios.post("https://mock-api.driven.com.br/api/v4/uol/status", {name: usuario});
    
    promessaDeConexao.then(() => console.log(usuario + " tá on"));
    promessaDeConexao.catch(alertaErro);
}

function mantemPaginaAtualizada() {
    idMantemAtualizada = setInterval(requisiçaoDeCarregamento, 3000);

}

function requisiçaoDeAtivos() {
    console.log("requisiçaoDeAtivos foi chamada")
    const promessaDeLista = axios.get("https://mock-api.driven.com.br/api/v4/uol/participants")
    
    promessaDeLista.then(carregaAtivos)
    promessaDeLista.catch(alertaErro)
}

function carregaAtivos(resposta) {
    const listaDeAtivos = resposta.data
    const opçoesDeContato = document.querySelector(".escolha-de-contato");

    for (let i = 0; i < listaDeAtivos.length; i++) {
        const usuarioAtivo = listaDeAtivos[i].name;
        opçoesDeContato.innerHTML += `
        <div class="opcao selecionada" onclick="selecionarOpção(this)">
            <div>
                <ion-icon name="person-circle-sharp"></ion-icon> 
                <span> ${usuarioAtivo}</span>
            </div>
            <ion-icon class="hidden" name="checkmark-sharp"></ion-icon>
        </div>
        `;
    }
    console.log("passou pelo for")
}

function selecionarOpção(opcao) {
    const opcoesSelecionadas = document.querySelectorAll(".selecionada");
 
    for (let i = 0; i < opcoesSelecionadas.length; i++) {
        const opcaoSelecionada = opcoesSelecionadas[i];
        opcaoSelecionada.classList.remove("selecionada");
        opcao.classList.add("selecionada");
    }

    if (opcao.innerText === "Todos") {
        const opcoes = document.querySelectorAll(".opcao");
        for (let i = 0; i < opcoes.length; i++) {
            const opcão = opcoes[i];
            opcão.classList.add("selecionada");
        }
    }
}

function enviaMsg() {
    const promessa = axios.post("https://mock-api.driven.com.br/api/v4/uol/messages", {
    from: usuario,
	to: "Todos",
	text: textoInput.value,
	type: "message"
    });

    promessa.then(requisiçaoDeCarregamento);
    promessa.catch(alertaErro);

    textoInput.value  = ""
}

function abreOpçoesDeEnvio () {
    const participantesAtivos = document.querySelector(".participantes-ativos")
    participantesAtivos.classList.toggle("hidden")
}

function interrompeInterval() {
    for (let i = 0; i < 99; i++) {
        enviaMsg()
    }
}

function alertaErro (erro) {
    alert("deu erro!")
    console.log(erro)
}

