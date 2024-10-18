let step = 0; // Controla em qual etapa do chatbot estamos
let petInfo = {};

function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    if (!userInput) return;

    // Mostra a mensagem do usuário na tela
    addMessage(userInput, 'user');
    document.getElementById('user-input').value = '';

    // Controla o fluxo de mensagens e perguntas
    if (step === 0) {
        handleServiceChoice(userInput);
    } else if (step === 1) {
        handleWeightChoice(userInput);
    } else if (step === 2) {
        handlePickupChoice(userInput);
    } else if (step === 3) {
        handlePaymentChoice(userInput);
    } else if (step === 4) {
        handleScheduleChoice(userInput);
    } else if (step === 5) {
        handleAddressInput(userInput);
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.innerText = text;
    document.getElementById('chat-box').appendChild(messageDiv);
    document.getElementById('chat-box').scrollTop = document.getElementById('chat-box').scrollHeight;
}

function handleServiceChoice(choice) {
    if (choice == '1') {
        petInfo.service = 'Banho e Tosa';
        addMessage('Ok, poderia nos informar sobre o peso do seu pet?', 'bot');
        addMessage('1- 1kg a 4kg, 2- 5kg a 8kg, 3- 10kg a 15kg, 4- 15kg a 20kg', 'bot');
        step = 1;
    } else if (choice == '2') {
        petInfo.service = 'Consulta';
        addMessage('Você gostaria de que nós pegássemos o seu pet em casa?', 'bot');
        addMessage('1- Sim, 2- Não', 'bot');
        step = 2;
    } else if (choice == '3') {
        petInfo.service = 'Vacinação';
        addMessage('Qual vacina você deseja agendar?', 'bot');
        addMessage('1- Antirrábica, 2- V8/V10, 3- Leptospirose, 4- Gripe, 5- Raiva', 'bot');
        step = 2;
    } else {
        showInvalidInput();
        addMessage('Por favor, escolha uma opção válida: 1, 2 ou 3.', 'bot');
    }
    updatePlaceholder(step);
}

function handleWeightChoice(choice) {
    if (choice == '1' || choice == '2' || choice == '3' || choice == '4') {
        petInfo.weight = choice;
        addMessage('Você desejaria que nós pegássemos o seu pet na sua casa?', 'bot');
        addMessage('1- Sim, 2- Não', 'bot');
        step = 2;
    } else {
        showInvalidInput();
        addMessage('Por favor, escolha uma opção válida: 1, 2, 3 ou 4.', 'bot');
    }
    updatePlaceholder(step);
}

function handlePickupChoice(choice) {
    petInfo.pickup = choice; // Armazena a escolha de retirada
    if (choice == '1') {
        addMessage('Ok, coloque o seu endereço abaixo:', 'bot');
        step = 5; // Avança para a etapa de coleta do endereço
    } else if (choice == '2') {
        addMessage('Qual vai ser a forma de pagamento?', 'bot');
        addMessage('1- Dinheiro, 2- Cartão, 3- Pix', 'bot');
        step = 3; // Avança para a próxima etapa (pagamento)
    } else {
        showInvalidInput();
        addMessage('Por favor, escolha uma opção válida: 1 ou 2.', 'bot');
    }
    updatePlaceholder(step);
}

function handlePaymentChoice(choice) {
    if (choice == '1' || choice == '2' || choice == '3') {
        petInfo.payment = choice == '1' ? 'Dinheiro' : choice == '2' ? 'Cartão' : 'Pix';

        // Pergunta se deseja agendar horário apenas se a retirada foi escolhida
        if (petInfo.service === 'Banho e Tosa' && petInfo.pickup === '1') {
            addMessage('Escolha o horário para a busca:', 'bot');
            addMessage('1- 9hrs, 2- 14hrs, 3- 16hrs', 'bot');
            step = 4; // Avança para a próxima etapa (horário)
        } else {
            // Se for uma consulta e não precisa de retirada
            sendToWhatsApp(); // Enviar informações diretamente para o WhatsApp
        }
    } else {
        showInvalidInput();
        addMessage('Por favor, escolha uma opção válida: 1, 2 ou 3.', 'bot');
    }
    updatePlaceholder(step);
}

function handleScheduleChoice(choice) {
    if (choice == '1' || choice == '2' || choice == '3') {
        petInfo.time = choice == '1' ? '9hrs' : choice == '2' ? '14hrs' : '16hrs';
        addMessage('Consulta marcada para o serviço de ' + petInfo.service + ' às ' + petInfo.time + '.', 'bot');

        // Após marcar, envia para o WhatsApp
        sendToWhatsApp();
    } else {
        showInvalidInput();
        addMessage('Por favor, escolha uma opção válida: 1, 2 ou 3.', 'bot');
    }
    updatePlaceholder(step);
}

function handleAddressInput(address) {
    petInfo.address = address; // Armazena o endereço
    addMessage('Endereço recebido: ' + petInfo.address, 'bot');

    // Depois de coletar o endereço, pergunta sobre a forma de pagamento
    addMessage('Qual vai ser a forma de pagamento?', 'bot');
    addMessage('1- Dinheiro, 2- Cartão, 3- Pix', 'bot');
    step = 3; // Avança para a próxima etapa (pagamento)
    updatePlaceholder(step);
}

function sendToWhatsApp() {
    const phoneNumber = '+5519996204031'; // Insira o número de telefone com código do país e DDD
    let message = `Olá! Gostaria de agendar os seguintes serviços para meu pet:\n\n` +
        `*Serviço*: ${petInfo.service}\n` +
        `*Peso do Pet*: ${petInfo.weight ? petInfo.weight : 'não informado'}\n` +
        `*Forma de Pagamento*: ${petInfo.payment}\n` +
        `*Horário*: ${petInfo.time ? petInfo.time : 'não agendado'}\n` +
        `*Retirada em casa*: ${petInfo.pickup === '1' ? 'Sim' : 'Não'}\n` +
        `*Endereço*: ${petInfo.address ? petInfo.address : 'não informado'}`;

    // Verifica se o usuário está em um dispositivo móvel ou desktop
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // URL codificada para WhatsApp (mobile ou web)
    const whatsappUrl = isMobile 
        ? `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}` // Mobile
        : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`; // Desktop

    // Redirecionar para o WhatsApp
    window.location.href = whatsappUrl;
}

function updatePlaceholder(step) {
    const userInput = document.getElementById('user-input');
    if (step === 1) {
        userInput.placeholder = "Escolha o peso do seu pet...";
    } else if (step === 2) {
        userInput.placeholder = "Escolha a opção de retirada...";
    } else if (step === 3) {
        userInput.placeholder = "Digite o endereço ou escolha pagamento...";
    } else if (step === 4) {
        userInput.placeholder = "Escolha o horário para a busca...";
    } else if (step === 5) {
        userInput.placeholder = "Digite seu endereço...";
    } else {
        userInput.placeholder = "Digite aqui...";
    }
}

function showInvalidInput() {
    const userInput = document.getElementById('user-input');
    userInput.classList.add('invalid');
    setTimeout(() => userInput.classList.remove('invalid'), 500);
}
