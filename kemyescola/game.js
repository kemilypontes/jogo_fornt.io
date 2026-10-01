/* ============================================================
   A ÚLTIMA MEMÓRIA DE BELLY — game.js
   ============================================================ */

'use strict';

const GameState = {
    currentRoom: 'entrada',
    memoriesCollected: [],
    clockHour: 3,
    clockMinute: 47,
    stability: 100,
    endingsUnlocked: [],
    settings: { textSpeed: 5, sfxVolume: 70, textSize: 100, colorblind: false, reducedMotion: false, highContrast: false },
    isPaused: false,
    isDialogueActive: false,
    isLoading: true,
    isFullscreen: false,
    hasSave: false,
    flags: { readCissaLetter: false, enteredBellyRoom: false, playedPiano: false, fixedMirror: false, wateredGarden: false, organizedAttic: false }
};

const DOM = {
    loadingScreen: document.getElementById('loading-screen'),
    mainMenu: document.getElementById('main-menu'),
    gameContainer: document.getElementById('game-container'),
    pauseMenu: document.getElementById('pause-menu'),
    journal: document.getElementById('journal'),
    map: document.getElementById('map'),
    options: document.getElementById('options'),
    credits: document.getElementById('credits'),
    endingScreen: document.getElementById('ending-screen'),
    confirmModal: document.getElementById('confirm-modal'),
    loadingBar: document.getElementById('loading-bar'),
    loadingPercent: document.getElementById('loading-percent'),
    loadingPhrase: document.getElementById('loading-phrase'),
    btnNewGame: document.getElementById('btn-new-game'),
    btnContinue: document.getElementById('btn-continue'),
    btnOptions: document.getElementById('btn-options'),
    btnCredits: document.getElementById('btn-credits'),
    clockTime: document.getElementById('clock-time'),
    candleFlame: document.getElementById('candle-flame'),
    candleLabel: document.getElementById('candle-label'),
    hudCandle: document.getElementById('hud-candle'),
    memoryCount: document.getElementById('memory-count'),
    btnJournal: document.getElementById('btn-journal'),
    btnMap: document.getElementById('btn-map'),
    btnFullscreen: document.getElementById('btn-fullscreen'),
    btnPause: document.getElementById('btn-pause'),
    dialogueBox: document.getElementById('dialogue-box'),
    dialogueSpeaker: document.getElementById('dialogue-speaker'),
    dialogueText: document.getElementById('dialogue-text'),
    dialogueChoices: document.getElementById('dialogue-choices'),
    dialogueContinue: document.getElementById('dialogue-continue'),
    btnResume: document.getElementById('btn-resume'),
    btnPauseJournal: document.getElementById('btn-pause-journal'),
    btnPauseMap: document.getElementById('btn-pause-map'),
    btnPauseOptions: document.getElementById('btn-pause-options'),
    btnPauseSave: document.getElementById('btn-pause-save'),
    btnQuit: document.getElementById('btn-quit'),
    btnCloseJournal: document.getElementById('btn-close-journal'),
    journalList: document.getElementById('journal-list'),
    journalDetail: document.getElementById('journal-detail'),
    btnCloseMap: document.getElementById('btn-close-map'),
    btnCloseOptions: document.getElementById('btn-close-options'),
    optTextSpeed: document.getElementById('opt-text-speed'),
    optTextSpeedValue: document.getElementById('opt-text-speed-value'),
    optSfxVolume: document.getElementById('opt-sfx-volume'),
    optSfxVolumeValue: document.getElementById('opt-sfx-volume-value'),
    optTextSize: document.getElementById('opt-text-size'),
    optTextSizeValue: document.getElementById('opt-text-size-value'),
    optColorblind: document.getElementById('opt-colorblind'),
    optReducedMotion: document.getElementById('opt-reduced-motion'),
    optHighContrast: document.getElementById('opt-high-contrast'),
    btnResetOptions: document.getElementById('btn-reset-options'),
    btnCloseCredits: document.getElementById('btn-close-credits'),
    endingTitle: document.getElementById('ending-title'),
    endingText: document.getElementById('ending-text'),
    endingSignature: document.getElementById('ending-signature'),
    btnEndingMenu: document.getElementById('btn-ending-menu'),
    btnEndingCredits: document.getElementById('btn-ending-credits'),
    confirmMessage: document.getElementById('confirm-message'),
    btnConfirmYes: document.getElementById('btn-confirm-yes'),
    btnConfirmNo: document.getElementById('btn-confirm-no'),
    dustContainer: document.getElementById('dust-container')
};

const ScreenManager = {
    currentScreen: 'loading-screen',
    show(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const t = document.getElementById(id);
        if (t) { t.classList.add('active'); this.currentScreen = id; }
    },
    showOverlay(id) {
        const o = document.getElementById(id);
        if (o) { o.classList.add('active'); o.classList.remove('hidden'); }
    },
    hideOverlay(id) {
        const o = document.getElementById(id);
        if (o) o.classList.remove('active');
    },
    confirm(msg, onConfirm) {
        DOM.confirmMessage.textContent = msg;
        DOM.confirmModal.classList.remove('hidden');
        DOM.confirmModal.classList.add('active');
        const y = DOM.btnConfirmYes.cloneNode(true);
        const n = DOM.btnConfirmNo.cloneNode(true);
        DOM.btnConfirmYes.parentNode.replaceChild(y, DOM.btnConfirmYes);
        DOM.btnConfirmNo.parentNode.replaceChild(n, DOM.btnConfirmNo);
        DOM.btnConfirmYes = y; DOM.btnConfirmNo = n;
        y.addEventListener('click', () => {
            DOM.confirmModal.classList.remove('active');
            DOM.confirmModal.classList.add('hidden');
            if (onConfirm) onConfirm();
        });
        n.addEventListener('click', () => {
            DOM.confirmModal.classList.remove('active');
            DOM.confirmModal.classList.add('hidden');
        });
    }
};

const LoadingScreen = {
    phrases: ["Relembrando...", "Organizando as caixas...", "Limpando a poeira...", "Acendendo a vela...", "Abrindo as cortinas...", "Encontrando as cartas...", "Preparando o piano...", "Reacendendo as memórias..."],
    currentProgress: 0,
    phraseIndex: 0,
    phraseInterval: null,
    start(onComplete) {
        this.currentProgress = 0;
        this.phraseIndex = 0;
        DOM.loadingBar.style.width = '0%';
        DOM.loadingPercent.textContent = '0%';
        DOM.loadingPhrase.textContent = this.phrases[0];
        this.phraseInterval = setInterval(() => {
            this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
            DOM.loadingPhrase.style.opacity = '0';
            setTimeout(() => {
                DOM.loadingPhrase.textContent = this.phrases[this.phraseIndex];
                DOM.loadingPhrase.style.opacity = '1';
            }, 300);
        }, 2000);
        const inc = setInterval(() => {
            this.currentProgress += Math.random() * 8 + 2;
            if (this.currentProgress >= 100) {
                this.currentProgress = 100;
                clearInterval(inc);
                clearInterval(this.phraseInterval);
                setTimeout(() => { if (onComplete) onComplete(); }, 800);
            }
            DOM.loadingBar.style.width = this.currentProgress + '%';
            DOM.loadingPercent.textContent = Math.floor(this.currentProgress) + '%';
        }, 150);
    }
};

