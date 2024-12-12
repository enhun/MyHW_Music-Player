const audio = document.getElementById("audio");
const controlPanel = document.getElementById("controlPanel");
const funcBtn = controlPanel.getElementsByTagName("span");
const musicList = controlPanel.getElementsByTagName("select")[0];
const infoPanel = controlPanel.getElementsByTagName("div");
const progressBar = document.getElementById('progressBar');
const volRangeBar = document.getElementById('volumeControl');
const txtVol = document.getElementById('volumeText');
const btnPlay = funcBtn[0];
const btnMuted = document.getElementById('muteBtn');
const playModeDiv = document.getElementById('playMode');
let isLooping = false;
let isRandom = false;
let isRepeatAll = false;
let timeUpdateInterval;

let progressSaveInterval;





// 進度更新
audio.addEventListener('timeupdate', updateProgress);

// 音頻加載完成時的處理
audio.addEventListener('loadedmetadata', () => {
    progressBar.max = audio.duration;
    progressBar.value = 0;
    updateProgress();
    getMusicTime();
});

// 播放時開始定時保存進度
audio.addEventListener('playing', () => {
    if (progressSaveInterval) {
        clearInterval(progressSaveInterval);
    }
    // 每5秒保存一次播放進度
    progressSaveInterval = setInterval(savePlaybackState, 5000);
});

// 暫停時停止保存進度
audio.addEventListener('pause', () => {
    if (progressSaveInterval) {
        clearInterval(progressSaveInterval);
    }
});

// 進度條變化時更新播放位置
progressBar.addEventListener('change', () => {
    audio.currentTime = progressBar.value;
});

// 音量控制
volRangeBar.addEventListener('input', setVolumeByRangeBar);

let titleTexts = [
    "歡迎使用我的播放器",
    "❤️ 享受美好音樂時光 ❤️",
    "✨ enjoy learning ✨",
    "🎵 沉浸在音樂世界 🎵",
    "讓我們一起聆聽動人旋律",
    "跟著德華一起飛吧"
];
let titleIndex = 0;
let titleChar = 0;
let currentText = '';
let isDeleting = false;
let titleBar = null;
let timeoutId = null;  // 新增變量來存儲 timeout ID

function typeTitle() {
    // 確保 titleBar 元素存在
    if (!titleBar) {
        titleBar = document.getElementById('titleBar');
        if (!titleBar) {
            console.error('找不到 titleBar 元素');
            return;
        }
    }

    const fullText = titleTexts[titleIndex % titleTexts.length];

    if (isDeleting) {
        currentText = fullText.substring(0, titleChar--);
    } else {
        currentText = fullText.substring(0, ++titleChar);
    }

    titleBar.textContent = currentText;

    let typeSpeed = isDeleting ? 50 : 150;

    if (!isDeleting && currentText === fullText) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && currentText === '') {
        isDeleting = false;
        titleIndex++;
        titleChar = 0;
        typeSpeed = 500;
    }

    // 清除之前的 timeout
    if (timeoutId) {
        clearTimeout(timeoutId);
    }

    // 設置新的 timeout
    timeoutId = setTimeout(() => {
        requestAnimationFrame(typeTitle);
    }, typeSpeed);
}

// 當頁面加載完成時初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 載入完成，開始初始化跑馬燈');
    titleBar = document.getElementById('titleBar');
    if (titleBar) {
        console.log('找到 titleBar 元素，開始執行跑馬燈');
        // 清除任何可能存在的舊 timeout
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        // 重置所有狀態
        titleIndex = 0;
        titleChar = 0;
        currentText = '';
        isDeleting = false;
        // 開始新的動畫
        typeTitle();
    } else {
        console.error('找不到 titleBar 元素');
    }
});

// 清理函數 - 在需要停止動畫時調用
function cleanup() {
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
}

// 在頁面卸載時清理
window.addEventListener('unload', cleanup);


const originalOnload = window.onload;
// 重新定義 window.onload


// 移除 window.onload 中的 typeTitle() 調用
window.onload = function() {
    // 執行原本的 onload 函數
    if (originalOnload) {
        originalOnload();
    }
    
    // 初始化音量控制
    setVolumeByRangeBar();
    
    // 載入播放狀態
    const savedState = loadPlaybackState();
    if (savedState) {
        audio.src = savedState.currentSong;
        audio.title = savedState.songTitle;
        audio.currentTime = savedState.currentTime;
        musicList.selectedIndex = savedState.selectedIndex;
        getMusicTime();
    }
};


function updateProgress() {
    if (!isNaN(audio.duration)) {
        progressBar.value = audio.currentTime;
        progressBar.max = audio.duration;
        
        const currentTime = getTimeFormat(audio.currentTime);
        const totalTime = getTimeFormat(audio.duration);
        document.getElementById('timeInfo').innerText = `${currentTime} / ${totalTime}`;
    }
}

