// HTML要素の取得
const startBtn = document.getElementById('start-btn');
const wheel = document.getElementById('wheel');
const resultModal = document.getElementById('result-modal');
const resultText = document.getElementById('result-text');
const closeModal = document.getElementById('close-modal');
const modalCandidates = document.getElementById('modal-candidates');
const replayBtn = document.getElementById('replay-btn');
const machoLeft = document.getElementById('macho-left');
const machoRight = document.getElementById('macho-right');
const speechLeft = document.getElementById('speech-left');
const speechRight = document.getElementById('speech-right');

// ルーレットの状態管理
let isSpinning = false;
let currentRotation = 0;

// マッチョのセリフ集
const machoIdleLines = [
    'ナイスバルク！', 'パンプアップ！', 'プロテイン飲め！',
    '筋肉は裏切らない！', 'ベンチプレス！', 'チキンブレスト！',
    'レッツマッスル！', '限界突破！', 'もっと追い込め！',
    'デカくなれ！', 'ナイスカット！', '超回復！'
];

const machoSpinLines = [
    '回れぇぇ！！', 'うおおおお！！', 'パワーーー！！',
    'フルパワー！！', '全力だ！！', 'いけぇぇ！！',
    'マッスル回転！', '筋肉の力！！', 'ぶん回せ！！'
];

const machoCelebrateLines = [
    'おめでとう！！', 'ナイス選択！！', 'マッスル！！',
    '最高だぜ！！', 'プレゼント！！', 'やったぜ！！',
    'ビクトリー！！', '勝利だ！！', '素晴らしい！！'
];

// ランダムなセリフを取得
function getRandomLine(lines) {
    return lines[Math.floor(Math.random() * lines.length)];
}

// マッチョのセリフを更新
let speechInterval;
function startIdleSpeech() {
    clearInterval(speechInterval);
    speechInterval = setInterval(() => {
        speechLeft.textContent = getRandomLine(machoIdleLines);
        setTimeout(() => {
            speechRight.textContent = getRandomLine(machoIdleLines);
        }, 1000);
    }, 4000);
}

// 初期化時にアイドルセリフ開始
startIdleSpeech();

// シークレットモード管理
const inputSection = document.querySelector('.input-section');
function enableSecret() {
    inputSection.classList.add('secret');
    wheel.classList.add('secret');
}
function revealSecret() {
    inputSection.classList.remove('secret');
    wheel.classList.remove('secret');
    setupWheel();
}
enableSecret();

// スタートボタンがクリックされた時の処理
startBtn.addEventListener('click', () => {
    if (isSpinning) return;
    
    const gifts = [
        document.getElementById('gift1').value || 'プレゼント1',
        document.getElementById('gift2').value || 'プレゼント2',
        document.getElementById('gift3').value || 'プレゼント3',
        document.getElementById('gift4').value || 'プレゼント4'
    ];

    spinRoulette(gifts);
});

// ルーレットを回す関数
function spinRoulette(gifts) {
    isSpinning = true;
    startBtn.disabled = true;

    // マッチョを興奮状態に
    machoLeft.classList.add('excited');
    machoRight.classList.add('excited');
    clearInterval(speechInterval);
    
    // スピン中のセリフ
    speechLeft.textContent = getRandomLine(machoSpinLines);
    speechRight.textContent = getRandomLine(machoSpinLines);
    const spinSpeechInterval = setInterval(() => {
        speechLeft.textContent = getRandomLine(machoSpinLines);
        speechRight.textContent = getRandomLine(machoSpinLines);
    }, 800);

    // 画面シェイク
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), 500);

    const additionalDegree = 1800 + Math.floor(Math.random() * 360);
    currentRotation += additionalDegree;
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        isSpinning = false;
        startBtn.disabled = false;
        
        // マッチョを通常状態に戻す
        machoLeft.classList.remove('excited');
        machoRight.classList.remove('excited');
        clearInterval(spinSpeechInterval);
        
        showResult(currentRotation, gifts);
    }, 4000);
}

// 結果を判定して表示する関数
function showResult(degree, gifts) {
    const actualDegree = degree % 360;
    const count = gifts.length;
    const segmentAngle = 360 / count;
    
    const calibratedDegree = (360 - actualDegree) % 360;
    const index = Math.floor(calibratedDegree / segmentAngle);
    
    resultText.textContent = gifts[index];
    
    revealSecret();
    
    // モーダル内に全候補チップを表示
    modalCandidates.innerHTML = '';
    gifts.forEach((gift, i) => {
        const chip = document.createElement('span');
        chip.classList.add('candidate-chip');
        if (i === index) chip.classList.add('winner');
        chip.textContent = gift;
        chip.style.animationDelay = `${i * 0.1}s`;
        modalCandidates.appendChild(chip);
    });
    
    // マッチョをお祝いモードに
    machoLeft.classList.add('celebrate');
    machoRight.classList.add('celebrate');
    speechLeft.textContent = getRandomLine(machoCelebrateLines);
    speechRight.textContent = getRandomLine(machoCelebrateLines);
    
    resultModal.classList.remove('hidden');
    startConfetti();
    
    // 画面シェイク（お祝い）
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), 500);
}

