// criar a variável modalKey sera global
let modalKey = 0

// variavel para controlar a quantidade inicial de lojas na modal
let quantlojas = 1

let cart = [] // carrinho

const seleciona = (elemento) => document.querySelector(elemento)
const selecionaTodos = (elemento) => document.querySelectorAll(elemento)

const formatoReal = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const formatoMonetario = (valor) => {
    if(valor) {
        return valor.toFixed(2)
    }
}

const abrirModal = () => {
    seleciona('.lojaWindowArea').style.opacity = 0 // transparente
    seleciona('.lojaWindowArea').style.display = 'flex'
    setTimeout(() => seleciona('.lojaWindowArea').style.opacity = 1, 150)
}

const fecharModal = () => {
    seleciona('.lojaWindowArea').style.opacity = 0 // transparente
    setTimeout(() => seleciona('.lojaWindowArea').style.display = 'none', 500)
}

const botoesFechar = () => {
    // BOTOES FECHAR MODAL
    selecionaTodos('.lojaInfo--cancelButton, .lojaInfo--cancelMobileButton').forEach( (item) => item.addEventListener('click', fecharModal) )
}

const preencheDadosDaslojas = (lojaItem, item, index) => {
    // setar um atributo para identificar qual elemento foi clicado
	lojaItem.setAttribute('data-key', index)
    lojaItem.querySelector('.loja-item--img img').src = item.img
    lojaItem.querySelector('.loja-item--price').innerHTML = formatoReal(item.price[0])
    lojaItem.querySelector('.loja-item--name').innerHTML = item.name
    lojaItem.querySelector('.loja-item--desc').innerHTML = item.description
}

const preencheDadosModal = (item) => {
    seleciona('.lojaBig img').src = item.img
    seleciona('.lojaInfo h1').innerHTML = item.name
    seleciona('.lojaInfo--desc').innerHTML = item.description
    seleciona('.lojaInfo--actualPrice').innerHTML = formatoReal(item.price[0])

}


const pegarKey = (e) => {
    // .closest retorna o elemento mais proximo que tem a class
    // do .loja-item ele vai pegar o valor do atributo data-key
    let key = e.target.closest('.loja-item').getAttribute('data-key')
    //console.log('loja clicada ' + key)

    console.log(lojaJson[key])


    // garantir que a quantidade inicial de lojas é 1
    quantlojas = 1

    // Para manter a informação de qual loja foi clicada
    modalKey = key

    return key
}

const mudarQuantidade = () => {
    // Ações nos botões + e - da janela
    seleciona('.lojaInfo--qtmais').addEventListener('click', () => {
        quantlojas++
        seleciona('.lojaInfo--qt').innerHTML = quantlojas
    })

    seleciona('.lojaInfo--qtmenos').addEventListener('click', () => {
        if(quantlojas > 1) {
            quantlojas--
            seleciona('.lojaInfo--qt').innerHTML = quantlojas	
        }
    })
}

const adicionarNoCarrinho = () => {
    seleciona('.lojaInfo--addButton').addEventListener('click', () => {
        console.log('Adicionar no carrinho')

        // pegar dados da janela modal atual
    	console.log("loja " + modalKey)
    
	    let size
        
        let pack = seleciona('.cart--pack').innerHTML.replace('R$&nbsp;', '')
	    // quantidade
    	console.log("Quant. " + quantlojas)
        // preco
        let price = seleciona('.lojaInfo--actualPrice').innerHTML.replace('R$&nbsp;', '')
    
	    let identificador = lojaJson[modalKey].id+'t'+size+lojaJson[modalKey].pack

        let key = cart.findIndex( (item) => item.identificador == identificador )
        console.log(key)
        
        if(key > -1) {
            // se encontrar aumente a quantidade
            cart[key].qt += quantlojas
        } else {
            // adicionar objeto loja no carrinho
            let loja = {
                identificador,
                id: lojaJson[modalKey].id,
                size, 
                qt: quantlojas,
                price: parseFloat(price), 
                pack: lojaJson[modalKey].pack
                
            }
            cart.push(loja)
            console.log(loja)
            console.log('Sub total R$ ' + (loja.qt * loja.price).toFixed(2))
            
            
        }

        fecharModal()
        abrirCarrinho()
        atualizarCarrinho()
    })
}

const abrirCarrinho = () => {
    console.log('Qtd de itens no carrinho ' + cart.length)
    if(cart.length > 0) {
        // mostrar o carrinho
	    seleciona('aside').classList.add('show')
        seleciona('header').style.display = 'flex' // mostrar barra superior
    }

    // exibir aside do carrinho no modo mobile
    seleciona('.menu-openner').addEventListener('click', () => {
        if(cart.length > 0) {
            seleciona('aside').classList.add('show')
            seleciona('aside').style.left = '0'
        }
    })
}