function getTimeFormat(t) {
    let m = parseInt(t / 60);
    let s = parseInt(t % 60);
    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;
    return m + ":" + s;
}

function getMusicTime() {
    if (!isNaN(audio.duration)) {
        const currentTime = getTimeFormat(audio.currentTime);
        const totalTime = getTimeFormat(audio.duration);
        document.getElementById('timeInfo').innerText = `${currentTime} / ${totalTime}`;
    }
}

function updatePlayModeDisplay() {
    document.getElementById('loopBtn').classList.remove('active');
    document.getElementById('randomBtn').classList.remove('active');
    document.getElementById('repeatAllBtn').classList.remove('active');
    
    if (isLooping) {
        document.getElementById('loopBtn').classList.add('active');
        playModeDiv.innerText = "單曲循環播放";
        audio.loop = true;
    } else if (isRandom) {
        document.getElementById('randomBtn').classList.add('active');
        playModeDiv.innerText = "隨機播放";
        audio.loop = false;
    } else if (isRepeatAll) {
        document.getElementById('repeatAllBtn').classList.add('active');
        playModeDiv.innerText = "全部循環播放";
        audio.loop = false;
    } else {
        playModeDiv.innerText = "正常播放";
        audio.loop = false;
    }
}

function getRandomIndex(currentIndex, max) {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * max);
    } while (newIndex === currentIndex && max > 1);
    return newIndex;
}

function toggleLoop() {
    isLooping = !isLooping;
    if (isLooping) {
        isRandom = false;
        isRepeatAll = false;
    }
    updatePlayModeDisplay();
}

function toggleRandom() {
    isRandom = !isRandom;
    if (isRandom) {
        isLooping = false;
        isRepeatAll = false;
    }
    updatePlayModeDisplay();
}

function toggleRepeatAll() {
    isRepeatAll = !isRepeatAll;
    if (isRepeatAll) {
        isLooping = false;
        isRandom = false;
    }
    updatePlayModeDisplay();
}

function musicStatus() {
    if (isLooping) {
        audio.currentTime = 0;
        playMusic();
        return;
    }
    
    if (isRandom) {
        let randomIndex = getRandomIndex(musicList.selectedIndex, musicList.length);
        musicList.selectedIndex = randomIndex;
        changeMusic(0);
        return;
    }

    if (isRepeatAll) {
        if (musicList.selectedIndex === musicList.length - 1) {
            musicList.selectedIndex = 0;
        } else {
            musicList.selectedIndex++;
        }
        changeMusic(0);
    } else {
        if (musicList.selectedIndex < musicList.length - 1) {
            changeMusic(1);
        } else {
            stopMusic();
        }
    }
}



function setVolumeByRangeBar() {
    const volume = parseInt(volRangeBar.value);
    audio.volume = volume / 100;
    txtVol.value = volume;
}

function setMute() {
    audio.muted = !audio.muted;
    if (audio.muted) {
        txtVol.value = "靜音";
        btnMuted.classList.add('muted');
    } else {
        btnMuted.classList.remove('muted');
        setVolumeByRangeBar();
    }
}

function increaseVolume() {
    volRangeBar.value = Math.min(parseInt(volRangeBar.value) + 10, 100);
    audio.muted = false;
    btnMuted.classList.remove('muted');
    setVolumeByRangeBar();
}

function decreaseVolume() {
    volRangeBar.value = Math.max(parseInt(volRangeBar.value) - 10, 0);
    audio.muted = false;
    btnMuted.classList.remove('muted');
    setVolumeByRangeBar();
}

function changeTime(s) {
    audio.currentTime += s;
}

function savePlaybackState() {
    const state = {
        currentSong: audio.src,
        currentTime: audio.currentTime,
        songTitle: audio.title,
        selectedIndex: musicList.selectedIndex
    };
    localStorage.setItem('playbackState', JSON.stringify(state));
}

