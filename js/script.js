// criar a variável modalKey será global
let modalKey = 0;

// variável para controlar a quantidade inicial de lojas na modal
let quantlojas = 1;

let cart = []; // carrinho

const seleciona = (elemento) => document.querySelector(elemento);
const selecionaTodos = (elemento) => document.querySelectorAll(elemento);

const formatoReal = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatoMonetario = (valor) => {
    if (valor) {
        return valor.toFixed(2);
    }
};


const abrirModal = () => {
    seleciona('.lojaWindowArea').style.opacity = 0; // transparente
    seleciona('.lojaWindowArea').style.display = 'flex';
    setTimeout(() => seleciona('.lojaWindowArea').style.opacity = 1, 150);
};

const fecharModal = () => {
    seleciona('.lojaWindowArea').style.opacity = 0; // transparente
    setTimeout(() => seleciona('.lojaWindowArea').style.display = 'none', 500);
};

const botoesFechar = () => {
    // BOTOES FECHAR MODAL
    selecionaTodos('.lojaInfo--cancelButton, .lojaInfo--cancelMobileButton').forEach((item) => item.addEventListener('click', fecharModal));
};

const preencheDadosDasLojas = (lojaItem, item, index) => {
    // setar um atributo para identificar qual elemento foi clicado
    lojaItem.setAttribute('data-key', index);
    lojaItem.querySelector('.loja-item--img img').src = item.img;
    lojaItem.querySelector('.loja-item--price').innerHTML = formatoReal(item.price[0]);
    lojaItem.querySelector('.loja-item--name').innerHTML = item.name;
    lojaItem.querySelector('.loja-item--desc').innerHTML = item.description;
};

const preencheDadosModal = (item) => {
    seleciona('.lojaBig img').src = item.img;
    seleciona('.lojaInfo h1').innerHTML = item.name;
    seleciona('.lojaInfo--desc').innerHTML = item.description;
    seleciona('.lojaInfo--actualPrice').innerHTML = formatoReal(item.price[0]);

};


const pegarKey = (e) => {
    // .closest retorna o elemento mais proximo que tem a class
    // do .loja-item ele vai pegar o valor do atributo data-key
    let key = e.target.closest('.loja-item').getAttribute('data-key');
    console.log('loja clicada ' + key);

    console.log(lojaJson[key]);


    // garantir que a quantidade inicial de lojas é 1
    quantlojas = 1;

    // Para manter a informação de qual loja foi clicada
    modalKey = key;

    return key;
};

const preencherCor = (key) => {
    seleciona('.lojaInfo--size.selected').classList.remove('selected');

    // selecionar todos os tamanhos
    selecionaTodos('.lojaInfo--size').forEach((size, sizeIndex) => {

        (sizeIndex == 2) ? size.classList.add('selected') : '';
        size.querySelector('span').innerHTML = lojaJson[key].sizes[sizeIndex];

    });
};

const escolherCor = (key) => {
    selecionaTodos('.lojaInfo--size').forEach((size, sizeIndex) => {
        size.addEventListener('click', (e) => {
            seleciona('.lojaInfo--size.selected').classList.remove('selected');
            size.classList.add('selected');
            seleciona('.lojaInfo--actualPrice').innerHTML = formatoReal(lojaJson[key].price[sizeIndex]);
        });
    });
};

const mudarQuantidade = () => {
    // Ações nos botões + e - da janela
    seleciona('.lojaInfo--qtmais').addEventListener('click', () => {
        quantlojas++;
        seleciona('.lojaInfo--qt').innerHTML = quantlojas;
    });

    seleciona('.lojaInfo--qtmenos').addEventListener('click', () => {
        if (quantlojas > 1) {
            quantlojas--;
            seleciona('.lojaInfo--qt').innerHTML = quantlojas;
        }
    });
};