const fecharCarrinho = () => {
    // fechar o carrinho com o botão X no modo mobile
    seleciona('.menu-closer').addEventListener('click', () => {
        seleciona('aside').style.left = '100vw' // usando 100vw ele ficara fora da tela
        seleciona('header').style.display = 'flex'
    })
}

const atualizarCarrinho = (cartItem) => {
    // exibir número de itens no carrinho
	seleciona('.menu-openner span').innerHTML = cart.length
	
	// mostrar ou nao o carrinho
	if(cart.length > 0) {

		// mostrar o carrinho
		seleciona('aside').classList.add('show')

		// zerar meu .cart para nao fazer insercoes duplicadas
		seleciona('.cart').innerHTML = ''

		let subtotal = 0
		let desconto = 0
		let total    = 0
        let pack     = 0

		for(let i in cart) {
			// use o find para pegar o item por id
			let lojaItem = lojaJson.find( (item) => item.id == cart[i].id )
			console.log(lojaItem)
            let lojaPack = lojaJson.find( (item) => item.id == cart[i].pack )
			console.log(lojaItem)
            
        	subtotal += cart[i].price * cart[i].qt
            pack = cart[i].pack * cart[i].qt

            console.log(cart[i].price)
            console.log(pack) 
            

			// fazer o clone, exibir na tela e depois preencher as informacoes
			let cartItem = seleciona('.models .cart--item').cloneNode(true)
			seleciona('.cart').append(cartItem)

			let lojaName = `${lojaItem.name}`

            desconto = lojaItem?.desconto

			// preencher as informacoes
			cartItem.querySelector('img').src = lojaItem.img
            cartItem.querySelector('.cart--item')
			cartItem.querySelector('.cart--item-nome').innerHTML = lojaName
			cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].qt      

			// selecionar botoes + e -
			cartItem.querySelector('.cart--item-qtmais').addEventListener('click', () => {
				console.log('Clicou no botão mais')
				// adicionar apenas a quantidade que esta neste contexto
				cart[i].qt++
				// atualizar a quantidade

				atualizarCarrinho()
			})

			cartItem.querySelector('.cart--item-qtmenos').addEventListener('click', () => {
				console.log('Clicou no botão menos')
				if(cart[i].qt > 1) {
					// subtrair apenas a quantidade que esta neste contexto
					cart[i].qt--
				} else {
					// remover se for zero
					cart.splice(i, 1)
				}

                (cart.length < 1) ? seleciona('header').style.display = 'flex' : ''

				// atualizar a quantidade
				atualizarCarrinho()
			})

			seleciona('.cart').append(cartItem)

		} 

		//desconto 10% e total
		desconto = desconto * subtotal    
		total = subtotal - desconto

		// exibir na tela os resultados
		// selecionar o ultimo span do elemento
		seleciona('.subtotal span:last-child').innerHTML = formatoReal(subtotal)
		seleciona('.desconto span:last-child').innerHTML = formatoReal(desconto)
		seleciona('.total span:last-child').innerHTML    = formatoReal(total)

        

	} else {
		// ocultar o carrinho
		seleciona('aside').classList.remove('show')
		seleciona('aside').style.left = '100vw'
	}
}

const finalizarCompra = () => {
    seleciona('.cart--finalizar').addEventListener('click', () => {            
        seleciona('aside').classList.remove('show')
        seleciona('aside').style.left = '100vw'
        seleciona('header').style.display = 'flex'
    })
    
}

// MAPEAR lojaJson para gerar lista de lojas
lojaJson.map((item, index ) => {
    //console.log(item)
    let lojaItem = document.querySelector('.models .loja-item').cloneNode(true)
    //console.log(lojaItem)
    //document.querySelector('.loja-area').append(lojaItem)
    seleciona('.loja-area').append(lojaItem)

    // preencher os dados de cada loja
    preencheDadosDaslojas(lojaItem, item, index)
    
    // loja clicada
    lojaItem.querySelector('.loja-item a').addEventListener('click', (e) => {
        e.preventDefault()
        console.log('Clicou na loja')

        
        let chave = pegarKey(e)

        // abrir janela modal
        abrirModal()

        // preenchimento dos dados
        preencheDadosModal(item)

		// definir quantidade inicial como 1
		seleciona('.lojaInfo--qt').innerHTML = quantlojas

    })

    botoesFechar()

}) // fim do MAPEAR lojaJson para gerar lista de lojas


// mudar quantidade com os botoes + e -
mudarQuantidade()


adicionarNoCarrinho()
atualizarCarrinho()
fecharCarrinho()
finalizarCompra()