// モーダルを閉じるボタンの処理
closeModal.addEventListener('click', () => {
    resultModal.classList.add('hidden');
    stopConfetti();
    machoLeft.classList.remove('celebrate');
    machoRight.classList.remove('celebrate');
    startIdleSpeech();
});

// 「もう一回あそぶ」ボタン
replayBtn.addEventListener('click', () => {
    resultModal.classList.add('hidden');
    stopConfetti();
    machoLeft.classList.remove('celebrate');
    machoRight.classList.remove('celebrate');
    enableSecret();
    setupWheel();
    startIdleSpeech();
});

// コンフェッティ（紙吹雪）の処理 - パーティー版は多め＆派手
function startConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#ffd700', '#ff3e6c', '#ff9f1c', '#00d4ff', '#39ff14', '#ff6ec7', '#ffffff'];
    
    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 3 + 1.5) + 's';
        confetti.style.opacity = Math.random() * 0.5 + 0.5;
        confetti.style.width = (Math.random() * 8 + 6) + 'px';
        confetti.style.height = (Math.random() * 8 + 6) + 'px';
        
        if (Math.random() > 0.5) {
            confetti.style.borderRadius = '50%';
        }
        
        container.appendChild(confetti);
        
        confetti.addEventListener('animationend', () => {
            confetti.remove();
        });
    }
}

function stopConfetti() {
    const container = document.getElementById('confetti-container');
    if (container) {
        container.innerHTML = '';
    }
}

const inputContainer = document.getElementById('input-container');
const addBtn = document.getElementById('add-btn');
const removeBtn = document.getElementById('remove-btn');

// 追加ボタンの処理
addBtn.addEventListener('click', () => {
    const currentInputs = inputContainer.querySelectorAll('input');
    const newIndex = currentInputs.length + 1;
    
    if (newIndex > 8) {
        alert('プレゼントは8個までです！');
        return;
    }

    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.id = `gift${newIndex}`;
    newInput.placeholder = `プレゼント${newIndex}`;
    newInput.value = `プレゼント${newIndex}`;
    
    newInput.addEventListener('input', setupWheel);
    
    inputContainer.appendChild(newInput);
    setupWheel();
});

// 削除ボタンの処理
removeBtn.addEventListener('click', () => {
    const currentInputs = inputContainer.querySelectorAll('input');
    
    if (currentInputs.length <= 2) {
        alert('プレゼントは最低2個必要です！');
        return;
    }
    
    inputContainer.removeChild(currentInputs[currentInputs.length - 1]);
    setupWheel();
});

// ルーレットのラベル生成・更新・色設定
function setupWheel() {
    const labels = wheel.querySelectorAll('.label');
    labels.forEach(label => label.remove());

    const inputs = inputContainer.querySelectorAll('input');
    const gifts = Array.from(inputs).map(input => input.value || input.placeholder);
    const count = gifts.length;
    const segmentAngle = 360 / count;

    // パーティーカラー
    const colors = [
        '#FFD6C5', // Soft Orange
        '#C5F0ED', // Soft Mint
        '#FEE440', // Lemon
        '#E2D4F0', // Soft Violet
        '#FFB8C0', // Soft Red
        '#D4F0C5', // Soft Green
        '#FFEAB6', // Soft Yellow
        '#C5D8F0'  // Soft Blue
    ];

    let gradientStr = 'conic-gradient(';
    for (let i = 0; i < count; i++) {
        const color = colors[i % colors.length];
        const startDeg = i * segmentAngle;
        const endDeg = (i + 1) * segmentAngle;
        gradientStr += `${color} ${startDeg}deg ${endDeg}deg${i === count - 1 ? '' : ', '}`;
    }
    gradientStr += ')';
    wheel.style.background = gradientStr;

    gifts.forEach((gift, index) => {
        const label = document.createElement('div');
        label.classList.add('label');
        label.textContent = gift;
        
        const angle = index * segmentAngle + (segmentAngle / 2);
        label.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(-110px)`;
        
        wheel.appendChild(label);
    });
}

// 入力変更時にルーレットのラベルも更新
const initialInputs = document.querySelectorAll('.inputs input');
initialInputs.forEach(input => {
    input.addEventListener('input', setupWheel);
});

// スタートボタンの処理を更新
startBtn.onclick = function() {
    if (isSpinning) return;
    
    const inputs = inputContainer.querySelectorAll('input');
    const gifts = Array.from(inputs).map(input => input.value || input.placeholder);

    isSpinning = true;
    startBtn.disabled = true;

    // マッチョを興奮状態に
    machoLeft.classList.add('excited');
    machoRight.classList.add('excited');
    clearInterval(speechInterval);
    
    speechLeft.textContent = getRandomLine(machoSpinLines);
    speechRight.textContent = getRandomLine(machoSpinLines);
    const spinSpeechInterval = setInterval(() => {
        speechLeft.textContent = getRandomLine(machoSpinLines);
        speechRight.textContent = getRandomLine(machoSpinLines);
    }, 800);

    // 画面シェイク
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), 500);

    const additionalDegree = 1800 + Math.floor(Math.random() * 360);
    currentRotation += additionalDegree;
    
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        isSpinning = false;
        startBtn.disabled = false;
        machoLeft.classList.remove('excited');
        machoRight.classList.remove('excited');
        clearInterval(spinSpeechInterval);
        showResult(currentRotation, gifts);
    }, 4000);
};

// 初期化
setupWheel();