const DustSystem = {
    particles: [],
    maxParticles: 60,
    animationId: null,
    start() {
        this.particles = [];
        DOM.dustContainer.innerHTML = '';
        for (let i = 0; i < this.maxParticles; i++) this.createParticle();
        this.animate();
    },
    createParticle() {
        const p = document.createElement('div');
        p.className = 'dust-particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.width = (Math.random() * 2 + 1) + 'px';
        p.style.height = p.style.width;
        p.style.opacity = Math.random() * 0.4 + 0.2;
        p.style.animationDuration = (Math.random() * 20 + 15) + 's';
        p.style.animationDelay = (Math.random() * 20) + 's';
        DOM.dustContainer.appendChild(p);
        this.particles.push(p);
    },
    animate() {
        this.animationId = setInterval(() => {
            this.particles = this.particles.filter(p => p.parentNode);
            while (this.particles.length < this.maxParticles) this.createParticle();
        }, 5000);
    },
    stop() {
        if (this.animationId) clearInterval(this.animationId);
        DOM.dustContainer.innerHTML = '';
        this.particles = [];
    }
};

const DialogueSystem = {
    queue: [], currentLine: null, currentChoice: null, isTyping: false, typeInterval: null, onComplete: null,
    start(lines, onComplete = null) {
        this.queue = [...lines];
        this.onComplete = onComplete;
        this.show();
        this.nextLine();
    },
    show() { DOM.dialogueBox.classList.remove('hidden'); GameState.isDialogueActive = true; },
    hide() {
        DOM.dialogueBox.classList.add('hidden');
        GameState.isDialogueActive = false;
        DOM.dialogueChoices.innerHTML = '';
        DOM.dialogueContinue.style.display = 'none';
    },
    nextLine() {
        if (this.isTyping) { this.skipTyping(); return; }
        if (this.queue.length === 0) { this.hide(); if (this.onComplete) this.onComplete(); return; }
        this.currentLine = this.queue.shift();
        this.displayLine(this.currentLine);
    },
    displayLine(line) {
        DOM.dialogueSpeaker.textContent = line.speaker || 'Belly';
        DOM.dialogueChoices.innerHTML = '';
        DOM.dialogueContinue.style.display = 'none';
        if (line.choices && line.choices.length > 0) {
            this.currentChoice = line;
            this.typeText(line.text, () => this.showChoices(line.choices, line.onChoice));
        } else {
            this.currentChoice = null;
            this.typeText(line.text, () => { DOM.dialogueContinue.style.display = 'block'; });
        }
    },
    typeText(text, onComplete) {
        this.isTyping = true;
        DOM.dialogueText.textContent = '';
        let i = 0;
        const speed = Math.max(10, 60 - (GameState.settings.textSpeed * 5));
        this.typeInterval = setInterval(() => {
            if (i < text.length) { DOM.dialogueText.textContent += text[i]; i++; }
            else { clearInterval(this.typeInterval); this.isTyping = false; if (onComplete) onComplete(); }
        }, speed);
    },
    skipTyping() {
        if (this.typeInterval) clearInterval(this.typeInterval);
        if (this.currentLine) DOM.dialogueText.textContent = this.currentLine.text;
        this.isTyping = false;
        if (this.currentChoice && this.currentChoice.choices) this.showChoices(this.currentChoice.choices, this.currentChoice.onChoice);
        else DOM.dialogueContinue.style.display = 'block';
    },
    showChoices(choices, onChoice) {
        DOM.dialogueChoices.innerHTML = '';
        DOM.dialogueContinue.style.display = 'none';
        choices.forEach((c, idx) => {
            const b = document.createElement('button');
            b.className = 'dialogue-choice';
            b.textContent = c.text;
            b.addEventListener('click', (e) => {
                e.stopPropagation();
                DOM.dialogueChoices.innerHTML = '';
                if (c.action) c.action();
                if (onChoice) onChoice(idx, c);
                setTimeout(() => this.nextLine(), 100);
            });
            DOM.dialogueChoices.appendChild(b);
        });
    },
    advance() { if (this.isTyping) this.skipTyping(); else if (!this.currentChoice) this.nextLine(); }
};

DOM.dialogueBox.addEventListener('click', (e) => {
    if (e.target.classList.contains('dialogue-choice')) return;
    DialogueSystem.advance();
});

document.addEventListener('keydown', (e) => {
    if (GameState.isDialogueActive && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        DialogueSystem.advance();
    }
});

const Dialogues = {
    intro: [
        { speaker: 'Belly', text: 'Três anos. Três anos desde que a Cissa se foi.' },
        { speaker: 'Belly', text: 'A casa está do jeito que ela deixou. Só que... mais quieta.' },
        { speaker: 'Belly', text: 'Eu vim para vender. É o certo a fazer. Não posso ficar presa ao passado.' },
        { speaker: 'Belly', text: 'Mas tem algo estranho aqui. Como se a casa... esperasse por mim.' },
        { speaker: 'Belly', text: 'Vou dar uma olhada. Só uma olhada. Depois eu chamo o corretor.' }
    ],
    sala: [
        { speaker: 'Belly', text: 'O piano da vó. Ela tocava todas as manhãs.' },
        { speaker: 'Belly', text: 'Eu odiava acordar com aquilo. Agora... eu daria tudo para ouvir de novo.' },
        { speaker: 'Eco de Cissa', text: 'Você desafinou, Belly. Precisa praticar.' },
        { speaker: 'Belly', text: 'Vó? Não... eu só... eu lembro dessa voz.' }
    ],
    quartoBelly: [
        { speaker: 'Belly', text: 'Esse quarto... eu não entrava aqui desde os 15 anos.' },
        { speaker: 'Belly', text: 'Está tudo igual. Minhas coisas, meus diários, meus brinquedos.' },
        { speaker: 'Belly', text: 'Como se o tempo não tivesse passado. Como se eu ainda fosse aquela menina.' },
        { speaker: 'Eco de Cissa', text: 'Belly, minha boneca. Você cresceu tanto.' },
        { speaker: 'Belly', text: 'Vó... eu sinto muito. Eu sinto muito por não ter voltado antes.' }
    ],
    quartoCissa: [
        { speaker: 'Belly', text: 'O quarto da vó. Está do jeito que ela deixou.' },
        { speaker: 'Belly', text: 'A cama, a penteadeira, o guarda-roupa...' },
        { speaker: 'Belly', text: 'Ela dormia aqui todas as noites. Sozinha, nos últimos anos.' }
    ],
    cozinha: [
        { speaker: 'Belly', text: 'A cozinha. Onde a vó fazia bolo de fubá.' },
        { speaker: 'Belly', text: 'O bule ainda está na mesa. Como se ela fosse voltar.' }
    ],
    espelho: [
        { speaker: 'Belly', text: 'O espelho está quebrado. Mas o reflexo... não é o meu.' },
        { speaker: 'Belly', text: 'É uma versão de mim. Mais velha. Mais cansada. Mais... sozinha.' },
        {
            speaker: 'Belly', text: 'O que eu faço?',
            choices: [
                { text: 'Aceitar o reflexo como ele é', action: () => { GameState.flags.fixedMirror = true; CandleSystem.change(20); } },
                { text: 'Quebrar o espelho de vez', action: () => { CandleSystem.change(-20); } },
                { text: 'Ignorar e sair do banheiro', action: () => {} }
            ]
        }
    ]
};