const adicionarNoCarrinho = () => {
    seleciona('.lojaInfo--addButton').addEventListener('click', () => {
        console.log('Adicionar no carrinho');

        let nomePersonalizacao = seleciona('.lojaInfo-valueNomePersonalizacao').value;
        let size = seleciona('.lojaInfo--size.selected').getAttribute('data-key');
        let pack = seleciona('.cart--pack').innerHTML.replace('R$&nbsp;', '');
        let price = seleciona('.lojaInfo--actualPrice').innerHTML.replace('R$&nbsp;', '');
        
        let identificador;

        if (nomePersonalizacao) {
            identificador = lojaJson[modalKey].id + 'T' + size + nomePersonalizacao;
        } else {
            identificador = lojaJson[modalKey].id + 'T' + size + lojaJson[modalKey].name;
        }

        // Verifica se já existe um item no carrinho com o mesmo identificador
        let key = cart.findIndex((item) => item.identificador === identificador);

        if (key > -1) {
            // Se encontrar o item, incrementa a quantidade
            cart[key].qt += quantlojas;
        } else {
            // Adiciona o item como um novo item no carrinho
            let nome = nomePersonalizacao ? nomePersonalizacao : lojaJson[modalKey].name;

            let loja = {
                identificador,
                name: nome,
                id: lojaJson[modalKey].id,
                size,
                categoria: lojaJson[modalKey].categoria,
                qt: quantlojas,
                price: parseFloat(price),
                pack: lojaJson[modalKey].pack,
                packSell: 0
            };
            cart.push(loja);
        }

        fecharModal();
        abrirCarrinho();
        atualizarCarrinho();
    });
};



const abrirCarrinho = () => {
    console.log('Qtd de itens no carrinho ' + cart.length);
    if (cart.length > 0) {
        // mostrar o carrinho
        seleciona('aside').classList.add('show');
        seleciona('header').style.display = 'flex'; // mostrar barra superior
    }

    // exibir aside do carrinho no modo mobile
    seleciona('.menu-openner').addEventListener('click', () => {
        if (cart.length > 0) {
            seleciona('aside').classList.add('show');
            seleciona('aside').style.left = '0';
        }
    });
};

const fecharCarrinho = () => {
    // fechar o carrinho com o botão X no modo mobile
    seleciona('.menu-closer').addEventListener('click', () => {
        seleciona('aside').style.left = '100vw'; // usando 100vw ele ficara fora da tela
        seleciona('header').style.display = 'flex';
    });
};

const atualizarCarrinho = (cartItem) => {
    // exibir número de itens no carrinho
    seleciona('.menu-openner span').innerHTML = cart.length;

    // mostrar ou nao o carrinho
    if (cart.length > 0) {

        // mostrar o carrinho
        seleciona('aside').classList.add('show');

        // zerar meu .cart para nao fazer insercoes duplicadas
        seleciona('.cart').innerHTML = '';

        let subtotal = 0;
        let desconto = 0;
        let total = 0;
        let pack = 0;

        for (let i in cart) {
            // use o find para pegar o item por id
            let lojaItem = lojaJson.find((item) => item.id == cart[i].id);
            let lojaPack = lojaJson.find((item) => item.id == cart[i].pack);

            subtotal += cart[i].price * cart[i].qt;
            pack = cart[i].pack * cart[i].qt;
            cart[i].packSell = pack;

            //console.log(cart[i].price)
            //console.log(pack) 

            // fazer o clone, exibir na tela e depois preencher as informacoes
            let cartItem = seleciona('.models .cart--item').cloneNode(true);
            seleciona('.cart').append(cartItem);

            let lojaSizeName = cart[i].size;

            let lojaName = `${(cart[i].name) ? cart[i].name : lojaItem.name} (${lojaSizeName})`;

            desconto = lojaItem?.desconto;

            // preencher as informacoes
            cartItem.querySelector('img').src = lojaItem.img;
            cartItem.querySelector('.cart--item-nome').innerHTML = lojaName;
            cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].qt;

            // selecionar botoes + e -
            cartItem.querySelector('.cart--item-qtmais').addEventListener('click', () => {
                console.log('Clicou no botão mais');
                // adicionar apenas a quantidade que esta neste contexto
                cart[i].qt++;
                // atualizar a quantidade
                cart[i].packSell += cart[i].pack;

                atualizarCarrinho();
            });

            cartItem.querySelector('.cart--item-qtmenos').addEventListener('click', () => {
                console.log('Clicou no botão menos');
                if (cart[i].qt > 1) {
                    // subtrair apenas a quantidade que esta neste contexto
                    cart[i].qt--;
                } else {
                    // remover se for zero
                    cart.splice(i, 1);
                }

                (cart.length < 1) ? seleciona('header').style.display = 'flex' : '';

                // atualizar a quantidade
                atualizarCarrinho();
            });

            seleciona('.cart').append(cartItem);

        }

        //desconto 10% e total
        desconto = desconto * subtotal;
        total = subtotal - desconto;

        // exibir na tela os resultados
        // selecionar o ultimo span do elemento
        seleciona('.subtotal span:last-child').innerHTML = formatoReal(subtotal);
        seleciona('.desconto span:last-child').innerHTML = formatoReal(desconto);
        seleciona('.total span:last-child').innerHTML = formatoReal(total);
        seleciona('.lojaInfo-valueNomePersonalizacao').value = '';

    } else {
        // ocultar o carrinho
        seleciona('aside').classList.remove('show');
        seleciona('aside').style.left = '100vw';
    }
};

