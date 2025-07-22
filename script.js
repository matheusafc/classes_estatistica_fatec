const camposEntrada = document.querySelectorAll('input');
const botaoCalcular = document.getElementById('calcular');
const containerOperacoes = document.getElementById('operacoes');
const seletorClasses = document.getElementById('numeroClasses');
const containerEntrada = document.getElementById('dados');
const botoesOperacao = document.querySelectorAll('.botaoOperacao');
const botaoAjuda = document.getElementById('alternarInstrucoes');
const containerAjuda = document.getElementById('instrucoes');

// Função para rolagem suave
function rolarSuavemente(elemento, deslocamento = 0) {
    const posicaoElemento = elemento.getBoundingClientRect().top;
    const posicaoDeslocada = posicaoElemento + window.pageYOffset - deslocamento;

    window.scrollTo({
        top: posicaoDeslocada,
        behavior: 'smooth'
    });
}

// Função auxiliar para arredondar números
function arredondar(numero, casasDecimais = 2) {
    const fator = Math.pow(10, casasDecimais);
    return Math.round(numero * fator) / fator;
}

// Funções de cálculo estatístico
function calcularLimites(limiteInferior, amplitude, numeroClasses) {

    const limites = {
        inferior: [],
        superior: []
    };
    
    // Para cada classe
    for (let i = 0; i < numeroClasses; i++) {
        // Calcula o limite inferior: limite inicial + (número da classe * amplitude)
        let li = arredondar(limiteInferior + (i * amplitude));
        limites.inferior.push(li);
        
        // Calcula o limite superior: limite inferior + amplitude
        let ls = arredondar(li + amplitude);
        limites.superior.push(ls);
    }
    
    return limites;
}

function calcularPontosMedios(limites) {
    // Cria um array vazio para os pontos médios
    let pontosMedios = [];
    
    // Para cada classe
    for (let i = 0; i < limites.inferior.length; i++) {
        // Ponto médio = (limite inferior + limite superior) / 2
        let pontoMedio = arredondar((limites.inferior[i] + limites.superior[i]) / 2);
        pontosMedios.push(pontoMedio);
    }
    
    return pontosMedios;
}

function calcularFrequenciasAcumuladas(frequencias) {
    // Cria um array vazio para as frequências acumuladas
    let acumuladas = [];
    let soma = 0;
    
    // Para cada frequência
    for (let i = 0; i < frequencias.length; i++) {
        // Soma a frequência atual com o total anterior
        soma = soma + frequencias[i];
        acumuladas.push(arredondar(soma));
    }
    
    return acumuladas;
}

function calcularMedia(pontosMedios, frequencias) {
    let somaProdutos = 0;
    let somaFrequencias = 0;
    
    // Para cada classe
    for (let i = 0; i < pontosMedios.length; i++) {
        // Multiplica o ponto médio pela frequência e soma ao total
        somaProdutos = somaProdutos + (pontosMedios[i] * frequencias[i]);
        // Soma a frequência ao total
        somaFrequencias = somaFrequencias + frequencias[i];
    }
    
    // Média = soma dos produtos / soma das frequências
    return arredondar(somaProdutos / somaFrequencias);
}