const ClockSystem = {
    update() {
        const m = GameState.clockMinute.toString().padStart(2, '0');
        DOM.clockTime.textContent = `${GameState.clockHour}:${m}`;
    },
    set(h, m) {
        GameState.clockHour = h;
        GameState.clockMinute = m;
        const l = DOM.clockTime.nextElementSibling;
        if (l) l.textContent = h >= 12 ? 'PM' : 'AM';
        this.update();
    },
    advance(hours) {
        let t = GameState.clockHour * 60 + GameState.clockMinute + (hours * 60);
        t = ((t % 1440) + 1440) % 1440;
        this.set(Math.floor(t / 60), t % 60);
    }
};

const CandleSystem = {
    update() {
        const s = GameState.stability;
        DOM.hudCandle.classList.remove('unstable', 'critical');
        let label = 'Estável';
        if (s < 25) { DOM.hudCandle.classList.add('critical'); label = 'Apagando'; }
        else if (s < 60) { DOM.hudCandle.classList.add('unstable'); label = 'Instável'; }
        DOM.candleLabel.textContent = label;
        DOM.candleFlame.style.height = (8 + (s / 100) * 12) + 'px';
    },
    change(amount) {
        GameState.stability = Math.max(0, Math.min(100, GameState.stability + amount));
        this.update();
        if (GameState.stability === 0) this.onRoomForgotten();
    },
    onRoomForgotten() {
        DialogueSystem.start([{ speaker: 'Belly', text: 'Não... não consigo lembrar desse lugar. Ele está... sumindo.' }]);
    }
};

const MemorySystem = {
    add(memory) {
        if (GameState.memoriesCollected.find(m => m.id === memory.id)) return;
        GameState.memoriesCollected.push(memory);
        this.updateHUD();
        this.updateJournal();
        this.flashMemory(memory.type);
    },
    updateHUD() { DOM.memoryCount.textContent = GameState.memoriesCollected.length; },
    updateJournal() {
        if (GameState.memoriesCollected.length === 0) {
            DOM.journalList.innerHTML = '<p class="journal-empty">Nenhuma memória registrada ainda.</p>';
            return;
        }
        DOM.journalList.innerHTML = '';
        GameState.memoriesCollected.forEach(m => {
            const item = document.createElement('div');
            item.className = 'journal-item';
            item.innerHTML = `<span class="journal-item-dot" style="background: ${this.getColor(m.type)}"></span><span class="journal-item-title">${m.title}</span>`;
            item.addEventListener('click', () => this.showDetail(m));
            DOM.journalList.appendChild(item);
        });
    },
    showDetail(m) {
        DOM.journalDetail.innerHTML = `
            <h3 style="color: ${this.getColor(m.type)}; margin-bottom: 1rem; font-family: 'Cinzel', serif; letter-spacing: 0.15em;">${m.title}</h3>
            <p style="font-style: italic; line-height: 1.9; color: var(--text-primary);">${m.text}</p>
            <p style="margin-top: 2rem; font-size: 0.85rem; color: var(--text-dim); letter-spacing: 0.1em;">Tipo: ${this.getTypeName(m.type)}</p>
        `;
    },
    getColor(t) { return { blue: '#4A6B8A', yellow: '#A8904A', red: '#8A3A3A', purple: '#6B4A8A', green: '#4A8A5A' }[t] || '#4A6B8A'; },
    getTypeName(t) { return { blue: 'Memória Estável', yellow: 'Memória Fragmentada', red: 'Memória Distorcida', purple: 'Memória Falsa', green: 'Memória de Cissa' }[t] || 'Memória'; },
    flashMemory(type) {
        const f = document.createElement('div');
        f.className = `memory-flash ${type}`;
        f.classList.add('active');
        document.body.appendChild(f);
        setTimeout(() => { f.classList.remove('active'); setTimeout(() => f.remove(), 400); }, 300);
    }
};

const HUDButtons = {
    init() {
        DOM.btnJournal.addEventListener('click', () => ScreenManager.showOverlay('journal'));
        DOM.btnMap.addEventListener('click', () => ScreenManager.showOverlay('map'));
        DOM.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
        DOM.btnPause.addEventListener('click', () => this.pause());
    },
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            DOM.gameContainer.requestFullscreen().then(() => {
                GameState.isFullscreen = true;
                DOM.gameContainer.classList.add('fullscreen');
            }).catch(e => console.warn(e));
        } else {
            document.exitFullscreen().then(() => {
                GameState.isFullscreen = false;
                DOM.gameContainer.classList.remove('fullscreen');
            });
        }
    },
    pause() { GameState.isPaused = true; ScreenManager.showOverlay('pause-menu'); }
};

document.addEventListener('fullscreenchange', () => {
    GameState.isFullscreen = !!document.fullscreenElement;
    if (!GameState.isFullscreen) DOM.gameContainer.classList.remove('fullscreen');
});

const SaveSystem = {
    SAVE_KEY: 'ultima_memoria_belly_save',
    SETTINGS_KEY: 'ultima_memoria_belly_settings',
    hasSave() { try { return !!localStorage.getItem(this.SAVE_KEY); } catch (e) { return false; } },
    save() {
        try {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify({
                currentRoom: GameState.currentRoom,
                memoriesCollected: GameState.memoriesCollected,
                clockHour: GameState.clockHour,
                clockMinute: GameState.clockMinute,
                stability: GameState.stability,
                endingsUnlocked: GameState.endingsUnlocked,
                flags: GameState.flags
            }));
            this.showSaveFeedback();
            return true;
        } catch (e) { return false; }
    },
    load() {
        try {
            const raw = localStorage.getItem(this.SAVE_KEY);
            if (!raw) return false;
            const d = JSON.parse(raw);
            GameState.currentRoom = d.currentRoom || 'entrada';
            GameState.memoriesCollected = d.memoriesCollected || [];
            GameState.clockHour = d.clockHour || 3;
            GameState.clockMinute = d.clockMinute || 47;
            GameState.stability = d.stability !== undefined ? d.stability : 100;
            GameState.endingsUnlocked = d.endingsUnlocked || [];
            GameState.flags = d.flags || GameState.flags;
            ClockSystem.update();
            CandleSystem.update();
            MemorySystem.updateHUD();
            MemorySystem.updateJournal();
            return true;
        } catch (e) { return false; }
    },
    delete() { localStorage.removeItem(this.SAVE_KEY); GameState.hasSave = false; DOM.btnContinue.disabled = true; },
    saveSettings() { try { localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(GameState.settings)); } catch (e) {} },
    loadSettings() {
        try {
            const raw = localStorage.getItem(this.SETTINGS_KEY);
            if (!raw) return;
            Object.assign(GameState.settings, JSON.parse(raw));
            this.applySettings();
        } catch (e) {}
    },
    showSaveFeedback() {
        const f = document.createElement('div');
        f.textContent = '✓ Salvo';
        f.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(13,13,13,0.95);border:1px solid #A88B4A;color:#A88B4A;padding:1rem 2rem;font-family:'Cinzel',serif;letter-spacing:0.2em;z-index:9999;pointer-events:none;`;
        document.body.appendChild(f);
        setTimeout(() => {
            f.style.transition = 'opacity 0.5s ease';
            f.style.opacity = '0';
            setTimeout(() => f.remove(), 500);
        }, 1200);
    },
    applySettings() {
        const s = GameState.settings;
        const b = document.body;
        b.classList.remove('text-small', 'text-large', 'text-huge');
        if (s.textSize < 90) b.classList.add('text-small');
        else if (s.textSize > 110 && s.textSize <= 130) b.classList.add('text-large');
        else if (s.textSize > 130) b.classList.add('text-huge');
        b.classList.toggle('high-contrast', s.highContrast);
        b.classList.toggle('reduced-motion', s.reducedMotion);
        b.style.filter = s.colorblind ? 'hue-rotate(20deg) saturate(1.2)' : '';
    }
};