const finalizarCompra = () => {
    seleciona('.cart--finalizar').addEventListener('click', () => {
        seleciona('aside').classList.remove('show');
        seleciona('aside').style.left = '100vw';
        seleciona('header').style.display = 'flex';
        let i = 1;

        for (let i in cart) {
            console.log(cart[i].qt)
            console.log('Pacotes Vendidos: ' + String(cart[i].packSell))
            console.log('Fabricar '+ String(cart[i].packSell + ' de ' + String(cart[i].name)))
            console.log(String(cart[i].name) ? String(cart[i].name) : String(cart[i].packSell) + String(cart[i].packSell));

        }
    });

};

const dados = () => {
    lojaJson.map((item, index) => {

        let lojaItem = document.querySelector('.models .loja-item').cloneNode(true);
        seleciona('.loja-area').append(lojaItem);
        preencheDadosDasLojas(lojaItem, item, index);
        lojaItem.querySelector('.loja-item a').addEventListener('click', (e) => {
            e.preventDefault();

            console.log('Clicou na loja');
            let chave = pegarKey(e);
            abrirModal();
            preencherCor(chave);
            preencheDadosModal(item);
            seleciona('.lojaInfo--qt').innerHTML = quantlojas;
            escolherCor(chave);
        });
        botoesFechar();

    });
};

const filtro = () => {
    const escolha = document.getElementById('categoria').value; // Atribuindo o valor do filtro
    let lojaItem;
    if (escolha !== 'Todos') {
        document.querySelector(".loja-area").innerHTML = '';
        const itensEscolhidos = lojaJson.filter(item => item.categoria == escolha);
        itensEscolhidos.forEach((item, index) => {

            lojaItem = document.querySelector('.models .loja-item').cloneNode(true); // CloneNode

            document.querySelector('.loja-area').append(lojaItem);

            preencheDadosDasLojas(lojaItem, item, index);
            lojaItem.querySelector('.loja-item a').addEventListener('click', (e) => {
                e.preventDefault();
                let chave = pegarKey(e);
                abrirModal();
                preencherCor(chave);
                preencheDadosModal(item);
                seleciona('.lojaInfo--qt').innerHTML = quantlojas;
                escolherCor(chave);

            });
            botoesFechar();

        }); // Fim do mapeamento de lojaJson para gerar lista de lojas
    } else {
        // Se a opção "Todos" for selecionada, exibir todos os produtos
        document.querySelector(".loja-area").innerHTML = '';
        lojaJson.forEach((item, index) => {
            lojaItem = document.querySelector('.models .loja-item').cloneNode(true); // CloneNode
            document.querySelector('.loja-area').append(lojaItem);
            preencheDadosDasLojas(lojaItem, item, index);
            lojaItem.querySelector('.loja-item a').addEventListener('click', (e) => {
                e.preventDefault();
                let chave = pegarKey(e);
                abrirModal();
                preencherCor(chave);
                preencheDadosModal(item);
                seleciona('.lojaInfo--qt').innerHTML = quantlojas;
                escolherCor(chave);
            });
            botoesFechar();
        });
    }
};



// mudar quantidade com os botoes + e -
mudarQuantidade();
adicionarNoCarrinho();
atualizarCarrinho();
fecharCarrinho();
finalizarCompra();
dados();


function setCookie(nome, valor, dias) {
    var validade = "";
    if (dias) {
        var date = new Date();
        date.setTime(date.getTime() + (dias * 24 * 60 * 60 * 1000));
        validade = "; expires=" + date.toUTCString();
    }
    document.cookie = nome + "=" + (valor || "") + validade + "; path=/";
}

function getCookie(nome) {
    var nomeCookie = nome + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var novo = ca[i];
        while (novo.charAt(0) == ' ') novo = novo.substring(1, novo.length);
        if (novo.indexOf(nomeCookie) == 0) return novo.substring(nomeCookie.length, novo.length);
    }
    return null;
}
//Atualizando 