function calcularModa(limites, frequencias) {
    // Encontra todas as frequências máximas
    let maiorFrequencia = Math.max(...frequencias);
    let indicesModa = [];
    
    // Encontra todos os índices que têm a frequência máxima
    for (let i = 0; i < frequencias.length; i++) {
        if (frequencias[i] === maiorFrequencia) {
            indicesModa.push(i);
        }
    }
    
    // Se não houver moda (todos os valores têm a mesma frequência)
    if (indicesModa.length === frequencias.length) {
        return { tipo: 'amodal', valor: null };
    }
    
    // Se houver apenas uma moda
    if (indicesModa.length === 1) {
        let indiceModa = indicesModa[0];
        let limiteInferior = limites.inferior[indiceModa];
        let amplitude = limites.superior[indiceModa] - limiteInferior;
        
        let frequenciaAnterior = indiceModa > 0 ? frequencias[indiceModa - 1] : 0;
        let frequenciaPosterior = indiceModa < frequencias.length - 1 ? frequencias[indiceModa + 1] : 0;
        
        let diferencaAnterior = maiorFrequencia - frequenciaAnterior;
        let diferencaPosterior = maiorFrequencia - frequenciaPosterior;
        
        // Verifica se a soma das diferenças é zero para evitar divisão por zero
        if (diferencaAnterior + diferencaPosterior === 0) {
            return { tipo: 'unimodal', valor: arredondar((limiteInferior + limites.superior[indiceModa]) / 2) };
        }
        
        let moda = limiteInferior + (diferencaAnterior / (diferencaAnterior + diferencaPosterior)) * amplitude;
        return { tipo: 'unimodal', valor: arredondar(moda) };
    }
    
    // Se houver duas ou mais modas
    let modas = indicesModa.map(indice => {
        let limiteInferior = limites.inferior[indice];
        let amplitude = limites.superior[indice] - limiteInferior;
        
        let frequenciaAnterior = indice > 0 ? frequencias[indice - 1] : 0;
        let frequenciaPosterior = indice < frequencias.length - 1 ? frequencias[indice + 1] : 0;
        
        let diferencaAnterior = maiorFrequencia - frequenciaAnterior;
        let diferencaPosterior = maiorFrequencia - frequenciaPosterior;
        
        // Verifica se a soma das diferenças é zero para evitar divisão por zero
        if (diferencaAnterior + diferencaPosterior === 0) {
            return arredondar((limiteInferior + limites.superior[indice]) / 2);
        }
        
        return arredondar(limiteInferior + (diferencaAnterior / (diferencaAnterior + diferencaPosterior)) * amplitude);
    });
    
    return { 
        tipo: modas.length === 2 ? 'bimodal' : 'multimodal', 
        valor: modas 
    };
}

function calcularModaBruta(limites, frequencias) {
    // Encontra a maior frequência
    let maiorFrequencia = Math.max(...frequencias);
    let indicesModa = [];
    
    // Encontra todos os índices que têm a frequência máxima
    for (let i = 0; i < frequencias.length; i++) {
        if (frequencias[i] === maiorFrequencia) {
            indicesModa.push(i);
        }
    }
    
    // Se não houver moda (todos os valores têm a mesma frequência)
    if (indicesModa.length === frequencias.length) {
        return { tipo: 'amodal', valor: null };
    }
    
    // Calcula os pontos médios para cada classe modal
    let modas = indicesModa.map(indice => {
        let limiteInferior = limites.inferior[indice];
        let limiteSuperior = limites.superior[indice];
        return arredondar((limiteInferior + limiteSuperior) / 2);
    });
    
    // Determina o tipo de moda baseado no número de modas encontradas
    let tipo;
    if (modas.length === 1) {
        tipo = 'unimodal';
    } else if (modas.length === 2) {
        tipo = 'bimodal';
    } else {
        tipo = 'multimodal';
    }
    
    return { tipo, valor: modas.length === 1 ? modas[0] : modas };
}

function calcularMediana(limites, frequencias) {
    // Calcula o total de elementos
    let totalElementos = 0;
    for (let i = 0; i < frequencias.length; i++) {
        totalElementos = totalElementos + frequencias[i];
    }
    
    // Posição da mediana
    let posicaoMediana = totalElementos / 2;
    
    // Encontra a classe mediana
    let frequenciaAcumulada = 0;
    let classeMediana = 0;
    
    for (let i = 0; i < frequencias.length; i++) {
        frequenciaAcumulada = frequenciaAcumulada + frequencias[i];
        if (frequenciaAcumulada >= posicaoMediana) {
            classeMediana = i;
            break;
        }
    }
    
    // Pega o limite inferior da classe mediana
    let limiteInferior = limites.inferior[classeMediana];
    // Calcula a amplitude
    let amplitude = limites.superior[classeMediana] - limiteInferior;
    
    // Calcula a frequência acumulada anterior
    let frequenciaAnterior = 0;
    for (let i = 0; i < classeMediana; i++) {
        frequenciaAnterior = frequenciaAnterior + frequencias[i];
    }
    
    // Aplica a fórmula da mediana
    let mediana = limiteInferior + ((posicaoMediana - frequenciaAnterior) / frequencias[classeMediana]) * amplitude;
    return arredondar(mediana);
}