const OptionsSystem = {
    init() {
        DOM.optTextSpeed.value = GameState.settings.textSpeed;
        DOM.optTextSpeedValue.textContent = GameState.settings.textSpeed;
        DOM.optSfxVolume.value = GameState.settings.sfxVolume;
        DOM.optSfxVolumeValue.textContent = GameState.settings.sfxVolume + '%';
        DOM.optTextSize.value = GameState.settings.textSize;
        DOM.optTextSizeValue.textContent = GameState.settings.textSize + '%';
        DOM.optColorblind.checked = GameState.settings.colorblind;
        DOM.optReducedMotion.checked = GameState.settings.reducedMotion;
        DOM.optHighContrast.checked = GameState.settings.highContrast;
        DOM.optTextSpeed.addEventListener('input', e => { GameState.settings.textSpeed = parseInt(e.target.value); DOM.optTextSpeedValue.textContent = e.target.value; SaveSystem.saveSettings(); });
        DOM.optSfxVolume.addEventListener('input', e => { GameState.settings.sfxVolume = parseInt(e.target.value); DOM.optSfxVolumeValue.textContent = e.target.value + '%'; SaveSystem.saveSettings(); });
        DOM.optTextSize.addEventListener('input', e => { GameState.settings.textSize = parseInt(e.target.value); DOM.optTextSizeValue.textContent = e.target.value + '%'; SaveSystem.applySettings(); SaveSystem.saveSettings(); });
        DOM.optColorblind.addEventListener('change', e => { GameState.settings.colorblind = e.target.checked; SaveSystem.applySettings(); SaveSystem.saveSettings(); });
        DOM.optReducedMotion.addEventListener('change', e => { GameState.settings.reducedMotion = e.target.checked; SaveSystem.applySettings(); SaveSystem.saveSettings(); });
        DOM.optHighContrast.addEventListener('change', e => { GameState.settings.highContrast = e.target.checked; SaveSystem.applySettings(); SaveSystem.saveSettings(); });
        DOM.btnResetOptions.addEventListener('click', () => {
            ScreenManager.confirm('Restaurar configurações padrão?', () => {
                GameState.settings = { textSpeed: 5, sfxVolume: 70, textSize: 100, colorblind: false, reducedMotion: false, highContrast: false };
                this.init();
                SaveSystem.applySettings();
                SaveSystem.saveSettings();
            });
        });
    }
};

const MenuManager = {
    init() {
        DOM.btnNewGame.addEventListener('click', () => {
            if (GameState.hasSave) {
                ScreenManager.confirm('Iniciar um novo jogo? O progresso será perdido.', () => {
                    SaveSystem.delete();
                    this.startNewGame();
                });
            } else this.startNewGame();
        });
        DOM.btnContinue.addEventListener('click', () => {
            if (SaveSystem.load()) { ScreenManager.show('game-container'); GameEngine.start(); }
        });
        DOM.btnOptions.addEventListener('click', () => ScreenManager.showOverlay('options'));
        DOM.btnCredits.addEventListener('click', () => ScreenManager.showOverlay('credits'));
        DOM.btnCloseJournal.addEventListener('click', () => ScreenManager.hideOverlay('journal'));
        DOM.btnCloseMap.addEventListener('click', () => ScreenManager.hideOverlay('map'));
        DOM.btnCloseOptions.addEventListener('click', () => ScreenManager.hideOverlay('options'));
        DOM.btnCloseCredits.addEventListener('click', () => ScreenManager.hideOverlay('credits'));
        DOM.btnResume.addEventListener('click', () => { GameState.isPaused = false; ScreenManager.hideOverlay('pause-menu'); });
        DOM.btnPauseJournal.addEventListener('click', () => { ScreenManager.hideOverlay('pause-menu'); ScreenManager.showOverlay('journal'); });
        DOM.btnPauseMap.addEventListener('click', () => { ScreenManager.hideOverlay('pause-menu'); ScreenManager.showOverlay('map'); });
        DOM.btnPauseOptions.addEventListener('click', () => { ScreenManager.hideOverlay('pause-menu'); ScreenManager.showOverlay('options'); });
        DOM.btnPauseSave.addEventListener('click', () => { SaveSystem.save(); GameState.hasSave = true; DOM.btnContinue.disabled = false; });
        DOM.btnQuit.addEventListener('click', () => {
            ScreenManager.confirm('Sair para o menu?', () => {
                GameState.isPaused = false;
                ScreenManager.hideOverlay('pause-menu');
                ScreenManager.show('main-menu');
            });
        });
        DOM.btnEndingMenu.addEventListener('click', () => ScreenManager.show('main-menu'));
        DOM.btnEndingCredits.addEventListener('click', () => ScreenManager.showOverlay('credits'));
        document.querySelectorAll('.map-room').forEach(room => {
            room.addEventListener('click', () => {
                if (room.classList.contains('locked')) return;
                ScreenManager.hideOverlay('map');
                GameEngine.goToRoom(room.dataset.room);
            });
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const ov = document.querySelector('.overlay-screen.active');
                if (ov && ov.id !== 'pause-menu') ov.classList.remove('active');
                else if (GameState.isPaused) { GameState.isPaused = false; ScreenManager.hideOverlay('pause-menu'); }
                else if (ScreenManager.currentScreen === 'game-container') HUDButtons.pause();
            }
            if (ScreenManager.currentScreen === 'game-container') {
                if (e.key === 'f' || e.key === 'F') HUDButtons.toggleFullscreen();
                if (e.key === 'j' || e.key === 'J') ScreenManager.showOverlay('journal');
                if (e.key === 'm' || e.key === 'M') ScreenManager.showOverlay('map');
            }
        });
    },
    startNewGame() {
        GameState.currentRoom = 'entrada';
        GameState.memoriesCollected = [];
        GameState.clockHour = 3;
        GameState.clockMinute = 47;
        GameState.stability = 100;
        GameState.endingsUnlocked = [];
        GameState.flags = { readCissaLetter: false, enteredBellyRoom: false, playedPiano: false, fixedMirror: false, wateredGarden: false, organizedAttic: false };
        ClockSystem.update();
        CandleSystem.update();
        MemorySystem.updateHUD();
        MemorySystem.updateJournal();
        const qb = document.querySelector('[data-room="quarto-belly"]');
        if (qb) qb.classList.add('locked');
        ScreenManager.show('game-container');
        GameEngine.start();
    }
};

