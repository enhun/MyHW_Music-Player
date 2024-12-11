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
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => {
    progressBar.max = audio.duration;
    progressBar.value = 0;
    getMusicTime();
});

audio.addEventListener('playing', () => {
    if (progressSaveInterval) {
        clearInterval(progressSaveInterval);
    }
    // 每5秒保存一次播放進度
    progressSaveInterval = setInterval(savePlaybackState, 5000);
});

audio.addEventListener('pause', () => {
    if (progressSaveInterval) {
        clearInterval(progressSaveInterval);
    }
});

audio.addEventListener('timeupdate', () => {
    updateProgress();
});

audio.addEventListener('loadedmetadata', () => {
    updateProgress();
    getMusicTime();
});

progressBar.addEventListener('change', () => {
    audio.currentTime = progressBar.value;
});

volRangeBar.addEventListener('input', setVolumeByRangeBar);

const titleTexts = [
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

function typeTitle() {
    const i = titleIndex % titleTexts.length;
    const fullText = titleTexts[i];

    if (isDeleting) {
        currentText = fullText.substring(0, titleChar--);
    } else {
        currentText = fullText.substring(0, ++titleChar);
    }

    document.getElementById('titleBar').textContent = currentText;

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

    setTimeout(typeTitle, typeSpeed);
}

window.onload = function() {
    setVolumeByRangeBar();
    typeTitle();
    
    const savedState = loadPlaybackState();
    if (savedState) {
        audio.src = savedState.currentSong;
        audio.title = savedState.songTitle;
        audio.currentTime = savedState.currentTime;
        musicList.selectedIndex = savedState.selectedIndex;
        getMusicTime();
    }
}

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
    audio.pause();
    btnPlay.innerText = "4";
    btnPlay.onclick = playMusic;
    document.getElementById('statusInfo').innerText = "音樂暫停中...";
    if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
    }
    savePlaybackState();
}

function loadPlaybackState() {
    const savedState = localStorage.getItem('playbackState');
    if (savedState) {
        const state = JSON.parse(savedState);
        return state;
    }
    return null;
}


function changeMusic(n) {
    if (!audio.paused) {
        stopMusic();
    }
    const currentIndex = musicList.selectedIndex;
    const newIndex = currentIndex + n;

    if (newIndex >= 0 && newIndex < musicList.options.length) {
        musicList.selectedIndex = newIndex;
        const selectedOption = musicList.options[newIndex];

        // 檢查音樂檔案路徑
        const audioPath = selectedOption.value;
        console.log('嘗試載入音樂:', audioPath); // 加入除錯訊息

        // 更新音源和標題
        audio.src = audioPath;
        audio.title = selectedOption.text;
        
        // 更新狀態顯示
        document.getElementById('statusInfo').innerText = "正在載入 " + selectedOption.text;
        
        // 更新播放按鈕
        btnPlay.innerText = ";";
        btnPlay.onclick = pauseMusic;

        // 重要：等待音頻加載完成
        audio.load();

        // 監聽載入錯誤
        audio.onerror = function(e) {
            console.error('音頻載入失敗:', e);
            document.getElementById('statusInfo').innerText = 
                `無法載入音樂檔案: ${audioPath}，請確認檔案是否存在`;
            btnPlay.innerText = "4";
            btnPlay.onclick = playMusic;
        };

        audio.oncanplaythrough = function() {
            audio.play()
                .then(() => {
                    document.getElementById('statusInfo').innerText = 
                        "正在播放 " + selectedOption.text;
                    getMusicTime();
                    savePlaybackState();
                })
                .catch(error => {
                    console.error('播放失敗:', error);
                    document.getElementById('statusInfo').innerText = 
                        "播放失敗，請重試";
                    btnPlay.innerText = "4";
                    btnPlay.onclick = playMusic;
                });
        };
    }
}

function playMusic() {
    // 如果音樂正在播放，不需要做任何事情
    if (!audio.paused) {
        return;
    }

    try {
        const savedState = loadPlaybackState();

        if (savedState && savedState.currentSong) {
            // 檢查當前音源是否不同
            if (audio.src !== savedState.currentSong) {
                audio.src = savedState.currentSong;
                audio.title = savedState.songTitle;
                musicList.selectedIndex = savedState.selectedIndex;
            }

            // 只在音樂完全停止時才設置播放位置
            if (audio.paused && audio.currentTime === 0 && !isNaN(savedState.currentTime)) {
                audio.currentTime = savedState.currentTime;
            }
        }

        // 直接播放，不需要重新載入
        audio.play()
            .then(() => {
                btnPlay.innerText = ";";
                btnPlay.onclick = pauseMusic;
                document.getElementById('statusInfo').innerText = "正在播放 " + audio.title + " 歌曲中...";
                
                // 更新進度和時間顯示
                updateProgress();
                getMusicTime();
                
                // 設置更新計時器
                if (timeUpdateInterval) {
                    clearInterval(timeUpdateInterval);
                }
                timeUpdateInterval = setInterval(() => {
                    updateProgress();
                    getMusicTime();
                }, 1000);
            })
            .catch(error => {
                console.error('播放失敗:', error);
                document.getElementById('statusInfo').innerText = "播放失敗，請確認音樂檔案路徑是否正確";
                btnPlay.innerText = "4";
                btnPlay.onclick = playMusic;
            });

        // 添加錯誤處理
        audio.onerror = function() {
            console.error('音頻載入失敗');
            document.getElementById('statusInfo').innerText = "無法載入音樂檔案，請確認檔案是否存在";
            btnPlay.innerText = "4";
            btnPlay.onclick = playMusic;
        };

    } catch (error) {
        console.error('播放過程發生錯誤:', error);
        document.getElementById('statusInfo').innerText = "播放發生錯誤，請重試";
        btnPlay.innerText = "4";
        btnPlay.onclick = playMusic;
    }
}

setVolumeByRangeBar();