function calcularVariancia(pontosMedios, frequencias, media) {
    let somaQuadrados = 0;
    let somaFrequencias = 0;
    
    // Para cada classe
    for (let i = 0; i < pontosMedios.length; i++) {
        // Calcula o desvio em relação à média ao quadrado
        let desvio = pontosMedios[i] - media;
        let desvioQuadrado = desvio * desvio;
        
        // Multiplica pelo peso (frequência) e soma ao total
        somaQuadrados = somaQuadrados + (desvioQuadrado * frequencias[i]);
        somaFrequencias = somaFrequencias + frequencias[i];
    }
    
    // Variância = soma dos quadrados / soma das frequências
    return arredondar(somaQuadrados / somaFrequencias);
}

function calcularDesvioPadrao(variancia) {
    // Desvio padrão é a raiz quadrada da variância
    return arredondar(Math.sqrt(variancia));
}

function calcularCoeficienteVariacao(desvioPadrao, media) {
    // Coeficiente de variação = (desvio padrão / média) * 100
    return arredondar((desvioPadrao / media) * 100);
}

// Variáveis para armazenar os resultados
let resultados = null;
let botaoAtivo = null;

// Event Listeners
seletorClasses.addEventListener('change', () => {
    if (seletorClasses.value) {
        camposEntrada.forEach(campo => {
            campo.value = '';
        });
        
        containerEntrada.style.display = 'flex';
        setTimeout(() => {
            containerEntrada.classList.add('show');
            rolarSuavemente(containerEntrada, 100);
        }, 50);
        
        botaoCalcular.disabled = true;
        containerOperacoes.style.display = 'none';
        esconderResultado();
    } else {
        containerEntrada.classList.remove('show');
        setTimeout(() => {
            containerEntrada.style.display = 'none';
        }, 500);
        
        botaoCalcular.disabled = true;
        containerOperacoes.style.display = 'none';
        esconderResultado();
    }
});

function validarCampos() {
    const todosPreenchidos = Array.from(camposEntrada).every(campo => campo.value.trim() !== '');
    const amplitude = parseFloat(document.getElementById('amplitude').value);
    const frequencias = document.getElementById('frequencias').value.split(',').map(Number);
    
   
    if (amplitude < 0) {
        alert('A amplitude não pode ser negativa!');
        document.getElementById('amplitude').value = '';
        botaoCalcular.disabled = true;
        return;
    }
    

    if (frequencias.some(freq => freq < 0)) {
        alert('As frequências não podem ser negativas!');
        document.getElementById('frequencias').value = '';
        botaoCalcular.disabled = true;
        return;
    }
    
    botaoCalcular.disabled = !todosPreenchidos;
}

camposEntrada.forEach(campo => {
    campo.addEventListener('input', validarCampos);
});

function esconderResultado() {
    const elementoResultado = document.getElementById('resultado');
    if (elementoResultado) {
        elementoResultado.classList.remove('show');
        setTimeout(() => {
            elementoResultado.remove();
        }, 300);
    }
    botoesOperacao.forEach(botao => botao.classList.remove('active'));
    botaoAtivo = null;
}

function mostrarResultado(texto, id) {
    // Remove resultado anterior
    const resultadoAnterior = document.querySelector('.resultado');
    if (resultadoAnterior) {
        resultadoAnterior.remove();
    }
    
    // Cria o novo elemento de resultado
    const elementoResultado = document.createElement('div');
    elementoResultado.id = id;
    elementoResultado.className = 'resultado';
    
    // Formata o texto como lista se for "todos"
    if (id === 'resultado-todos') {
        const linhas = texto.split('\n');
        const lista = document.createElement('ul');
        linhas.forEach(linha => {
            const item = document.createElement('li');
            item.textContent = linha;
            lista.appendChild(item);
        });
        elementoResultado.appendChild(lista);
    } else {
        elementoResultado.textContent = texto;
    }
    
    containerOperacoes.appendChild(elementoResultado);
    
    // Adiciona a classe show apenas se for "todos"
    if (id === 'resultado-todos') {
        elementoResultado.classList.add('show');
    }

    // Adiciona scroll suave até o resultado após um pequeno delay
    setTimeout(() => {
        rolarSuavemente(elementoResultado, 100);
    }, 100);
}