const GameEngine = {
    canvas: null, ctx: null, lastTime: 0, deltaTime: 0, animationId: null, isRunning: false, fadeAlpha: 0,
    images: {},
    belly: { x: 500, y: 500, width: 60, height: 130, speed: 220, direction: 'down', isMoving: false, animTimer: 0 },
    keys: { up: false, down: false, left: false, right: false },
    currentRoomData: null, hoveredObject: null, mouseX: 0, mouseY: 0,

    rooms: {
        'entrada': {
            name: 'Entrada', bgColor: '#1A1A1A',
            bounds: { x: 200, y: 580, width: 880, height: 120 },
            spawn: { x: 620, y: 560 },
            objects: [
                { id: 'porta-rua', name: 'Porta da Rua', x: 100, y: 130, w: 220, h: 520, action: () => DialogueSystem.start([{ speaker: 'Belly', text: 'A porta da rua. Eu podia simplesmente ir embora.' }, { speaker: 'Belly', text: 'Mas... não ainda. Tem algo aqui que eu preciso ver.' }]) },
                { id: 'porta-sala', name: 'Ir para a Sala', x: 1080, y: 130, w: 200, h: 520, action: () => GameEngine.goToRoom('sala') },
                { id: 'quadros', name: 'Quadros de Família', x: 450, y: 100, w: 500, h: 380, action: () => {
                    DialogueSystem.start([
                        { speaker: 'Belly', text: 'Esses quadros... são da minha família.' },
                        { speaker: 'Belly', text: 'A vó, eu, meus pais. Todos juntos.' },
                        { speaker: 'Belly', text: 'Tem poeira. Mas ainda dá para ver os sorrisos.' }
                    ], () => MemorySystem.add({ id: 'mem-quadros', title: 'Os Quadros de Família', text: 'Fotos antigas onde todos ainda estavam juntos. A vó sorria.', type: 'blue' }));
                }}
            ]
        },
        'sala': {
            name: 'Sala de Estar', bgColor: '#1A1A1A',
            bounds: { x: 100, y: 600, width: 1080, height: 100 },
            spawn: { x: 620, y: 580 },
            objects: [
                { id: 'piano', name: 'Piano de Cissa', x: 280, y: 280, w: 400, h: 360, action: () => {
                    if (!GameState.flags.playedPiano) {
                        GameState.flags.playedPiano = true;
                        DialogueSystem.start([
                            { speaker: 'Belly', text: 'O piano da vó. Ainda está aqui.' },
                            { speaker: 'Belly', text: 'Eu não toco desde criança. Mas... vou tentar.' },
                            { speaker: 'Eco de Cissa', text: 'Devagar, Belly. Uma nota por vez.' },
                            { speaker: 'Belly', text: 'Vó... eu lembro. Eu lembro dessa música.' }
                        ], () => { MemorySystem.add({ id: 'mem-piano', title: 'A Música da Vó', text: 'Uma melodia simples que a avó tocava todas as manhãs.', type: 'green' }); CandleSystem.change(15); ClockSystem.advance(2); });
                    } else DialogueSystem.start([{ speaker: 'Belly', text: 'A música ainda está na minha cabeça.' }]);
                }},
                { id: 'sofa', name: 'Sofá da Vó', x: 680, y: 390, w: 380, h: 230, action: () => {
                    MemorySystem.add({ id: 'mem-sofa', title: 'O Sofá da Vó', text: 'Aqui a vó sentava para ler. Dizia que os livros eram janelas.', type: 'blue' });
                    DialogueSystem.start([{ speaker: 'Belly', text: 'A vó sentava aqui. Ela lia por horas.' }, { speaker: 'Belly', text: '"Livros são janelas", ela dizia.' }]);
                }},
                { id: 'estante', name: 'Estante de Livros', x: 1150, y: 150, w: 130, h: 500, action: () => {
                    MemorySystem.add({ id: 'mem-estante', title: 'Os Livros de Cissa', text: 'Livros empoeirados, alguns com anotações à mão nas margens.', type: 'blue' });
                    DialogueSystem.start([{ speaker: 'Belly', text: 'Os livros da vó. Ela escrevia nas margens.' }]);
                }},
                { id: 'relogio', name: 'Relógio Parado', x: 790, y: 120, w: 130, h: 130, action: () => DialogueSystem.start([{ speaker: 'Belly', text: 'O relógio parou. Marcando 3:47.' }, { speaker: 'Belly', text: 'A mesma hora que a vó se foi.' }]) },
                { id: 'porta-entrada', name: 'Voltar', x: 100, y: 550, w: 100, h: 200, action: () => GameEngine.goToRoom('entrada') },
                { id: 'porta-cozinha', name: 'Ir para a Cozinha', x: 1150, y: 550, w: 130, h: 200, action: () => GameEngine.goToRoom('cozinha') }
            ]
        },
        'cozinha': {
            name: 'Cozinha', bgColor: '#1A1A1A',
            bounds: { x: 100, y: 600, width: 1080, height: 100 },
            spawn: { x: 620, y: 580 },
            objects: [
                { id: 'mesa', name: 'Mesa da Cozinha', x: 280, y: 440, w: 400, h: 200, action: () => {
                    MemorySystem.add({ id: 'mem-bolo', title: 'O Bolo de Fubá', text: 'Toda tarde a vó fazia bolo de fubá. A cozinha cheirava a infância.', type: 'green' });
                    DialogueSystem.start([{ speaker: 'Belly', text: 'O cheiro de bolo de fubá... ainda está aqui.' }, { speaker: 'Belly', text: 'Como se a vó tivesse acabado de fazer.' }]);
                }},
                { id: 'fogao', name: 'Fogão Antigo', x: 600, y: 320, w: 320, h: 280, action: () => DialogueSystem.start([{ speaker: 'Belly', text: 'O fogão ainda tem as panelas penduradas.' }]) },
                { id: 'geladeira', name: 'Geladeira', x: 920, y: 250, w: 180, h: 400, action: () => DialogueSystem.start([{ speaker: 'Belly', text: 'A geladeira. Ainda tem ímãs da minha infância.' }]) },
                { id: 'porta-sala', name: 'Voltar', x: 0, y: 500, w: 100, h: 200, action: () => GameEngine.goToRoom('sala') },
                { id: 'porta-cissa', name: 'Ir para o Quarto de Cissa', x: 1180, y: 500, w: 100, h: 200, action: () => GameEngine.goToRoom('quarto-cissa') }
            ]
        },
        'quarto-cissa': {
            name: 'Quarto de Cissa', bgColor: '#151515',
            bounds: { x: 100, y: 620, width: 1080, height: 80 },
            spawn: { x: 620, y: 600 },
            objects: [
                { id: 'cama-cissa', name: 'Cama de Cissa', x: 450, y: 400, w: 550, h: 280, action: () => {
                    MemorySystem.add({ id: 'mem-cama-cissa', title: 'A Cama de Cissa', text: 'Aqui a vó dormiu seus últimos dias. O travesseiro ainda guarda o formato.', type: 'red' });
                    DialogueSystem.start([
                        { speaker: 'Belly', text: 'A cama da vó. Ela dormia aqui.' },
                        { speaker: 'Belly', text: 'Nos últimos meses, ela não sabia mais quem eu era.' },
                        { speaker: 'Belly', text: 'Mas ela sempre sorria quando eu chegava. Mesmo sem saber quem eu era.' }
                    ]);
                }},
                { id: 'penteadeira', name: 'Penteadeira', x: 240, y: 200, w: 280, h: 280, action: () => {
                    if (!GameState.flags.readCissaLetter) {
                        GameState.flags.readCissaLetter = true;
                        DialogueSystem.start([
                            { speaker: 'Belly', text: 'Uma carta... escondida atrás da penteadeira.' },
                            { speaker: 'Belly', text: '"Belly, minha boneca..." — a letra é da vó.' },
                            { speaker: 'Belly', text: '"Se um dia eu esquecer você, não fique triste."' },
                            { speaker: 'Belly', text: '"Você foi a melhor coisa que já me aconteceu."' },
                            { speaker: 'Belly', text: 'Vó... eu sinto muito. Eu devia ter voltado antes.' }
                        ], () => {
                            MemorySystem.add({ id: 'mem-carta', title: 'A Carta de Cissa', text: 'Uma carta escondida onde Cissa perdoa Belly por não ter voltado.', type: 'green' });
                            CandleSystem.change(20);
                            const qb = document.querySelector('[data-room="quarto-belly"]');
                            if (qb) qb.classList.remove('locked');
                        });
                    } else DialogueSystem.start([{ speaker: 'Belly', text: 'A carta da vó... eu vou guardar para sempre.' }]);
                }},
                { id: 'guarda-roupa', name: 'Guarda-Roupa', x: 1080, y: 100, w: 200, h: 500, action: () => DialogueSystem.start([{ speaker: 'Belly', text: 'O guarda-roupa da vó. Roupas antigas, perfumadas.' }]) },
                { id: 'porta-cozinha', name: 'Voltar para a Cozinha', x: 0, y: 500, w: 100, h: 200, action: () => GameEngine.goToRoom('cozinha') },
                { id: 'porta-belly', name: 'Ir para o Quarto de Belly', x: 1180, y: 500, w: 100, h: 200, action: () => GameEngine.goToRoom('quarto-belly') }
            ]
        },
        'quarto-belly': {
            name: 'Quarto de Belly', bgColor: '#1A1A1A',
            bounds: { x: 100, y: 600, width: 1080, height: 100 },
            spawn: { x: 620, y: 580 },
            objects: [
                { id: 'cama-belly', name: 'Sua Cama Antiga', x: 300, y: 400, w: 550, h: 280, action: () => {
                    MemorySystem.add({ id: 'mem-cama-belly', title: 'A Cama de Estrelinhas', text: 'A cama pequena onde você sonhava. A colcha ainda tem estrelinhas.', type: 'blue' });
                    DialogueSystem.start([
                        { speaker: 'Belly', text: 'Minha cama. A colcha de estrelinhas.' },
                        { speaker: 'Belly', text: 'Eu dormia aqui e sonhava que ia ser astronauta.' },
                        { speaker: 'Belly', text: 'O que aconteceu com aquela menina?' }
                    ]);
                }},
                { id: 'diario', name: 'Diário de Infância', x: 0, y: 480, w: 350, h: 150, action: () => {
                    MemorySystem.add({ id: 'mem-diario', title: 'O Diário de Belly', text: 'Um diário rosa com corações. A última página diz: "Hoje a vó me ensinou a tocar piano."', type: 'green' });
                    DialogueSystem.start([
                        { speaker: 'Belly', text: 'Meu diário. Ainda está aqui.' },
                        { speaker: 'Belly', text: '"Hoje a vó me ensinou a tocar piano."' },
                        { speaker: 'Belly', text: 'Eu tinha 8 anos. Eu era tão feliz.' },
                        { speaker: 'Eco de Cissa', text: 'Você ainda é, Belly. Só esqueceu.' }
                    ]);
                }},
                { id: 'prateleira', name: 'Prateleira de Brinquedos', x: 430, y: 220, w: 340, h: 90, action: () => {
                    MemorySystem.add({ id: 'mem-brinquedos', title: 'Os Brinquedos', text: 'Ursinho, carrinho, blocos coloridos. Todos ainda no lugar.', type: 'blue' });
                    DialogueSystem.start([{ speaker: 'Belly', text: 'Meus brinquedos. Todos no lugar.' }, { speaker: 'Belly', text: 'A vó nunca deixou ninguém mexer.' }]);
                }},
                { id: 'ursinho', name: 'Ursinho de Pelúcia', x: 1050, y: 480, w: 200, h: 220, action: () => {
                    MemorySystem.add({ id: 'mem-ursinho', title: 'O Ursinho', text: 'O ursinho que a vó te deu no seu 5º aniversário. Você nunca soltava.', type: 'green' });
                    DialogueSystem.start([{ speaker: 'Belly', text: 'O ursinho da vó. Ela me deu quando eu fiz 5 anos.' }, { speaker: 'Belly', text: 'Eu dormia abraçada com ele todas as noites.' }]);
                }},
                { id: 'porta-cissa', name: 'Voltar', x: 0, y: 500, w: 100, h: 200, action: () => GameEngine.goToRoom('quarto-cissa') }
            ]
        },
        'banheiro': {
            name: 'Banheiro', bgColor: '#141414',
            bounds: { x: 200, y: 620, width: 880, height: 80 },
            spawn: { x: 640, y: 600 },
            objects: [
                { id: 'espelho', name: 'Espelho Quebrado', x: 380, y: 80, w: 340, h: 260, action: () => DialogueSystem.start(Dialogues.espelho) },
                { id: 'banheira', name: 'Banheira de Pés', x: 760, y: 380, w: 440, h: 220, action: () => DialogueSystem.start([{ speaker: 'Belly', text: 'A banheira de pés. A vó me dava banho aqui quando eu era pequena.' }]) },
                { id: 'pia', name: 'Pia Antiga', x: 440, y: 340, w: 220, h: 200, action: () => DialogueSystem.start([{ speaker: 'Belly', text: 'A pia ainda pinga. Como sempre pingou.' }]) },
                { id: 'voltar', name: 'Voltar', x: 0, y: 500, w: 100, h: 200, action: () => GameEngine.goToRoom('quarto-cissa') }
            ]
        },
        'sotao': {
            name: 'Sótão', bgColor: '#0F0F0F',
            bounds: { x: 150, y: 620, width: 980, height: 80 },
            spawn: { x: 640, y: 600 },
            objects: [
                { id: 'caixas', name: 'Caixas Antigas', x: 280, y: 380, w: 350, h: 300, action: () => {
                    MemorySystem.add({ id: 'mem-caixas', title: 'As Caixas do Sótão', text: 'Caixas de fotos, cartas e lembranças. Cada uma é um pedaço de Cissa.', type: 'purple' });
                    DialogueSystem.start([{ speaker: 'Belly', text: 'Caixas. Muitas caixas.' }, { speaker: 'Belly', text: 'Cada uma é uma memória. Cada uma é um pedaço da vó.' }]);
                }},
                { id: 'bau', name: 'Baú Antigo', x: 380, y: 520, w: 300, h: 160, action: () => DialogueSystem.start([{ speaker: 'Belly', text: 'Um baú trancado. A chave... eu não sei onde está.' }]) },
                { id: 'cadeira', name: 'Cadeira de Balanço', x: 960, y: 400, w: 200, h: 280, action: () => DialogueSystem.start([{ speaker: 'Belly', text: 'A cadeira de balanço da vó. Ela sentava aqui para descansar.' }]) },
                { id: 'janela', name: 'Janela do Sótão', x: 680, y: 180, w: 180, h: 180, action: () => GameEngine.triggerEnding('aceitacao') },
                { id: 'voltar', name: 'Voltar', x: 0, y: 500, w: 100, h: 200, action: () => GameEngine.goToRoom('quarto-cissa') }
            ]
        },
        'jardim': {
            name: 'Jardim', bgColor: '#151A15',
            bounds: { x: 100, y: 620, width: 1080, height: 80 },
            spawn: { x: 620, y: 600 },
            objects: [
                { id: 'flores', name: 'Flores Abandonadas', x: 100, y: 400, w: 500, h: 300, action: () => {
                    if (!GameState.flags.wateredGarden) {
                        GameState.flags.wateredGarden = true;
                        DialogueSystem.start([
                            { speaker: 'Belly', text: 'As flores da vó. Estão mortas.' },
                            { speaker: 'Belly', text: 'Eu me lembro de regar com ela. Todas as manhãs.' },
                            { speaker: 'Eco de Cissa', text: 'A memória também precisa de água, Belly.' }
                        ], () => { MemorySystem.add({ id: 'mem-flores', title: 'As Flores de Cissa', text: 'Um jardim que florescia sob os cuidados de Cissa.', type: 'green' }); CandleSystem.change(15); });
                    } else DialogueSystem.start([{ speaker: 'Belly', text: 'As flores... eu vou cuidar delas. Prometo.' }]);
                }},
                { id: 'banco', name: 'Banco de Madeira', x: 800, y: 480, w: 400, h: 180, action: () => {
                    MemorySystem.add({ id: 'mem-banco', title: 'O Banco do Jardim', text: 'Aqui Cissa sentava ao entardecer, olhando o jardim.', type: 'blue' });
                    DialogueSystem.start([{ speaker: 'Belly', text: 'A vó sentava aqui. Olhando o jardim.' }, { speaker: 'Belly', text: 'Ela dizia que as flores eram as memórias da terra.' }]);
                }},
                { id: 'arvore', name: 'Árvore Grande', x: 600, y: 0, w: 680, h: 500, action: () => DialogueSystem.start([{ speaker: 'Belly', text: 'A árvore que eu subia quando criança. Ainda está aqui.' }]) },
                { id: 'voltar', name: 'Voltar', x: 0, y: 500, w: 100, h: 200, action: () => GameEngine.goToRoom('entrada') }
            ]
        }
    },

    async start() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        await this.loadImages();
        this.isRunning = true;
        this.lastTime = performance.now();
        this.setupInput();
        this.enterRoom(GameState.currentRoom);
        if (GameState.memoriesCollected.length === 0 && !GameState.flags.readCissaLetter && !GameState.flags.playedPiano) {
            setTimeout(() => DialogueSystem.start(Dialogues.intro, () => { GameState.flags.readCissaLetter = true; }), 500);
        }
        this.loop();
    },

    loadImages() {
        return new Promise((resolve) => {
            const list = ['entrada', 'sala', 'cozinha', 'quarto-cissa', 'quarto-belly', 'banheiro', 'sotao', 'jardim', 'belly'];
            let loaded = 0;
            list.forEach(name => {
                const img = new Image();
                img.src = `assets/${name}.png`;
                img.onload = () => {
                    this.images[name] = img;
                    loaded++;
                    console.log(`✓ ${name}.png (${img.width}×${img.height})`);
                    if (loaded === list.length) resolve();
                };
                img.onerror = () => { console.warn(`✗ ${name}.png não encontrada`); loaded++; if (loaded === list.length) resolve(); };
            });
            setTimeout(resolve, 4000);
        });
    },

    setupInput() {
        document.addEventListener('keydown', (e) => {
            if (GameState.isDialogueActive || GameState.isPaused) return;
            if (ScreenManager.currentScreen !== 'game-container') return;
            const k = e.key.toLowerCase();
            if (k === 'arrowup' || k === 'w') { this.keys.up = true; e.preventDefault(); }
            if (k === 'arrowdown' || k === 's') { this.keys.down = true; e.preventDefault(); }
            if (k === 'arrowleft' || k === 'a') { this.keys.left = true; e.preventDefault(); }
            if (k === 'arrowright' || k === 'd') { this.keys.right = true; e.preventDefault(); }
            if (k === 'e' || k === 'enter') { this.tryInteract(); e.preventDefault(); }
        });
        document.addEventListener('keyup', (e) => {
            const k = e.key.toLowerCase();
            if (k === 'arrowup' || k === 'w') this.keys.up = false;
            if (k === 'arrowdown' || k === 's') this.keys.down = false;
            if (k === 'arrowleft' || k === 'a') this.keys.left = false;
            if (k === 'arrowright' || k === 'd') this.keys.right = false;
        });
        this.canvas.addEventListener('mousemove', (e) => {
            const r = this.canvas.getBoundingClientRect();
            this.mouseX = (e.clientX - r.left) * (this.canvas.width / r.width);
            this.mouseY = (e.clientY - r.top) * (this.canvas.height / r.height);
        });
        this.canvas.addEventListener('click', () => {
            if (GameState.isDialogueActive || GameState.isPaused) return;
            this.tryInteract();
        });
    },

    tryInteract() {
        if (!this.currentRoomData) return;
        if (this.hoveredObject) { this.hoveredObject.action(); return; }
        const bcx = this.belly.x + this.belly.width / 2;
        const bcy = this.belly.y + this.belly.height / 2;
        for (const o of this.currentRoomData.objects) {
            if (Math.hypot(bcx - (o.x + o.w / 2), bcy - (o.y + o.h / 2)) < 200) { o.action(); return; }
        }
    },

    enterRoom(id) {
        const r = this.rooms[id];
        if (!r) return;
        GameState.currentRoom = id;
        this.currentRoomData = r;
        if (r.spawn) { this.belly.x = r.spawn.x; this.belly.y = r.spawn.y; }
    },

    goToRoom(id) {
        this.fadeOut(() => {
            this.enterRoom(id);
            const d = { 'sala': Dialogues.sala, 'quarto-belly': Dialogues.quartoBelly, 'quarto-cissa': Dialogues.quartoCissa, 'cozinha': Dialogues.cozinha, 'banheiro': Dialogues.espelho };
            if (d[id] && !GameState.flags[`visited_${id}`]) {
                GameState.flags[`visited_${id}`] = true;
                setTimeout(() => DialogueSystem.start(d[id]), 400);
            }
            SaveSystem.save();
        });
    },

    fadeOut(cb) {
        let a = 0;
        const f = setInterval(() => {
            a += 0.15; this.fadeAlpha = a;
            if (a >= 1) {
                clearInterval(f); cb();
                let b = 1;
                const fi = setInterval(() => { b -= 0.15; this.fadeAlpha = Math.max(0, b); if (b <= 0) clearInterval(fi); }, 30);
            }
        }, 30);
    },

    loop() {
        if (!this.isRunning) return;
        const now = performance.now();
        this.deltaTime = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;
        if (!GameState.isPaused) this.update(this.deltaTime);
        this.render();
        this.animationId = requestAnimationFrame(() => this.loop());
    },

    update(dt) {
        if (!this.currentRoomData || GameState.isDialogueActive) return;
        const b = this.belly;
        const bo = this.currentRoomData.bounds;
        let dx = 0, dy = 0;
        if (this.keys.up) dy -= 1;
        if (this.keys.down) dy += 1;
        if (this.keys.left) dx -= 1;
        if (this.keys.right) dx += 1;
        if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
        b.isMoving = dx !== 0 || dy !== 0;
        if (b.isMoving) {
            if (Math.abs(dx) > Math.abs(dy)) b.direction = dx > 0 ? 'right' : 'left';
            else b.direction = dy > 0 ? 'down' : 'up';
            b.x = Math.max(bo.x, Math.min(bo.x + bo.width - b.width, b.x + dx * b.speed * dt));
            b.y = Math.max(bo.y, Math.min(bo.y + bo.height - b.height, b.y + dy * b.speed * dt));
            b.animTimer += dt;
        }
        this.checkHover();
        this.updateHint();
    },

    checkHover() {
        this.hoveredObject = null;
        if (!this.currentRoomData) return;
        for (const o of this.currentRoomData.objects) {
            if (this.mouseX >= o.x && this.mouseX <= o.x + o.w && this.mouseY >= o.y && this.mouseY <= o.y + o.h) {
                this.hoveredObject = o; break;
            }
        }
        this.canvas.style.cursor = this.hoveredObject ? 'pointer' : 'default';
    },

    updateHint() {
        const hint = document.getElementById('object-hint');
        if (!hint) return;
        const bcx = this.belly.x + this.belly.width / 2;
        const bcy = this.belly.y + this.belly.height / 2;
        let closest = null, cd = Infinity;
        for (const o of this.currentRoomData.objects) {
            const d = Math.hypot(bcx - (o.x + o.w / 2), bcy - (o.y + o.h / 2));
            if (d < 200 && d < cd) { closest = o; cd = d; }
        }
        if (closest) {
            hint.textContent = closest.name;
            hint.classList.remove('hidden');
            const r = this.canvas.getBoundingClientRect();
            const sx = r.width / this.canvas.width;
            const sy = r.height / this.canvas.height;
            hint.style.left = ((closest.x + closest.w / 2) * sx) + 'px';
            hint.style.top = ((closest.y - 10) * sy) + 'px';
        } else hint.classList.add('hidden');
    },

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const room = this.currentRoomData;
        ctx.fillStyle = room ? room.bgColor : '#0D0D0D';
        ctx.fillRect(0, 0, w, h);
        if (this.images[GameState.currentRoom]) {
            ctx.drawImage(this.images[GameState.currentRoom], 0, 0, w, h);
        } else if (room) {
            ctx.fillStyle = 'rgba(201, 192, 176, 0.15)';
            ctx.font = 'italic 100px Lora, serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(room.name, w / 2, h / 2);
        }
        this.renderBelly(ctx);
        if (room) {
            for (const o of room.objects) {
                if (this.hoveredObject === o) {
                    ctx.save();
                    ctx.strokeStyle = '#A88B4A';
                    ctx.lineWidth = 3;
                    ctx.setLineDash([10, 5]);
                    ctx.globalAlpha = 0.7 + Math.sin(performance.now() / 250) * 0.3;
                    ctx.strokeRect(o.x, o.y, o.w, o.h);
                    ctx.restore();
                }
            }
        }
        const grad = ctx.createRadialGradient(w/2, h/2, Math.min(w,h)*0.35, w/2, h/2, Math.max(w,h)*0.75);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        if (this.fadeAlpha > 0) {
            ctx.fillStyle = `rgba(0,0,0,${this.fadeAlpha})`;
            ctx.fillRect(0, 0, w, h);
        }
    },

    renderBelly(ctx) {
        const b = this.belly;
        const img = this.images['belly'];
        if (img && img.width > 0) {
            const fw = img.width / 4;
            const fh = img.height;
            let idx = 0;
            if (b.direction === 'down') idx = 0;
            else if (b.direction === 'up') idx = 1;
            else if (b.direction === 'left') idx = 2;
            else if (b.direction === 'right') idx = 3;
            const aspect = fw / fh;
            const drawH = b.height;
            const drawW = drawH * aspect;
            ctx.drawImage(img, idx * fw, 0, fw, fh, b.x - (drawW - b.width) / 2, b.y, drawW, drawH);
        } else {
            ctx.fillStyle = '#2A2620';
            ctx.fillRect(b.x, b.y, b.width, b.height);
        }
    },

    stop() {
        this.isRunning = false;
        if (this.animationId) cancelAnimationFrame(this.animationId);
    },

    triggerEnding(id) {
        const endings = {
            'esquecimento': { title: 'O Esquecimento', text: 'Eu não lembro mais. E isso... não dói mais. Mas também não é mais eu.', signature: '— Belly' },
            'aceitacao': { title: 'A Aceitação', text: 'Eu não esqueci. Eu só aprendi a carregar.', signature: '— Belly' },
            'heranca': { title: 'A Herança', text: 'Eu cuidei tão bem do passado que esqueci de viver o presente.', signature: '— Belly' },
            'mudanca': { title: 'A Mudança', text: 'Não precisei esquecer para seguir em frente. Precisei lembrar do que importava.', signature: '— Belly' },
            'ultima-memoria': { title: 'A Última Memória', text: 'A última memória de Belly não é sobre esquecer. É sobre ser lembrada.', signature: '— Belly' }
        };
        const e = endings[id] || endings.aceitacao;
        if (!GameState.endingsUnlocked.includes(id)) GameState.endingsUnlocked.push(id);
        DOM.endingTitle.textContent = e.title;
        DOM.endingText.textContent = e.text;
        DOM.endingSignature.textContent = e.signature;
        this.stop();
        setTimeout(() => ScreenManager.show('ending-screen'), 1500);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    console.log('%c✦ A Última Memória de Belly', 'color: #A88B4A; font-size: 20px; font-family: serif;');
    DustSystem.start();
    SaveSystem.loadSettings();
    OptionsSystem.init();
    HUDButtons.init();
    if (SaveSystem.hasSave()) {
        GameState.hasSave = true;
        DOM.btnContinue.disabled = false;
    }
    LoadingScreen.start(() => {
        MenuManager.init();
        ScreenManager.show('main-menu');
        GameState.isLoading = false;
    });
});

window.addEventListener('beforeunload', () => {
    if (ScreenManager.currentScreen === 'game-container' && !GameState.isPaused) SaveSystem.save();
    GameEngine.stop();
    DustSystem.stop();
});