// HTML要素の取得
const startBtn = document.getElementById('start-btn');
const wheel = document.getElementById('wheel');
const resultModal = document.getElementById('result-modal');
const resultText = document.getElementById('result-text');
const closeModal = document.getElementById('close-modal');
const modalCandidates = document.getElementById('modal-candidates');
const replayBtn = document.getElementById('replay-btn');

// ルーレットの状態管理
let isSpinning = false;
let currentRotation = 0; // 現在の回転角度を保持

// シークレットモード管理
const inputSection = document.querySelector('.input-section');
function enableSecret() {
    inputSection.classList.add('secret');
    wheel.classList.add('secret');
}
function revealSecret() {
    inputSection.classList.remove('secret');
    wheel.classList.remove('secret');
    setupWheel(); // ラベルを正しい名前に更新
}
// 初期状態でシークレットモードを有効化
enableSecret();

// スタートボタンがクリックされた時の処理
startBtn.addEventListener('click', () => {
    if (isSpinning) return; // 回転中はクリック無効
    
    // 入力欄からプレゼントの候補を取得
    const gifts = [
        document.getElementById('gift1').value || 'プレゼント1',
        document.getElementById('gift2').value || 'プレゼント2',
        document.getElementById('gift3').value || 'プレゼント3',
        document.getElementById('gift4').value || 'プレゼント4'
    ];

    // ルーレットを回す関数を呼び出し
    spinRoulette(gifts);
});

// ルーレットを回す関数
function spinRoulette(gifts) {
    isSpinning = true;
    startBtn.disabled = true; // ボタンを無効化

    // 追加で回転させる角度を決定 (最低5回転(1800度) + ランダムな角度)
    const additionalDegree = 1800 + Math.floor(Math.random() * 360);
    
    // 現在の角度に加算する
    currentRotation += additionalDegree;
    
    // CSSのtransformプロパティを使って回転させる
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    // 回転が終わった後の処理 (4秒後に実行)
    setTimeout(() => {
        isSpinning = false;
        startBtn.disabled = false; // ボタンを有効化
        
        // 結果を判定して表示
        showResult(currentRotation, gifts);
    }, 4000); // CSSのtransition時間(4s)と合わせる
}

// 結果を判定して表示する関数
function showResult(degree, gifts) {
    // 最終的な角度を360で割った余りを計算
    // ※今回は蓄積した角度(degree)を使うので、そのまま360で割った余りを計算すれば、
    // 0回転目からの相対位置がわかります。
    const actualDegree = degree % 360;
    const count = gifts.length;
    const segmentAngle = 360 / count;
    
    // 針は上(0度)に固定。
    // ホイールは時計回りに回転。
    // 0度のとき、Index 0 (0 to segmentAngle) が右側（時計回りの開始位置）にあるわけではなく
    // CSS錐形グラデーションは 0度(上)から時計回りに描画される。
    // rotate(0)のとき、Index 0 は 0度〜segmentAngle の範囲（つまり右上の扇形、時計の12時〜X時）
    // 針(12時の位置)にあるのは、Index 0 の「開始位置(0度)」直後。
    
    // 回転すると、全体が時計回りにズレる。
    // 針の下に来るインデックスを求めるには、逆回転で考える。
    // (360 - actualDegree) % 360  -> これが「針の位置(0度)」に対する相対的なホイールの角度
    
    const calibratedDegree = (360 - actualDegree) % 360;
    
    // calibratedDegree がどのセグメントに含まれるか
    // Index i の範囲: [i * segmentAngle, (i+1) * segmentAngle)
    
    const index = Math.floor(calibratedDegree / segmentAngle);
    
    // 結果テキストを設定
    resultText.textContent = gifts[index];
    
    // 候補リストを公開
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
    
    // モーダルを表示
    resultModal.classList.remove('hidden');
    
    // クラッカー（コンフェッティ）演出を開始
    startConfetti();
}

// モーダルを閉じるボタンの処理（公開状態を維持）
closeModal.addEventListener('click', () => {
    resultModal.classList.add('hidden');
    // モーダルを閉じたらコンフェッティを停止/削除
    stopConfetti();
});

// 「もう一回あそぶ」ボタンでシークレットモードに戻す
replayBtn.addEventListener('click', () => {
    resultModal.classList.add('hidden');
    stopConfetti();
    enableSecret();
    setupWheel();
});