function stopMusic() {
    try {
        // 1. 先暫停音頻播放
        audio.pause();
        
        // 2. 重置音頻狀態
        audio.currentTime = 0;
        
        // 3. 更新按鈕狀態
        btnPlay.innerText = "4";
        btnPlay.onclick = playMusic;
        
        // 4. 更新播放狀態顯示
        document.getElementById('statusInfo').innerText = "音樂停止";
        
        // 5. 清除所有計時器
        if (timeUpdateInterval) {
            clearInterval(timeUpdateInterval);
            timeUpdateInterval = null;
        }
        
        if (progressSaveInterval) {
            clearInterval(progressSaveInterval);
            progressSaveInterval = null;
        }
        
        // 6. 重置進度條和時間顯示
        if (progressBar) {
            progressBar.value = 0;
        }
        
        if (document.getElementById('timeInfo')) {
            document.getElementById('timeInfo').innerText = "00:00 / 00:00";
        }
        
        // 7. 清除播放模式狀態
        isLooping = false;
        isRandom = false;
        isRepeatAll = false;
        updatePlayModeDisplay();
        
        // 8. 清除本地存儲的播放狀態
        localStorage.removeItem('playbackState');
        
        // 9. 重置音頻事件監聽器
        audio.oncanplaythrough = null;
        audio.onerror = null;
        
        // 10. 觸發自定義事件通知其他相關組件
        const stopEvent = new CustomEvent('musicStopped');
        audio.dispatchEvent(stopEvent);
        
    } catch (error) {
        console.error('停止音樂時發生錯誤:', error);
        document.getElementById('statusInfo').innerText = "停止音樂時發生錯誤";
    }
}


function pauseMusic() {
    try {
        audio.pause();
        btnPlay.innerHTML = '<i class="fas fa-play"></i>';
        document.getElementById('statusInfo').innerText = "音樂暫停中...";
        if (timeUpdateInterval) {
            clearInterval(timeUpdateInterval);
        }
        savePlaybackState();
    } catch (error) {
        console.error('暫停失敗:', error);
        document.getElementById('statusInfo').innerText = "暫停失敗，請重試";
    }
}

function loadPlaybackState() {
    const savedState = localStorage.getItem('playbackState');
    if (savedState) {
        const state = JSON.parse(savedState);
        return state;
    }
    return null;
}


// 修改切換音樂的函數
function changeMusic(n) {
    const playingBeforeChange = !audio.paused;
    
    // 停止當前播放
    stopMusic();
    
    const currentIndex = musicList.selectedIndex;
    const newIndex = currentIndex + n;

    if (newIndex >= 0 && newIndex < musicList.options.length) {
        musicList.selectedIndex = newIndex;
        const selectedOption = musicList.options[newIndex];
        
        // 更新音源和標題
        audio.src = selectedOption.value;
        audio.title = selectedOption.text;
        
        // 更新狀態顯示
        document.getElementById('statusInfo').innerText = "正在載入 " + selectedOption.text;

        // 等待音頻加載完成
        audio.load();
        
        // 如果之前正在播放，則繼續播放新的音樂
        if (playingBeforeChange) {
            audio.addEventListener('canplay', () => {
                playMusic();
            }, { once: true });
        }
    }
}

function playMusic() {
    // 防止重複觸發
    if (!audio.paused) {
        pauseMusic(); // 如果音樂正在播放，就暫停
        return;
    }

    // 添加錯誤處理和狀態提示
    const handlePlayError = (error) => {
        console.error('播放失敗:', error);
        document.getElementById('statusInfo').innerText = "播放失敗，請重試";
        btnPlay.innerHTML = '<i class="fas fa-play"></i>';
        btnPlay.onclick = playMusic;
    };

    try {
        // 先更新 UI
        btnPlay.innerHTML = '<i class="fas fa-pause"></i>';
        document.getElementById('statusInfo').innerText = "正在準備播放...";

        // 確保音頻已經加載
        if (audio.readyState >= 2) {
            // 音頻已經可以播放
            startPlayback();
        } else {
            // 等待音頻加載
            audio.addEventListener('canplay', startPlayback, { once: true });
            // 設置加載超時
            setTimeout(() => {
                if (audio.paused) {
                    handlePlayError(new Error('加載超時'));
                }
            }, 5000);
        }
    } catch (error) {
        handlePlayError(error);
    }
}

// 將實際播放邏輯抽離出來
function startPlayback() {
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                document.getElementById('statusInfo').innerText = 
                    "正在播放 " + (audio.title || '音樂');
                updateProgress();
                getMusicTime();
                // 確保按鈕點擊事件綁定正確
                btnPlay.onclick = pauseMusic;
            })
            .catch(error => {
                // 特別處理用戶互動要求
                if (error.name === 'NotAllowedError') {
                    document.getElementById('statusInfo').innerText = 
                        "請點擊播放按鈕開始播放";
                } else {
                    console.error('播放出錯:', error);
                    document.getElementById('statusInfo').innerText = 
                        "播放失敗，請重試";
                }
                btnPlay.innerHTML = '<i class="fas fa-play"></i>';
                btnPlay.onclick = playMusic;
            });
    }
}
// 在適當的地方顯示/隱藏加載提示
function showLoading() {
    document.getElementById('loadingIndicator').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingIndicator').style.display = 'none';
}

setVolumeByRangeBar();