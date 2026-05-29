document.addEventListener("DOMContentLoaded", () => {
    // ---- Toast functionality ----
    const toast = document.getElementById('toast');
    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        // Animation pop bounce
        toast.style.transform = "translateX(-50%) scale(1.05)";
        setTimeout(() => toast.style.transform = "translateX(-50%) scale(1)", 150);
        setTimeout(() => toast.classList.add('hidden'), 2500);
    }

    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            showToast('COPIED TO BUFFER');
        } catch (err) {
            showToast('COPY FAILED');
        }
    }

    async function pasteFromClipboard() {
        try { return await navigator.clipboard.readText(); }
        catch { showToast('PASTE ERROR'); return null; }
    }

    // ---- Visual / Interactions ----
    const gridRippleContainer = document.getElementById('grid-ripple-container');
    
    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('click', function(e) {
            key.style.animation = 'none';
            void key.offsetWidth; // trigger reflow
            key.style.animation = 'popClick 0.2s cubic-bezier(0.165, 0.84, 0.44, 1)';
            
            // Grid Ripple Generation
            if(gridRippleContainer) {
                const rect = gridRippleContainer.getBoundingClientRect();
                const circle = document.createElement('span');
                circle.style.left = `${e.clientX - rect.left}px`;
                circle.style.top = `${e.clientY - rect.top}px`;
                circle.classList.add('grid-ripple');
                gridRippleContainer.appendChild(circle);
                setTimeout(() => circle.remove(), 500);
            }
            
            // Equals button ripple
            if (key.classList.contains('k-equals')) {
                const rect = key.getBoundingClientRect();
                const circle = document.createElement('span');
                const diameter = Math.max(rect.width, rect.height);
                
                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${e.clientX - rect.left}px`;
                circle.style.top = `${e.clientY - rect.top}px`;
                circle.classList.add('ripple');
                
                const ripple = key.querySelector('.ripple');
                if (ripple) ripple.remove();
                
                key.appendChild(circle);
                setTimeout(() => circle.remove(), 600);
            }
        });
    });

    const btnSync = document.getElementById('btn-sync-data');
    btnSync.addEventListener('click', () => {
        btnSync.classList.add('syncing');
        fetchExchangeRate().then(() => {
            setTimeout(() => {
                btnSync.classList.remove('syncing');
                showToast("DATA SYNCED");
            }, 800);
        });
    });

    // ---- Log Drawer ----
    const logTrigger = document.getElementById('log-trigger');
    const logDrawer = document.getElementById('log-drawer');
    const closeDrawer = document.getElementById('close-drawer');
    
    logTrigger.addEventListener('click', () => {
        if(logDrawer.classList.contains('hidden')){
            logDrawer.classList.remove('hidden');
            logDrawer.style.animation = 'none';
            void logDrawer.offsetWidth;
            logDrawer.style.animation = 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        } else {
            logDrawer.classList.add('hidden');
        }
    });

    closeDrawer.addEventListener('click', () => {
        logDrawer.classList.add('hidden');
    });

    const navCalc = document.getElementById('nav-calc');
    const navConv = document.getElementById('nav-conv');
    const calcPanel = document.querySelector('.calc-panel');
    const rightColumn = document.querySelector('.right-column');

    function switchTab(tab) {
        if (tab === 'calc') {
            navCalc.classList.add('active');
            navConv.classList.remove('active');
            rightColumn.style.display = 'none';
            calcPanel.style.display = 'flex';
            
            calcPanel.style.animation = 'none';
            void calcPanel.offsetWidth;
            calcPanel.style.animation = 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        } else {
            navConv.classList.add('active');
            navCalc.classList.remove('active');
            calcPanel.style.display = 'none';
            rightColumn.style.display = 'flex';

            rightColumn.style.animation = 'none';
            void rightColumn.offsetWidth;
            rightColumn.style.animation = 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        }
    }

    navCalc.addEventListener('click', () => {
        switchTab('calc');
        switchCalcMode('standard');
    });
    navConv.addEventListener('click', () => switchTab('conv'));

    // Initialize tabs depending on screen size or just default to calc
    if (window.innerWidth <= 900) {
        switchTab('calc'); // start with calc on small screens
    } else {
        // Desktop can show both or follow tabs. As user requested, we enable tab switching.
        // Let's enforce tab switching everywhere for clear navigation.
        switchTab('calc');
    }

    // ---- Calculator Logic ----
    let currentInput = "0";
    let previousInput = "";
    let operator = null;
    let waitingForNext = false;
    let equationHistory = "";

    const displayMain = document.getElementById('calc-display');
    const displayHistory = document.getElementById('calc-history');
    const miniTerminal = document.getElementById('mini-terminal');

    function logTerminal(msg) {
        if (!miniTerminal) return;
        const line = document.createElement('div');
        line.textContent = `> ${msg}`;
        miniTerminal.appendChild(line);
        if (miniTerminal.childElementCount > 3) miniTerminal.firstChild.remove();
    }

    function triggerFade(element) {
        element.classList.remove('fading');
        void element.offsetWidth; 
        element.classList.add('fading');
    }
    
    function scrambleText(element, finalValue, duration = 200) {
        const charset = "0123456789!X?";
        let start = null;
        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            if (progress < duration) {
                element.value = finalValue.split('').map(c => Math.random() < 0.5 ? charset[Math.floor(Math.random() * charset.length)] : c).join('');
                requestAnimationFrame(step);
            } else {
                element.value = finalValue;
                triggerFade(element);
            }
        }
        requestAnimationFrame(step);
    }

    function updateDisplay(fast = false) {
        let finalVal = "ERR";
        if (currentInput !== "Error" && currentInput !== "NaN" && currentInput !== "Infinity") {
             let parts = currentInput.split('.');
             parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
             finalVal = parts.join('.');
        }
        
        if (!fast && finalVal !== displayMain.value) {
            scrambleText(displayMain, finalVal);
        } else {
            displayMain.value = finalVal;
        }
        
        displayHistory.textContent = equationHistory;
    }

    function inputNumber(num) {
        if (waitingForNext) {
            currentInput = num;
            waitingForNext = false;
            logTerminal(`IN: ${num}`);
        } else {
            if (currentInput === "0") currentInput = num;
            else if (currentInput.replace('.','').length < 12) currentInput += num;
        }
        updateDisplay(true);
    }

    function inputDecimal() {
        if (waitingForNext) {
            currentInput = "0.";
            waitingForNext = false;
        } else if (!currentInput.includes(".")) {
            currentInput += ".";
        }
        updateDisplay();
    }

    function handleOperator(op) {
        if (currentInput === "Error") return;

        if (operator && !waitingForNext) {
            calculate(false);
        } else {
            previousInput = currentInput;
        }

        operator = op;
        equationHistory = `${previousInput} ${operator}`;
        waitingForNext = true;
        updateDisplay();
    }

    function calculate(final = true) {
        if (!operator || !previousInput) return;
        
        const prev = parseFloat(previousInput);
        const curr = parseFloat(currentInput);

        if (isNaN(prev) || isNaN(curr)) {
            currentInput = "Error";
            operator = null;
            equationHistory = "";
            updateDisplay();
            return;
        }

        let result = 0;
        switch (operator) {
            case "+": result = prev + curr; break;
            case "-": result = prev - curr; break;
            case "×": result = prev * curr; break;
            case "÷": 
                if (curr === 0) { currentInput = "Error"; operator = null; equationHistory = ""; updateDisplay(); return; }
                result = prev / curr; 
                break;
            case "^": result = Math.pow(prev, curr); break;
        }

        equationHistory = final ? `${prev} ${operator} ${curr} =` : `${result} ${operator}`;
        currentInput = String(Math.round(result * 100000000) / 100000000); // precision
        
        if (final) {
            // Push to Smart History Tape
            pushToSmartHistory(`${prev} ${operator} ${curr}`, currentInput);
            
            operator = null;
            previousInput = "";
            logTerminal(`COMPUTED`);
        } else {
            previousInput = currentInput;
        }
        
        waitingForNext = true;
        updateDisplay(false); // Enable scramble on final result
    }

    // ---- Mode Switching Logic ----
    const modeBtns = document.querySelectorAll('.mode-btn');
    const modeViews = {
        standard: document.getElementById('view-standard'),
        scientific: document.getElementById('view-scientific'),
        developer: document.getElementById('view-developer')
    };
    
    let currentCalcMode = 'standard';

    function switchCalcMode(mode) {
        if(!mode) return;
        currentCalcMode = mode;
        switchTab('calc'); // Force tab switch
        
        modeBtns.forEach(btn => btn.classList.remove('active'));
        const matchingBtns = document.querySelectorAll(`[data-mode="${mode}"]`);
        matchingBtns.forEach(btn => btn.classList.add('active'));
        
        const dropdown = document.getElementById('modes-dropdown');
        if (dropdown) dropdown.classList.remove('show');
        
        Object.values(modeViews).forEach(view => view.classList.remove('active'));
        modeViews[mode].classList.add('active');
        
        if(mode === 'standard') { displayMain.style.fontSize = ''; }
        if(mode === 'scientific') { displayMain.style.fontSize = ''; }
        
        const mainDisplayBox = document.querySelector('.display-box');
        
        // Developer mode handles its own inputs, hide main display box entirely
        if(mode === 'developer') {
            if(mainDisplayBox) mainDisplayBox.style.display = 'none';
        } else {
            if(mainDisplayBox) mainDisplayBox.style.display = 'flex';
            updateDisplay(true); // recover value
        }
    }
    
    modeBtns.forEach(btn => btn.addEventListener('click', (e) => switchCalcMode(e.currentTarget.dataset.mode)));

    // Mobile Modes Dropdown Logic
    const modesToggle = document.getElementById('nav-modes-toggle');
    const modesDropdown = document.getElementById('modes-dropdown');
    
    if (modesToggle && modesDropdown) {
        modesToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            modesDropdown.classList.toggle('show');
            
            // Micro-animation click
            modesToggle.style.transform = 'scale(0.95)';
            setTimeout(() => modesToggle.style.transform = '', 100);
        });
        
        document.addEventListener('click', (e) => {
            if (!modesDropdown.contains(e.target) && e.target !== modesToggle) {
                modesDropdown.classList.remove('show');
            }
        });
    }

    // Key presses (Numbers & Operators)
    document.querySelectorAll('.k-num, .k-sci, .k-dev-hex').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = currentCalcMode;
            const val = e.target.dataset.val || e.target.dataset.sci;
            
            if(mode === 'developer') {
                handleDevKeyInput(val);
                return;
            }

            if (val === "sin" || val === "cos" || val === "tan" || val === "log" || val === "ln" || val === "√" || val === "x²" || val === "x³" || val === "x^y" || val === "π" || val === "e" || val === "(" || val === ")") {
                handleScientificInput(val);
            } else if (val === ".") {
                inputDecimal();
            } else {
                inputNumber(val);
            }
        });
    });

    document.querySelectorAll('.k-op').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = currentCalcMode;
            if (mode === 'developer') return;
            handleOperator(e.target.dataset.op);
        });
    });
    
    // Clear Keys
    document.querySelectorAll('.k-accent-red').forEach(btn => {
        btn.addEventListener('click', () => {
            currentInput = "0"; previousInput = ""; operator = null; equationHistory = ""; waitingForNext = false; 
            updateDisplay();
            
            // Wipe dev bases
            devHex.value = ""; devDec.value = ""; devOct.value = ""; devBin.value = "";
            devActiveInput.value = "0";
        });
    });

    // Equals Keys
    document.querySelectorAll('.k-equals').forEach(btn => {
        btn.addEventListener('click', () => { calculate(true); });
    });

    // Toggle Sign
    document.querySelectorAll('[data-action^="toggle-sign"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentInput !== "0" && currentInput !== "Error") {
                currentInput = String(parseFloat(currentInput) * -1);
                updateDisplay();
            }
        });
    });

    // Backspace
    document.querySelectorAll('[data-action^="backspace"]').forEach(btn => {
        btn.addEventListener('click', () => {
             const mode = currentCalcMode;
             if (mode === 'developer') {
                 let val = devActiveInput.value;
                 devActiveInput.value = val.slice(0, -1) || "0";
                 syncDevBases(devActiveInput);
                 return;
             }
        
            if (!waitingForNext && currentInput !== "Error") {
                currentInput = currentInput.slice(0, -1) || "0";
                if (currentInput === "-" || currentInput === "-0") currentInput = "0";
                updateDisplay();
            }
        });
    });
    
    document.querySelectorAll('[data-action^="percent"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentInput !== "Error") {
                currentInput = String(parseFloat(currentInput) / 100);
                updateDisplay();
            }
        });
    });

    // ---- Scientific Logic ----
    function handleScientificInput(fn) {
        let val = parseFloat(currentInput);
        if (isNaN(val) && fn !== "π" && fn !== "e") return;

        let result = 0;
        let histStr = "";
        
        switch(fn) {
            case "sin": result = Math.sin(val); histStr = `sin(${val})`; break;
            case "cos": result = Math.cos(val); histStr = `cos(${val})`; break;
            case "tan": result = Math.tan(val); histStr = `tan(${val})`; break;
            case "log": result = Math.log10(val); histStr = `log(${val})`; break;
            case "ln": result = Math.log(val); histStr = `ln(${val})`; break;
            case "√": result = Math.sqrt(val); histStr = `√(${val})`; break;
            case "x²": result = Math.pow(val, 2); histStr = `${val}²`; break;
            case "x³": result = Math.pow(val, 3); histStr = `${val}³`; break;
            case "π": result = Math.PI; histStr = "π"; break;
            case "e": result = Math.E; histStr = "e"; break;
            case "x^y": handleOperator("^"); return;
            default: return;
        }

        currentInput = String(Math.round(result * 100000000) / 100000000);
        equationHistory = histStr + " =";
        waitingForNext = true;
        updateDisplay();
        pushToSmartHistory(histStr, currentInput);
    }
    
    // Add ^ (pow) to calculate logic implicitly if needed (fallback handled)

    // ---- Developer Logic ----
    const devHex = document.getElementById('dev-hex');
    const devDec = document.getElementById('dev-dec');
    const devOct = document.getElementById('dev-oct');
    const devBin = document.getElementById('dev-bin');
    let devActiveInput = devDec;
    let devActiveBase = 10;
    
    document.querySelectorAll('.base-row label').forEach(lbl => {
        lbl.addEventListener('click', (e) => {
            document.querySelectorAll('.base-input').forEach(inp => inp.classList.remove('active-base'));
            const row = e.target.closest('.base-row');
            devActiveInput = row.querySelector('.base-input');
            devActiveInput.classList.add('active-base');
            
            const btnType = e.target.textContent;
            if(btnType === 'HEX') devActiveBase = 16;
            if(btnType === 'DEC') devActiveBase = 10;
            if(btnType === 'OCT') devActiveBase = 8;
            if(btnType === 'BIN') devActiveBase = 2;
        });
    });

    document.querySelectorAll('.base-input').forEach(inp => {
        inp.addEventListener('input', (e) => syncDevBases(e.target));
    });

    function handleDevKeyInput(val) {
        if(devActiveInput.value === "0") devActiveInput.value = val;
        else devActiveInput.value += val;
        syncDevBases(devActiveInput);
    }

    function syncDevBases(sourceInp) {
        let rawVal = sourceInp.value;
        if (!rawVal) {
            devHex.value = ""; devDec.value = ""; devOct.value = ""; devBin.value = "";
            return;
        }
        
        let decVal = 0;
        try {
            if (sourceInp === devHex) decVal = parseInt(rawVal, 16);
            if (sourceInp === devDec) decVal = parseInt(rawVal, 10);
            if (sourceInp === devOct) decVal = parseInt(rawVal, 8);
            if (sourceInp === devBin) decVal = parseInt(rawVal, 2);
        } catch(e) {}
        
        if(isNaN(decVal)) { decVal = 0; }
        
        if (sourceInp !== devHex) devHex.value = decVal.toString(16).toUpperCase();
        if (sourceInp !== devDec) devDec.value = decVal.toString(10);
        if (sourceInp !== devOct) devOct.value = decVal.toString(8);
        if (sourceInp !== devBin) devBin.value = decVal.toString(2);
    }

    document.getElementById('calc-copy').addEventListener('click', () => copyToClipboard(currentInput));
    document.getElementById('calc-paste').addEventListener('click', async () => {
        const text = await pasteFromClipboard();
        if (text) {
            let parsed = parseFloat(text.replace(/[^0-9.-]/g, ''));
            if (!isNaN(parsed)) {
                currentInput = String(Math.abs(parsed)); // Keep it clean
                waitingForNext = true;
                updateDisplay();
            }
        }
    });

    // ---- Converter / FX Module ----
    const usdInput = document.getElementById('usd-input');
    const lkrOutput = document.getElementById('lkr-output');
    const rateDisplay = document.getElementById('rate-display');
    const syncTimeLabel = document.getElementById('sync-time');
    const historyList = document.getElementById('conversion-history-list');
    const liveSwitch = document.getElementById('live-rate-switch');
    const swapBtn = document.getElementById('swap-btn');
    
    const fxSource = document.getElementById('fx-source');
    const fxTarget = document.getElementById('fx-target');

    let exchangeRates = {};
    let liveRateEnabled = true;
    let lastSync = null;
    let logs = []; // store history

    function updateTimeLabel() {
        if (!lastSync) return;
        const diff = Math.floor((Date.now() - lastSync) / 60000);
        if (diff < 1) syncTimeLabel.textContent = "SYNC: JUST NOW";
        else syncTimeLabel.textContent = `SYNC: ${diff}M AGO`;
    }
    setInterval(updateTimeLabel, 60000);

    async function fetchExchangeRate() {
        try {
            const res = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await res.json();
            if (data && data.rates) {
                exchangeRates = data.rates;
                
                // Populate dropdowns only if empty
                if (fxSource.options.length === 0) {
                    const mainCurrencies = ['USD', 'LKR', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'JPY', 'INR', 'AED'];
                    
                    mainCurrencies.forEach(currency => {
                        if(exchangeRates[currency]) {
                            let opt1 = document.createElement('option');
                            opt1.value = currency; opt1.textContent = currency;
                            fxSource.appendChild(opt1);
                            
                            let opt2 = document.createElement('option');
                            opt2.value = currency; opt2.textContent = currency;
                            fxTarget.appendChild(opt2);
                        }
                    });
                    fxSource.value = 'USD';
                    fxTarget.value = 'LKR';
                }

                lastSync = Date.now();
                updateTimeLabel();
                updateRateUI();
                if (liveRateEnabled) performConversion(true);
            }
        } catch (err) {
            console.error(err);
        }
    }

    function updateRateUI() {
        if (!exchangeRates[fxSource.value] || !exchangeRates[fxTarget.value]) return;
        let sRate = exchangeRates[fxSource.value];
        let tRate = exchangeRates[fxTarget.value];
        
        let multiplier = tRate / sRate;
        rateDisplay.textContent = `1 ${fxSource.value} = ${multiplier.toFixed(4)} ${fxTarget.value}`;
    }

    function performConversion(logIt = true) {
        let val = parseFloat(usdInput.value);
        if (isNaN(val) || !exchangeRates[fxSource.value]) { lkrOutput.value = ""; return; }

        let sRate = exchangeRates[fxSource.value];
        let tRate = exchangeRates[fxTarget.value];
        
        // Convert to base (USD), then to target
        let result = (val / sRate) * tRate;
        
        let parts = result.toFixed(2).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        lkrOutput.value = parts.join('.');
        triggerFade(lkrOutput);
        
        if (logIt && usdInput.value !== "" && usdInput.value !== "0") {
             logConversion();
        }
    }

    function addLogEntry(inputStr, outputStr) {
        logs.unshift({ time: new Date().toLocaleTimeString(), in: inputStr, out: outputStr });
        if (logs.length > 10) logs.pop();
        
        historyList.innerHTML = logs.map((log, i) => `
            <li class="log-item ${i===0?'latest':''}">
                <div><span class="log-val">${log.in} → ${log.out}</span></div>
                <div class="log-time">${log.time}</div>
            </li>
        `).join('');
    }
    
    function logConversion() {
        let inStr = `${usdInput.value} ${fxSource.value}`;
        let outStr = `${lkrOutput.value} ${fxTarget.value}`;
        addLogEntry(inStr, outStr);
    }

    usdInput.addEventListener('input', () => { if(liveRateEnabled) performConversion(false); });
    usdInput.addEventListener('change', () => { 
        if(usdInput.value) { logConversion(); }
    });
    
    function animateSelect(selectElem) {
        selectElem.style.animation = 'none';
        void selectElem.offsetWidth;
        selectElem.style.animation = 'popClick 0.2s cubic-bezier(0.165, 0.84, 0.44, 1)';
    }

    fxSource.addEventListener('change', () => { animateSelect(fxSource); updateRateUI(); if(usdInput.value) performConversion(true); });
    fxTarget.addEventListener('change', () => { animateSelect(fxTarget); updateRateUI(); if(usdInput.value) performConversion(true); });

    liveSwitch.addEventListener('change', (e) => {
        liveRateEnabled = e.target.checked;
        if(liveRateEnabled) performConversion(true);
    });

    swapBtn.addEventListener('click', () => {
        let temp = fxSource.value;
        fxSource.value = fxTarget.value;
        fxTarget.value = temp;
        
        updateRateUI();
        usdInput.value = lkrOutput.value.replace(/,/g, '');
        performConversion(true);
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        // Prevent typing default if focused on inputs
        if(document.activeElement === usdInput || document.activeElement === lkrOutput) return;

        const key = e.key;
        if (/[0-9]/.test(key)) { e.preventDefault(); inputNumber(key); }
        if (key === '.') { e.preventDefault(); inputDecimal(); }
        if (key === 'Escape') { e.preventDefault(); document.querySelector('[data-action="clear"]').click(); }
        if (key === 'Enter' || key === '=') { e.preventDefault(); calculate(true); }
        if (key === 'Backspace') {
            e.preventDefault();
            if (!waitingForNext && currentInput !== "Error") {
                currentInput = currentInput.slice(0, -1) || "0";
                updateDisplay();
            }
        }
        if (key === '+' || key === '-') { e.preventDefault(); handleOperator(key); }
        if (key === '*') { e.preventDefault(); handleOperator('×'); }
        if (key === '/') { e.preventDefault(); handleOperator('÷'); }
    });

    // Init
    fetchExchangeRate();

    // ---- Settings Overlay Logic ----
    const settingsOverlay = document.getElementById('settings-overlay');
    const utilityOverlay = document.getElementById('utility-overlay');
    
    document.querySelector('.icon-btn[title="Settings"]').addEventListener('click', () => {
        settingsOverlay.classList.remove('hidden');
    });
    
    document.getElementById('btn-open-utility').addEventListener('click', () => {
        utilityOverlay.classList.remove('hidden');
    });
    
    document.getElementById('btn-close-settings').addEventListener('click', () => settingsOverlay.classList.add('hidden'));
    document.getElementById('btn-close-utility').addEventListener('click', () => utilityOverlay.classList.add('hidden'));
    
    [settingsOverlay, utilityOverlay].forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.add('hidden');
        });
    });

    // ---- Utility: Smart Data Tape ----
    const smartHistoryList = document.getElementById('smart-history-list');
    let tapeHistory = [];
    
    function pushToSmartHistory(equation, result) {
        tapeHistory.unshift({ eq: equation, res: result });
        if (tapeHistory.length > 50) tapeHistory.pop();
        renderSmartHistory();
    }
    
    function renderSmartHistory() {
        smartHistoryList.innerHTML = tapeHistory.map((item, index) => `
            <div class="tape-item" style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); animation: numberFadeIn 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);">
                <div style="font-family: monospace; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 4px;">${item.eq}</div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color: var(--accent-blue); font-size: 1.1rem; font-weight: 600; text-shadow: 0 0 10px rgba(0,243,255,0.2);">${item.res}</span>
                    <button class="btn-copy-tape" data-res="${item.res}" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer;">📋</button>
                </div>
            </div>
        `).join('');
        
        document.querySelectorAll('.btn-copy-tape').forEach(btn => {
            btn.addEventListener('click', (e) => copyToClipboard(e.target.dataset.res));
        });
    }
    
    document.getElementById('btn-clear-history').addEventListener('click', () => {
        tapeHistory = [];
        renderSmartHistory();
        showToast("LOG WIPED");
    });

    // ---- Utility: Quick Converter ----
    const bytesInput = document.getElementById('bytes-input');
    const dataReadout = document.getElementById('data-readout');
    bytesInput.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        if(isNaN(val)) { dataReadout.innerHTML = "KB: 0 <br> MB: 0 <br> GB: 0"; return; }
        
        let kb = (val / 1024).toFixed(2);
        let mb = (val / 1048576).toFixed(4);
        let gb = (val / 1073741824).toFixed(6);
        dataReadout.innerHTML = `KB: ${kb} <br> MB: ${mb} <br> GB: ${gb}`;
    });
    
    const pxInput = document.getElementById('px-input');
    const remOutput = document.getElementById('rem-output');
    pxInput.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        if(isNaN(val)) { remOutput.value = ""; return; }
        remOutput.value = (val / 16).toFixed(3);
    });

    // Theme Customization
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
    }
    
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const newColor = this.getAttribute('data-color');
            const rgbColor = hexToRgb(newColor);
            
            document.documentElement.style.setProperty('--accent-lime', newColor);
            if (rgbColor) {
                document.documentElement.style.setProperty('--accent-lime-rgb', rgbColor);
            }
            
            // Re-trigger animation on equals button for visual feedback
            const equalsBtn = document.querySelector('.k-equals');
            equalsBtn.style.animation = 'none';
            void equalsBtn.offsetWidth;
            equalsBtn.style.animation = 'slowPulse 3s cubic-bezier(0.165, 0.84, 0.44, 1) infinite';
        });
    });
    
    // Custom toggle switches micro-animations
    document.querySelectorAll('.switch input[type="checkbox"]').forEach(toggle => {
        toggle.addEventListener('change', function() {
            const slider = this.nextElementSibling;
            slider.style.transform = 'scale(0.95)';
            setTimeout(() => slider.style.transform = 'scale(1)', 150);
        });
    });
});