// コンフェッティ（紙吹雪）の処理
function startConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#FF6B35', '#E84855', '#2EC4B6', '#9B5DE5', '#FEE440', '#1A1A1A'];
    
    // 50個の紙吹雪を生成
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        // ランダムな色、位置、アニメーション速度
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's'; // 2-5秒
        confetti.style.opacity = Math.random();
        
        // ランダムな形（正方形、丸）
        if (Math.random() > 0.5) {
            confetti.style.borderRadius = '50%';
        }
        
        container.appendChild(confetti);
        
        // アニメーションが終わったら削除（DOMを圧迫しないように）
        confetti.addEventListener('animationend', () => {
            confetti.remove();
        });
    }
}

function stopConfetti() {
    const container = document.getElementById('confetti-container');
    if (container) {
        container.innerHTML = ''; // 全削除
    }
}

const inputContainer = document.getElementById('input-container');
const addBtn = document.getElementById('add-btn');
const removeBtn = document.getElementById('remove-btn');

// 追加ボタンの処理
addBtn.addEventListener('click', () => {
    const currentInputs = inputContainer.querySelectorAll('input');
    const newIndex = currentInputs.length + 1;
    
    // 最大8個まで制限（見やすさのため）
    if (newIndex > 8) {
        alert('プレゼントは8個までです！');
        return;
    }

    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.id = `gift${newIndex}`;
    newInput.placeholder = `プレゼント${newIndex}`;
    newInput.value = `プレゼント${newIndex}`;
    
    // 入力イベントを追加
    newInput.addEventListener('input', setupWheel);
    
    inputContainer.appendChild(newInput);
    setupWheel();
});

// 削除ボタンの処理
removeBtn.addEventListener('click', () => {
    const currentInputs = inputContainer.querySelectorAll('input');
    
    // 最小2個は残す
    if (currentInputs.length <= 2) {
        alert('プレゼントは最低2個必要です！');
        return;
    }
    
    inputContainer.removeChild(currentInputs[currentInputs.length - 1]);
    setupWheel();
});

// ルーレットのラベル生成・更新・色設定
function setupWheel() {
    // 既存のラベルを削除
    const labels = wheel.querySelectorAll('.label');
    labels.forEach(label => label.remove());

    const inputs = inputContainer.querySelectorAll('input');
    const gifts = Array.from(inputs).map(input => input.value || input.placeholder);
    const count = gifts.length;
    const segmentAngle = 360 / count;

    // 色の生成
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

    // グラデーションの作成
    let gradientStr = 'conic-gradient(';
    for (let i = 0; i < count; i++) {
        const color = colors[i % colors.length];
        const startDeg = i * segmentAngle;
        const endDeg = (i + 1) * segmentAngle;
        gradientStr += `${color} ${startDeg}deg ${endDeg}deg${i === count - 1 ? '' : ', '}`;
    }
    gradientStr += ')';
    wheel.style.background = gradientStr;

    // ラベルの配置
    gifts.forEach((gift, index) => {
        const label = document.createElement('div');
        label.classList.add('label');
        label.textContent = gift;
        
        // 角度の計算: セグメントの中心に配置
        const angle = index * segmentAngle + (segmentAngle / 2);
        
        label.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(-110px)`;
        
        wheel.appendChild(label);
    });
}

// 入力変更時にルーレットのラベルも更新
// 既存の入力にもリスナーを追加
const initialInputs = document.querySelectorAll('.inputs input');
initialInputs.forEach(input => {
    input.addEventListener('input', setupWheel);
});

// スタートボタンの処理を更新して、現在の入力値を使うように
startBtn.onclick = function() {
    if (isSpinning) return;
    
    const inputs = inputContainer.querySelectorAll('input');
    const gifts = Array.from(inputs).map(input => input.value || input.placeholder);

    isSpinning = true;
    startBtn.disabled = true;

    const additionalDegree = 1800 + Math.floor(Math.random() * 360);
    currentRotation += additionalDegree;
    
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        isSpinning = false;
        startBtn.disabled = false;
        showResult(currentRotation, gifts);
    }, 4000); // 4000ms animation
};

// showResult関数も更新が必要（角度計算がセグメント数に依存するため）
// ここではsetupWheelと一緒に更新されるべきですが、showResultは別途定義されているため
// 変数スコープに注意。showResultは引数でgiftsを受け取るのでOKだが、計算ロジックを変える必要がある。

// 初期化
setupWheel();