botaoCalcular.addEventListener('click', () => {
    if (!botaoCalcular.disabled) {
        // Limpa resultados anteriores
        esconderResultado();
        botoesOperacao.forEach(botao => botao.classList.remove('active'));
        botaoAtivo = null;

        // Limpa o container de operações
        containerOperacoes.innerHTML = '';
        
        // Recria os botões de operação
        const operacoes = [
            'todos', 'média', 'moda de czuber', 'mediana', 'moda bruta',
            'variância', 'desvio padrão', 'coeficiente de variação'
        ];
        
        operacoes.forEach(operacao => {
            const botao = document.createElement('button');
            botao.className = 'botaoOperacao';
            botao.textContent = operacao.charAt(0).toUpperCase() + operacao.slice(1);
            containerOperacoes.appendChild(botao);
        });

        const limiteInferior = parseFloat(document.getElementById('limiteInferior').value);
        const amplitude = parseFloat(document.getElementById('amplitude').value);
        const frequencias = document.getElementById('frequencias').value.split(',').map(Number);
        const numeroClasses = parseInt(seletorClasses.value);

        // Calcular todos os resultados
        const limites = calcularLimites(limiteInferior, amplitude, numeroClasses);
        const pontosMedios = calcularPontosMedios(limites);
        const frequenciasAcumuladas = calcularFrequenciasAcumuladas(frequencias);
        const media = calcularMedia(pontosMedios, frequencias);
        const moda = calcularModa(limites, frequencias);
        const modaBruta = calcularModaBruta(limites, frequencias);
        const mediana = calcularMediana(limites, frequencias);
        const variancia = calcularVariancia(pontosMedios, frequencias, media);
        const desvioPadrao = calcularDesvioPadrao(variancia);
        const coeficienteVariacao = calcularCoeficienteVariacao(desvioPadrao, media);

        resultados = {
            limites,
            pontosMedios,
            frequenciasAcumuladas,
            media,
            moda,
            modaBruta,
            mediana,
            variancia,
            desvioPadrao,
            coeficienteVariacao
        };

        // Mostrar os botões de operações com efeito suave
        containerOperacoes.style.display = 'flex';
        setTimeout(() => {
            containerOperacoes.classList.add('show');
            rolarSuavemente(containerOperacoes, 100);
        }, 100);

        // Adiciona os event listeners aos novos botões
        const novosBotoesOperacao = document.querySelectorAll('.botaoOperacao');
        novosBotoesOperacao.forEach(botao => {
            botao.addEventListener('click', () => {
                if (!resultados) return;

                const operacao = botao.textContent.toLowerCase();
                let resultado = '';
                let idResultado = '';

                // Remover classe active do botão anterior
                if (botaoAtivo) {
                    botaoAtivo.classList.remove('active');
                }
                
                // Adicionar classe active ao botão atual
                botao.classList.add('active');
                botaoAtivo = botao;

                switch(operacao) {
                    case 'todos':
                        idResultado = 'resultado-todos';
                        let modaTexto = '';
                        if (resultados.moda.tipo === 'amodal') {
                            modaTexto = 'Moda de Czuber: Amodal (não há moda)';
                        } else {
                            modaTexto = `Moda de Czuber: ${Array.isArray(resultados.moda.valor) ? resultados.moda.valor.map(v => v.toFixed(2)).join(', ') : resultados.moda.valor.toFixed(2)}`;
                        }

                        let modaBrutaTexto = '';
                        if (resultados.modaBruta.tipo === 'amodal') {
                            modaBrutaTexto = 'Moda Bruta: Amodal (não há moda)';
                        } else {
                            modaBrutaTexto = `Moda Bruta: ${Array.isArray(resultados.modaBruta.valor) ? resultados.modaBruta.valor.map(v => v.toFixed(2)).join(', ') : resultados.modaBruta.valor.toFixed(2)}`;
                        }

                        resultado = `Média: ${resultados.media.toFixed(2)}
${modaTexto}
${modaBrutaTexto}
Mediana: ${resultados.mediana.toFixed(2)}
Variância: ${resultados.variancia.toFixed(2)}
Desvio Padrão: ${resultados.desvioPadrao.toFixed(2)}
Coeficiente de Variação: ${resultados.coeficienteVariacao.toFixed(2)}%`;
                        break;
                    case 'média':
                        idResultado = 'resultado-media';
                        resultado = `Média: ${resultados.media.toFixed(2)}`;
                        break;
                    case 'moda de czuber':
                        idResultado = 'resultado-moda';
                        if (resultados.moda.tipo === 'amodal') {
                            resultado = 'Moda de Czuber: Amodal (não há moda)';
                        } else {
                            resultado = `Moda de Czuber: ${Array.isArray(resultados.moda.valor) ? resultados.moda.valor.map(v => v.toFixed(2)).join(', ') : resultados.moda.valor.toFixed(2)}`;
                        }
                        break;
                    case 'mediana':
                        idResultado = 'resultado-mediana';
                        resultado = `Mediana: ${resultados.mediana.toFixed(2)}`;
                        break;
                    case 'moda bruta':
                        idResultado = 'resultado-moda-bruta';
                        if (resultados.modaBruta.tipo === 'amodal') {
                            resultado = 'Moda Bruta: Amodal (não há moda)';
                        } else {
                            resultado = `Moda Bruta: ${Array.isArray(resultados.modaBruta.valor) ? resultados.modaBruta.valor.map(v => v.toFixed(2)).join(', ') : resultados.modaBruta.valor.toFixed(2)}`;
                        }
                        break;
                    case 'variância':
                        idResultado = 'resultado-variancia';
                        resultado = `Variância: ${resultados.variancia.toFixed(2)}`;
                        break;
                    case 'desvio padrão':
                        idResultado = 'resultado-desvio-padrao';
                        resultado = `Desvio Padrão: ${resultados.desvioPadrao.toFixed(2)}`;
                        break;
                    case 'coeficiente de variação':
                        idResultado = 'resultado-coeficiente-variacao';
                        resultado = `Coeficiente de Variação: ${resultados.coeficienteVariacao.toFixed(2)}%`;
                        break;
                }

                mostrarResultado(resultado, idResultado);

                // Scroll para qualquer resultado
                const elementoResultado = document.getElementById(idResultado);
                if (elementoResultado) {
                    setTimeout(() => {
                        rolarSuavemente(elementoResultado, 100);
                    }, 100);
                }
            });
        });
    }
});

// Event listeners para o botão de ajuda
botaoAjuda.addEventListener('click', (e) => {
    e.stopPropagation();
    const estaVisivel = containerAjuda.style.display !== 'none';
    
    if (estaVisivel) {
        containerAjuda.classList.remove('show');
        setTimeout(() => {
            containerAjuda.style.display = 'none';
        }, 300);
    } else {
        containerAjuda.style.display = 'block';
        setTimeout(() => {
            containerAjuda.classList.add('show');
        }, 50);
    }
});

// Event listener para fechar ao clicar fora
document.addEventListener('click', (e) => {
    const cliqueDentroAjuda = containerAjuda.contains(e.target);
    const cliqueNoBotao = botaoAjuda.contains(e.target);
    
    if (!cliqueDentroAjuda && !cliqueNoBotao && containerAjuda.style.display !== 'none') {
        containerAjuda.classList.remove('show');
        setTimeout(() => {
            containerAjuda.style.display = 'none';
        }, 300);
    }
});

// Prevenir que cliques dentro da caixa de ajuda fechem ela
containerAjuda.addEventListener('click', (e) => {
    e.stopPropagation();
});