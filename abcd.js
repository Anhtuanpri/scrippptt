// ==UserScript==
    // @name          HH3D - Menu - Full 1.2.10.2
    // @namespace     Tampermonkey
    // @version       1.2.10.2
    // @description   Custom menu
    // @author       Further developed by Who knows, knows - Tiên Tộc
    // @include      *://hoathinh3d.bz*/*
    // @exclude      *://hoathinh3d.bz/khoang-mach*
    // @run-at        document-start
    // @grant         GM_xmlhttpRequest
    // @connect       raw.githubusercontent.com
    // ==/UserScript==
    (async function() {
        'use strict';

        console.log('%c[HH3D Script] Tải thành công. Đang khởi tạo UI tùy chỉnh.',
        'background: #222; color: #bada55; padding: 2px 5px; border-radius: 3px;');

        // ===============================================
        // HÀM TIỆN ÍCH CHUNG
        // ===============================================
        const weburl = window.location.origin.replace(/\/+$/, '') + '/';
        const baseUrl = "https://raw.githubusercontent.com";
        const repoPath = "/shinylee1205/Anonymous";
        const branch = "/refs/heads/main";
        //const WebUrlfileName = "/WebURL.json";
        //const Weblink = baseUrl + repoPath + branch + WebUrlfileName;
        // const Webresponse = await fetch(Weblink);
        // const weburl = (await Webresponse.text()).trim();

        // lấy chuỗi và bỏ khoảng trắng thừa

        const ajaxUrl = weburl + 'wp-content/themes/halimmovies-child/hh3d-ajax.php';
        let questionDataCache = null;
        let isCssInjected = false;
        let userBetCount = 0;
        let userBetStones = [];

        // Chỉ override khi đang ở trang Khoáng Mạch
    if (location.pathname.includes('khoang-mach') || location.href.includes('khoang-mach')) {
        const fastAttack = localStorage.getItem('khoangmach_fast_attack') === 'true';
        if (fastAttack) {
            const NEW_DELAY = 50;
            const originalSetInterval = window.setInterval;
            window.setInterval = function(callback, delay, ...args) {
                let actualDelay = delay;
                if (typeof callback === 'function' && callback.toString().includes('countdown--') &&
                        callback.toString().includes('clearInterval(countdownInterval)') &&
                        callback.toString().includes('executeAttack')){
                    actualDelay = NEW_DELAY
                    showNotification('Không được đánh đến khi hết thông báo này', 'error', 5500);
                }
            return originalSetInterval(callback, actualDelay, ...args);
            };
        }
    }
        // Cấu trúc menu
        const LINK_GROUPS = [
            {
            name: 'Autorun',
            links: [
                    {
                text: 'Autorun',
                isAutorun: true
                    }
                ]
            },
            {
            name: 'Điểm danh, Tế lễ, Vấn đáp',
            links: [
                    {
                text: 'Điểm danh - Tế lễ - Vấn đáp',
                isDiemDanh: true
                    }
                ]
            },
            {
            name: 'Hoang Vực, Thí Luyện, Phúc Lợi, Bí Cảnh',
            links: [
                    {
                text: 'Hoang Vực',
                isHoangVuc: true
                    },
                    {
                text: 'Thí Luyện',
                isThiLuyen: true
                    },
                    {
                text: 'Phúc Lợi',
                isPhucLoi: true
                    },
                    {
                text: 'Bí Cảnh',
                isBiCanh: true
                    }
                ]
            },
            {
            name: 'Luận Võ',
            links: [
                    {
                text: 'Luận Võ',
                isLuanVo: true
                    }
                ]
            },
            {
            name: 'Khoáng mạch',
            links: [
                    {
                text: 'Khoáng Mạch',
                isKhoangMach: true
                    }
                ]
            },
            {
            name: 'Bảng hoạt động ngày',
            links: [
                    {
                text: 'Bảng hoạt động ngày',
                url: weburl + 'bang-hoat-dong-ngay?t'
                    },
                ]
            },
            {
            name: 'Đổ Thạch',
            links: [
                    {
                text: 'Đổ Thạch',
                isDiceRoll: true
                    }
                ]
            },
            {
        name: 'Tặng hoa',
        links: [
                    {
            text: 'Tặng hoa',
            isTangHoa: true
                    }
                ]
            },
            {
        name: 'Mua rương',
        links: [
                    {
            text: 'Rương Linh Bảo',
            isMuaRuong: true
                    }
                ]
            },
            {
        name: 'Khắc Trận',
        links: [
                    {
            text: 'Khắc Trận Văn',
            isKhacTran: true
                    }
                ]
            },
            {
        name: 'Mua đan',
        links: [
                    {
            text: 'Mua đan hàng tháng',
            isMuaDan: true
                    }
                ]
            },
        ];

        function addStyle(css) {
            const style = document.createElement('style');
            style.type = 'text/css';
            style.appendChild(document.createTextNode(css));
            document.head.appendChild(style);
        }

     // ===== Khoáng Mạch-only UI addons =====
     addStyle(`
       .km-punch-btn{
         background:#e74c3c;color:#fff;border:none;
         width:28px;height:28px;border-radius:6px;
         cursor:pointer;display:inline-flex;align-items:center;justify-content:center;
         font-weight:700;
       }
       .km-punch-btn:hover{filter:brightness(1.05);}
     `);


   async function speak(textVN, textEN) {
        console.log("[TTS] Bắt đầu khởi tạo speak()");
        await new Promise(r => setTimeout(r, 300)); // đợi hệ thống load voice
        let voices = speechSynthesis.getVoices();
        if (!voices.length) {
        console.log("[TTS] Chưa có voice, chờ event voiceschanged...");
        await new Promise(res => {
            const onChange = () => {
            voices = speechSynthesis.getVoices();
            if (voices.length) {
                speechSynthesis.removeEventListener("voiceschanged", onChange);
                res();
            }
            };
            speechSynthesis.addEventListener("voiceschanged", onChange);
        });
        }

        voices = speechSynthesis.getVoices();
        console.log(`[TTS] Tổng số voice: ${voices.length}`);
        voices.forEach(v => console.log(`[VOICE] ${v.name} | ${v.lang}`));

        let voice = voices.find(v => /vi[-_]?VN/i.test(v.lang));
        let lang = "vi-VN";
        let text = textVN;

        if (!voice) {
        console.log("[TTS] Không có voice tiếng Việt, dùng tiếng Anh");
        voice = voices.find(v => /en[-_]?US/i.test(v.lang)) || voices[0];
        lang = "en-US";
        text = textEN;
        }

        if (!voice) return console.error("[TTS] ❌ Không tìm thấy voice khả dụng");

        const u = new SpeechSynthesisUtterance(text);
        u.voice = voice;
        u.lang = lang;
        u.rate = 0.8; // tốc độ nói
        u.onstart = () => console.log(`[TTS] ▶️ Bắt đầu đọc (${lang}): ${text}`);
        u.onend = () => console.log("[TTS] ✅ Hoàn tất đọc");
        u.onerror = e => console.error("[TTS] ❌ Lỗi:", e.error);

        speechSynthesis.cancel();
        speechSynthesis.speak(u);
    }



        /**
        * Lấy securityToken bằng cách fetch một URL (nếu có)
        * hoặc quét HTML của trang hiện tại (nếu không có URL).
        *
        * @param {string} [url] - (Tùy chọn) URL để fetch.
        * @returns {Promise<string|null>} - Một Promise sẽ resolve với token, hoặc null nếu thất bại.
        */

    async function getSecurityToken(url) {
        const logPrefix = "[SecurityTokenFetcher]";
        console.log(`${logPrefix} ▶️ Bắt đầu lấy security token từ ${url || 'trang hiện tại'}...`);
        let htmlContent = null;

        try {
            // 1. Lấy nội dung HTML (Fetch hoặc quét trang hiện tại)
            if (url) {
                const response = await fetch(url);
                if (!response.ok) return null;
                htmlContent = await response.text();
            } else {
                htmlContent = document.documentElement.outerHTML;
            }

            // 2. Quét Regex lấy Token mới
            const regex = /"securityToken"\s*:\s*"([^"]+)"/;
            const match = htmlContent.match(regex);

            if (match && match[1]) {
                const token = match[1];

                // 🔥 LOGIC MỚI: Kiểm tra xem URL yêu cầu có phải là trang hiện tại không
                // Nếu không truyền URL (!url) -> Mặc định là trang hiện tại
                // Nếu có URL -> Phải trùng khớp tuyệt đối với window.location.href
                const isCurrentPage = !url || (url === window.location.href);

                if (isCurrentPage) {
                    console.log(`${logPrefix} 🎯 URL trùng khớp trang hiện tại. Tiến hành cập nhật Global State...`);

                    // ============================================================
                    // 🔥 SỬA LỖI: CẬP NHẬT XUYÊN SANDBOX
                    // ============================================================

                    // Cách 1: Dùng unsafeWindow (Cách chuẩn của Tampermonkey)
                    if (typeof unsafeWindow !== 'undefined' && unsafeWindow.hh3dData) {
                        unsafeWindow.hh3dData.securityToken = token;
                        console.log(`${logPrefix} 🔓 Đã cập nhật hh3dData thông qua unsafeWindow.`);
                    }
                    // Cách 2: Fallback nếu không có unsafeWindow
                    else if (typeof window.hh3dData !== 'undefined') {
                        window.hh3dData.securityToken = token;
                        console.log(`${logPrefix} ⚠️ Đã cập nhật hh3dData qua window thường.`);
                    }

                    // Cách 3: "Tiêm thuốc" trực tiếp
                    try {
                        const script = document.createElement('script');
                        script.textContent = `
                            try {
                                if (typeof hh3dData !== 'undefined') {
                                    hh3dData.securityToken = "${token}";
                                    console.log('✅ [Inject] Token đã được cập nhật từ bên trong trang web.');
                                }
                            } catch(e) {}
                        `;
                        (document.head || document.body || document.documentElement).appendChild(script);
                        script.remove();
                    } catch (injectErr) {
                        console.warn(`${logPrefix} Lỗi tiêm script:`, injectErr);
                    }
                    // ============================================================
                } else {
                    //  - Token chỉ được trả về cho hàm gọi, không ảnh hưởng trang hiện tại
                    console.log(`${logPrefix} 🛑 Token lấy từ URL khác (${url}). KHÔNG cập nhật hh3dData của trang này.`);
                }

                return token;
            }
            return null;

        } catch (e) {
            console.error(`${logPrefix} ❌ Lỗi:`, e);
            return null;
        }
    }



//Lấy Nonce
    async function getNonce() {
        if (typeof customRestNonce !== 'undefined' && customRestNonce) {
            return customRestNonce;
        }

        const scripts = document.querySelectorAll('script');
        for (const script of scripts) {
            const match = script.innerHTML.match(/customRestNonce\s*=\s*'([a-f0-9]+)'/);
            if (match) {
                return match[1];
            }
        }

        try {
            const nonce = await getSecurityNonce(weburl + '?t', /customRestNonce\s*=\s*'([a-f0-9]+)'/);
            if (nonce) {
                return nonce;
            }
        } catch (error) {
            console.error("Failed to get security nonce", error);
        }

        return null;
    }


/**
        * Lấy security nonce một cách chung chung từ một URL.
        *
        * @param {string} url - URL của trang web cần lấy nonce.
        * @param {RegExp} regex - Biểu thức chính quy (regex) để tìm và trích xuất nonce.
        * @returns {Promise<string|null>} Trả về security nonce nếu tìm thấy, ngược lại trả về null.
        */


async function getSecurityNonce(url, regex) {
        // Sử dụng một tiền tố log cố định cho đơn giản
        const logPrefix = '[HH3D Auto]';

        console.log(`${logPrefix} ▶️ Đang tải trang từ ${url} để lấy security nonce...`);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();

            const match = html.match(regex);
            if (match && match[1]) {
                const nonce = match[1];
                console.log(`${logPrefix} ✅ Đã trích xuất thành công security nonce: ${nonce}`);
                return nonce;
            } else {
                console.error(`${logPrefix} ❌ Không tìm thấy security nonce trong mã nguồn.`);
                return null;
            }
        } catch (e) {
            console.error(`${logPrefix} ❌ Lỗi khi tải trang hoặc trích xuất nonce:`, e);
            return null;
        }
    }



    // Lấy ID tài khoản
    async function getAccountId() {
        const html = document.documentElement.innerHTML;
        const regexList = [
            /"user_id"\s*:\s*"(\d+)"/,       // "user_id":"123"
            /current_user_id\s*:\s*'(\d+)'/  // current_user_id: '123'
        ];

        // --- Thử lấy trực tiếp từ DOM ---
        for (const regex of regexList) {
            const match = html.match(regex);
            if (match) {
                console.log('Lấy account ID trực tiếp từ html');
                return match[1];
            }
        }

        // --- Fallback: thử fetch trang chính với từng regex ---
        for (const regex of regexList) {
            const id = await getSecurityNonce(weburl + '?t', regex);
            if (id) {
                console.log('Lấy account ID qua fetch fallback');
                return id;
            }
        }

        return null;
    }


// Lưu trữ trạng thái các hoạt động đã thực hiện
        class TaskTracker {
            constructor(storageKey = 'dailyTasks') {
                this.storageKey = storageKey;
                this.data = this.loadData();
                this.dothachTimeoutId = null;
    }
    // Tải dữ liệu từ localStorage
            loadData() {
                const storedData = localStorage.getItem(this.storageKey);
                return storedData ? JSON.parse(storedData) : {};
    }
    // Lưu dữ liệu vào localStorage
            saveData() {
                localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }
    /** Lấy thông tin của một tài khoản cụ thể và tự động cập nhật nếu sang ngày mới
                * @param {string} accountId - ID của tài khoản.
                * @return {object} Trả về dữ liệu tài khoản, bao gồm các nhiệm vụ và trạng thái.
                * Nếu tài khoản chưa có dữ liệu, nó sẽ tự động tạo mới và lưu vào localStorage.
                * Nếu ngày hôm nay đã được cập nhật, nó sẽ reset các nhiệm vụ cho ngày mới.
                * Nếu đã đến giờ chuyển sang lượt 2 của Đổ Thạch, nó sẽ tự động chuyển trạng thái.
            */
 getAccountData(accountId) {
                if (!this.data[accountId
        ]) {
                    this.data[accountId
            ] = {};
                    this.saveData();
        }

                const accountData = this.data[accountId
        ];
                const today = new Date().toLocaleDateString('vi-VN',
        {timeZone: 'Asia/Ho_Chi_Minh'
        });


                // Danh sách tất cả nhiệm vụ mặc định
                const defaultTasks = {
                    diemdanh: { done: false
            },
                    thiluyen: { done: false, nextTime: null
            },
                    bicanh: { done: false, nextTime: null
            },
                    phucloi: { done: false, nextTime: null
            },
                    hoangvuc: { done: false, nextTime: null
            },
                    dothach: { betplaced: false, reward_claimed: false, turn: 1
            },
                    luanvo: { battle_joined: false, auto_accept: false, done: false
            },
                    khoangmach: {done: false, nextTime: null
            },
                    tienduyen: {last_check: null
            },
                    hoatdongngay: {done: false
            },
                    luotkhactranvip: {done: false
            },
                    caunguyendaolu: {done: false
            }
        };

                if (accountData.lastUpdatedDate !== today) {
                    console.log(`[TaskTracker] Cập nhật dữ liệu ngày mới cho tài khoản: ${accountId}`);
                    accountData.lastUpdatedDate = today;
                    // Reset toàn bộ nhiệm vụ
                    Object.assign(accountData, defaultTasks);
                    this.saveData();
        } else {
            // Ngày chưa đổi → merge các nhiệm vụ mới
                    let updated = false;
                    for (const taskName in defaultTasks) {
                        if (!accountData[taskName
                ]) {
                            accountData[taskName
                    ] = defaultTasks[taskName
                    ];
                            updated = true;
                }
            }
                    if (updated) this.saveData();
        }
        // Xử lý Đổ Thạch lượt 2
                const now = new Date();
                    const hourInVN = parseInt(
                        new Date().toLocaleString('en-US',
        {
                            timeZone: 'Asia/Ho_Chi_Minh',
                            hour: 'numeric',
                            hour12: false
        }),
        10
                    );
                if (accountData.dothach.turn === 1 && hourInVN >= 16) {
                    accountData.dothach = {
                        betplaced: false,
                        reward_claimed: false,
                        turn: 2,
            };
                    this.saveData();
        }
        // Lên lịch tự động reset vào 16h hàng ngày nếu chưa có timer
                if (!this.dothachTimeoutId) {
                    const now = new Date();

                    // Tạo danh sách mốc reset theo thứ tự
                    const resetTimes = [
                        new Date(now.getFullYear(), now.getMonth(), now.getDate(),
                16,
                1,
                0,
                0), // 16h hôm nay
                        new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1,
                1,
                0,
                0,
                0) // 01h sáng mai
            ];

                    // Tìm mốc reset gần nhất so với hiện tại
                    let nextResetTime = resetTimes.find(t => t > now);
                    if (!nextResetTime) {
                // Nếu đã qua tất cả mốc → chọn 16h ngày mai
                        nextResetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1,
                16,
                0,
                0,
                0);
            }

                    const timeToWait = nextResetTime - now;

                    console.log(`[TaskTracker] Reset sau ${Math.floor(timeToWait / 1000 / 60)
            } phút.`);

                    this.dothachTimeoutId = setTimeout(() => {
                        this.getAccountData(accountId);
            }, timeToWait);
        }

                return accountData;
    }
    /**
            * Cập nhật một thuộc tính cụ thể của một nhiệm vụ.
            * @param {string} accountId - ID của tài khoản.
            * @param {string} taskName - Tên nhiệm vụ (ví dụ: 'dothach').
            * @param {string} key - Tên thuộc tính cần cập nhật (ví dụ: 'betplaced').
            * @param {*} value - Giá trị mới cho thuộc tính.
            */
            updateTask(accountId, taskName, key, value) {
                const accountData = this.getAccountData(accountId);
                if (accountData[taskName
        ]) {
                    accountData[taskName
            ][key
            ] = value;
                    this.saveData();
        } else {
                    console.error(`[TaskTracker] Nhiệm vụ "${taskName}" không tồn tại cho tài khoản "${accountId}"`);
        }
    }
    /** Lấy thông tin task
            * @param {string} accountId - ID của tài khoản.
            * @param {string} taskName - Tên nhiệm vụ: 'diemdanh', 'thiluyen', 'bicanh', 'phucloi', 'hoangvuc'.
            * @return {object|null} Trả về đối tượng nhiệm vụ hoặc null nếu không tồn tại.
            * Ví dụ:  getTaskStatus('123', 'luanvo').battle_joined => 'true'
            */
            getTaskStatus(accountId, taskName) {
                const accountData = this.getAccountData(accountId);
                return accountData[taskName] || null;
    }
    /**
            * Kiểm tra xem một nhiệm vụ đã hoàn thành hay chưa
            * @param {string} accountId - ID của tài khoản.
            * @param {string} taskName - Tên nhiệm vụ: 'diemdanh', 'thiluyen', 'bicanh', 'phucloi', 'hoangvuc'.
            * @return {boolean} Trả về `true` nếu nhiệm vụ đã hoàn thành, ngược lại là `false`.
            */
            isTaskDone(accountId, taskName) {
                const accountData = this.getAccountData(accountId);
                return accountData[taskName] && accountData[taskName
        ].done;
    }
    /**
            * Đánh dấu một nhiệm vụ là đã hoàn thành
            * @param {string} accountId - ID của tài khoản.
            * @param {string} taskName - Tên nhiệm vụ: 'diemdanh', 'thiluyen', 'bicanh', 'phucloi', 'hoangvuc'.
            * @return {void}
            */
            markTaskDone(accountId, taskName) {
                const accountData = this.getAccountData(accountId);
                if (accountData[taskName]) {
                    accountData[taskName].done = true;
                    this.saveData();
        } else {
                    console.error(`[TaskTracker] Nhiệm vụ "${taskName}" không tồn tại cho tài khoản "${accountId}"`);
        }
    }
    /**
            * Điều chỉnh thời gian của một nhiệm vụ
            * @param {string} accountId - ID của tài khoản.
            * @param {string} taskName - Tên nhiệm vụ: 'thiluyen', 'bicanh', 'phucloi', 'hoangvuc'.
            * @param {string} newTime - Thời gian mới theo định dạng timestamp.
            * @return {void}
            */
            adjustTaskTime(accountId, taskName, newTime) {
        //console.log(`[TaskTracker] adjustTaskTime called for ${taskName}, newTime=`, newTime, "stack=", new Error().stack);
                const accountData = this.getAccountData(accountId);
                if (accountData[taskName]) {
                    accountData[taskName].nextTime = newTime;
                    this.saveData();
        } else {
                    console.error(`[TaskTracker] Nhiệm vụ "${taskName}" không tồn tại cho tài khoản "${accountId}"`);
        }
    }

            getNextTime(accountId, taskName) {
                const accountData = this.getAccountData(accountId);
                const ts = accountData[taskName]?.nextTime;
                if (!ts || ts === "null") {
                    return null; // chưa có thời gian
        }
                const date = new Date(Number(ts));
                return isNaN(date.getTime()) ? null : date;
    }
    /** Return dạng Date */
            getLastCheckTienDuyen(accountId) {
                const accountData = this.getTaskStatus(accountId, 'tienduyen');
                const timestamp = Number(accountData.last_check); // Chuyển chuỗi miligiây thành số
                return new Date(timestamp); // Tạo đối tượng Date
    }
    /** Lấy cả timstamp dạng string hay Date đều được */
            setLastCheckTienDuyen(accountId, timestamp) {
                let finalTimestamp = timestamp; // Khởi tạo biến lưu giá trị cuối cùng
                // Kiểm tra nếu timestamp là một đối tượng Date
                if (timestamp instanceof Date) {
                    finalTimestamp = timestamp.getTime(); // Lấy giá trị timestamp dạng số
        }
                this.updateTask(accountId, 'tienduyen', 'last_check', finalTimestamp);
    }
}
/**
        * Cộng thêm phút và giây vào thời điểm hiện tại và trả về một đối tượng Date mới.
        * @param {string} timeString - Chuỗi thời gian định dạng "mm:ss" (phút:giây).
        * @returns {Date} - String dạng timestamp cho thời gian được cộng thêm
        */

    function timePlus(timeString) {
        const now = new Date();
        const [minutes, seconds] = timeString.split(':').map(Number);
        const millisecondsToAdd = (minutes * 60 + seconds) * 1000;
        return now.getTime() + millisecondsToAdd;
        }



        /* ===== Update Profile Info ===== */
async function loadHH3DProfile() {
  // Avatar + Tên
  const avatarBox = document.querySelector(".avatar-container-header")?.outerHTML
    || `<div style="width:36px;height:36px;background:#333;border-radius:50%;"></div>`;
  const nameHtml = document.querySelector("#ch_head_name")?.innerHTML.trim() || "Tên NV ?";
  const statsHtml = [...document.querySelectorAll("#head_manage_acc div")].map(e => e.outerHTML);

  // Avatar - Muốn hiển thị thì bật lại
//   document.getElementById("profile-avatar").innerHTML = avatarBox;
//   const avatar = document.querySelector("#profile-avatar .avatar-container-header");
//   if (avatar) {
//     avatar.style.width = "36px";
//     avatar.style.height = "36px";
//     avatar.style.display = "inline-block";
//   }

  // Gán tên
  document.getElementById("profile-name").innerHTML = nameHtml;

  // Stats (giữ nguyên format gốc bằng outerHTML)
  document.getElementById("profile-tuvi").innerHTML =
    statsHtml.find(t => t.includes("Tu Vi")) || `<div>✨ Tu Vi: ?</div>`;
  document.getElementById("profile-thach").innerHTML =
    statsHtml.find(t => t.includes("Tinh Thạch")) || `<div>💎 Tinh Thạch: ?</div>`;
  document.getElementById("profile-ngoc").innerHTML =
    statsHtml.find(t => t.includes("Tiên Ngọc")) || `<div>🔮 Tiên Ngọc: ?</div>`;

  // Xu
try {
  const res = await fetch("/vip-hh3d", { credentials: "include" });
  const html = await res.text();
  //console.log("HTML /vip-hh3d:", html); // log toàn bộ HTML trả về

  const xuMatch = html.match(/id="current-coins">([\d.,]+)/); // bắt cả số có dấu . hoặc ,
  const xukhoaMatch = html.match(/id="current-coins-locked">([\d.,]+)/);

  //console.log("xuMatch:", xuMatch);
  //console.log("xukhoaMatch:", xukhoaMatch);

  const xu = xuMatch ? xuMatch[1] : "?";
  const xukhoa = xukhoaMatch ? xukhoaMatch[1] : "?";

  //console.log("Parsed Xu:", xu);
  //console.log("Parsed Xu Khóa:", xukhoa);

  document.getElementById("xu-info").innerHTML = `
    <div>🪙 Xu: ${xu}</div>
    <div>🔒 Xu Khóa: ${xukhoa}</div>
  `;
} catch (e) {
  console.error("Error fetching Xu:", e);
}



  // Tiến độ
  try {
    const html = await (await fetch("/bang-hoat-dong-ngay", { credentials: "include" })).text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const fill = doc.querySelector(".reward-progress-fill");
    if (fill) {
      const percent = fill.style.width || "0%";
      document.getElementById("reward-progress-wrap").innerHTML = `
        <div style="font-size:12px;margin-bottom:4px;color:#ccc;">
          Hoạt động <span style="float:right;">${percent}</span>
        </div>
        <div style="width:100%;height:6px;background:#2a2a2a;border-radius:999px;overflow:hidden;">
          <div style="width:${percent};height:100%;border-radius:999px;
            background:linear-gradient(90deg,#ff4ecd,#b84cff);
            box-shadow:0 0 6px rgba(255,78,205,.6);
            transition:width .4s ease;">
          </div>
        </div>
      `;
    }
  } catch {}
}

// ===============================================
// VẤN ĐÁP
// ===============================================

class VanDap {
    constructor(nonce) {
        this.nonce = nonce;
        this.ajaxUrl = ajaxUrl;
        const VanDapfileName = "/VanDap.json";
        const VanDapUrl = baseUrl + repoPath + branch + VanDapfileName;
        this.QUESTION_DATA_URL = VanDapUrl;
        this.taskTracker = taskTracker;
        this.questionDataCache = null;
    }

    // 🔧 normalizeText riêng
    normalizeText(str) {
        return str
            .normalize("NFC")   // chuẩn hóa Unicode
            .toLowerCase()
            .trim()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\s]/g, '');
    }


      tokenize(str) {
        if (typeof str !== "string") return [];
        return str
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ' ')
            .trim()
            .split(/\s+/)
            .filter(x => x);
    }

    /**
     * Tải dữ liệu đáp án và lưu vào cache.
     */
async loadAnswersFromHub() {
        try {
            // ép tải mới bằng cách thêm timestamp
            const urlWithBypass = this.QUESTION_DATA_URL + "?t=" + Date.now();
            const response = await fetch(urlWithBypass, { cache: "no-store" });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            this.questionDataCache = await response.json();

            console.log("[Vấn Đáp] ✅ Đã tải dữ liệu mới từ hub:", urlWithBypass);
        } catch (e) {
            showNotification('Lỗi khi tải đáp án. Vui lòng thử lại.', 'error');
            throw e;
        }
    }

    /**
     * Kiểm tra câu hỏi trong cache và gửi đáp án lên server.
    */
        /**
    * Tìm câu trả lời đúng cho một câu hỏi và gửi nó đi.
    * @param {object} question Đối tượng câu hỏi từ máy chủ.
    * @param {object} headers Headers của yêu cầu để gửi đi.
    * @returns {Promise<boolean>} True nếu câu trả lời được gửi thành công, ngược lại là false.
    */
async checkAnswerAndSubmit(question, headers) {

    const normalizedIncomingQuestion = this.normalizeText(question.question);// system question

    //check log câu hỏi từ hệ thống và câu hỏi từ hub
        console.log("Incoming Question (gốc):", question.question);
        console.log("Incoming Question (normalized):", normalizedIncomingQuestion);
        console.log(
                "Stored keys(normalized):",
                Object.keys(this.questionDataCache.questions).map(k => this.normalizeText(k))
            );

    let foundAnswer = null;
    let matchedQuestionKey = null;

    for (const storedQuestionKey in this.questionDataCache.questions) {
        const normalizedStoredQuestionKey = this.normalizeText(storedQuestionKey);
        if (normalizedStoredQuestionKey === normalizedIncomingQuestion) {
            matchedQuestionKey = storedQuestionKey;
            foundAnswer = this.questionDataCache.questions[storedQuestionKey];
            break;
        }
    }


    if (!foundAnswer) {
        console.warn("[Vấn Đáp] ❌ Không tìm thấy câu hỏi trong cache:", question.question, "Normalized Question:", normalizedIncomingQuestion);
        showNotification(`<b>Vấn Đáp:</b> Không tìm thấy đáp án cho câu hỏi: <i>${question.question}</i>`, 'error');
        return false;
    }

// Tìm chỉ mục (Index) trong options
  // Ưu tiên 1: Tìm chính xác (Exact Match)
    let answerIndex = question.options.findIndex(option =>
    this.normalizeText(option) === this.normalizeText(foundAnswer));
    //  console.log("Answer index:", answerIndex, "Option chosen:", question.options[answerIndex]);

  // Ưu tiên 2: Nếu không thấy, tìm theo điểm trùng từ (Similarity Score)
    if (answerIndex === -1) {

    let maxScore = -1;
    let bestIdx = -1;
    const targetTokens = this.tokenize(foundAnswer);
    question.options.forEach((option, idx) => {
        const optTokens = this.tokenize(option);
        const intersection = optTokens.filter(token => targetTokens.includes(token));
        const score = intersection.length;

        if (score > maxScore) {
            maxScore = score;
            bestIdx = idx;
        }
    });

    if (bestIdx > -1 && maxScore > 0) {
        answerIndex = bestIdx;
        console.log(`[Vấn Đáp] 🎯 Chọn option theo điểm cao nhất (${maxScore}): ${question.options[bestIdx]}`);
    }
        }
// Nếu vẫn không tìm thấy
    if (answerIndex === -1) {
        console.warn("[Vấn Đáp] ❌ Không khớp option nào.");
        console.warn("Options (gốc):", question.options);
        console.warn("Options (normalized):", question.options.map(opt => this.normalizeText(opt)));
        console.warn("Đáp án từ GitHub:", foundAnswer);
        console.log("Đáp án từ GitHub (normalized):", this.normalizeText(foundAnswer));
        //console.log("Unicode từng ký tự đáp án:", [...foundAnswer].map(c => c.charCodeAt(0).toString(16)));
        showNotification(`Vấn Đáp: Câu hỏi: <i>${question.question}</i> không có đáp án đúng trong server.`, 'error');
        return false;
    }

    const payloadSubmitAnswer = new URLSearchParams();
    payloadSubmitAnswer.append('action', 'save_quiz_result');
    payloadSubmitAnswer.append('question_id', question.id);
    payloadSubmitAnswer.append('answer', answerIndex);
    payloadSubmitAnswer.append('security_token', securityToken);

    //console.log("Submit payload:", { question_id: question.id, answer: answerIndex, security_token: securityToken });

    try {
        const responseSubmit = await fetch(this.ajaxUrl, {
            method: 'POST',
            headers: headers,
            body: payloadSubmitAnswer,
            credentials: 'include'
        });

        const dataSubmit = await responseSubmit.json();

        //console.log("Server response:", dataSubmit);

        if (dataSubmit.success) {
            return { success: true };
        } else {
            const msg = dataSubmit?.data?.message || dataSubmit?.message || "Server không trả về thông điệp lỗi";
            return { success: false, reason: "server_error", message: msg };
        }
    } catch (error) {
        const msg = error?.message || JSON.stringify(error) || "Lỗi không xác định";
        return { success: false, reason: "exception", message: msg };
    }
}


    /**
     * Thực hiện toàn bộ quy trình vấn đáp.
     */
    async doVanDap(nonce) {
        const securityToken = await getSecurityToken(weburl + 'van-dap-tong-mon?t');
        try {
            await this.loadAnswersFromHub();

            console.log('[HH3D Vấn Đáp] ▶️ Bắt đầu Vấn Đáp');
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Wp-Nonce': nonce,
            };

            let correctCount = 0;
            let answeredThisSession = 0;
            const maxAttempts = 10;
            let currentAttempt = 0;
            let totalQuestions = 0;

            while (correctCount < 5 && currentAttempt < maxAttempts) {
                currentAttempt++;
                const payloadLoadQuiz = new URLSearchParams();
                payloadLoadQuiz.append('action', 'load_quiz_data');
                payloadLoadQuiz.append('security_token', securityToken);

                const responseQuiz = await fetch(this.ajaxUrl, {
                    method: 'POST',
                    headers: headers,
                    body: payloadLoadQuiz,
                    credentials: 'include'
                });

                const dataQuiz = await responseQuiz.json();

                if (!dataQuiz.success || !dataQuiz.data) {
                    showNotification(`Vấn Đáp: ${dataQuiz.data || 'Lỗi khi lấy câu hỏi'}`, 'warn');
                    return;
                }

                if (dataQuiz.data.completed) {
                    showNotification('Đã hoàn thành vấn đáp hôm nay.', 'success');
                    taskTracker.markTaskDone(accountId, 'diemdanh');
                    return;
                }

                if (!dataQuiz.data.questions) {
                    showNotification(`Vấn Đáp: Không có câu hỏi nào được tải.`, 'warn');
                    return;
                }

                const questions = dataQuiz.data.questions;
                totalQuestions = questions.length;
                correctCount = dataQuiz.data.correct_answers || 0;

                // Bộ lọc câu hỏi bao hàm cả 2 trường hợp
                const questionsToAnswer = questions.filter(q => {
                    if ('is_correct' in q) {
                        return String(q.is_correct) === "0"; // chỉ lấy câu chưa đúng
                    }
                    return true; // nếu chưa có is_correct thì lấy tất cả
                });

                if (questionsToAnswer.length === 0) {
                    break;
                }

                let newAnswersFound = false;

        for (const question of questionsToAnswer) {
            //console.log(`Đang xử lý câu hỏi #${question.id}: ${question.question}`);
            const result = await this.checkAnswerAndSubmit(question, headers,securityToken);

            if (result.success) {
                answeredThisSession++;
                // correctCount++;
                newAnswersFound = true;
                //showNotification(`✅ Trả lời đúng câu hỏi #${question.id}`, 'success'); // 🔧 thêm noti
            } else {
                if (result.reason === "not_in_cache") {
                    console.warn(`Không tìm thấy đáp án trong cache cho câu hỏi #${question.id}`);
                    showNotification(`❌ Không tìm thấy đáp án trong cache cho câu hỏi #${question.id}`, 'error'); // 🔧 thêm noti
                } else if (result.reason === "not_in_options") {
                    console.warn(`Đáp án có trong cache nhưng không khớp option server cho câu hỏi #${question.id}`);
                    showNotification(`❌ Đáp án không khớp option server cho câu hỏi #${question.id}`, 'error'); // 🔧 thêm noti
                } else if (result.reason === "server_error") {
                    console.error(`Server từ chối câu hỏi #${question.id}: ${result.message}`);
                    showNotification(`⚠️ Server từ chối câu hỏi #${question.id}: ${result.message}`, 'warn'); // 🔧 thêm noti
                } else if (result.reason === "exception") {
                    console.error(`Lỗi khi gửi câu hỏi #${question.id}: ${result.message}`);
                    showNotification(`⚠️ Lỗi khi gửi câu hỏi #${question.id}: ${result.message}`, 'warn'); // 🔧 thêm noti
                }
            }
        }

                if (!newAnswersFound) {
                    showNotification(`Vấn Đáp: Không tìm thấy câu trả lời mới, dừng lại.`, 'warn');
                    break;
                }

                if (correctCount < 5) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            // Tìm nạp trạng thái cuối cùng để báo cáo chính xác
            const finalPayload = new URLSearchParams();
            finalPayload.append('action', 'load_quiz_data');
            finalPayload.append('security_token', securityToken);

            const finalResponse = await fetch(this.ajaxUrl, {
                method: 'POST',
                headers: headers,
                body: finalPayload,
                credentials: 'include'
            });
            const finalData = await finalResponse.json();
            if (finalData.success && finalData.data) {
                correctCount = finalData.data.correct_answers || correctCount;
                totalQuestions = finalData.data.questions.length || totalQuestions;
            }

            showNotification(
                `Hoàn thành Vấn Đáp. Đã trả lời thêm ${answeredThisSession} câu. Tổng số câu đúng: ${correctCount}/${totalQuestions}`,
                'success'
            );

        } catch (e) {
            console.error(`[HH3D Vấn Đáp] ❌ Lỗi xảy ra:`, e);
            showNotification(`Lỗi khi thực hiện Vấn Đáp: ${e.message}`, 'error');
        }
    }
}

// ===============================================
// ĐIỂM DANH
// ===============================================
async function doDailyCheckin(nonce) {
    try {
            console.log('[HH3D Daily Check-in] ▶️ Bắt đầu Daily Check-in');
            const url = weburl + 'wp-json/hh3d/v1/action';
            const headers = {
                'Content-Type': 'application/json',
                'X-Wp-Nonce': nonce,
                'X-Requested-With': 'XMLHttpRequest'
            };

            const bodyPayload = {
                action: 'daily_check_in'
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(bodyPayload),
                credentials: 'include',
                referrer: weburl + 'diem-danh',
                mode: 'cors'
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showNotification(`Điểm danh: ${data.message} (${data.streak} ngày)`, 'success');
            } else {
                showNotification(`Điểm danh: ${data.message || 'Lỗi không xác định'}`, 'warn');
            }
        } catch (e) {
            console.error(`[HH3D Daily Check-in] ❌ Lỗi xảy ra:`, e);
            showNotification(`Lỗi khi thực hiện Daily Check-in: ${e.message}`, 'error');
    }
}

// ===============================================
// TẾ LỄ TÔNG MÔN
// ===============================================
async function doClanDailyCheckin(nonce) {
    const securityToken = await getSecurityToken(weburl + 'danh-sach-thanh-vien-tong-mon?t');
    try {
        console.log('[HH3D Clan Check-in] ▶️ Bắt đầu Clan Check-in');

        // Giả định 'weburl' được định nghĩa ở scope bên ngoài
        const url = weburl + "wp-json/tong-mon/v1/te-le-tong-mon";

        // --- 1. CẬP NHẬT HEADERS ---
        const headers = {
            "Content-Type": "application/json",
            "X-WP-Nonce": nonce,
            "security_token": securityToken
        };

        // --- 2. CẬP NHẬT BODY ---
        const bodyPayload = {
            action: "te_le_tong_mon",
            security_token: securityToken
        };

        const response = await fetch(url, {
            "credentials": "include",
            "headers": headers, // (Đã cập nhật)
            "referrer": weburl + "danh-sach-thanh-vien-tong-mon",
            "body": JSON.stringify(bodyPayload), // <-- THAY ĐỔI TỪ "{}"
            "method": "POST",
            "mode": "cors"
        });

        // Logic xử lý response giữ nguyên
        const data = await response.json();
        if (response.ok && data.success) {
            showNotification(`Tế lễ: ${data.message} (${data.cong_hien_points})`, 'success');
        } else {
            showNotification(`Tế lễ: ${data.message || 'Lỗi không xác định'}`, 'warn');
        }
    } catch (e) {
        console.error(`[HH3D Clan Check-in] ❌ Lỗi xảy ra:`, e);
        showNotification(`Lỗi khi thực hiện Clan Check-in: ${e.message}`, 'error');
    }
}

// ===============================================
// HÀM ĐỔ THẠCH
// ===============================================

/**
* Lớp quản lý tính năng Đổ Thạch (Dice Roll).
*
* Hướng dẫn sử dụng:
* 1. Tạo một thực thể của lớp, cung cấp các phụ thuộc cần thiết.
*    const doThachManager = new DoThach();
*
* 2. Gọi phương thức run với chiến lược mong muốn ('tài' hoặc 'xỉu').
*    await doThachManager.run('tài');
*/
        class DoThach {
            constructor() {
                this.ajaxUrl = ajaxUrl;
                this.webUrl = weburl;
                this.getSecurityNonce = getSecurityNonce;
                this.doThachUrl = this.webUrl + 'do-thach-hh3d?t';
            }

    // --- Các phương thức private để gọi API và lấy nonce ---

    // async #getLoadDataNonce() {
    //     return this.getSecurityNonce(this.doThachUrl, /action: 'load_do_thach_data',[\s\S]*?security: '([a-f0-9]+)'/);
    // }

    // async #getPlaceBetNonce() {
    //     return this.getSecurityNonce(this.doThachUrl, /action: 'place_do_thach_bet',[\s\S]*?security: '([a-f0-9]+)'/);
    // }

    // async #getClaimRewardNonce() {
    //     return this.getSecurityNonce(this.doThachUrl, /action: 'claim_do_thach_reward',[\s\S]*?security: '([a-f0-9]+)'/);
    // }



            /**
            * Lấy thông tin phiên đổ thạch hiện tại.
            * @param {string} securityNonce - Nonce cho yêu cầu.
            * @returns {Promise<object|null>} Dữ liệu phiên hoặc null nếu có lỗi.
            */
            async #getDiceRollInfo() {
                console.log('[HH3D Đổ Thạch] ▶️ Đang lấy thông tin phiên...');
                const securityToken = await getSecurityToken(this.doThachUrl);
                //const payload = new URLSearchParams({ action: 'load_do_thach_data', security_token: securityToken, security: securityNonce });
                const payload = new URLSearchParams({ action: 'load_do_thach_data', security_token: securityToken});
                const headers = {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                };

                try {
                    const response = await fetch(this.ajaxUrl, { method: 'POST', headers, body: payload });
                    const data = await response.json();
                    if (data.success) {
                        console.log('[HH3D Đổ Thạch] ✅ Tải thông tin phiên thành công.');
                        return data.data;
                    }
                    console.error('[HH3D Đổ Thạch] ❌ Lỗi từ API:', data.data || 'Lỗi không xác định');
                    return null;
                } catch (e) {
                    console.error('[HH3D Đổ Thạch] ❌ Lỗi mạng:', e);
                    return null;
                }
            }

            /**
            * Đặt cược vào một viên đá cụ thể.
            * @param {object} stone - Đối tượng đá để đặt cược.
            * @param {number} betAmount - Số tiền cược.
            * @param {string} placeBetSecurity - Nonce để đặt cược.
            * @returns {Promise<boolean>} True nếu đặt cược thành công.
            */
            async #placeBet(stone, betAmount) {
                console.log(`[HH3D Đặt Cược] 🪙 Đang cược ${betAmount} Tiên Ngọc vào ${stone.name}...`);
                const securityToken = await getSecurityToken(this.doThachUrl);
                    const payload = new URLSearchParams({
                    action: 'place_do_thach_bet',
                    security_token: securityToken,
                    //security: placeBetSecurity, bỏ security nonce
                    stone_id: stone.stone_id,
                    bet_amount: betAmount
                });
                const headers = {
                    'Accept': '*/*',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                };

                try {
                    const response = await fetch(this.ajaxUrl, { method: 'POST', headers, body: payload });
                    const data = await response.json();

                    if (data.success) {
                        showNotification(`✅ Cược thành công vào ${stone.name}!<br>Tỷ lệ <b>x${stone.reward_multiplier}</b>`, 'success');
                        this._alreadyClaimedReward = false; // reset flag
                        return true;
                    }
                    else if (data.data === 'Vui lòng nhận thưởng kỳ trước rồi mới tiếp tục đặt cược.') {
                        if (!this._alreadyClaimedReward) {
                            if (await this.#claimReward()) {
                                this._alreadyClaimedReward = true;
                                //return await this.#placeBet(stone, betAmount, placeBetSecurity);
                                return await this.#placeBet(stone, betAmount);
                            } else {
                                showNotification(`❌ Không thể nhận thưởng kỳ trước, vui lòng thử lại.`, 'error');
                            }
                        } else {
                            showNotification(`❌ Đã thử nhận thưởng nhưng vẫn không cược được.`, 'error');
                        }
                        this._alreadyClaimedReward = false; // reset flag
                        return false;
                    }

                    const errorMessage = data.data || data.message || 'Lỗi không xác định.';
                    showNotification(`❌ Lỗi cược: ${errorMessage}`, 'error');
                    this._alreadyClaimedReward = false;
                    return false;
                } catch (e) {
                    showNotification(`❌ Lỗi mạng khi cược: ${e.message}`, 'error');
                    this._alreadyClaimedReward = false;
                    return false;
                }
            }

            /**
            * Nhận thưởng cho một lần cược thắng.
            * @returns {Promise<boolean>} True nếu nhận thưởng thành công.
            */
            async #claimReward() {
                console.log('[HH3D Nhận Thưởng] 🎁 Đang nhận thưởng...');
                const securityToken = await getSecurityToken(this.doThachUrl);
                const payload = new URLSearchParams({ action: 'claim_do_thach_reward', security_token: securityToken });
                const headers = {
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                };

                try {
                    const response = await fetch(this.ajaxUrl, { method: 'POST', headers, body: payload });
                    const data = await response.json();
                    if (data.success) {
                        const rewardMessage = data.data?.message || `Nhận thưởng thành công!`;
                        showNotification(rewardMessage, 'success');
                        return true;
                    }
                    const errorMessage = data.data?.message || 'Lỗi không xác định khi nhận thưởng.';
                    showNotification(errorMessage, 'error');
                    return false;
                } catch (e) {
                    console.error(e);
                    showNotification(`❌ Lỗi mạng khi nhận thưởng: ${e.message}`, 'error');
                    return false;
                }
            }

            // --- Phương thức public để chạy toàn bộ quy trình ---

            /**
            * Chạy toàn bộ quy trình đổ thạch dựa trên chiến lược đã chọn.
            * @param {string} stoneType - Chiến lược đặt cược ('tài' hoặc 'xỉu').
            */
            async run(stoneType) {
                console.log(`[HH3D Đổ Thạch] 🧠 Bắt đầu quy trình với chiến lược: ${stoneType}...`);

                const sessionData = await this.#getDiceRollInfo();

                if (!sessionData) {
                    console.error('[HH3D Đổ Thạch] ❌ Không thể lấy dữ liệu phiên, dừng lại.');
                    return;
                }

                const userBetStones = sessionData.stones.filter(stone => stone.bet_placed);

                // Bước 2: Kiểm tra trạng thái phiên và hành động (nhận thưởng hoặc đặt cược)
                if (sessionData.winning_stone_id) {
                    console.log('[HH3D Đổ Thạch] 🎁 Đã có kết quả. Kiểm tra nhận thưởng...');
                    const claimableWin = userBetStones.find(s => s.stone_id === sessionData.winning_stone_id && !s.reward_claimed);
                    const alreadyClaimed = userBetStones.find(s => s.stone_id === sessionData.winning_stone_id && s.reward_claimed);

                    if (claimableWin) {
                        console.log(`[HH3D Đổ Thạch] 🎉 Trúng rồi! Đá cược: ${claimableWin.name}. Đang nhận thưởng...`);
                        await this.#claimReward();
                    } else if (alreadyClaimed) {
                        console.log(`[HH3D Đổ Thạch] ✅ Đã nhận thưởng cho phiên này.`);
                    } else if (userBetStones.length > 0) {
                        showNotification('[Đổ Thạch] 🥲 Rất tiếc, bạn không trúng phiên này.', 'info');
                    } else {
                        showNotification('[Đổ Thạch] 😶 Bạn không tham gia phiên này.', 'info');
                    }
                    taskTracker.updateTask(accountId, 'dothach', 'reward_claimed', 'true')
                    return;
                }

                // Bước 3: Nếu đang trong giờ cược, tiến hành đặt cược
                console.log('[HH3D Đổ Thạch] 💰 Đang trong thời gian đặt cược.');
                const userBetCount = userBetStones.length;

                if (userBetCount >= 2) {
                    showNotification('[Đổ Thạch] ⚠️ Đã cược đủ 2 lần. Chờ phiên sau.', 'warn');
                    taskTracker.updateTask(accountId, 'dothach', 'betplaced', true);

                    return;
                }

                const sortedStones = [...sessionData.stones].sort((a, b) => b.reward_multiplier - a.reward_multiplier);
                const availableStones = sortedStones.filter(stone => !stone.bet_placed);

                if (availableStones.length === 0) {
                    showNotification('[Đổ Thạch] ⚠️ Không còn đá nào để cược!', 'warn');
                    return;
                }

                const betAmount = 20;
                const stonesToBet = [];
                const normalizedStoneType = stoneType.toLowerCase();
                const betsRemaining = 2 - userBetCount;

                if (normalizedStoneType === 'tài' || normalizedStoneType === 'tai') {
                    stonesToBet.push(...availableStones.slice(0, betsRemaining));
                } else if (normalizedStoneType === 'xỉu' || normalizedStoneType === 'xiu') {
                    const xiuStones = availableStones.slice(2, 4);
                    stonesToBet.push(...xiuStones.slice(0, betsRemaining));
                } else {
                    console.log('[HH3D Đổ Thạch] ❌ Chiến lược không hợp lệ. Vui lòng chọn "tài" hoặc "xỉu".');
                    return;
                }

                if (stonesToBet.length === 0) {
                    console.log('[HH3D Đổ Thạch] ⚠️ Không có đá nào phù hợp chiến lược hoặc đã cược đủ.');
                    return;
                }

                let successfulBets = 0;
                for (const stone of stonesToBet) {
                    //const success = await this.#placeBet(stone, betAmount, placeBetSecurity);
                    const success = await this.#placeBet(stone, betAmount);
                    if (success) {
                        successfulBets++;
                    }
                }

                // Kiểm tra và cập nhật trạng thái ngay sau khi cược
                if (userBetCount + successfulBets >= 2) {
                    taskTracker.updateTask(accountId, 'dothach', 'betplaced', true);
                    //console.log(taskTracker.getTaskStatus(accountId, 'dothach'));

                }
            }
        }

//===================================
// TIÊN DUYÊN
//===================================
class TienDuyen {
    nonce;

    constructor() {
        this.apiUrl = weburl + "wp-json/hh3d/v1/action";
    }

    async init() {
        console.log("Chạy init tiên duyên");
        this.nonce = await getNonce();
        //console.log("getNonce type:", typeof getNonce);
        //console.log("getNonce source:", getNonce.toString());
        console.log("Tiên Duyên Nonce (init):", this.nonce);

        this.securityToken = await getSecurityToken(weburl + "tien-duyen?t");
        console.log("Tiên Duyên SecurityToken (init):", this.securityToken);
    }

    async #post(action, body = {}) {
        const res = await fetch(this.apiUrl, {
            credentials: "include",
            method: "POST",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json",
                "X-WP-Nonce": this.nonce
            },
            body: JSON.stringify({ action, ...body })
        });
        return res.json();
    }

    // 📋 Lấy danh sách phòng cưới
    async getWeddingRooms() {
        console.log("Tiên Duyên SecurityToken (GetWedding Rooms):", this.securityToken);
        return await this.#post("show_all_wedding", {
            security_token: this.securityToken
        });
    }

    // 🎉 Chúc phúc
    async addBlessing(weddingRoomId, message = "Chúc phúc trăm năm hạnh phúc 🎉") {
        return await this.#post("hh3d_add_blessing", {
            wedding_room_id: weddingRoomId,
            message
        });
    }

    // 🧧 Nhận lì xì
    async receiveLiXi(weddingRoomId) {
        return await this.#post("hh3d_receive_li_xi", {
            wedding_room_id: weddingRoomId
        });
    }

    // 💞 Duyên: chúc phúc + nhận lì xì
    async doTienDuyen() {
        if (!this.nonce || !this.securityToken)
        { console.log("▶ Chưa init, đang chạy init trong doTienDuyen...");
         await this.init(); }

        const lastCheck = taskTracker.getLastCheckTienDuyen(accountId);
        const now = new Date();
        if (now - lastCheck < 1800000) return;

        const list = await this.getWeddingRooms();
        if (!list?.data) {
            showNotification("Không có danh sách phòng cưới", "warn");
            return;
        }

        for (const room of list.data) {
            taskTracker.setLastCheckTienDuyen(accountId, now);
            console.log(`👉 Kiểm tra phòng ${room.wedding_room_id}`);

            if (room.has_blessed === false) {
                const bless = await this.addBlessing(room.wedding_room_id);
                if (bless && bless.success === true) {
                    showNotification(
                        `Bạn đã gửi lời chúc phúc cho cặp đôi <br><b>${room.user1_name} 💞 ${room.user2_name}</b>`,
                        "success"
                    );
                }
            }

            if (room.has_li_xi === true) {
                const liXi = await this.receiveLiXi(room.wedding_room_id);
                if (liXi && liXi.success === true) {
                    showNotification(
                        `Nhận lì xì phòng cưới ${room.wedding_room_id} được <b>${liXi.data.amount} ${liXi.data.name}</b>!`,
                        "success"
                    );
                }
            }

            // ⏳ Chờ 1 giây tránh spam
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

    // ===============================================
    // TIÊN DUYÊN - TẶNG HOA
    // ===============================================

    class TangHoa {
        nonce;
        initialized = false;

        constructor() {
            this.apiUrl = weburl + "wp-json/hh3d/v1/action";
            this.accountId = accountId;
                    }

        async init() {
            console.log("chạy tặng hoa");
            this.nonce = await getNonce();
            console.log("getNonce type:", typeof getNonce);
            console.log("getNonce source:", getNonce.toString());
            this.securityToken = await getSecurityToken(weburl + 'tien-duyen?t');
            this.initialized = true;
                    }

        async #post(action, body = {}) {
            const res = await fetch(this.apiUrl,
                        {
                credentials: "include",
                method: "POST",
                headers: {
                                "Accept": "*/*",
                                "Content-Type": "application/json",
                                "X-WP-Nonce": this.nonce
                            },
                body: JSON.stringify({ action, ...body
                            })
                        });
            return res.json();
                    }
                    // Lấy danh sách bạn bè
        async getFriends() {
            return await this.#post("get_friends_td");
                    }
                    // Kiểm tra giới hạn quà tặng
        async checkGiftLimit(friendId, costType = "tien_ngoc") {
            return await this.#post("check_daily_gift_limit",
                        {
                user_id: this.accountId,
                friend_id: friendId, // user_id của bạn bè
                cost_type: costType
                        });
                    }
                    // Tặng quà
        async giftToFriend(friendId, giftType = "hoa_hong", costType = "tien_ngoc") {
            return await this.#post("gift_to_friend",
                        {
                user_id: this.accountId,
                friend_id: friendId, // user_id của bạn bè
                gift_type: giftType,
                cost_type: costType
                        });
                    }
                    // Hàm chính: tặng hoa cho đúng số người đã chọn
    async run(selectedCount) {
        try {
            if (!this.initialized) {
                await this.init();
                            }

            const count = parseInt(selectedCount,
                            10);
            if (Number.isNaN(count) || count <= 0) {
                showNotification(`⚠️ Số lượng chọn không hợp lệ: ${selectedCount
                                }`, 'warn');
                return;
                            }

            const friendsRes = await this.getFriends();
            const list = Array.isArray(friendsRes?.data)
                ? friendsRes.data
                : (Array.isArray(friendsRes) ? friendsRes : []);

            if (!Array.isArray(list) || list.length === 0) {
                showNotification("❌ Không có danh sách bạn bè", 'error');
                return;
                            }
                            // Lấy đúng số người đã chọn trên menu
            const targetFriends = list.slice(0, count);
            //showNotification(`🎯 Sẽ tặng cho ${targetFriends.length} người.`, 'info');

            let processed = 0;

            for (const friend of targetFriends) {
                const friendId = friend?.user_id;
                if (!friendId) {
                    showNotification("⚠️ Thiếu user_id trong item", 'warn');
                    continue;
                                }

                processed++;
                showNotification(`👤 Bắt đầu tặng cho ID ${friendId
                                } (${processed
                                }/${targetFriends.length
                                })`, 'info');

                let giftsForThisFriend = 0;
                const maxGiftsPerFriend = 3;

                while (giftsForThisFriend < maxGiftsPerFriend) {
                    const check = await this.checkGiftLimit(friendId);
                    const remaining = Number(check?.remaining_free_gifts ?? 0);

                    if (remaining <= 0) {
                        showNotification(`⛔ Hết lượt tặng cho ID ${friendId
                                        }, dừng tặng người này.`, 'warn');
                        break;
                                    }

                    const gift = await this.giftToFriend(friendId);
                    if (gift?.success === true) {
                        giftsForThisFriend++;
                        //const remainingAfter = gift?.remaining_free_gifts ?? 'N/A';
                        showNotification(`🎁 Tặng lần ${giftsForThisFriend
                                        }/${maxGiftsPerFriend
                                        }`, 'success');
                                    } else {
                        showNotification(`⚠️ Tặng quà thất bại cho ID ${friendId
                                        }`, 'error');
                        break;
                                    }

                    await new Promise(r => setTimeout(r,
                                    2000));
                                }

                await new Promise(r => setTimeout(r,
                                1000));
                            }

            showNotification(`🎉 Kết thúc: đã xử lý ${processed
                            }/${targetFriends.length
                            } người`, 'success');
                        } catch (err) {
            showNotification(`💥 Lỗi trong run(): ${err?.message ?? err
                            }`, 'error');
                        }
                    }
                }

    // ===============================================
    // TIÊN DUYÊN - CẦU NGUYỆN
    // ===============================================

async function docaunguyen(accountId) {
        const logPrefix = "[Cầu Nguyện tiên duyên]";
    try {

        console.log(logPrefix, "▶️ Đang thực hiện...");

        const nonce = await getNonce();
        if (!nonce) {
            showNotification("Không lấy được nonce", "error");
            return false;
        }

        const url = weburl + "wp-json/hh3d/v1/action";
        const bodyPayload = { action: "make_wish_tree" };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Wp-Nonce": nonce,
                "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify(bodyPayload),
            credentials: "include"
        });

        const data = await response.json();

        if (
            data.success ||
            (data.message && data.message.includes("Chưa có đạo lữ để ước nguyện Tiên Duyên Thụ"))
        ) {
            showNotification(`${logPrefix} ✨ ${data.message}`, "info");
            taskTracker.markTaskDone(accountId, "caunguyendaolu");
            return true;
        } else {
            showNotification(`${logPrefix}⚠️ ${data.message || "Thất bại"}`, "warn");
            return false;
        }
    } catch (e) {
        console.error(e);
        showNotification(`${logPrefix}: ${e.message}`, "error");
        return false;
    }
}


// ===============================================
        // THÍ LUYỆN TÔNG MÔN
        // ===============================================

    async function doThiLuyenTongMon() {
    console.log('[HH3D Thí Luyện Tông Môn] ▶️ Bắt đầu Thí Luyện Tông Môn');

    // Bước 1: Lấy security token
    const securityToken = await getSecurityToken(weburl + 'thi-luyen-tong-mon-hh3d?t');
    if (!securityToken) {
        showNotification('Lỗi khi lấy security token cho Thí Luyện Tông Môn.', 'error');
        throw new Error('Lỗi khi lấy security token cho Thí Luyện Tông Môn.');
    }

    const url = ajaxUrl;
    const payload = new URLSearchParams();
    payload.append('action', 'open_chest_tltm');
    payload.append('security_token', securityToken);

    console.log([...payload.entries()]);

    const headers = {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: payload,
            credentials: 'include' // Quan trọng để gửi cookies
        });

        // Đọc body một lần
        const text = await response.text();
        console.log(text);
        // Parse JSON từ text
        const data = JSON.parse(text);

        if (data.success) {
            // Trường hợp thành công
            const message = data.data && data.data.message ? data.data.message : 'Mở rương thành công!';
            showNotification(message, 'success');
        } else {
            // Trường hợp thất bại
            const errorMessage = data.data && data.data.message ? data.data.message : 'Lỗi không xác định khi mở rương.';
            if (errorMessage.includes("Đã hoàn thành Thí Luyện Tông Môn hôm nay")) {
                showNotification(errorMessage, 'info');
                taskTracker.markTaskDone(accountId, 'thiluyen');
            } else {
                showNotification(errorMessage, 'error');
            }
        }


    } catch (e) {
        showNotification(`Lỗi mạng khi thực hiện Thí Luyện: ${e.message}`, 'error');
    }
}

        // ===============================================
        // PHÚC LỢI
        // ===============================================


async function doPhucLoiDuong() {
    console.log('[HH3D Phúc Lợi Đường] ▶️ Bắt đầu nhiệm vụ Phúc Lợi Đường.');

    // Bước 1: Lấy security nonce từ trang hoặc fallback sang AJAX
    let securityNonce = null;
    try {
        const resp= await fetch(weburl + 'phuc-loi-duong?t');
        const jsonConfigMatch = await resp.text();
        const match = jsonConfigMatch.match(/"securityToken"\s*:\s*"([^"]+)"/);
        if (match && match[1]) {
            securityNonce = match[1];
            console.log('[HH3D Phúc Lợi Đường] ✅ Nonce từ HTML:', securityNonce);
        }
    } catch (err) {
        console.warn('[HH3D Phúc Lợi Đường] ⚠️ Lỗi khi parse HTML:', err);
    }

    if (!securityNonce) {
        try {
            const resAjax = await fetch(weburl + 'wp-content/themes/halimmovies-child/hh3d-ajax.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: 'action=get_next_time_pl',
                credentials: 'include'
            });
            const dataAjax = await resAjax.json();
            if (dataAjax && dataAjax.security_token) {
                securityNonce = dataAjax.security_token;
                console.log('[HH3D Phúc Lợi Đường] ✅ Nonce từ AJAX:', securityNonce);
            }
        } catch (err) {
            console.error('[HH3D Phúc Lợi Đường] ❌ Lỗi khi gọi AJAX:', err);
        }
    }

    if (!securityNonce) {
        showNotification('Lỗi khi lấy security nonce cho Phúc Lợi Đường.', 'error');
        return;
    }

    const url = ajaxUrl;
    const headers = {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
    };

    // Bước 2: Lấy thông tin thời gian còn lại và cấp độ rương
    console.log('[HH3D Phúc Lợi Đường] ⏲️ Đang kiểm tra thời gian mở rương...');
    const securityToken = await getSecurityToken(weburl + 'phuc-loi-duong?t');
    const payloadTime = new URLSearchParams();
    payloadTime.append('action', 'get_next_time_pl');
    payloadTime.append('security_token', securityToken);
    payloadTime.append('security', securityNonce);

    try {
        const responseTime = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: payloadTime,
            credentials: 'include'
        });
        const dataTime = await responseTime.json();

        if (dataTime.success) {
            const { time, chest_level: chest_level_string } = dataTime.data;
            const chest_level = parseInt(chest_level_string, 10);

            if (chest_level >= 4) {
                showNotification('Phúc Lợi Đường đã hoàn tất hôm nay!', 'success');
                taskTracker.markTaskDone(accountId, 'phucloi');
                return;
            }

            if (time === '00:00') {
                console.log(`[HH3D Phúc Lợi Đường] 🎁 Đang mở rương cấp ${chest_level + 1}...`);
                const payloadOpen = new URLSearchParams();
                payloadOpen.append('action', 'open_chest_pl');
                payloadOpen.append('security_token', securityToken);
                payloadOpen.append('security', securityNonce);
                payloadOpen.append('chest_id', chest_level + 1);

                const responseOpen = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: payloadOpen,
                    credentials: 'include'
                });
                const dataOpen = await responseOpen.json();

                if (dataOpen.success) {
                    const message = dataOpen.data && dataOpen.data.message ? dataOpen.data.message : 'Mở rương thành công!';
                    showNotification(message, 'success');
                    if (message.includes('đã hoàn thành Phúc Lợi ngày hôm nay')) {
                        taskTracker.markTaskDone(accountId, 'phucloi');
                    } else {
                        taskTracker.adjustTaskTime(accountId, 'phucloi', timePlus('30:00'));
                    }
                } else {
                    const errorMessage = dataOpen.data && dataOpen.data.message ? dataOpen.data.message : 'Lỗi không xác định khi mở rương.';
                    showNotification(errorMessage, 'error');
                }
            } else {
                showNotification(`Vui lòng đợi ${time} để mở rương tiếp theo.`, 'warn');
                taskTracker.adjustTaskTime(accountId, 'phucloi', timePlus(time));
            }
        } else {
            const errorMessage = dataTime.data && dataTime.data.message ? dataTime.data.message : 'Lỗi không xác định khi lấy thời gian.';
            showNotification(errorMessage, 'error');
        }
    } catch (e) {
        showNotification(`Lỗi mạng khi thực hiện Phúc Lợi Đường: ${e.message}`, 'error');
    }
}

async function phucloiclaimbonus() {
    const logPrefix = "[HH3D Phúc Lợi Claim Bonus]";
    const weburl = "https://hoathinh3d.hot/";
    const ajaxUrl = weburl + "wp-content/themes/halimmovies-child/hh3d-ajax.php";

    // Bước 1: Lấy security token từ trang hoặc fallback sang AJAX
    let securityToken = null;
    try {
        const resp = await fetch(weburl + "phuc-loi-duong?t", { credentials: "include" });
        const html = await resp.text();
        const match = html.match(/"securityToken"\s*:\s*"([^"]+)"/);
        if (match && match[1]) {
            securityToken = match[1];
            console.log(`${logPrefix} ✅ Security token từ HTML:`, securityToken);
        }
    } catch (err) {
        console.warn(`${logPrefix} ⚠️ Lỗi khi parse HTML:`, err);
    }

    if (!securityToken) {
        try {
            const resAjax = await fetch(ajaxUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
                body: "action=get_next_time_pl",
                credentials: "include"
            });
            const dataAjax = await resAjax.json();
            if (dataAjax && dataAjax.security_token) {
                securityToken = dataAjax.security_token;
                console.log(`${logPrefix} ✅ Security token từ AJAX:`, securityToken);
            }
        } catch (err) {
            console.error(`${logPrefix} ❌ Lỗi khi gọi AJAX:`, err);
        }
    }

    if (!securityToken) {
        console.error(`${logPrefix} ❌ Không lấy được security token.`);
        return;
    }

    // Bước 2: Thử chest_id từ 1 đến 4
    for (let chestId = 1; chestId <= 4; chestId++) {
        const payload = new URLSearchParams();
        payload.append("action", "claim_bonus_reward");
        payload.append("security_token", securityToken);
        payload.append("chest_id", chestId);

        try {
            const response = await fetch(ajaxUrl, {
                method: "POST",
                headers: {
                    "Accept": "application/json, text/javascript, */*; q=0.01",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: payload,
                credentials: "include"
            });

            const data = await response.json();
            console.log(`${logPrefix} Chest ${chestId}:`, data);

            if (data.success) {
                showNotification(`${logPrefix} ✅ Chest ${chestId}: ${data.data?.message}`, "success");
            } else {
                showNotification(`${logPrefix} ⚠️ Chest ${chestId}: ${data.data?.message}`, "warn");
            }
        } catch (err) {
            showNotification(`${logPrefix} ❌ Lỗi khi gọi chest ${chestId}: ${err}`, "error");
        }
    }
}





// ===============================================
        // BÍ CẢNH
        // ===============================================
class BiCanh {
    constructor() {
        this.weburl = weburl;
        this.logPrefix = '[HH3D Bí Cảnh]';
    }

    async doBiCanh() {
        console.log(`${this.logPrefix} ▶️ Bắt đầu nhiệm vụ Bí Cảnh Tông Môn.`);

        // 1. Lấy nonce
        const nonce = await this.getNonce();
        if (!nonce) {
            showNotification('Lỗi: Không thể lấy nonce cho Bí Cảnh Tông Môn.', 'error');
            throw new Error('Lỗi nonce bí cảnh');
        }

        // 2. Lấy boss status
        let statusResp = await this.getBossStatus(nonce);
        console.log("[DEBUG lấy boss status]", statusResp);

        // 3. Nếu có thưởng pending thì nhận
        if (statusResp?.has_pending_reward) {
            console.log(`${this.logPrefix} 🎁 Có thưởng chưa nhận, tiến hành nhận...`);
            const rewardResponse = await this.sendApiRequest('wp-json/tong-mon/v1/claim-boss-reward', 'POST', nonce, {});
            console.log("[DEBUG ClaimReward response]", rewardResponse)
            if (rewardResponse?.success) {
                showNotification(rewardResponse.message, 'success');
            }
            // Sau khi nhận thưởng, lấy lại boss status sạch
            statusResp = await this.getBossStatus(nonce);
            console.log("[DEBUG BossStatus sau khi nhận thưởng]", statusResp);

        }

        // 4. Kiểm tra cooldown
        await this.sleep(500);
        console.log("[DEBUG Trước khi check cooldown, statusResp]", statusResp);
           const canAttack = await this.checkAttackCooldown(nonce, statusResp);
           console.log("[DEBUG Kết quả checkAttackCooldown]: canattack", canAttack);
        if (!canAttack) return;

        // 5. Tấn công boss
        await this.sleep(500);
        await this.attackBoss(nonce);
    }

    async getNonce() {
        const nonce = await getSecurityNonce(
            weburl + 'bi-canh-tong-mon?t',
            /"nonce":"([a-f0-9]+)"/
        );
        return nonce || null;
    }

    async getBossStatus(nonce) {
        console.log(`${this.logPrefix} 📡 Gọi API getBossStatus...`);
        const resp = await this.sendApiRequest('wp-json/tong-mon/v1/get-boss-status', 'POST', nonce, {});
    console.log("[DEBUG getBossStatus response]", resp);
    return resp;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

   async isReserveHold() {
        const nonce = await this.getNonce();
        if (!nonce) return false;

        // Lấy thông tin boss status
        const statusResp = await this.sendApiRequest('wp-json/tong-mon/v1/get-boss-status', 'POST', nonce, {});
        //console.log(`${this.logPrefix} Debug boss status:`, statusResp);

        const remaining = Number(statusResp?.attack_info?.remaining ?? 0);
        const reserve   = Number(localStorage.getItem('reserveBiCanhAttacks') || '0');
        console.log("[DEBUG isReserveHold] reserveBiCanhAttacks:", reserve);
    console.log("[DEBUG isReserveHold] remaining:", remaining);

        // Nếu có cấu hình giữ lượt và số lượt còn lại <= số lượt giữ → coi như đang giữ
        return reserve > 0 && remaining <= reserve;
    }




    async checkAttackCooldown(nonce, statusResp) {

    console.log(`${this.logPrefix} ⏲️ Đang kiểm tra thời gian hồi chiêu...`);
    const endpoint = 'wp-json/tong-mon/v1/check-attack-cooldown';

    try {
        const response = await this.sendApiRequest(endpoint, 'POST', nonce, {});
        console.log("[DEBUG checkAttackCooldown response]", response);
        // const statusResp = await this.getBossStatus(nonce);
        // console.log("[DEBUG BossStatus]", statusResp);

        // Nếu có thể tấn công
        if (response?.success && response.can_attack) {
            // Kiểm tra giữ lượt
            if (await this.isReserveHold()) {
                const msg = `Đang giữ lượt, không tấn công.`;
                console.log(`${this.logPrefix} 🛑 ${msg}`);
                showNotification(msg, 'info');
                // ❌ Không hiển thị countdown trong trường hợp giữ lượt
                //taskTracker.adjustTaskTime(accountId, 'bicanh', null);
                return false;
            }
            const statusResp = await this.sendApiRequest('wp-json/tong-mon/v1/get-boss-status', 'POST', nonce, {});
            const remaining = Number(statusResp?.attack_info?.remaining ?? 0);
            console.log(`${this.logPrefix} ✅ Có thể tấn công. Còn ${remaining} lượt.`);
            return true;
        }

        // Boss chết
        if (response?.success && response.message === 'Không có boss để tấn công') {
            await this.sleep(1000);
            const rewardResponse = await this.sendApiRequest('wp-json/tong-mon/v1/claim-boss-reward', 'POST', nonce, {});
            if (rewardResponse?.success) showNotification(rewardResponse.message, 'success');

            const contributionResponse = await this.sendApiRequest('wp-json/tong-mon/v1/contribute-boss', 'POST', nonce, {});
            if (contributionResponse) {
                showNotification(contributionResponse.message, contributionResponse.success ? 'success' : 'warn');
            }

            taskTracker.adjustTaskTime(accountId, 'bicanh', null);
            return false;
        }

        // Countdown hiển thị khi có cooldown_remaining (trừ trường hợp giữ lượt)
        if (Number.isFinite(response?.cooldown_remaining)) {
            console.log("[DEBUG Cooldown_remaining]", response.cooldown_remaining);
            taskTracker.adjustTaskTime(accountId, 'bicanh', Date.now() + response.cooldown_remaining * 1000);
        } else {
            console.log("[DEBUG Không có cooldown_remaining, reset taskTime]");
            taskTracker.adjustTaskTime(accountId, 'bicanh', null);
        }

        const message = response?.message || 'Không thể tấn công vào lúc này.';
        showNotification(`⏳ ${message}`, 'info');
        return false;

    } catch (e) {
        showNotification(`${this.logPrefix} ❌ Lỗi kiểm tra cooldown: ${e.message}`, 'error');
        return false;
    }
}

    async attackBoss(nonce) {
        console.log(`${this.logPrefix} 🔥 Đang khiêu chiến boss...`);
        const endpoint = 'wp-json/tong-mon/v1/attack-boss';

        try {
            const response = await this.sendApiRequest(endpoint, 'POST', nonce, {});
            if (response && response.success) {
                console.log("[DEBUG attackBoss response]", response);
                const message = response.message || `Gây ${response.damage} sát thương.`;
                showNotification(message, 'success');
                taskTracker.adjustTaskTime(accountId, 'bicanh', timePlus('07:00'));
            } else {
                const errorMessage = response?.message || 'Lỗi không xác định khi tấn công.';
                console.log("[DEBUG attackBoss errorMessage]", errorMessage);
                showNotification(errorMessage, 'error');
            }
        } catch (e) {
            showNotification(`Lỗi mạng khi tấn công boss Bí Cảnh: ${e.message}`, 'error');
        }
    }

    async isDailyLimit() {
        const endpoint = 'wp-json/tong-mon/v1/check-attack-cooldown';
        const nonce = await this.getNonce();
        if (!nonce) return false;

        try {
            const response = await this.sendApiRequest(endpoint, 'POST', nonce, {});
            return response && response.success && response.cooldown_type === 'daily_limit';
        } catch (e) {
            console.error(`${this.logPrefix} ❌ Lỗi kiểm tra cooldown:`, e);
            return false;
        }
    }

    async sendApiRequest(endpoint, method, nonce, body = {}) {
        try {
            const url = `${this.weburl}${endpoint}`;
            const headers = {
                "Content-Type": "application/json",
                "X-WP-Nonce": nonce,
                "Accept": "*/*",
                "Accept-Language": "vi,en-US;q=0.5",
                "X-Requested-With": "XMLHttpRequest",
            };
            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(body),
                credentials: 'include'
            });
            return await response.json();
        } catch (error) {
            console.error(`${this.logPrefix} ❌ Lỗi khi gửi yêu cầu tới ${endpoint}:`, error);
            throw error;
        }
    }
}


        // ===============================================
        // BÍ CẢNH HIẾN TẾ
        // ===============================================
    class BiCanhHienTe {
        constructor() {
        this.weburl = weburl;
            this.logPrefix = "[HH3D Bí Cảnh Socket]";
            this.biCanhSocketActive = false;
            this.biCanhSocketWaiter = null;
            this.handledBossIds = new Set();
            this.currentDay = this.getTodayKey();
            this.currentBossId = null;
        }

        getTodayKey() {
            const d = new Date();
            return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
        }

        resetIfNewDay() {
            const today = this.getTodayKey();
            if (today !== this.currentDay) {
                this.currentDay = today;
                this.handledBossIds.clear();
                console.log(`${this.logPrefix} 🔄 Reset handledBossIds vì sang ngày mới`);
                showNotification(`${this.logPrefix} 🔄 Reset handledBossIds vì sang ngày mới`,'info');
            }
        }

                async sendApiRequest(endpoint, method, nonce, body = {}) {
                try {
                    const url = `${this.weburl}${endpoint}`;
                    const headers = {
                        "Content-Type": "application/json",
                        "X-WP-Nonce": nonce,
                        "Accept": "*/*",
                        "Accept-Language": "vi,en-US;q=0.5",
                        "X-Requested-With": "XMLHttpRequest",
                    };
                    const response = await fetch(url, {
                        method,
                        headers,
                        body: JSON.stringify(body),
                        credentials: 'include'
                    });
                    return await response.json();
                } catch (error) {
                    console.error(`${this.logPrefix} ❌ Lỗi khi gửi yêu cầu tới ${endpoint}:`, error);
                    showNotification(`${this.logPrefix} ❌ Lỗi khi gửi yêu cầu tới ${endpoint}:`, error);
                    throw error;
                }
            }

        async updateCurrentBossId() {
            const nonce = await getNonce();
            if (!nonce) {
                console.error(`${this.logPrefix} ❌ Không lấy được nonce`);
                showNotification(`${this.logPrefix} ❌ Không lấy được nonce`,'info)');
                return null;
            }
            const res = await this.sendApiRequest("wp-json/tong-mon/v1/get-boss-status", "POST", nonce, {});
            //console.log(`${this.logPrefix} 📦 Response get-boss-status:`, res);
            //showNotification(`${this.logPrefix} 📦 Response get-boss-status:`, res,'info');

            if (res?.boss?.id) {
                this.currentBossId = res.boss.id;
                // console.log(`${this.logPrefix} 🎯 Current boss id set to ${this.currentBossId}`);
                // showNotification(`${this.logPrefix} 🎯 Current boss id set to ${this.currentBossId}`);
            } else {
                console.warn(`${this.logPrefix} ⚠️ Không tìm thấy boss id trong response`);
                showNotification(`${this.logPrefix} ⚠️ Không tìm thấy boss id trong response`,'info');
            }
            return this.currentBossId;
        }


    async handleBossDefeated(bossId) {
        this.resetIfNewDay();
        if (this.handledBossIds.has(bossId)) return;
        this.handledBossIds.add(bossId);

        showNotification(`💀 Boss ${bossId} chết! Chuẩn bị hiến tế...`, "warn");

        // Delay ngẫu nhiên trước khi bắt đầu
        const initialDelay = Math.floor(Math.random() * 1000) + 2000;
        await new Promise(resolve => setTimeout(resolve, initialDelay));

        const nonce = await getNonce();
        if (!nonce) {
            console.error(`${this.logPrefix} ❌ Không lấy được nonce`);
             showNotification(`${this.logPrefix} ❌ Không lấy được nonce`,'info');
            return;
        }

        // Hàm gọi API với retry/backoff - retry tối đa 3 lần
        const safeApiCall = async (endpoint, body = {}, retries = 3) => {
            for (let i = 0; i < retries; i++) {
                try {
                    return await this.sendApiRequest(endpoint, "POST", nonce, body);
                } catch (err) {
                    if (i < retries - 1) {
                        const backoff = (i + 1) * 1000; // tăng dần: 1s, 2s, 3s
                        console.warn(`${this.logPrefix} ⚠️ Lỗi khi gọi ${endpoint}, thử lại sau ${backoff}ms`);
                        showNotification(`${this.logPrefix} ⚠️ Lỗi khi gọi ${endpoint}, thử lại sau ${backoff}ms`,'info');

                        await new Promise(r => setTimeout(r, backoff));
                    } else {
                        console.error(`${this.logPrefix} ❌ Gọi ${endpoint} thất bại sau ${retries} lần`);
                        throw err;
                    }
                }
            }
        };

        // Nhận thưởng
        const reward = await safeApiCall("wp-json/tong-mon/v1/claim-boss-reward");
        if (reward?.success) showNotification(reward.message, "success");

        // Delay trước khi hiến tế
        const contribDelay = Math.floor(Math.random() * 1000) + 2000;
        await new Promise(resolve => setTimeout(resolve, contribDelay));

        // Hiến tế
        const contrib = await safeApiCall("wp-json/tong-mon/v1/contribute-boss");
        if (contrib?.success) showNotification(contrib.message, "success");
    }



    // Check event
        async processBossEvent(event, data) {
            if (!this.biCanhSocketActive || !data) return;
            const bossId = data.boss_id;

            if (bossId !== this.currentBossId) return;
            console.log(`[BiCanh] ${event} cho boss ${bossId}:`, data);
           //showNotification(`[BiCanh] ${event} cho boss ${bossId}:`, data);
            if (event === "boss_tm_hp_update" && Number(data.current_hp) === 0) {
                await this.handleBossDefeated(bossId);
            }
            if (event === "boss_tm_defeated") {
                await this.handleBossDefeated(bossId);
            }
        }

        async startBossSocketListener() {
            if (this.biCanhSocketActive) return;
            this.biCanhSocketActive = true;
            // console.log(`${this.logPrefix} ▶️ Bắt đầu startBossSocketListener`);
            // showNotification(`${this.logPrefix} ▶️ Bắt đầu startBossSocketListener`);
            if (this.biCanhSocketWaiter) clearInterval(this.biCanhSocketWaiter);
            this.biCanhSocketWaiter = setInterval(async () => {
                if (typeof socket !== "undefined" && typeof socket.on === "function") {
                    clearInterval(this.biCanhSocketWaiter);
                    this.biCanhSocketWaiter = null;

                    // console.log(`${this.logPrefix} ✅ Socket sẵn sàng, gọi updateCurrentBossId...`);
                    // showNotification(`${this.logPrefix} ✅ Socket sẵn sàng, gọi updateCurrentBossId...`, "info");
                    await this.updateCurrentBossId();
                    //showNotification(`${this.logPrefix} theo dõi bossId=${this.currentBossId})`, "info");
                    if (typeof socket.off === "function") {
                        socket.off("boss_tm_hp_update");
                        socket.off("boss_tm_defeated");
                    }

                    socket.on("boss_tm_hp_update", (data) => this.processBossEvent("boss_tm_hp_update", data));
                    socket.on("boss_tm_defeated", (data) => this.processBossEvent("boss_tm_defeated", data));

                    showNotification(`Đã kết nối socket Bí Cảnh (theo dõi bossId=${this.currentBossId})`, "info");
                }
            }, 200);
        }


    stopBossSocketListener() {
         //showNotification(`${this.logPrefix} (bossId=${this.currentBossId}) trước khi clear`,'info');
        this.biCanhSocketActive = false;
        this.handledBossIds.clear();
        // console.log(`${this.logPrefix} ⏹️ Reset handledBossIds khi stop listener (bossId=${this.currentBossId})`);
        //  showNotification(`${this.logPrefix} ⏹️ Reset handledBossIds khi stop listener (bossId=${this.currentBossId})`,'info');
        if (this.biCanhSocketWaiter) {
            clearInterval(this.biCanhSocketWaiter);
            this.biCanhSocketWaiter = null;
        }

        if (typeof socket !== "undefined" && typeof socket.off === "function") {
            socket.off("boss_tm_hp_update");
            socket.off("boss_tm_defeated");
        }

        showNotification(`⏹️ Socket listener Bí Cảnh đã tắt (bossId=${this.currentBossId})`, "warn");
    }



    }
// ===============================================
// HOANG VỰC
// ===============================================
 class HoangVuc {
            constructor() {
                this.ajaxUrl = `${weburl}wp-content/themes/halimmovies-child/hh3d-ajax.php`;
                this.adminAjaxUrl = `${weburl}wp-admin/admin-ajax.php`;
                this.logPrefix = "[HH3D Hoang Vực]";
                this.headers = {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest",
                };
            }
            /**
            * Lấy nguyên tố của người dùng từ trang Hoang Vực.
            */
            async getMyElement() {
                const url = weburl + 'hoang-vuc?t';
                const response = await fetch(url);
                const text = await response.text();
                const regex = /<img id="user-nguhanh-image".*?src=".*?ngu-hanh-(.*?)\.gif"/;
                const match = text.match(regex);
                if (match && match[1]) {
                    const element = match[1];
                    console.log(`${this.logPrefix} ✅ Đã lấy được nguyên tố của bạn: ${element}`);
                    return element;
                } else {
                    console.error(`${this.logPrefix} ❌ Không tìm thấy nguyên tố của người dùng.`);
                    return null;
                }
            }

            /**
            * Xác định nguyên tố tối ưu dựa trên boss và chiến lược.
            * @param {string} bossElement - Nguyên tố của boss.
            * @param {boolean} maximizeDamage - true: tối đa hóa sát thương; false: tránh giảm sát thương.
            * @returns {Array<string>} Mảng chứa các nguyên tố phù hợp.
            */
            getTargetElement(bossElement, maximizeDamage) {
                const rules = {
                    'kim': { khắc: 'moc', bị_khắc: 'hoa' },
                    'moc': { khắc: 'tho', bị_khắc: 'kim' },
                    'thuy': { khắc: 'hoa', bị_khắc: 'tho' },
                    'hoa': { khắc: 'kim', bị_khắc: 'thuy' },
                    'tho': { khắc: 'thuy', bị_khắc: 'moc' },
                };

                const suitableElements = [];

                if (maximizeDamage) {
                    // Tối đa hóa sát thương: tìm nguyên tố khắc boss
                    for (const myElement in rules) {
                        if (rules[myElement].khắc === bossElement) {
                            suitableElements.push(myElement);
                            break; // Chỉ cần một nguyên tố khắc là đủ
                        }
                    }
                } else {
                    // Không bị giảm sát thương: tìm tất cả các nguyên tố không bị boss khắc
                    for (const myElement in rules) {
                        if (rules[myElement].bị_khắc !== bossElement) {
                            suitableElements.push(myElement);
                        }
                    }
                }
                return suitableElements;
            }

            /**
            * Nhận thưởng Hoang Vuc.
            */
            async claimHoangVucRewards(nonce) {
                const payload = new URLSearchParams();
                payload.append('action', 'claim_chest');
                payload.append('nonce', nonce);

                console.log(`${this.logPrefix} 🎁 Đang nhận thưởng...`);
                const response = await fetch(this.adminAjaxUrl, {
                    method: 'POST',
                    headers: this.headers,
                    body: payload,
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    const rewards = data.total_rewards;
                    const message = `✅ Nhận thưởng thành công: +${rewards.tinh_thach} Tinh Thạch, +${rewards.tu_vi} Tu Vi.`;
                    console.log(message);
                    showNotification(message, 'success');
                } else {
                    console.error(`${this.logPrefix} ❌ Lỗi khi nhận thưởng:`, data.message || 'Lỗi không xác định.');
                    showNotification(data.message || 'Lỗi khi nhận thưởng.', 'error');
                }
            }

            /**
            * Tấn công boss Hoang Vực.
            * @param {string} bossId - ID của boss cần tấn công.
            * @param {string} nonce - Nonce bảo mật.
            * @returns {Promise<boolean>} `True` nếu tấn công thành công, ngược lại là `false`.
            */
            async attackHoangVucBoss(bossId, nonce) {
                const currentTime = Date.now();
                const securityToken = await getSecurityToken(weburl + 'hoang-vuc?t');
                const payload = new URLSearchParams();
                payload.append('action', 'attack_boss');
                payload.append('boss_id', bossId);
                payload.append('security_token', securityToken);
                payload.append('nonce', nonce);
                payload.append('request_id', `req_${Math.random().toString(36).substring(2, 8)}${currentTime}`);

                console.log(`${this.logPrefix} ⚔️ Đang tấn công boss...`);
                const response = await fetch(this.ajaxUrl, {
                    method: 'POST',
                    headers: this.headers,
                    body: payload,
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    showNotification('✅ Tấn công boss hoang vực hành công', 'success');
                    return true
                } else if (data.data.error === 'Đạo hữu đã hết lượt tấn công trong ngày.') {
                    taskTracker.markTaskDone(accountId, 'hoangvuc');
                    showNotification('Đạo hữu đã hết lượt tấn công trong ngày.', 'info');
                    return true;
                }
                else {
                    const errorMessage = data.data.error || 'Lỗi không xác định khi tấn công.';
                    showNotification(errorMessage, 'error');
                    return false;
                }
            }

            /**
            * Lặp lại việc đổi nguyên tố cho đến khi đạt được nguyên tố phù hợp hoặc không thể đổi tiếp.
            * @param {string} currentElement - Nguyên tố hiện tại của người dùng.
            * @param {string} bossElement - Nguyên tố của boss.
            * @param {boolean} maximizeDamage - Chiến lược tối đa hóa sát thương hay không.
            * @param {string} nonce - Nonce bảo mật.
            * @returns {Promise<string|null>} Nguyên tố mới nếu đổi thành công, ngược lại là null.
            */
            async changeElementUntilSuitable(currentElement, bossElement, maximizeDamage, nonce) {
                let myElement = currentElement;
                let changeAttempts = 0;
                const MAX_ATTEMPTS = 5;

                const rules = {
                    'kim':  { khắc: 'moc',  bị_khắc: 'hoa' },
                    'moc':  { khắc: 'tho',  bị_khắc: 'kim' },
                    'thuy': { khắc: 'hoa',  bị_khắc: 'tho' },
                    'hoa':  { khắc: 'kim',  bị_khắc: 'thuy' },
                    'tho':  { khắc: 'thuy', bị_khắc: 'moc' },
                };

                function isOptimal(el) {
                    return rules[el].khắc === bossElement;
                }
                function isNeutral(el) {
                    return rules[el].bị_khắc !== bossElement;
                }

                while (changeAttempts < MAX_ATTEMPTS) {
                    changeAttempts++;

                    const currentlyOptimal = isOptimal(myElement);
                    const currentlyNeutral = isNeutral(myElement);

                    // 🔎 Kiểm tra trước khi đổi
                    if (!currentlyNeutral) {
                        console.log(`${this.logPrefix} ❌ Đang bị boss khắc chế -> phải đổi.`);
                    } else {
                        if (maximizeDamage && currentlyOptimal) {
                            console.log(`${this.logPrefix} 🌟 Đang ở trạng thái tối ưu. Dừng đổi.`);
                            return myElement;
                        }
                        if (!maximizeDamage && currentlyNeutral) {
                            console.log(`${this.logPrefix} ✅ Đang ở trạng thái hòa (không bị giảm). Dừng đổi.`);
                            return myElement;
                        }
                    }

                    // 🔄 Tiến hành đổi element
                    const payloadChange = new URLSearchParams({ action: 'change_user_element', nonce });
                    const changeData = await (await fetch(this.ajaxUrl, {
                        method: 'POST',
                        headers: this.headers,
                        body: payloadChange,
                        credentials: 'include'
                    })).json();

                    if (changeData.success) {
                        myElement = changeData.data.new_element;
                        console.log(`${this.logPrefix} 🔄 Đổi lần ${changeAttempts} -> ${myElement}`);
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } else {
                        console.error(`${this.logPrefix} ❌ Lỗi khi đổi:`, changeData.message || 'Không xác định.');
                        return myElement;
                    }
                }

                // ⏳ Hết lượt đổi nhưng vẫn chưa đạt chiến lược
                console.log(`${this.logPrefix} ⚠️ Đã hết MAX_ATTEMPTS (${MAX_ATTEMPTS}). Chấp nhận nguyên tố cuối cùng: ${myElement}`);
                return myElement;
            };

            async getNonceAndRemainingAttacks(url) {
                const logPrefix = '[Hoang Vực]';
                    console.log(`${logPrefix} ▶️ Đang tải trang từ ${url}...`);
                    try {
                        const response = await fetch(url);
                        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                        const html = await response.text();

                        // Regex 1: lấy số lượt đánh
                        const attacksMatch = html.match(/<div class="remaining-attacks">Lượt đánh còn lại:\s*(\d+)<\/div>/);
                        const remainingAttacks = attacksMatch ? parseInt(attacksMatch[1], 10) : null;

                        // Regex 2: lấy nonce
                        const nonceMatch = html.match(/var ajax_boss_nonce = '([a-f0-9]+)'/);
                        const nonce = nonceMatch ? nonceMatch[1] : null;

                        console.log(`${logPrefix} ✅ Lấy dữ liệu thành công.`);
                        return { remainingAttacks, nonce };

                    } catch (e) {
                        console.error(`${logPrefix} ❌ Lỗi khi tải trang hoặc trích xuất dữ liệu:`, e);
                        return { remainingAttacks: null, nonce: null };
                    }
                }


            /**
            * Hàm chính để tự động hóa Hoang Vực.
            */
            async doHoangVuc() {
                const maximizeDamage = localStorage.getItem('hoangvucMaximizeDamage') === 'true';
                console.log(`${this.logPrefix} ▶️ Bắt đầu nhiệm vụ với chiến lược: ${maximizeDamage ? 'Tối đa hóa Sát thương' : 'Không giảm Sát thương'}.`);
                const hoangVucUrl = `${weburl}hoang-vuc?t`;
                const { remainingAttacks, nonce } = await this.getNonceAndRemainingAttacks(hoangVucUrl);

                if (!nonce) {
                    showNotification('Lỗi: Không thể lấy nonce cho Hoang Vực.', 'error');
                    throw new Error("Không lấy được nonce");
                }

                const payloadBossInfo = new URLSearchParams();
                payloadBossInfo.append('action', 'get_boss');
                payloadBossInfo.append('nonce', nonce);

                try {
                    const bossInfoResponse = await fetch(this.ajaxUrl, {
                        method: 'POST',
                        headers: this.headers,
                        body: payloadBossInfo,
                        credentials: 'include'
                    });
                    const bossInfoData = await bossInfoResponse.json();

                    if (bossInfoData.success) {
                        const boss = bossInfoData.data;

                        if (boss.has_pending_rewards) {
                            await this.claimHoangVucRewards(nonce);
                            return this.doHoangVuc();
                        } else if (boss.created_date === new Date().toISOString().slice(0, 10) && boss.health === boss.max_health) {
                            taskTracker.markTaskDone(accountId, 'hoangvuc');
                            return true;
                        }

                        let myElement = await this.getMyElement();
                        const bossElement = boss.element;

                        // Lấy danh sách các nguyên tố phù hợp
                        const suitableElements = this.getTargetElement(bossElement, maximizeDamage);

                        if (!suitableElements.includes(myElement)) {
                            console.log(`${this.logPrefix} 🔄 Nguyên tố hiện tại (${myElement}) không phù hợp. Đang thực hiện đổi.`);
                            const newElement = await this.changeElementUntilSuitable(myElement, bossElement, maximizeDamage, nonce);

                            if (newElement && suitableElements.includes(newElement)) {
                                myElement = newElement;
                                console.log(`${this.logPrefix} ✅ Đã có được nguyên tố phù hợp: ${myElement}.`);
                            } else {
                                console.log(`${this.logPrefix} ⚠️ Không thể có được nguyên tố phù hợp sau khi đổi. Tiếp tục với nguyên tố hiện tại.`);
                            }
                        } else {
                            console.log(`${this.logPrefix} ✅ Nguyên tố hiện tại (${myElement}) đã phù hợp. Không cần đổi.`);
                        }
                        // Cập nhật số lượt đánh còn lại
                        await new Promise(resolve => setTimeout(resolve, 500));
                        const timePayload = new URLSearchParams();
                        timePayload.append('action', 'get_next_attack_time');
                        const timeResponse = await fetch(this.ajaxUrl, {
                            method: 'POST',
                            headers: this.headers,
                            body: timePayload,
                            credentials: 'include'
                        });
                        const nextAttackTime = await timeResponse.json();

                        if (nextAttackTime.success && Date.now() >= nextAttackTime.data) {
                            // Thực hiện tấn công boss Hoang Vực, nếu thành công và còn 1 lượt tấn công thì đánh dấu nhiệm vụ hoàn thành
                            await new Promise(resolve => setTimeout(resolve, 500));
                            if (await this.attackHoangVucBoss(boss.id, nonce)){
                                taskTracker.adjustTaskTime(accountId, 'hoangvuc', timePlus('15:02'));   //--------- 15 phút cho lần sau -----------//
                                if (this.remainingAttacks <= 1) {
                                taskTracker.markTaskDone(accountId, 'hoangvuc');
                                };
                            };
                        } else {
                            const remainingTime = nextAttackTime.data - Date.now();
                            const remainingSeconds = Math.floor(remainingTime / 1000);
                            const minutes = Math.floor(remainingSeconds / 60);
                            const seconds = remainingSeconds % 60;
                            const message = `⏳ Cần chờ <b>${minutes} phút ${seconds} giây</b> để tấn công tiếp.`; ///////////////////
                            showNotification(message, 'info');
                            taskTracker.adjustTaskTime(accountId, 'hoangvuc', nextAttackTime.data);
                        }
                    } else {
                        const errorMessage = bossInfoData.message || 'Lỗi không xác định khi lấy thông tin boss.';
                        showNotification(errorMessage, 'error');
                    }
                } catch (e) {
                    console.error(`${this.logPrefix} ❌ Lỗi mạng:`, e);
                    showNotification(e.message, 'error');
                    throw e;
                }
            }
        }


        // ===============================================
        // HOANG VỰC SHOP
        // ===============================================


    class HoangVucShop {
        constructor() {
            this.ajaxUrl = `${weburl}wp-content/themes/halimmovies-child/hh3d-ajax.php`;
            this.logPrefix = "[HH3D Hoang Vuc Shop]";
            this.dailyLimit = 5;
        }

        async getHoangVucNonce() {
            const url = `${weburl}hoang-vuc?t`;
            try {
                const response = await fetch(url, { credentials: 'include' });
                if (!response.ok) return null;
                const html = await response.text();
                const nonceMatch = html.match(/var ajax_boss_nonce = '([a-f0-9]+)'/);
                return nonceMatch ? nonceMatch[1] : null;
            } catch (err) {
                console.error(`${this.logPrefix} ❌ Lỗi khi lấy nonce:`, err);
                return null;
            }
        }

        getTodayKey() {
            return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
        }

        resetPurchase() {
            const todayKey = this.getTodayKey();
            localStorage.setItem('hoangvuc-purchase', JSON.stringify({
                date: todayKey,
                count: 0,
                lastPurchaseTime: null
            }));
        }

        getPurchasedToday() {
            const saved = JSON.parse(localStorage.getItem('hoangvuc-purchase') || '{}');
            const todayKey = this.getTodayKey();

            if (!saved.date || saved.date !== todayKey) {
                this.resetPurchase();
                return 0;
            }
            return saved.count || 0;
        }

        setPurchasedToday(count) {
            const todayKey = this.getTodayKey();
            const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
            localStorage.setItem('hoangvuc-purchase', JSON.stringify({
                date: todayKey,
                count,
                lastPurchaseTime: now
            }));
        }

        isDailyLimit() {
            return this.getPurchasedToday() >= this.dailyLimit;
        }

        async muaRuongLinhBao(quantity) {
            const nonce = await this.getHoangVucNonce();
            if (!nonce) {
                showNotification("❌ Không lấy được nonce, vui lòng đăng nhập lại", "error");
                return null;
            }

            let purchased = this.getPurchasedToday();
            if (purchased >= this.dailyLimit) {
                showNotification("⚠️ Bạn đã mua đủ 5 rương hôm nay", "warn");
                return null;
            }

            let allowedQuantity = quantity;
            if (purchased + quantity > this.dailyLimit) {
                allowedQuantity = this.dailyLimit - purchased;
                showNotification(`⚠️ Chỉ có thể mua thêm ${allowedQuantity} rương để đạt tối đa 5/ngày`, "warn");
            }

            try {
                const body = new URLSearchParams({
                    action: "purchase_item_shop_boss",
                    item_id: "ruong_linh_bao",
                    item_type: "tinh_thach",
                    quantity: allowedQuantity,
                    nonce: nonce
                });

                const response = await fetch(this.ajaxUrl, {
                    method: "POST",
                    body,
                    credentials: "include"
                });

                const res = await response.json();
                console.log(`${this.logPrefix} 📦 Response:`, res);

                if (res.success) {
                    purchased += allowedQuantity;
                    this.setPurchasedToday(purchased);
                    showNotification(`✅ ${res.data.message}`, "success");
                } else {
                    showNotification(`⚠️ ${res.data}`, "warn");
                }
                return res;
            } catch (err) {
                console.error(`${this.logPrefix} ❌ Lỗi khi mua rương:`, err);
                showNotification("❌ Lỗi khi gửi yêu cầu mua rương", "error");
                return null;
            }
        }
    }

        // ===============================================
        // ĐAN TÔNG
        // ===============================================


    class DanTongShop {
    constructor() {
        this.weburl = weburl;
        this.apiUrl = this.weburl + "wp-json/tong-mon/v1/buy-dan-duoc-tm";
        this.logPrefix = "[HH3D Đan Tông Môn]";
        this.danList = [];
        const DanTongfileName = "/DanTongMon.json";
        this.DanTongUrl = baseUrl + repoPath + branch + DanTongfileName;
    }

    async loadDanTongList() {
        if (this.danList && this.danList.length > 0) return;
        try {
            const response = await fetch(this.DanTongUrl);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            this.danList = await response.json(); // [{ id, name }, ...]
        } catch (err) {
            console.error(`${this.logPrefix} ❌ Lỗi khi tải danh sách Đan Tông:`, err);
            throw err;
        }
    }

    async muaDanTong(itemId, nonce) {
        try {
            const headers = {
                "Content-Type": "application/json",
                "X-WP-Nonce": nonce
            };
            const bodyPayload = { item_id: itemId };

            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers,
                credentials: "include",
                referrer: this.weburl + "danh-sach-thanh-vien-tong-mon",
                body: JSON.stringify(bodyPayload),
                mode: "cors"
            });

            const res = await response.json();
            console.log(`${this.logPrefix} 📦 Mua ${itemId}:`, res);
            return res;
        } catch (err) {
            console.error(`${this.logPrefix} ❌ Lỗi khi mua ${itemId}:`, err);
            return null;
        }
    }

    async muaTopNDanTong(n) {
        await this.loadDanTongList();
        const nonce = await getNonce(); // lấy nonce một lần cho cả vòng lặp
        const topN = this.danList.slice(0, n);

        for (const item of topN) {
            let keepBuying = true;
            while (keepBuying) {
                const res = await this.muaDanTong(item.id, nonce);
                if (!res) break;
                if (res.success) {
                    showNotification(`✅ Mua thành công ${item.name}`, "success");
                } else {
                    showNotification(`⚠️ ${item.name}: ${res.message}`, "warn");
                    keepBuying = false;
                }
            }
        }
        // showNotification(`🎉 Hoàn thành mua ${n} loại đan to nhất`, "success");
    }
}



    // ===============================================
        // ĐAN TỤ BẢO CÁC
        // ===============================================

class DanTuBaoShop {
    constructor() {
        this.weburl = weburl;
        this.logPrefix = "[HH3D Đan Tụ Bảo Các]";
        this.nonceLogged = false;
        this.danDuocList = [];

        const DanTuBaofileName = "/DanTuBaoCac.json";
        this.DanTuBaoUrl = baseUrl + repoPath + branch + DanTuBaofileName;

    }

    async loadDanDuocList() {
        if (this.danDuocList && this.danDuocList.length > 0) return;
        try {
            const response = await fetch(this.DanTuBaoUrl);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            this.danDuocList = await response.json();
            showNotification(`✅ Đã tải danh sách đan (${this.danDuocList.length} items)`, "info");
        } catch (err) {
            showNotification("❌ Lỗi khi tải danh sách đan", "error");
            throw err;
        }
    }

    // 🔑 lấy Nonce từ fetch HTML từ trang Tụ Bảo Các
    async getNonceAndUrl() {
        try {
            const response = await fetch(this.weburl + "tu-bao-cac?t", { credentials: "include" });
            const html = await response.text();

            const regex = /var\s+Ajax_Shop\s*=\s*(\{.*?\});/s;
            const match = html.match(regex);

            if (match && match[1]) {
                const ajaxShop = JSON.parse(match[1]);
                if (!this.nonceLogged) {
                    //showNotification(`🔐 Nonce lấy được: ${ajaxShop.nonce}`, "info");
                    console.log("🔑 Nonce tụ bảo:", ajaxShop.nonce);
                    this.nonceLogged = true;
                }
                return ajaxShop;
            }
            showNotification("❌ Không tìm thấy Ajax_Shop trong HTML", "error");
            return { nonce: null, ajaxurl: this.weburl + "wp-admin/admin-ajax.php" };
        } catch (e) {
            showNotification("❌ Lỗi khi tải trang Tụ Bảo Các để lấy nonce", "error");
            return { nonce: null, ajaxurl: this.weburl + "wp-admin/admin-ajax.php" };
        }
    }

    async getSelfTuVi() {
        const els = document.querySelectorAll('#head_manage_acc');
        for (const el of els) {
            const text = el.textContent || "";
            if (text.includes("Tu Vi")) {
                const num = text.match(/\d+/);
                if (num) return parseInt(num[0], 10);
            }
        }
        return null;
    }

    async muaDanTuBao(dan, nonce, apiUrl) {
        try {
            const bodyPayload = new URLSearchParams({
                action: "handle_buy_danduoc",
                danduoc_id: dan.id,
                nonce: nonce
            });

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
                credentials: "include",
                body: bodyPayload.toString()
            });

            const res = await response.json();
            const serverMsg = res?.data?.message || res?.message || "Lỗi không xác định";

            if (res.success) {
                showNotification(`✅ ${dan.name} — ${serverMsg}`, "success");
            } else {
                showNotification(`⚠️ Bỏ qua ${dan.name} — ${serverMsg}`, "warn");
            }
            return res;
        } catch (err) {
            showNotification(`⚠️ Bỏ qua ${dan.name} — ${err.message}`, "warn");
            return { success: false, data: { message: err.message } };
        }
    }

    async autobuyTuBao() {
        let myTuVi = await this.getSelfTuVi();
        if (!myTuVi) {
            showNotification("❌ Không lấy được Tu Vi", "error");
            return;
        }

        await this.loadDanDuocList();
        const ajaxShop = await this.getNonceAndUrl();
        if (!ajaxShop.nonce) {
            showNotification("❌ Không tìm thấy Nonce, cần truy cập Tụ Bảo Các để mua đan", "error");
            return;
        }

        let totalTuViGain = 0;
        let totalCost = 0;
        const skippedItems = new Set();

        const parseRange = (rangeStr) => {
            const [minStr, maxStr] = (rangeStr || "").split("-");
            return { min: parseInt(minStr, 10), max: parseInt(maxStr, 10) };
        };

        const idNumeric = (id) => {
            const m = /^item_(\d+)$/.exec(id || "");
            return m ? parseInt(m[1], 10) : NaN;
        };

        let keepGoing = true;
        while (keepGoing) {
            const danhSachPhuHop = this.danDuocList
                .map(d => ({ ...d, ...parseRange(d.range) }))
                .filter(d => myTuVi >= d.min && myTuVi <= d.max && !skippedItems.has(d.id));

            if (danhSachPhuHop.length === 0) {
                showNotification(`⚠️ Tu Vi ${myTuVi} không phù hợp với đan nào`, "warn");
                break;
            }

            danhSachPhuHop.sort((a, b) => {
                if (a.max !== b.max) return a.max - b.max;
                const na = idNumeric(a.id), nb = idNumeric(b.id);
                if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
                return String(a.id).localeCompare(String(b.id));
            });

            let muaThanhCong = false;
            for (const dan of danhSachPhuHop) {
                showNotification(`📌 Tu Vi ${myTuVi} thử mua ${dan.name}`, "info");
                const res = await this.muaDanTuBao(dan, ajaxShop.nonce, ajaxShop.ajaxurl);

                if (res?.success) {
                    totalTuViGain += dan.tuviGain;
                    totalCost += dan.cost;
                    myTuVi += dan.tuviGain;
                    muaThanhCong = true;
                    break;
                } else {
                    skippedItems.add(dan.id);
                }
            }

            if (!muaThanhCong) {
                showNotification(`❌ Không thể mua thêm viên nào ở Tu Vi ${myTuVi}`, "error");
                keepGoing = false;
            }
        }

        showNotification(`📊 Tổng kết: +${totalTuViGain} Tu Vi, -${totalCost} Tinh Thạch`, "info");
    }
}
//================== Pháp Tướng/ kHẮC TRẬN VĂN=====================//

class KhacTranVan {
    constructor() {
        this.weburl = weburl;
        this.logPrefix = "[HH3D Khắc Trận Văn]";
        this.config = null;
    }

    // 🔑 Lấy nonce và token từ trang Pháp Tướng
    async getConfig() {
        try {
            const response = await fetch(this.weburl + "/trieu-hoi-phap-tuong?t", {
                credentials: "include"
            });
            const html = await response.text();

            // Regex tìm đoạn PHAP_TUONG_CONFIG = {...};
            const regex = /PHAP_TUONG_CONFIG\s*=\s*(\{[\s\S]*?\});/;
            const match = html.match(regex);

            if (match && match[1]) {
                // Không dùng JSON.parse vì đây là object JS, không phải JSON
                this.config = eval("(" + match[1] + ")");
                //console.log(this.logPrefix, "🔑 Nonce:", this.config.nonce);
                //console.log(this.logPrefix, "🔒 Token:", this.config.token);
                return this.config;
            } else {
                // showNotification("❌ Không tìm thấy PHAP_TUONG_CONFIG trong HTML", "error");
                return null;
            }
        } catch (e) {
            console.error(this.logPrefix, e);
            showNotification("❌ Lỗi khi tải trang Pháp Tướng để lấy nonce/token", "error");
            return null;
        }
    }

    // 🌟 Claim lượt VIP
   async claimDailyTurns(accountId) {
    if (!this.config) await this.getConfig();
    if (!this.config?.nonce || !this.config?.token) return false; // ❌ thiếu config thì coi như thất bại

    try {
        const response = await fetch(this.weburl + "wp-json/phap-tuong/v1/claim-daily-turns", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-WP-Nonce": this.config.nonce,
                "X-Pt-Token": this.config.token
            }
        });

        const data = await response.json();

        // ✅ Thành công
        if (data.success) {
            showNotification(`${this.logPrefix}✨ ${data.message}`, "success");
            console.log(this.logPrefix, `🎁 Nhận thêm ${data.turns_claimed} lượt`);
            this.config.remainingTurns = data.new_total;
         taskTracker.markTaskDone(accountId, 'luotkhactranvip');
            return true;

        }

        // ✅ Đã nhận rồi (coi như OK)
        if (data.message && data.message.includes("Đạo hữu đã nhận lượt VIP hôm nay rồi")) {
            showNotification(`${this.logPrefix}ℹ️ ${data.message}`, "info");
            //console.log(this.logPrefix, data.message);
            taskTracker.markTaskDone(accountId, 'luotkhactranvip');
            return true;

        }

        // ✅ Tính năng dành riêng cho VIP (coi như OK)
        if (data.message && data.message.includes("Tính năng dành riêng cho VIP")) {
            showNotification(`${this.logPrefix}🔒 ${data.message}`, "error");
            //console.log(this.logPrefix, data.message);
            //console.log(this.logPrefix, "test nè");
            taskTracker.markTaskDone(accountId, 'luotkhactranvip');
            return true;

        }

        // ❌ Các lỗi khác
        showNotification(`${this.logPrefix}ℹ️ ${data.message}`, "error");

        return false;

    } catch (err) {
        console.error(this.logPrefix, "❌ Lỗi khi claim lượt VIP:", err);
        return null;
    }
}



    // 📜 Thực hiện một lần khắc trận văn
    async activateSeal() {
        if (!this.config) await this.getConfig();
        if (!this.config?.nonce || !this.config?.token) return null;

        try {
            const response = await fetch(this.weburl + "/wp-json/phap-tuong/v1/activate-seal", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-WP-Nonce": this.config.nonce,
                    "x-pt-token": this.config.token
                }
            });
            return await response.json(); // chỉ trả về data
        } catch (err) {
            console.error(this.logPrefix, "❌ Lỗi khi khắc trận văn:", err);
            return null;
        }
    }

    // ✅ Hàm kiểm tra còn lượt khắc hay không (luôn claim trước rồi mới check)
    async checkRemainingTurns() {
        await this.getConfig();

        // luôn thử claim trước
        //await this.claimDailyTurns();

        const turns = this.config?.remainingTurns || 0;
        return turns <= 0; // true nếu hết lượt, false nếu còn
    }

    // 🔄 Hàm tự động khắc theo số lượt còn lại
    async autoActivateSeal() {
        const isOut = await this.checkRemainingTurns();
        if (isOut) {
            // showNotification("❌ Không còn lượt khắc trận văn", "error");
            console.log(this.logPrefix, "❌ Không còn lượt khắc trận văn", "error");
            return;
        }

        // lấy số lượt từ config đã refresh trong checkRemainingTurns
        let turns = this.config?.remainingTurns || 0;
        console.log(this.logPrefix, `🔍 Bắt đầu, còn ${turns} lượt.`);

        let successCount = 0;
        let failCount = 0;

        while (turns > 0) {
            const res = await this.activateSeal();
            if (!res) {
                showNotification("❌ Lỗi khi khắc trận văn", "error");
                break;
            }

            if (res.success) {
                successCount++;
                showNotification(`✅ Thành công: ${res.message}`, "success");
            } else {
                failCount++;
                showNotification(`⚠️ Thất bại: ${res.message}`, "warn");
            }

            turns = res.remaining_turns ?? turns - 1;
            await new Promise(r => setTimeout(r, 1000));
        }

        if (turns <= 0) {
            showNotification(
                `⏹ Hết lượt khắc trận văn. Tổng kết: ${successCount} thành công, ${failCount} thất bại.`,
                "info"
            );
        } else {
            showNotification(
                `⏹ Dừng sớm, còn ${turns} lượt chưa dùng.`,
                "warn"
            );
        }
    }
}


  // ===============================================
        // LUẬN VÕ
        // ===============================================

       class LuanVo {
        constructor() {
        this.weburl = weburl;
        this.accountId = accountId;
        this.logPrefix = '[Luận Võ]';
        this.config = null;
        this.currentTarget = null;
        this.targetLeft = 0;
        this.sent = 0;
        this.maxBattles = 5;
    }

    async setupConfig() {
        const nonce = await getNonce();
        const securityToken = await getSecurityToken(this.weburl + 'luan-vo-duong?t');
        this.config = { nonce, token: securityToken };
    }

    async sendApiRequest(endpoint, method, body = {}) {
        try {
            const url = `${this.weburl}${endpoint}`;
            const headers = {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-WP-Nonce": this.config.nonce,
                "x-lv-token": this.config.token
            };

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(body),
                credentials: 'include'
            });

            const contentType = response.headers.get("content-type");
            let data = null;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
            }
            if (!response.ok) {
                console.warn(`${this.logPrefix} ⚠️ API lỗi ${response.status}:`, data);
                return data;
            }
            return data;
        } catch (error) {
            console.error(`${this.logPrefix} ❌ Lỗi khi gửi yêu cầu tới ${endpoint}:`, error);
            return null;
        }
    }
    /**
    * Hàm hỗ trợ: Đợi một khoảng thời gian.
    */
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    /**
    *
    lấy thông tin lượt gửi/nhận
    */
async fetchLvPageInfo() {
  try {
    const url = "/luan-vo-duong?t=" + Date.now();
    const resp = await fetch(url, {
      credentials: "include",
      cache: "no-store"
    });
    if (!resp.ok) {
      throw new Error("Không load được trang Luận Võ");
    }

    const html = await resp.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    // ===== PARSE ĐÃ GỬI / ĐÃ NHẬN =====
    let sent = 0;
    let received = 0;

    doc.querySelectorAll("p").forEach(p => {
      const t = p.innerText || "";
      if (t.includes("Đã gửi")) {
        const m = t.match(/(\d+)\s*\/\s*5/);
        if (m) {
          sent = Number(m[1]);
        }
      }
      if (t.includes("Đã nhận")) {
        const m = t.match(/(\d+)\s*\/\s*5/);
        if (m) {
          received = Number(m[1]);
        }
      }
    });


this.sent = sent;
this.received = received;
console.log(`${this.logPrefix} 🎯Đã gửi: ${this.sent}, Đã nhận: ${this.received}`);

    return { sent, received };
  } catch (error) {
    console.error("❌ Lỗi khi lấy thông tin Luận Võ:", error);
    return { sent: 0, received: 0 };
  }
}



    /**
    * Đảm bảo tính năng tự động chấp nhận khiêu chiến được bật.
    */
async ensureAutoAccept() {
    const toggleEndpoint = 'wp-json/luan-vo/v1/toggle-auto-accept';
    const result = await this.sendApiRequest(toggleEndpoint, 'POST', {});
    //console.log(`Check Status Auto Accept: ${result.message}`);



    if (result && result.success && result.message.includes('Đã bật')) {
        taskTracker.updateTask(this.accountId, 'luanvo', 'auto_accept', true);
        return true;
    }
        await this.sendApiRequest(toggleEndpoint, 'POST', {}); //bật lại nếu có manual tắt autoaccept
        //console.log("Đã bật lại tự động chấp nhận");
        taskTracker.updateTask(this.accountId, 'luanvo', 'auto_accept', true);
    return false;

}

        /**
    * Lấy danh sách tất cả user đang theo dõi
    * Gồm các phần: id, name, avatar, points, auto_accept, can_receive_count, profile_link, role, role_color, description, challenges_remaining, challenge_exists, challenge_id, is_following, is_joined_today, can_send_count, max_batch_count
    */

async getFollowingUsers() {
    console.log(`${this.logPrefix} 🕵️ Đang lấy danh sách người theo dõi...`);
    const endpoint = 'wp-json/luan-vo/v1/get-following-users';
    const body = { page: 1 };
    const data = await this.sendApiRequest(endpoint, 'POST', body);

    if (data && data.success) {
        const users = data.data.users;
        console.log(`${this.logPrefix} ✅ Tìm thấy ${users.length} người dùng.`);
        return users;
    } else {
        console.error(`${this.logPrefix} ❌ Lỗi khi lấy Online Users: ${data?.message || data?.data}`);
        return [];
    }
}


async getOnlineUsers() {
    console.log("🟢 Đang lấy danh sách người dùng online...");
    const endpoint = 'wp-json/luan-vo/v1/online-users';
    const body = { page: 1 };
    const data = await this.sendApiRequest(endpoint, 'POST', body);

    if (data && data.success) {
        const users = data.data.users;
        console.log(`✅ Tìm thấy ${users.length} người online.`);
        return users;
    } else {
       console.error(`${this.logPrefix} ❌ Lỗi khi lấy Online Users: ${data?.message || data?.data}`);
        return [];
    }
}



async sendChallenge(userId) {
    console.log(`${this.logPrefix} 🎯 Đang gửi khiêu chiến ID: ${userId}: ${this.currentTarget?.name}...`);
    const sendEndpoint = 'wp-json/luan-vo/v1/send-challenge';
    const sendBody = { target_user_id: userId };
    const sendResult = await this.sendApiRequest(sendEndpoint, 'POST', sendBody);

    if (sendResult && sendResult.success) {
        const approveEndpoint = 'wp-json/luan-vo/v1/auto-approve-challenge';
        const approveBody = {
            challenge_id: sendResult.data.challenge_id,
            target_user_id: userId
        };
        const approveResult = await this.sendApiRequest(approveEndpoint, 'POST', approveBody);
        if (approveResult && approveResult.success) {
            //showNotification(`⚔️ Hoàn tất Luận Võ với ${this.currentTarget?.name || userId}`, 'success');
            return true;
        }
    }
    showNotification(`❌ Gửi khiêu chiến thất bại tới ${this.currentTarget?.name || userId}`, 'error');
    return false;
}

async attackCurrentTarget() {
    if (!this.currentTarget) return;

    // ✅ nếu mình đã đủ 5 lượt → STOP
    if (this.sent >= this.maxBattles) {
        console.log("🏁 Đã đủ 5 lượt đấm — dừng auto", "success");
        return;
    }

    // ❌ target hết lượt
    if (this.targetLeft <= 0) {
        showNotification("🔄 Target hết lượt — chuyển đối tượng", "warn");
        this.currentTarget = null;
        return this.huntFromOnline();
    }

    const success = await this.sendChallenge(this.currentTarget.id, this.currentTarget.name);
    if (success) {
        this.sent++;        // tăng số lượt mình đã gửi
        this.targetLeft--;  // giảm số lượt còn lại của target
        await this.delay(4400);
    }
    return this.attackCurrentTarget();
}


async huntLuanVoTargets() {
    const users = await this.getFollowingUsers();
    if (!Array.isArray(users) || users.length === 0) {
        showNotification("❌ Không lấy được danh sách follow", "error");
        return this.huntFromOnline();
    }

    const target = users.find(u => Number(u.can_receive_count) > 0);
    if (!target) {
        showNotification("⚠️ Follow full — chuyển ONLINE", "warn");
        return this.huntFromOnline();
    }

    this.currentTarget = target;
    const myRemaining = this.maxBattles - this.sent;
    this.targetLeft = Math.min(target.can_receive_count, myRemaining);

    console.log(`🎯 Chọn ${target.name} còn(${this.targetLeft} lượt)`);
    return this.attackCurrentTarget();
}

async huntFromOnline() {
    const users = await this.getOnlineUsers();
    if (!Array.isArray(users) || users.length === 0) {
        showNotification("😴 Online full — nghỉ 60s", "info");
        return setTimeout(() => this.huntLuanVoTargets(), 60000);
    }

    const target = users.find(u => Number(u.challenges_remaining) > 0);
    if (!target) {
        showNotification("⚠️ Không có online khả dụng", "warn");
        return;

    }

    this.currentTarget = target;
    const myRemaining = this.maxBattles - this.sent;
    this.targetLeft = Math.min(target.challenges_remaining, myRemaining);
    //showNotification(`⚔️ Online: ${target.name} còn(${this.targetLeft} lượt)`, "info");
    return this.attackCurrentTarget();
}



async receiveReward() {
    console.log(`${this.logPrefix} 🎁 Đang gửi yêu cầu nhận thưởng...`);

    const endpoint = 'wp-json/luan-vo/v1/receive-reward';
    const body = {};

    try {
        const response = await this.sendApiRequest(endpoint, 'POST', {});
        if (!response) {
            return;
        }
        if (response.success === true) {
            showNotification(`🎉 Luận võ: ${response.message}`, 'success');
            taskTracker.markTaskDone(accountId, 'luanvo');
            return;
        } else if (response.message === "Đạo hữu đã nhận thưởng trong ngày hôm nay.") {
            showNotification('🎁 Bạn đã nhận thưởng Luận Võ hôm nay rồi!', 'info')
            taskTracker.markTaskDone(accountId, 'luanvo');
            return;
        } else {

            // const errorMessage = response.message || 'Lỗi không xác định khi nhận thưởng.';
            //console.error(`${this.logPrefix} ❌ Lỗi khi nhận thưởng: ${response?.message || response?.data}`);
            showNotification(`❌ ${response?.message || response?.data}`, 'error');

        }
    } catch (error) {
        showNotification(`❌ Lỗi mạng khi gửi yêu cầu nhận thưởng. ${error}`, 'error');
    }
}


async startLuanVo() {
        if (!this.config) {
            await this.setupConfig();
        }

        // lấy số lượt đã gửi/nhận từ server
        await this.fetchLvPageInfo();

        // Bước 2: Tham gia trận đấu
                if (!taskTracker.getTaskStatus(accountId, 'luanvo').battle_joined) {
                    const joinResult = await this.sendApiRequest(
                        'wp-json/luan-vo/v1/join-battle', 'POST', {action: 'join_battle', security_token: this.config.token}
                    );
                    console.log(`Check tham gia trận đấu ${joinResult}`);

                    if (joinResult && joinResult.success === true) {
                        console.log(`✅ ${joinResult.message || 'Tham gia luận võ thành công.'}`);
                        taskTracker.updateTask(accountId, 'luanvo', 'battle_joined', true);
                    } else if (joinResult.message === 'Bạn đã tham gia Luận Võ Đường hôm nay rồi!') {
                        console.log(`ℹ️ ${joinResult.message}`);
                        taskTracker.updateTask(accountId, 'luanvo', 'battle_joined', true);
                    } else {
                        console.error(`${this.logPrefix} ❌ ${joinResult?.message}`);
                        showNotification(joinResult?.message, 'error');
                    }
                } else {

                    console.log(`${this.logPrefix} ℹ️ Đã tham gia luận võ trước đó`);
                }

                // Bước 3: Đảm bảo tự động chấp nhận khiêu chiến
                // if (!taskTracker.getTaskStatus(accountId, 'luanvo').auto_accept) {
                    const autoAcceptSuccess = await this.ensureAutoAccept();
                    console.log(`${autoAcceptSuccess}`);
                    if (autoAcceptSuccess) {
                        console.log(`${this.logPrefix} ✅ Tự động chấp nhận đã được bật.`);
                    } else {
                        console.log('⚠️ Đã bật tự động chấp nhận trước đó hoặc Đã bật lại tự động lần nữa');
                    }

                // }

    }


    async doLuanVo(autoChallenge = true) {
        await this.startLuanVo();
        if (!autoChallenge) {
            return this.goToLuanVoPage();
        }
        console.log("🔍 Bắt đầu auto Luận Võ...");
        await this.huntLuanVoTargets();
        await this.receiveReward();
    }





    goToLuanVoPage() {
        const luanVoUrl = `${this.weburl}/luan-vo-duong?t`;
        if (confirm("Bạn có muốn chuyển đến trang Luận Võ Đường không?")) {
            window.location.href = luanVoUrl;
        }
    }
}


///====================== KHOÁNG MẠCH ===================

    class KhoangMach {
        constructor() {
            this.ajaxUrl = ajaxUrl;
            this.khoangMachUrl = weburl + 'khoang-mach?t';
            this.logPrefix = '[Khoáng Mạch]';
            this.headers = {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
            };
            this.getUsersInMineNonce = null;
            this.securityToken = null;
            this.buffBought = false;
            // Anti-spam + session recovery
            this._attackChain = Promise.resolve();
            this._minAttackGapMs = 5000; // increased to reduce session drops
            this.MINE_DATA_API_URL = 'https://script.google.com/macros/s/AKfycbxJoJniBQP6JHLpSHbLwYqmoihZj0YZ9qIWp9LsJoJOCANJPTiu7s8_6v9ecVZjtD40/exec';

            //https://script.google.com/macros/s/AKfycbwTrb6hM_9eVh_tOfJft8sjEWWcBFf4IY1p8tD_sTS36CceozgK3fhwsAR1r2qFuiY/exec
        }

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        _isSessionExpiredMessage(msg) {
            const s = String(msg || '').toLowerCase();
            return s.includes('hết phiên') || s.includes('het phien') || s.includes('phiên đã hết') ||
                   s.includes('đăng nhập') || s.includes('dang nhap') ||
                   s.includes('login') || s.includes('session');
        }

        async _refreshSession() {
            // Refresh token/nonce from Khoáng Mạch page (warm-up request helps keep cookies fresh).
            try { await fetch(this.khoangMachUrl, { credentials: 'include' }); } catch (e) {}
            this.securityToken = await getSecurityToken(this.khoangMachUrl);
            // nonce (customRestNonce) is global; refresh it too
            try { await getNonce(); } catch (e) {}
            this._tokenTs = Date.now();
            return !!this.securityToken;
        }

        async _fetchJsonWithSessionRetry(fetchFn, actionLabel) {
            // One retry after refresh session if looks like session expired.
            try {
                const d = await fetchFn();
                if (d && (d.success === false) && this._isSessionExpiredMessage(d.data?.message || d.message)) {
                    console.warn(`${this.logPrefix} ⚠️ Có dấu hiệu hết phiên (${actionLabel}). Thử làm mới token và retry 1 lần...`);
                    await this._refreshSession();
                    await this.delay(1500 + Math.floor(Math.random()*1000));
                    return await fetchFn();
                }
                return d;
            } catch (e) {
                // If network/parse error, also try one refresh+retry
                console.warn(`${this.logPrefix} ⚠️ Lỗi request (${actionLabel}). Thử refresh token và retry 1 lần...`, e);
                await this._refreshSession();
                await this.delay(1500 + Math.floor(Math.random()*1000));
                return await fetchFn();
            }
        }

        async #getNonce(regex) {
            // If session expired, nonce fetch may fail because HTML is login page.
            let n = await getSecurityNonce(this.khoangMachUrl, regex);
            if (!n) {
                await this._refreshSession();
                n = await getSecurityNonce(this.khoangMachUrl, regex);
            }
            return n;
        }


        async loadMines(mineType) {
            const nonce = await getSecurityNonce(this.khoangMachUrl, /action:\s*'load_mines_by_type',\s*mine_type:\s*mineType,[\s\S]*?security:\s*'([a-f0-9]+)'/);
            if (!nonce) { showNotification('Lỗi nonce (load_mines).', 'error'); return null; }
            const payload = new URLSearchParams({ action: 'load_mines_by_type', mine_type: mineType, security: nonce });
            try {
                const r = await fetch(this.ajaxUrl, { method: 'POST', headers: this.headers, body: payload, credentials: 'include' });
                const d = await r.json();
                return d.success ? d.data : (showNotification(d.message || 'Lỗi tải mỏ.', 'error'), null);
            } catch (e) { console.error(`${this.logPrefix} ❌ Lỗi mạng (tải mỏ):`, e); return null; }
        };

        async getAllMines() {
            const cacheKey = "HH3D_allMines";
            const cacheRaw = localStorage.getItem(cacheKey);

            // Kiểm tra cache
            if (cacheRaw && cacheRaw.length > 0) {
                try {
                    const cache = JSON.parse(cacheRaw);
                    if (Date.now() < cache.expiresAt && cache.data && cache.data.length > 0) {
                        console.log("[HH3D] 🗄️ Dùng dữ liệu mỏ từ cache");
                        return {
                            optionsHtml: cache.optionsHtml,
                            minesData: cache.data
                        };
                    } else {
                        localStorage.removeItem(cacheKey);
                    }
                } catch (e) {
                    console.warn("[HH3D] Lỗi đọc cache:", e);
                }
            }

            // --- Nếu chưa có cache hoặc đã hết hạn, tải mới ---
            const nonce = await getSecurityNonce(
                this.khoangMachUrl,
                /action:\s*'load_mines_by_type',\s*mine_type:\s*mineType,[\s\S]*?security:\s*'([a-f0-9]+)'/
            );
            if (!nonce) {
                showNotification('Lỗi nonce (getAllMines).', 'error');
                return { optionsHtml: '', minesData: [] };
            }

            const mineTypes = ['gold', 'silver', 'copper'];
            const allMines = [];

            // Tải song song cho nhanh
            const requests = mineTypes.map(async type => {
                const payload = new URLSearchParams({
                    action: 'load_mines_by_type',
                    mine_type: type,
                    security: nonce
                });

                try {
                    const r = await fetch(this.ajaxUrl, {
                        method: 'POST',
                        headers: this.headers,
                        body: payload,
                        credentials: 'include'
                    });
                    const d = await r.json();

                    if (d.success) {
                        d.data.forEach(mine => {
                            mine.type = type;
                            allMines.push(mine);
                        });
                    } else {
                        showNotification(d.message || `Lỗi tải mỏ loại ${type}.`, 'error');
                    }
                } catch (e) {
                    console.error(`${this.logPrefix} ❌ Lỗi mạng (tải mỏ ${type}):`, e);
                }
            });

            await Promise.all(requests);

            // --- Sắp xếp ---
            allMines.sort((a, b) => {
                const typeOrder = { 'gold': 1, 'silver': 2, 'copper': 3 };
                const typeComparison = typeOrder[a.type] - typeOrder[b.type];
                if (typeComparison === 0) {
                    return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
                }
                return typeComparison;
            });

            // --- Sinh HTML ---
            const mineOptionsHtml = allMines.map(mine => {
                let typePrefix = '';
                if (mine.type === 'gold') typePrefix = '[Thượng] ';
                else if (mine.type === 'silver') typePrefix = '[Trung] ';
                else if (mine.type === 'copper') typePrefix = '[Hạ] ';
                return `<option value="${mine.id}">${typePrefix}${mine.name} (${mine.id})</option>`;
            }).join('');

            // --- Tính thời điểm 0h hôm sau ---
            const now = new Date();
            const expireDate = new Date(now);
            expireDate.setHours(24, 0, 0, 0); // 0h ngày hôm sau
            const expiresAt = expireDate.getTime();

            // --- Lưu cache ---
            localStorage.setItem(cacheKey, JSON.stringify({
                data: allMines,
                optionsHtml: mineOptionsHtml,
                expiresAt
            }));

            return {
                optionsHtml: mineOptionsHtml,
                minesData: allMines
            };
        }


        async enterMine(mineId) {
            // Lấy nonce
            const nonce = await this.#getNonce(/action: 'enter_mine',\s*mine_id:\s*mine_id,[\s\S]*?security: '([a-f0-9]+)'/);
            if (!nonce) {
                showNotification('Lỗi nonce (enter_mine).', 'error');
                return false;
            }

            if (!nonce) {
                showNotification('Lỗi nonce (enter_mine).', 'error');
                return false;
            }

            // Hàm gửi request
            const post = async (payload) => {
                const r = await fetch(this.ajaxUrl, {
                    method: 'POST',
                    headers: this.headers,
                    body: new URLSearchParams(payload),
                    credentials: 'include'
                });
                return r.json();
            };
            this.securityToken = await getSecurityToken(this.khoangMachUrl);
            try {
                const d = await post({ action: 'enter_mine', mine_id: mineId, security_token: this.securityToken, security: nonce });

                if (d.success) {
                    showNotification(d.data.message, 'success');
                    return true;
                }

                const msg = d.data.message || 'Lỗi vào mỏ.';

                if (msg.includes('đạt đủ thưởng ngày')) {
                    taskTracker.markTaskDone(accountId, 'khoangmach');
                    showNotification(msg, 'error');
                }
                else if (msg.includes('Có phần thưởng chưa nhận')) {
                    // Nếu bị sát hại tại khoáng mạch → nhận thưởng trước
                    const nonce = await this.#getNonce(/action: 'claim_reward_km',[\s\S]*?security: '([a-f0-9]+)'/);
                    if (!nonce) {
                        showNotification('Lỗi nonce (claim_reward_km).', 'error');
                        return false;
                    }
                    this.securityToken = await getSecurityToken(this.khoangMachUrl);
                    const reward = await post({ action: 'claim_reward_km', security_token: this.securityToken, security: nonce });
                    if (reward.success) {
                        showNotification(`Nhận thưởng <b>${reward.data.total_tuvi} tu vi và ${reward.data.total_tinh_thach} tinh thạch</b> tại khoáng mạch ${reward.data.mine_name}`, 'info');
                        return this.enterMine(mineId); // gọi lại để vào mỏ
                    } else {
                        showNotification('Lỗi nhận thưởng khi bị đánh ra khỏi mỏ khoáng', 'warn');
                    }
                }

            } catch (e) {
                console.error(`${this.logPrefix} ❌ Lỗi mạng (vào mỏ):`, e);
                return false;
            }
        }

        async getUsersInMine(mineId) {

            // --- 1. Lấy 'security' nonce (giữ logic cache của bạn) ---
            let nonce = '';
            if (this.getUsersInMineNonce) {
                nonce = this.getUsersInMineNonce;
                console.log(`${this.logPrefix} 🗄️ Dùng 'security' nonce từ cache.`);
            } else {
                console.log(`${this.logPrefix} ▶️ Cache nonce không có, tải mới...`);
                // Giả định this.#getNonce là hàm private của class bạn
                nonce = await this.#getNonce(/action:\s*'get_users_in_mine',[\s\S]*?security:\s*'([a-f0-9]+)'/);

                if (nonce) {
                    this.getUsersInMineNonce = nonce; // lưu lại để dùng lần sau
                }
            }
            this.securityToken = await getSecurityToken(this.khoangMachUrl);
            // --- 3. Kiểm tra cả hai token ---
            if (!nonce || !this.securityToken) {
                let errorMsg = 'Lỗi (get_users):';
                if (!nonce) errorMsg += " Không tìm thấy 'security' nonce.";
                if (!this.securityToken) errorMsg += " Không tìm thấy 'security_token' (hh3dData).";

                showNotification(errorMsg, 'error');
                this.getUsersInMineNonce = null; // Xóa cache nonce hỏng nếu có
                return null;
            }

            // --- 4. Tạo payload (Đã thêm security_token) ---
            const payload = new URLSearchParams({
                action: 'get_users_in_mine',
                mine_id: mineId,
                security_token: this.securityToken, // <-- THÊM DÒNG NÀY
                security: nonce
            });

            // --- 5. Gửi fetch ---
            try {
                const r = await fetch(this.ajaxUrl, { method: 'POST', headers: this.headers, body: payload, credentials: 'include' });
                const d = await r.json();

                // Logic trả về của bạn (hoạt động tốt)
                return d.success ? d.data : (showNotification(d.data.message || 'Lỗi lấy thông tin người chơi.', 'error'), null);

            } catch (e) {
                console.error(`${this.logPrefix} ❌ Lỗi mạng (lấy user):`, e);
                return null;
            }
        }

        async takeOverMine(mineId) {
            const nonce = await this.#getNonce(/action: 'change_mine_owner',\s*mine_id:\s*mineId,[\s\S]*?security: '([a-f0-9]+)'/);
            if (!nonce) { showNotification('Lỗi nonce (take_over).', 'error'); return false; }
            this.securityToken = await getSecurityToken(this.khoangMachUrl);
            const payload = new URLSearchParams({ action: 'change_mine_owner', mine_id: mineId, security_token: this.securityToken, security: nonce });
            try {
                const r = await fetch(this.ajaxUrl, { method: 'POST', headers: this.headers, body: payload, credentials: 'include' });
                const d = await r.json();
                if (d.success) {
                    showNotification(d.data.message, 'success');
                    return true;
                } else {
                    showNotification(d.message || 'Lỗi đoạt mỏ.', 'error');
                    return false;
                }
            } catch (e) { console.error(`${this.logPrefix} ❌ Lỗi mạng (đoạt mỏ):`, e); return false; }
        }

        async buyBuffItem() {
            const nonce = await this.#getNonce(/action: 'buy_item_khoang',[\s\S]*?security: '([a-f0-9]+)'/);
            if (!nonce) { showNotification('Lỗi nonce (buy_item).', 'error'); return false; }
            const payload = new URLSearchParams({ action: 'buy_item_khoang', security: nonce, item_id: 4 });
            try {
                const r = await fetch(this.ajaxUrl, { method: 'POST', headers: this.headers, body: payload, credentials: 'include' });
                const d = await r.json();
                if (d.success) {
                    showNotification(d.data.message || 'Đã mua Linh Quang Phù', 'success');
                    this.buffBought = true;
                    return true;
                } else {
                    showNotification(d.data.message || 'Lỗi mua Linh Quang Phù', 'error');
                    return false;
                }
            } catch (e) { console.error(`${this.logPrefix} ❌ Lỗi mạng (mua buff):`, e); return false; }
        }

        async claimReward(mineId) {
            const leaveMineToClaimReward = localStorage.getItem(`khoangmach_leave_mine_to_claim_reward_${accountId}`) === 'true';
            if (leaveMineToClaimReward) {
                const left = await this.leaveMine(mineId);
                if (!left) {
                    showNotification('Không thể rời mỏ để nhận thưởng.', 'error');
                    return false;
                } else {
                    await this.delay(500); // đợi 1s cho chắc
                    const entered = await this.enterMine(mineId);
                    if (!entered) {
                        showNotification('Không thể vào lại mỏ sau khi nhận thưởng.', 'error');
                        return false;
                    } else {
                        taskTracker.adjustTaskTime(accountId, 'khoangmach', timePlus('30:00'));
                        return true;
                    }
                }
            } else {
                const nonce = await this.#getNonce(/action: 'claim_mycred_reward',\s*mine_id:\s*mine_id,[\s\S]*?security: '([a-f0-9]+)'/);
                if (!nonce) { showNotification('Lỗi nonce (claim_reward).', 'error'); return false; }
                this.securityToken = await getSecurityToken(this.khoangMachUrl);
                const payload = new URLSearchParams({ action: 'claim_mycred_reward', mine_id: mineId, security_token:this.securityToken, security: nonce });
                try {
                    const r = await fetch(this.ajaxUrl, { method: 'POST', headers: this.headers, body: payload, credentials: 'include' });
                    const d = await r.json();
                    if (d.success) {
                        showNotification(d.data.message, 'success');
                        taskTracker.adjustTaskTime(accountId, 'khoangmach', timePlus('30:00'));
                        return true;
                    } else {
                        showNotification(d.data.message || 'Lỗi nhận thưởng.', 'error');
                        return false;
                    }
                } catch (e) { console.error(`${this.logPrefix} ❌ Lỗi mạng (nhận thưởng):`, e); return false; }
            }
        }


        async attackUser(userId, mineId) {
            // Queue to avoid burst requests that often triggers "hết phiên".
            this._attackChain = this._attackChain.then(async () => {
                await this.delay(this._minAttackGapMs + Math.floor(300 + Math.random()*500));
                const _staleToken = !this._tokenTs || (Date.now() - this._tokenTs) > 180000;
                if (!this.securityToken || _staleToken) {
                    await this._refreshSession();
                }

                const doRequest = async () => {
                    const security = await this.#getNonce(/action:\s*'attack_user_in_mine'[\s\S]*?security:\s*'([a-f0-9]+)'/);
                    if (!security) {
                        return { success: false, data: { message: 'Lỗi nonce (attack_user_in_mine).' } };
                    }
                    const payload = new URLSearchParams({
                        action: 'attack_user_in_mine',
                        target_user_id: userId,
                        mine_id: mineId,
                        security_token: this.securityToken,
                        security
                    });
                    const r = await fetch(this.ajaxUrl, { method: 'POST', headers: this.headers, body: payload, credentials: 'include' });
                    const ct = (r.headers.get('content-type') || '').toLowerCase();
                    if (!r.ok) {
                        const t = await r.text().catch(() => '');
                        return { success: false, data: { message: `HTTP ${r.status} (ajax)` + (t ? ': ' + t.slice(0, 120) : '') } };
                    }
                    if (!ct.includes('application/json')) {
                        const t = await r.text().catch(() => '');
                        const lower = (t || '').toLowerCase();
                        if (lower.includes('wp-login') || lower.includes('login') || lower.includes('đăng nhập') || lower.includes('dang nhap')) {
                            return { success: false, data: { message: 'Hết phiên (login page).' } };
                        }
                        return { success: false, data: { message: 'Phản hồi không phải JSON.' } };
                    }
                    return await r.json();
                };

                const d = await this._fetchJsonWithSessionRetry(doRequest, 'attack_user_in_mine');
                if (d?.success) {
                    showNotification(d.data?.message || 'Đã tấn công người chơi.', 'success');
                    return true;
                }

                const msg = d?.data?.message || d?.message || 'Lỗi tấn công người chơi.';
                if (this._isSessionExpiredMessage(msg)) {
                    showNotification('Hết phiên. Bạn chỉ cần F5 nếu vẫn lỗi sau khi script tự refresh.', 'error', 6000);
                } else {
                    showNotification(msg, 'error');
                }
                return false;
            });

            return await this._attackChain;
        }

        async leaveMine(mineId) {
            const nonce = await this.#getNonce(/action: 'leave_mine',[\s\S]*?security: '([a-f0-9]+)'/);
            if (!nonce) { showNotification('Lỗi nonce (leave_mine).', 'error'); return false; }
            this.securityToken = await getSecurityToken(this.khoangMachUrl);
            const payload = new URLSearchParams({ action: 'leave_mine', mine_id: mineId, security_token: this.securityToken, security: nonce });
            try {
                const r = await fetch(this.ajaxUrl, { method: 'POST', headers: this.headers, body: payload, credentials: 'include' });
                const d = await r.json();
                if (d.success) {
                    showNotification(d.data.message, 'success');
                    return true;
                } else {
                    showNotification(d.message || 'Lỗi rời mỏ.', 'error');
                    return false;
                }
            } catch (e) { console.error(`${this.logPrefix} ❌ Lỗi mạng (rời mỏ):`, e); return false; }
        }

        async doKhoangMach() {
            const selectedMineSetting = localStorage.getItem(`khoangmach_selected_mine_${accountId}`);
            if (!selectedMineSetting) {
                showNotification('Vui lòng chọn một mỏ trong cài đặt.', 'error');
                throw new Error ('Bạn chưa chọn mỏ');
            }

            const selectedMineInfo = JSON.parse(selectedMineSetting);
            if (!selectedMineInfo || !selectedMineInfo.id || !selectedMineInfo.type) {
                showNotification('Cài đặt mỏ không hợp lệ.', 'error');
                throw new Error ('Cài đặt mỏ không hợp lệ.');
            }

            const useBuff = localStorage.getItem('khoangmach_use_buff') === 'true';
            const autoTakeover = localStorage.getItem('khoangmach_auto_takeover') === 'true';
            const autoTakeoverRotation = localStorage.getItem('khoangmach_auto_takeover_rotation') === 'true';
            const rewardMode = localStorage.getItem('khoangmach_reward_mode') || 'any';
            const rewardTimeSelected = localStorage.getItem('khoangmach_reward_time');
            const rewardTime = rewardTimeSelected;
            const outerNotification = localStorage.getItem('khoangmach_outer_notification') === 'true';

            this.securityToken = await getSecurityToken(this.khoangMachUrl);
            if (!this.securityToken) {
                showNotification('Lỗi: Không lấy được security_token cho khoáng mạch.', 'error');
                throw new Error ('Không lấy được security_token cho khoáng mạch.');
            }
            console.log(`${this.logPrefix} Bắt đầu quy trình cho mỏ ID: ${selectedMineInfo.id}.`);
            const mines = await this.loadMines(selectedMineInfo.type);
            if (!mines) throw new Error ('Không tải danh sách khoáng mạch được');

            const targetMine = mines.find(m => m.id === selectedMineInfo.id);
            if (!targetMine) {
                showNotification('Không tìm thấy mỏ đã chọn trong danh sách tải về.', 'error');
                throw new Error ('Không tìm thấy mỏ đã chọn trong danh sách.');
            }
            if (!targetMine.is_current) {
                if (parseInt(targetMine.user_count) >= parseInt(targetMine.max_users)) {
                    showNotification('Mỏ đã đầy. Không vào được.', 'warn');
                    return true;
                } else {
                    await this.enterMine(targetMine.id);
                    return true;
                }
            }

            // Bắt đầu vòng lặp để kiểm tra và thực hiện tác vụ liên tục
            while (true) {
                // Kiểm tra thông tin trong mỏ
                let mineInfo = await this.getUsersInMine(targetMine.id);
                if (!mineInfo) throw new Error('Lỗi lấy thông tin chi tiết trong mỏ');
                const users = mineInfo.users || [];
                if (users.length === 0) {
                    console.log(`[Khoáng mạch] Mỏ ${targetMine.id} trống.`);
                    throw new Error('Mỏ trống trơn???');
                }


                // Kiểm tra vị trí trong mỏ
                let myIndex = users.findIndex(u => u.id.toString() === accountId.toString());
                if (myIndex === -1) {
                    console.log(`[Khoáng mạch] Kiểm tra vị trí. Bạn chưa vào mỏ ${targetMine.name}.`);
                    return true;
                }

                // Kiểm tra ngoại tông
                let outer = users.some(u => !u.lien_minh && !u.dong_mon);
                if (outer && outerNotification) {
                    // Thông báo nếu vẫn còn ngoại tông
                    if (confirm('Ngoại tông xâm nhập khoáng mạch, \n Bạn có muốn đến khoáng mạch?')){
                        window.location.href = this.khoangMachUrl;
                    }
                }


                let myInfo = users[myIndex];
                console.log(`[Khoáng mạch] Vị trí: ${myIndex}, Tên: ${myInfo.name}, Time: ${myInfo.time_spent}`);

                // Kiểm tra thời gian
                if (myInfo.time_spent !== "Đạt tối đa") {
                    const timeMatch = myInfo.time_spent.match(/(\d+)\s*phút/);
                    const minutesSpent = timeMatch ? parseInt(timeMatch[1]) : 0;

                    let shouldWait = false;
                    let nextTime = null;

                    if (rewardTimeSelected === 'max') {
                        // Chờ đến khi đạt tối đa (30 phút)
                        shouldWait = true;
                        nextTime = Date.now() + Math.max(30*60*1000 - (minutesSpent * 60 * 1000), 0);
                        showNotification(`Khoáng mạch chưa đủ thời gian.<br>Hiện đạt: <b>${myInfo.time_spent}</b><br>Cần: <b>Đạt tối đa</b>`, 'warn');
                    } else {
                        // Kiểm tra với thời gian cụ thể
                        const requiredMinutes = parseInt(rewardTimeSelected);
                        if (minutesSpent < requiredMinutes) {
                            shouldWait = true;
                            nextTime = Date.now() + Math.max((requiredMinutes - minutesSpent) * 60 * 1000, 0);
                            showNotification(`Khoáng mạch chưa đủ thời gian.<br>Hiện đạt: <b>${myInfo.time_spent}</b><br>Cần: <b>${requiredMinutes} phút</b>`, 'warn');
                        }
                    }

                    if (shouldWait) {
                        taskTracker.adjustTaskTime(accountId, 'khoangmach', nextTime);
                        break;
                    }
                }

                // Kiểm tra trạng thái bonus
                let bonus = mineInfo.bonus_percentage || 0;
                let canClaim = false;
                if (rewardMode === "any") {
                    canClaim = true;
                } else if (rewardMode === "20" && bonus >= 20) {
                    canClaim = true;
                } else if (rewardMode === "100" && bonus >= 100) {
                    canClaim = true;
                } else if (rewardMode === "110" && bonus === 110) {
                    canClaim = true;
                }

                if (canClaim) {
                    console.log(`[Khoáng mạch] Nhận thưởng tại mỏ ${targetMine.id}, bonus=${bonus}%`);
                    await this.claimReward(targetMine.id);  // Nhận thưởng
                    break; // Thoát vòng lặp sau khi nhận thưởng
                } else {
                    console.log(`[Khoáng mạch] Bonus tu vi ${bonus}% chưa đạt ngưỡng ${rewardMode}`);

                    // Nếu có thể, thử takeover trước (option đoạt mỏ khi chưa buff)
                    if (autoTakeover && mineInfo.can_takeover) {
                        await this.delay(500);
                        console.log(`[Khoáng mạch] Thử đoạt mỏ ${targetMine.id}...`);
                        await this.takeOverMine(targetMine.id);
                        continue;
                    }

                    // Nếu có thể, thử takeover trước (option đoạt mỏ bất kể buff)
                    if (autoTakeoverRotation && mineInfo.can_takeover) {
                        await this.delay(500);
                        console.log(`[Khoáng mạch] Thử đoạt mỏ ${targetMine.id}...`);
                        await this.takeOverMine(targetMine.id);
                        continue;
                    }

                    // Nếu có chọn mua buff
                    if (useBuff && bonus > 20 && !this.buffBought) {
                        await this.delay(500);
                        console.log(`[Khoáng mạch] Mua linh quang phù...`);
                        await this.buyBuffItem(targetMine.id);
                        // Đợi một chút để server xử lý
                        await new Promise(resolve => setTimeout(resolve, 300));
                        continue;
                    }



                    // Nếu không thể làm gì, thoát khỏi vòng lặp
                    showNotification(`[Khoáng mạch] Bonus ${bonus}% chưa đạt ${rewardMode}%<br>Hiện không thể đoạt mỏ.<br>Không thực hiện được hành động nào.`, 'info')
                    break;
                }
            }
        }

        /**
         * Lấy danh sách tổng môn
         * @returns {Promise<Array<{id: string, name: string, level: number}>>} Mảng đối tượng tổng môn
         * ví dụ: [{id: "123", name: "Tông Môn A", level: 6}, ...]
         */
        async getListTongMon() {
            try {
                // 1. SỬA LỖI LOGIC URL:
                // Dùng đường dẫn tương đối "/" để tự động lấy domain hiện tại.
                // Không cần biến "weburl" (tránh lỗi weburl is not defined).
                const response = await fetch("/danh-sach-cac-tong-mon-tai-hoathinh3d");

                // Kiểm tra trạng thái HTTP
                if (!response.ok) {
                    throw new Error(`Lỗi kết nối: ${response.status} ${response.statusText}`);
                }

                // 2. Chuyển đổi dữ liệu
                const htmlText = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlText, "text/html");

                // Chọn danh sách hàng
                const rows = doc.querySelectorAll('table.bxh-page tbody tr');
                const results = [];

                rows.forEach(row => {
                    // Lấy nút tham gia để trích xuất ID
                    const btn = row.querySelector('button.join-group');
                    const id = btn ? btn.getAttribute('data-group-id') : null;

                    // Lấy khu vực tên
                    const nameDiv = row.querySelector('.display-container.group-name');

                    // 3. SỬA LỖI LOGIC PARSE TÊN:
                    // Chỉ xử lý khi có đủ ID và Tên
                    if (nameDiv && id) {
                        let levelNum = 0;

                        // Lấy thẻ level riêng biệt
                        const levelSpan = nameDiv.querySelector('.group-level');

                        if (levelSpan) {
                            const match = levelSpan.textContent.match(/\d+/);
                            if (match) levelNum = parseInt(match[0], 10);
                        }

                        // Lấy tên sạch:
                        // Thay vì cloneNode (nặng), ta lấy toàn bộ text rồi xóa phần text của level đi
                        let nameText = nameDiv.innerText;
                        if (levelSpan) {
                            nameText = nameText.replace(levelSpan.innerText, '').trim();
                        } else {
                            nameText = nameText.trim();
                        }

                        results.push({
                            id: id,
                            name: nameText,
                            level: levelNum
                        });
                    }
                });

                return results;

            } catch (error) {
                // Ghi log lỗi để dễ debug
                console.error("Lỗi tại getListTongMon:", error);
                // Ném lỗi tiếp ra ngoài để hàm gọi bên ngoài biết là có lỗi
                throw error;
            }
        }


        parseGroupRoleHtml(groupRoleHtml) {
            if (!groupRoleHtml || typeof groupRoleHtml !== 'string') {
                return { tongMonName: null, role: null };
            }

            try {
                const doc = new DOMParser().parseFromString(
                    `<div>${groupRoleHtml}</div>`,
                    'text/html'
                );
                const root = doc.body;

                /* =========
                * ROLE: tooltip cuối
                * ========= */
                const tooltips = Array.from(
                    root.querySelectorAll('span[data-tooltip]')
                )
                    .map(el => el.getAttribute('data-tooltip')?.trim())
                    .filter(Boolean);

                const role = tooltips.length
                    ? tooltips[tooltips.length - 1]
                    : null;

                /* =========
                * TÊN TÔNG
                * ========= */
                let tongMonName = null;

                const bangHoiEl = root.querySelector('span[class*="bang-hoi-mau"]');
                if (bangHoiEl) {
                    const t = (bangHoiEl.textContent || '').trim();
                    if (t) tongMonName = t;
                }

                if (!tongMonName) {
                    const wrapper = root.querySelector('.tong-cap-wrapper');
                    if (wrapper) {
                        const next = wrapper.nextElementSibling;
                        if (next && next.tagName === 'SPAN') {
                            const t = (next.textContent || '').trim();
                            if (t) tongMonName = t;
                        }
                    }
                }

                return { tongMonName, role };
            } catch {
                return { tongMonName: null, role: null };
            }
        }


        /**
         * Tìm kiếm kẻ địch theo ID và/hoặc theo Tông Môn (ID tông).
         * @param {string[]} enemyList - danh sách userId (string)
         * @param {string[]} tongMonList - danh sách groupId tông môn (string)
         * @returns {Promise<Array>}
         */
        async searchEnemiesInMines(enemyList, tongMonList) {
            // 1. Chuẩn bị bộ lọc (Giữ nguyên)
            const enemySet = new Set((enemyList || []).map(x => String(x).trim()).filter(Boolean));
            const tongIdSet = new Set((tongMonList || []).map(x => String(x).trim()).filter(Boolean));

            if (enemySet.size === 0 && tongIdSet.size === 0) {
                showNotification('Vui lòng nhập ID kẻ địch hoặc chọn Tông Môn để tìm.', 'warn');
                return [];
            }

            // Map tên tông (Giữ nguyên)
            let tongNameSet = new Set();
            if (tongIdSet.size > 0) {
                try {
                    const allTong = await this.getListTongMon();
                    tongNameSet = new Set(
                        (allTong || []).filter(t => tongIdSet.has(String(t.id)))
                        .map(t => String(t.name || '').trim()).filter(Boolean)
                    );
                } catch (e) {}
            }

            // 2. Logic Lấy dữ liệu
            let minesData = [];
            let dataTimestamp = 0;
            let dataSource = '☁️ Server (Cache)';

            try {
                console.log('[Khoáng Mạch] Đang kiểm tra dữ liệu trên Server...');
                const serverData = await fetch(this.MINE_DATA_API_URL).then(r => r.json());
                const now = Date.now();

                if (serverData && serverData.timestamp && (now - serverData.timestamp < 5 * 60 * 1000)) {
                    minesData = serverData.mines || [];
                    dataTimestamp = serverData.timestamp;
                    showNotification(`Dữ liệu từ Server (${this.timeSince(dataTimestamp)})`, 'success');
                } else {
                    throw new Error('Dữ liệu cũ');
                }
            } catch (err) {
                console.log('[Khoáng Mạch] ' + err.message);
                dataSource = '🕵️ Quét trực tiếp';
                showNotification('Đang quét trực tiếp...', 'info');

                // Quét mới
                minesData = await this.scanAllMinesRawData();
                dataTimestamp = Date.now();

                // Upload lên server (Dùng hàm đã sửa header ở trên)
                this.uploadDataToServer(minesData);
            }

            // 🔥 BƯỚC QUAN TRỌNG: CHUẨN HÓA DỮ LIỆU (Normalize)
            // Phải đặt ở đây để chạy cho CẢ trường hợp lấy từ Server HOẶC quét mới
            if (minesData && minesData.length > 0) {
                minesData = minesData.map(m => ({
                    ...m,
                    users: (m.users || []).map(u => ({
                        // Map key ngắn (i, n, t, r) -> key dài (id, name...)
                        id: u.i || u.id,
                        name: u.n || u.name,
                        tongMonName: u.t || u.tongMonName,
                        role: u.r || u.role,
                        ...u
                    }))
                }));
            }

            // 3. Lọc & Hiển thị (Giữ nguyên)
            const results = [];
            for (const mine of minesData) {
                if (!mine.users) continue;
                for (const u of mine.users) {
                    const uid = String(u.id ?? '').trim();
                    const uTong = String(u.tongMonName || '').trim();
                    if (enemySet.has(uid) || tongNameSet.has(uTong)) {
                        results.push({
                            ...u,
                            mineId: mine.id,
                            mineName: mine.name,
                            tongMonName: u.tongMonName,
                            role: u.role
                        });
                    }
                }
            }

            this.showEnemySearchResults(results, dataTimestamp, dataSource);
            const storageData = { results, timestamp: dataTimestamp, source: dataSource };
            sessionStorage.setItem('khoangmach_enemy_search_results', JSON.stringify(storageData));

            return results;
        }

        // Hàm phụ: Quét toàn bộ mỏ (Trả về dữ liệu thô để upload)
        async scanAllMinesRawData() {
                console.log(`${this.logPrefix} 🕵️ Bắt đầu quét toàn bộ mỏ (Mode: Raw Data)...`);

                // --- BƯỚC 1: LẤY DANH SÁCH MỎ & LỌC ---
                const allMines = await this.getAllMines();
                if (!allMines || !allMines.minesData) return [];

                // Chỉ lấy mỏ Gold/Silver
                const allowedTypes = new Set(['gold', 'silver']);
                const filteredMines = allMines.minesData.filter(m => allowedTypes.has(String(m.type)));

                if (filteredMines.length === 0) return [];

                // --- BƯỚC 2: CHUẨN BỊ TOKEN & NONCE (CHỈ LÀM 1 LẦN) ---

                // 2a. Lấy Security Nonce (cho action get_users_in_mine)
                let nonce = this.getUsersInMineNonce; // Kiểm tra cache xem có sẵn không
                if (!nonce) {
                    console.log(`${this.logPrefix} ♻️ Đang lấy Nonce mới...`);
                    // Gọi hàm getNonce (hoặc logic fetch regex tương đương)
                    nonce = await this.#getNonce(/action:\s*'get_users_in_mine',[\s\S]*?security:\s*'([a-f0-9]+)'/);
                    if (nonce) {
                        this.getUsersInMineNonce = nonce; // Lưu cache
                    }
                }

                // 2b. Lấy Security Token (Session)
                if (!this.securityToken) {
                    console.log(`${this.logPrefix} 🔑 Đang lấy Token mới...`);
                    this.securityToken = await getSecurityToken(this.khoangMachUrl);
                }

                // 2c. Kiểm tra lần cuối, nếu thiếu 1 trong 2 thì hủy quét
                if (!nonce || !this.securityToken) {
                    console.error(`${this.logPrefix} ❌ Không thể quét: Thiếu Token hoặc Nonce.`);
                    showNotification('Lỗi chuẩn bị dữ liệu quét mỏ.', 'error');
                    return [];
                }

                // --- BƯỚC 3: VÒNG LẶP QUÉT (DÙNG LẠI TOKEN & NONCE) ---
                const rawResult = [];
                console.log(`${this.logPrefix} 🚀 Bắt đầu quét ${filteredMines.length} mỏ...`);

                // Quét song song có giới hạn để nhanh hơn (tránh spam server)
                const CONCURRENCY = 4;
                let idx = 0;

                const worker = async () => {
                    while (true) {
                        const i = idx++;
                        if (i >= filteredMines.length) return;
                        const m = filteredMines[i];
                        const payload = new URLSearchParams({
                            action: 'get_users_in_mine',
                            mine_id: m.id,
                            security_token: this.securityToken,
                            security: nonce
                        });
                        try {
                            const r = await fetch(this.ajaxUrl, { method: 'POST', headers: this.headers, body: payload, credentials: 'include' });
                            const d = await r.json();
                            if (d.success && d.data && d.data.users && d.data.users.length > 0) {
                                const cleanUsers = d.data.users.map(u => {
                                    const extra = this.parseGroupRoleHtml(u.group_role_html);
                                    return {
                                        i: u.id,
                                        n: u.name,
                                        t: String(extra.tongMonName || '').trim(),
                                        r: extra.role
                                    };
                                });
                                rawResult.push({ id: m.id, name: m.name, users: cleanUsers });
                            }
                        } catch (e) {
                            console.error(`Lỗi mạng mỏ ${m.id}:`, e);
                        }
                        // nghỉ nhẹ giữa lượt để giảm nguy cơ bị chặn
                        await new Promise(res => setTimeout(res, 30));
                    }
                };

                await Promise.all(Array.from({length: CONCURRENCY}, worker));

                console.log(`${this.logPrefix} ✅ Hoàn tất quét. Tổng số mỏ có người: ${rawResult.length}`);
                return rawResult;
            }

        // Hàm phụ: Upload lên Server
        async  uploadDataToServer(minesData) {
            // Check sơ bộ: Nếu không có dữ liệu thì không gửi
            if (!minesData || minesData.length === 0) return;

            try {
                console.log(`[Khoáng Mạch] Đang đồng bộ ${minesData.length} mỏ lên server...`);

                // PAYLOAD Ở ĐÂY:
                const payload = JSON.stringify({
                    mines: minesData
                });

                // (Tùy chọn) Log dung lượng để kiểm tra xem có quá 50KB không
                console.log(`[Khoáng Mạch] Payload size: ~${Math.round(payload.length/1024)} KB`);

                await fetch(this.MINE_DATA_API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload // <--- Gửi cục này
                });

                console.log('[Khoáng Mạch] Đã gửi yêu cầu đồng bộ.');
            } catch (e) {
                console.warn('[Khoáng Mạch] Lỗi upload:', e);
            }
        }

        // Hàm phụ: Format thời gian
        timeSince(date) {
            const seconds = Math.floor((new Date() - date) / 1000);
            let interval = seconds / 31536000;
            if (interval > 1) return Math.floor(interval) + " năm trước";
            interval = seconds / 2592000;
            if (interval > 1) return Math.floor(interval) + " tháng trước";
            interval = seconds / 86400;
            if (interval > 1) return Math.floor(interval) + " ngày trước";
            interval = seconds / 3600;
            if (interval > 1) return Math.floor(interval) + " giờ trước";
            interval = seconds / 60;
            if (interval > 1) return Math.floor(interval) + " phút trước";
            return Math.floor(seconds) + " giây trước";
        }

        /**
         * Hiển thị kết quả tìm kiếm với thông tin nguồn và thời gian
         * @param {Array} foundUsers Danh sách kẻ địch tìm thấy
         * @param {Number} timestamp Thời gian dữ liệu được tạo (Date.now())
         * @param {String} source Nguồn dữ liệu ('Server' hoặc 'Quét trực tiếp')
         */
        showEnemySearchResults(foundUsers, timestamp, source = 'N/A') {
            // 1. Kiểm tra dữ liệu đầu vào
            if (!Array.isArray(foundUsers) || foundUsers.length === 0) {
                showNotification('Không tìm thấy kẻ địch nào phù hợp trong các mỏ.', 'info');
                return;
            }

            const PANEL_ID = 'enemyDashboard';
            const RESTORE_ID = 'enemyDashboardRestore';

            // 2. Xóa panel cũ nếu đang tồn tại
            const oldPanel = document.getElementById(PANEL_ID);
            if (oldPanel) oldPanel.remove();
            const oldRestore = document.getElementById(RESTORE_ID);
            if (oldRestore) oldRestore.remove();

            // 3. Hàm tiện ích: Escape HTML (Chống lỗi hiển thị tên có ký tự lạ)
            const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

            // 4. Hàm tiện ích: Tính thời gian (VD: 2 phút trước)
            const timeSinceStr = (ts) => {
                if (!ts) return 'Vừa xong';
                const seconds = Math.floor((Date.now() - ts) / 1000);
                if (seconds < 60) return `${seconds} giây trước`;
                const minutes = Math.floor(seconds / 60);
                if (minutes < 60) return `${minutes} phút trước`;
                return 'Khá lâu trước';
            };

            // 5. Gom nhóm user theo MineID
            const minesMap = foundUsers.reduce((acc, u) => {
                const mId = String(u.mineId || 'unknown');
                if (!acc[mId]) {
                    acc[mId] = {
                        id: mId,
                        name: u.mineName || 'Mỏ Lạ',
                        users: [],
                        tongMons: new Set()
                    };
                }
                acc[mId].users.push(u);
                if (u.tongMonName) acc[mId].tongMons.add(u.tongMonName);
                return acc;
            }, {});

            // Sắp xếp mỏ nào nhiều địch nhất lên đầu
            const sortedMines = Object.values(minesMap).sort((a, b) => b.users.length - a.users.length);

            // 6. Tạo giao diện Panel
            const panel = document.createElement('div');
            panel.id = PANEL_ID;
            panel.className = 'enemy-dashboard';

            // CSS cho Panel
            panel.style.cssText = `
                position: fixed; right: 20px; bottom: 20px;
                width: 400px; max-width: 95vw;
                background: #1a1a1a; color: #e0e0e0;
                border: 1px solid #444; border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.7);
                z-index: 999999; font-family: sans-serif;
                display: flex; flex-direction: column;
                overflow: hidden; font-size: 13px;
            `;

            // Xác định màu sắc cho nguồn dữ liệu
            const sourceColor = source.includes('Server') ? '#4caf50' : '#ff9800'; // Xanh lá nếu Server, Cam nếu Quét tay

            // Render HTML
            panel.innerHTML = `
                <div class="ed-header" style="padding: 10px 12px; background: #2d2d2d; border-bottom: 1px solid #3d3d3d; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: bold; font-size: 14px; color: #fff;">
                            🎯 Tìm thấy <span style="color: #ff5252;">${foundUsers.length}</span> mục tiêu
                        </div>
                        <div style="font-size: 11px; color: #aaa; margin-top: 3px;">
                            Nguồn: <span style="font-weight:bold; color: ${sourceColor}">${source}</span> • ${timeSinceStr(timestamp)}
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button id="edMin" style="background:#3d3d3d; border:none; color:#fff; width:28px; height:28px; border-radius:4px; cursor:pointer;">—</button>
                        <button id="edClose" style="background:#d32f2f; border:none; color:#fff; width:28px; height:28px; border-radius:4px; cursor:pointer;">✕</button>
                    </div>
                </div>

                <div class="ed-body" style="padding: 10px; max-height: 50vh; overflow-y: auto; background: #1a1a1a;">
                    ${sortedMines.map(mine => {
                        const tongList = mine.tongMons.size > 0 ? Array.from(mine.tongMons).join(', ') : 'Vô phái';
                        return `
                        <div style="margin-bottom: 8px; border: 1px solid #333; border-radius: 6px; overflow: hidden;">
                            <div class="mine-header" data-target="m-${mine.id}" style="padding: 8px 10px; background: #252525; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: bold; color: #ffd700;">⛏ ${esc(mine.name)}</div>
                                    <div style="font-size: 11px; color: #888;">Quân số: ${mine.users.length} | Phe: ${esc(tongList)}</div>
                                </div>
                                <span class="arrow" style="font-size: 10px; color: #666;">▼</span>
                            </div>

                            <div id="m-${mine.id}" style="display: none; padding: 5px 10px; background: #151515; border-top: 1px solid #333;">
                                ${mine.users.map(u => `
                                    <div style="padding: 6px 0; border-bottom: 1px dashed #333; display: flex; justify-content: space-between;">
                                        <div>
                                            <div style="color: #ff6b6b; font-weight: 500;">${esc(u.name)}</div>
                                            <div style="font-size: 11px; color: #777;">${esc(u.tongMonName || 'Vô phái')} - ${esc(u.role || 'Thành viên')}</div>
                                        </div>
                                        <div style="text-align:right; display:flex; gap:6px; align-items:center; justify-content:flex-end;">
                                            <button class="km-punch-btn" data-uid="${u.id}" data-mid="${mine.id}" title="Đấm">👊</button>
                                            <a href="/profile/${u.id}" target="_blank" style="font-size: 11px; color: #4fc3f7; text-decoration: none;">Info ↗</a>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            `;

            document.body.appendChild(panel);

            // 6.1 Nút 👊 Đấm ngay từ dashboard
            panel.querySelectorAll('.km-punch-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const uid = btn.getAttribute('data-uid');
                    const mid = btn.getAttribute('data-mid');
                    if (!uid || !mid) return;
                    try {
                        // luôn refresh token trước khi đấm
                        this.securityToken = await getSecurityToken(this.khoangMachUrl);
                        await this.attackUser(String(uid), String(mid));
                    } catch (err) {
                        console.error('[Khoáng Mạch] Punch error', err);
                        showNotification('Lỗi khi đấm (xem console).', 'error');
                    }
                });
            });


            // 7. Tạo nút Restore (Khi thu nhỏ)
            const restoreBtn = document.createElement('button');
            restoreBtn.id = RESTORE_ID;
            restoreBtn.textContent = `🎯 Mở lại (${foundUsers.length})`;
            restoreBtn.style.cssText = `
                display: none; position: fixed; bottom: 20px; right: 20px;
                padding: 8px 12px; border-radius: 20px;
                background: #2196f3; color: white; border: none;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                cursor: pointer; z-index: 999999; font-weight: bold;
            `;
            document.body.appendChild(restoreBtn);

            // 8. Gán sự kiện (Event Listeners)
            const body = panel.querySelector('.ed-body');

            // Thu nhỏ
            panel.querySelector('#edMin').onclick = () => {
                panel.style.display = 'none';
                restoreBtn.style.display = 'block';
            };

            // Đóng hẳn
            panel.querySelector('#edClose').onclick = () => {
                panel.remove();
                restoreBtn.remove();
            };

            // Mở lại
            restoreBtn.onclick = () => {
                panel.style.display = 'flex';
                restoreBtn.style.display = 'none';
            };

            // Click từng mỏ để xổ xuống (Accordion)
            panel.querySelectorAll('.mine-header').forEach(header => {
                header.onclick = () => {
                    const targetId = header.getAttribute('data-target');
                    const content = document.getElementById(targetId);
                    const arrow = header.querySelector('.arrow');
                    if (content) {
                        const isOpen = content.style.display === 'block';
                        content.style.display = isOpen ? 'none' : 'block';
                        if (arrow) arrow.textContent = isOpen ? '▼' : '▲';
                    }
                };
            });

            // Tự động mở mỏ đầu tiên (nhiều địch nhất) cho tiện
            const firstHeader = panel.querySelector('.mine-header');
            if(firstHeader) firstHeader.click();
        }

    }


//==================================
// RƯƠNG HOẠT ĐỘNG NGÀY
//==================================
        class HoatDongNgay {
    constructor() {
        this.ajaxUrl = weburl + "/wp-admin/admin-ajax.php";
    }

    // 📦 Lấy rương (Daily Chest)
    async getDailyChest(stage) {
        if (stage !== "stage1" && stage !== "stage2") {
            console.error("Lỗi: Stage phải là 'stage1' hoặc 'stage2'.");
            return false;
        }

        const bodyData = new URLSearchParams({
            action: "daily_activity_reward",
            stage: stage,
            security_token: securityToken // thêm token vào đây
        });

        try {
            const response = await fetch(this.ajaxUrl, {
                credentials: "include",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0",
                    "Accept": "*/*",
                    "Accept-Language": "vi,en-US;q=0.5",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: bodyData,
                method: "POST",
                mode: "cors"
            });

            const data = await response.json();
            if (data.success || data.data.message === "Đạo hữu đã nhận phần thưởng này rồi.") {
                return true;
            } else {
                showNotification(`❌ Lỗi nhận rương hàng ngày: ${data.data || data.message}`, "error");
                return false;
            }
        } catch (error) {
            console.error(`Lỗi khi lấy rương ${stage}:`, error);
            return false;
        }
    }

    // 🎰 Spin vòng quay phúc vận
    async spinLottery() {
        const nonce = await getNonce();
        //console.log("🔑 Nonce spinLottery:", nonce);

        if (!nonce) {
            showNotification("❌ Lỗi: Không thể lấy nonce cho vòng quay phúc vận", "error");
            return false;
        }

        const spinURL = weburl + "wp-json/lottery/v1/spin";
        let remainingSpins = 4;

        do {
            try {
                const response = await fetch(spinURL, {
                    credentials: "include",
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0",
                        "Accept": "*/*",
                        "Accept-Language": "vi,en-US;q=0.5",
                        "X-Security-Token": securityToken,
                        "X-WP-Nonce": nonce,
                        "Content-Type": "application/json"
                    },
                    method: "POST",
                    mode: "cors"
                });

                const data = await response.json();
                if (data.success) {
                    showNotification(`🎉 Vòng quay phúc vận: ${data.message}`, "success");
                    remainingSpins = data.user_info.remaining_spins;
                    if (remainingSpins === 0) {
                        return true;
                    }
                } else if (data.message === "Đạo hữu đã hết lượt quay hôm nay.") {
                    return true;
                } else {
                    showNotification(`❌ Lỗi khi quay vòng quay phúc vận: ${data.message}`, "error");
                    return false;
                }
            } catch (error) {
                console.error("Lỗi khi spin:", error);
                return false;
            }

            // ⏳ Chờ 1 giây tránh spam
            await new Promise(r => setTimeout(r, 1000));
        } while (remainingSpins > 0);
    }

    // 🏆 Thực hiện toàn bộ hoạt động ngày
    async doHoatDongNgay() {
        if (taskTracker.isTaskDone(accountId, "hoatdongngay")) return;

        console.log("Bắt đầu nhận rương hoạt động ngày...");
        const chest1 = await this.getDailyChest("stage1");
        const chest2 = await this.getDailyChest("stage2");
        const spin = await this.spinLottery();
        //const phaptuong = await khactran.autoActivateSeal();

        if (chest1 && chest2 && spin) {
            taskTracker.markTaskDone(accountId, "hoatdongngay");
            showNotification(
                "✅ Hoàn thành hoạt động ngày + vòng quay phúc vận",
                "success"
            );
        }
    }
}


// ===============================================
    // EVENT ĐUA TOP
    // ===============================================
    // --- CẤU HÌNH ---
    const SECRET_API_URL = 'https://script.google.com/macros/s/AKfycbwOuq62VOwVB0RGraqKUvicsXZjsqsziFDwts0jktwQb2vCPSoJ3t98xGr26yNgfIvZ/exec';

    async function doDuaTopTongMon() {
        const duaTopUrl = weburl + 'wp-json/hh3d/v1/action';
        const nonce = await getNonce();
        if (!nonce) return console.error('Lỗi nonce.');

        // 1. Load Data
        if (!vandap.questionDataCache) {
            await vandap.loadAnswersFromGitHub();
        }
        const securityToken = await getSecurityToken(weburl + 'dua-top-hh3d?t');

        try {
            // 2. Lấy câu hỏi
            const rGet = await fetch(duaTopUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce, 'X-DuaTop-Token': securityToken },
                body: JSON.stringify({ action: 'hh3d_get_question', dua_top_token: securityToken }),
                credentials: 'include'
            });
            const dGet = await rGet.json();

            if (!dGet || dGet.error || !dGet.id) {
                showNotification(dGet.message, 'warn');
                if (dGet.message && dGet.message.includes('Chưa đến thời gian kế tiếp')) {
                    const nextTimeMatch = dGet.message.match(/(\d{2}) giờ (\d{2}) phút (\d{2}) giây/);
                    if (nextTimeMatch) {
                        const hours = parseInt(nextTimeMatch[1], 10);
                        const minutes = parseInt(nextTimeMatch[2], 10);
                        const seconds = parseInt(nextTimeMatch[3], 10);
                        const nextTime = Date.now() + ((hours * 3600) + (minutes * 60) + seconds) * 1000;
                        taskTracker.adjustTaskTime(accountId, 'event', nextTime);
                    }
                }
                return;
            }

            console.log(`[Đua Top] ❓ ${dGet.question}`);

            // --- HÀM GỌI SERVER ---
            const callSecretServer = (action, question, answer = null) => {
                console.log(`[Sync] ☁️ Đang gửi lệnh ${action}...`);
                fetch(SECRET_API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: action,
                        question: question,
                        answer: answer
                    })
                }).then(() => console.log(`[Sync] ✅ Lệnh ${action} đã gửi đi!`))
                .catch(e => console.error(`[Sync] ❌ Lỗi kết nối server:`, e));
            };

            // --- HÀM SUBMIT ---
            const submitAnswer = async (index, isManual = false) => {
                const rSub = await fetch(duaTopUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce, 'X-DuaTop-Token': securityToken },
                    body: JSON.stringify({
                        action: "hh3d_submit_answer",
                        question_id: dGet.id,
                        selected_answer: index,
                        dua_top_token: securityToken
                    }),
                    credentials: 'include'
                });
                const dSub = await rSub.json();

                if (dSub.correct) {
                    showNotification(`[Đua Top] Hoàn thành, được ${dSub.points} tu vi`, 'success');
                    taskTracker.adjustTaskTime(accountId, 'event', Date.now() + 6.5 * 60 * 60 * 1000 + 30 * 1000);
                    if (Swal.isVisible()) Swal.close();

                    if (isManual) {
                        const ansText = dGet.options[index];
                        callSecretServer('save', dGet.question, ansText);
                        if (vandap.questionDataCache) vandap.questionDataCache.questions[dGet.question] = ansText;
                    }
                } else {
                    showNotification(`[Đua Top] Sai rồi! Câu hỏi: ${dGet.question}. Đang tiến hành sửa dữ liệu gốc`, 'error');
                    taskTracker.adjustTaskTime(accountId, 'event', Date.now() + 5 * 60 * 1000 + 15 * 1000);

                    if (vandap && vandap.questionDataCache && vandap.questionDataCache.questions) {
                        const normalize = (str) => str ? str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\s]/g, '') : '';
                        const currentQNorm = normalize(dGet.question);
                        const keyToDelete = Object.keys(vandap.questionDataCache.questions).find(k => normalize(k) === currentQNorm);

                        if (keyToDelete) {
                            console.warn(`[Auto] 🗑️ Phát hiện dữ liệu sai, đang xóa: "${keyToDelete}"`);
                            delete vandap.questionDataCache.questions[keyToDelete];
                            callSecretServer('delete', keyToDelete);
                        }
                    }
                }
            };

            // 3. Logic tìm kiếm
            // Normalize 1: Xóa hết ký tự đặc biệt VÀ khoảng trắng (dùng để tìm key câu hỏi)
            const normalize = (str) => str ? str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\s]/g, '') : '';

            // Tokenize: Giữ lại khoảng trắng để tách từ (dùng để so sánh điểm trùng lặp đáp án)
            const tokenize = (str) => str ? str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ' ').trim().split(/\s+/).filter(x => x) : [];

            const svQuesNorm = normalize(dGet.question);
            let foundAnswerText = null;

            if (vandap.questionDataCache && vandap.questionDataCache.questions) {
                for (const key in vandap.questionDataCache.questions) {
                    if (normalize(key) === svQuesNorm) {
                        foundAnswerText = vandap.questionDataCache.questions[key];
                        break;
                    }
                }
            }

            // 4. Quyết định
            if (foundAnswerText) {
                console.log(`[Đua Top] 💡 Dữ liệu gốc: "${foundAnswerText}"`);

                // Bước 1: Thử tìm chính xác
                let idx = dGet.options.findIndex(opt => normalize(opt) === normalize(foundAnswerText));

                // Bước 2: Tìm theo điểm trùng từ
                if (idx === -1) {
                    console.warn('[Đua Top] ⚠️ Không khớp chính xác, tính điểm trùng từ...');
                    let maxScore = -1;
                    let bestIdx = -1;
                    const targetTokens = tokenize(foundAnswerText);

                    dGet.options.forEach((opt, i) => {
                        const optTokens = tokenize(opt);
                        const intersection = optTokens.filter(token => targetTokens.includes(token));
                        const score = intersection.length;
                        if (score > maxScore) {
                            maxScore = score;
                            bestIdx = i;
                        }
                    });

                    if (bestIdx > -1 && maxScore > 0) {
                        idx = bestIdx;
                    }
                }

                if (idx > -1) {
                    await submitAnswer(idx, false);
                } else {
                    console.warn('[Đua Top] 🛑 Có đáp án mẫu nhưng không khớp option.');

                    // --- SỬA LỖI HIỂN THỊ TẠI ĐÂY ---
                    // Đưa text gợi ý vào thành HTML
                    const buttonsHtml = dGet.options.map((opt, i) =>
                        `<button id="btn-opt-${i}" class="swal2-confirm swal2-styled"
                        style="display:block; width:100%; margin: 5px 0; background-color: #3085d6;">${opt}</button>`
                    ).join('');

                    // Tạo đoạn HTML chứa cả Gợi ý và Nút
                    const contentHtml = `
                        <div style="margin-bottom: 15px; color: #d33; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                            Gợi ý: ${foundAnswerText}
                        </div>
                        <div>${buttonsHtml}</div>
                    `;

                    await Swal.fire({
                        title: dGet.question,
                        html: contentHtml, // Dùng duy nhất html
                        showConfirmButton: false, showCancelButton: true, cancelButtonText: 'Bỏ qua',
                        didOpen: () => {
                            dGet.options.forEach((_, i) => {
                                const btn = document.getElementById(`btn-opt-${i}`);
                                if (btn) btn.onclick = () => submitAnswer(i, true);
                            });
                        }
                    });
                }

            } else {
                console.warn('[Đua Top] 🛑 Hỏi người dùng (Chưa có dữ liệu)...');

                // --- SỬA LỖI HIỂN THỊ TẠI ĐÂY (TRƯỜNG HỢP KHÔNG CÓ DATA) ---
                const buttonsHtml = dGet.options.map((opt, idx) =>
                    `<button id="btn-opt-${idx}" class="swal2-confirm swal2-styled"
                    style="display:block; width:100%; margin: 5px 0; background-color: #3085d6;">${opt}</button>`
                ).join('');

                await Swal.fire({
                    title: dGet.question,
                    // Không dùng 'text' nữa vì tiêu đề đã có câu hỏi rồi, hoặc nếu muốn hiện lại câu hỏi thì đưa vào html
                    html: buttonsHtml,
                    showConfirmButton: false, showCancelButton: true, cancelButtonText: 'Bỏ qua',
                    didOpen: () => {
                        dGet.options.forEach((_, idx) => {
                            const btn = document.getElementById(`btn-opt-${idx}`);
                            if (btn) btn.onclick = () => submitAnswer(idx, true);
                        });
                    }
                });
            }
        } catch (e) { console.error('[Đua Top] Lỗi:', e); }
    }


    // ===============================================
    // HÀM HIỂN THỊ THÔNG BÁO
    //
    /**
        * HÀM HIỂN THỊ THÔNG BÁO
        * @param {*} message: nội dung thông báo (hỗ trợ HTML)
        * @param {*} type: success, warn, error, info
        * @param {*} duration: thời gian hiển thị (ms)

            */

    (function initNotificationContainer() {
        const check = setInterval(() => {
            if (document.body) {
                clearInterval(check);
                if (!document.getElementById('hh3d-notification-container')) {
                    const container = document.createElement('div');
                    container.id = 'hh3d-notification-container';
                    document.body.appendChild(container);
                }
            }
        }, 100);
    })();


        function showNotification(message, type = 'success', duration = 3000) {

            // --- Bắt đầu phần chèn CSS tự động ---
            if (!isCssInjected) {
                const style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = `
                    #hh3d-notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 10px;
                    z-index: 1000000;
                    pointer-events: none;
                    }

                    .hh3d-notification-item {
                    padding: 10px 20px;
                    border-radius: 5px;
                    color: white;
                    min-width: 250px;
                    max-width: 350px;
                    pointer-events: auto;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    transition: all 0.5s ease-in-out;
                    opacity: 0;
                    transform: translateX(100%);
                    background-color: white;
                    }

                    .hh3d-notification-item.success {
                    background-color: #4caf50ff;
                    }
                    .hh3d-notification-item.warn {
                    background-color: #ff9800;
                    }
                    .hh3d-notification-item.error {
                    background-color: #c31004ff;
                    }
                    .hh3d-notification-item.info {
                    background-color: #0066ffff;
                    }
                `;
                document.head.appendChild(style);
                isCssInjected = true;
            }
            // --- Kết thúc phần chèn CSS tự động ---

            // Log console
            const logPrefix = '[HH3D Notification]';
            if (type === 'success') {
                console.log(`${logPrefix} ✅ SUCCESS: ${message}`);
            } else if (type === 'warn') {
                console.warn(`${logPrefix} ⚠️ WARN: ${message}`);
            } else if (type === 'info') {
                console.info(`${logPrefix} ℹ️ INFO: ${message}`);
            } else {
                console.error(`${logPrefix} ❌ ERROR: ${message}`);
            }

            // Tạo container nếu chưa tồn tại
            let container = document.getElementById('hh3d-notification-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'hh3d-notification-container';
                document.body.appendChild(container);
            }

            // Tạo item thông báo
            const notification = document.createElement('div');
            notification.className = `hh3d-notification-item ${type}`;
            if (/<[a-z][\s\S]*>/i.test(message)) {
                notification.innerHTML = message; // có HTML
            } else {
                notification.innerText = message; // chỉ text
            }

            container.appendChild(notification);

            // Hiển thị thông báo với hiệu ứng trượt vào
            requestAnimationFrame(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(0)';
            });

            // Tự động ẩn và xóa thông báo
            let timeoutId = setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 500);
            }, duration);

            // Cho phép người dùng tương tác
            notification.addEventListener('mouseenter', () => {
                clearTimeout(timeoutId);
            });

            notification.addEventListener('mouseleave', () => {
                timeoutId = setTimeout(() => {
                    notification.style.opacity = '0';
                    notification.style.transform = 'translateX(100%)';
                    setTimeout(() => notification.remove(), 500);
                }, 500);
            });

            notification.addEventListener('click', () => {
                clearTimeout(timeoutId);
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 500);
            });
        };

        // ===============================================
        // Class quản lý các quy tắc CSS
        // ===============================================
        class UIMenuStyles {
        addStyles() {
            const style = document.createElement('style');
            style.innerHTML = `
                /* Kiểu chung cho toàn bộ menu */
                .custom-script-menu {
                    display: flex !important;
                    flex-direction: column !important;
                    position: absolute;
                    background-color: #242323ff;
                    min-width: 300px !important;
                    z-index: 1001;
                    border-radius: 5px;
                    top: calc(100% + 6px);
                    right: 0;
                    padding: 8px;
                    gap: 6px;
                }

                /* Kiểu chung cho các nhóm nút */
                .custom-script-menu-group {
                    display: flex;
                    flex-direction: row;
                    gap: 6px;
                    flex-wrap: wrap;
                    justify-content: flex-start;
                }

                /* Kiểu chung cho tất cả các nút (a, button) */
                .custom-script-menu-button,
                .custom-script-menu-link {
                    color: black;
                    padding: 8px 10px !important;
                    font-size: 13px !important;
                    text-decoration: none;
                    border-radius: 5px;
                    background-color: #f1f1f1;
                    flex-grow: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                }
                .custom-script-menu.hidden {
                    visibility: hidden;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s ease;
                }

                .custom-script-menu-button:hover,
                .custom-script-menu-link:hover {
                    box-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
                    transform: scale(1.03);
                }

                /* Nút auto-btn */
                .custom-script-auto-btn {
                    background-color: #3498db;
                    color: white;
                    font-weight: bold;
                }
                .custom-script-auto-btn:hover {
                    background-color: #2980b9;
                }
                .custom-script-auto-btn:disabled {
                    background-color: #7f8c8d;
                    cursor: not-allowed;
                    box-shadow: none;
                }


            /* Phúc lợi*/

/* Phúc Lợi */
.custom-script-phuc-loi-group {
    display:flex;
    flex-direction:row;
    gap:6px;
    width:100%;
}

.custom-script-phuc-loi-btn,
.custom-script-phuc-loi-icon-btn {
    border-radius: 5px;
    border: none;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Nút chính Phúc Lợi */
.custom-script-phuc-loi-btn {
    flex-grow:1;
    display:flex;
    justify-content:center;
    align-items:center;
    padding:8px 10px;
    font-size:13px;
    border-radius:5px;
    border:none;
    background-color:#3498db;
    color:white;
}


.custom-script-phuc-loi-btn:hover {
    background-color: #3498db;
}

.custom-script-phuc-loi-btn:disabled {
    background-color: #7f8c8d;
    cursor: not-allowed;
    box-shadow: none;
}

/* Nút Bonus (icon) */
.custom-script-phuc-loi-icon-btn {
    width: 30px;
    height: 30px;
    background-color: #555;
    color: white;
    border-radius: 15px;
    margin-top: 5px;
}

.custom-script-phuc-loi-icon-btn:hover {
    background-color: #1f6da1ff;
}








                /* Nhóm Dice Roll */
                .custom-script-dice-roll-group {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-grow: 1;
                }
                .custom-script-dice-roll-select {
                    padding: 8px 10px;
                    font-size: 13px;
                    border-radius: 5px;
                    border: 1px solid #ccc;
                    background-color: #fff;
                    color: black;
                    cursor: pointer;
                    flex-grow: 1;
                }
                .custom-script-dice-roll-btn {
                    background-color: #e74c3c;
                    color: white;
                    font-weight: bold;
                    padding: 8px 10px;
                }
                .custom-script-dice-roll-btn:hover {
                    background-color: #c0392b;
                }
                .custom-script-dice-roll-btn:disabled {
                    background-color: #7f8c8d;
                    cursor: not-allowed;
                    box-shadow: none;
                }
                .custom-script-menu-group-dice-roll {
                    display: flex;
                    flex-direction: row;
                    gap: 6px;
                    flex-wrap: wrap;
                    justify-content: flex-start;
                    align-items: center;
                }

                /* Nhóm Hoang Vực */
                .custom-script-hoang-vuc-group {
                    display: flex;
                    flex-direction: row;
                    gap: 6px;
                }
                .custom-script-hoang-vuc-btn,
                .custom-script-hoang-vuc-settings-btn {
                    border-radius: 5px;
                    border: none;
                    font-weight: bold;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .custom-script-hoang-vuc-btn {
                    background-color: #3498db;
                    color: white;
                }
                .custom-script-hoang-vuc-btn:hover {
                    background-color: #3498db;
                }
                .custom-script-hoang-vuc-btn:disabled {
                    background-color: #7f8c8d;
                    cursor: not-allowed;
                    box-shadow: none;
                }
                .custom-script-hoang-vuc-settings-btn {
                    width: 30px;
                    height: 30px;
                    background-color: #555;
                    color: white;
                    border-radius: 15px;
                    margin-top: 5px;

                }
                .custom-script-hoang-vuc-settings-btn:hover {
                    background-color: #1f6da1ff;
                }


    /* Bí cảnh*/
    /* Wrapper ép Bí Cảnh xuống hàng riêng */
            .custom-script-menu-group .bicanh-wrapper {
                flex-basis: 100%;
                display: block;
                margin-top: 2px;
            }

            /* Container hàng ngang cho các nút bên trong */
            .bicanh-row {
                display: flex;
                gap: 6px;
                align-items: stretch; /* ép các phần tử cao bằng nhau */
            }

            .bicanh-input {
                width: 60px;
                text-align: center;
                box-sizing: border-box;

            }

            .bicanh-socket {
                width: 40px;
                min-width: 0;
                padding: 0;
                margin: 0;
                text-align: center;
                box-sizing: border-box;

            }

        /* Khoáng Mạch */
        .custom-script-khoang-mach-container {
            display: flex;
            flex-direction: column;
            gap: 6px;
            width: 100%;
        }

        .custom-script-khoang-mach-button-row {
            display: flex;
            flex-direction: row;
            gap: 6px;
            width: 100%;
        }

        .custom-script-khoang-mach-button {
            padding: 8px 10px !important;
            font-size: 13px !important;
            text-decoration: none;
            border-radius: 5px;
            background-color: #3498db;
            color: white;
            font-weight: bold;
            flex-grow: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
        }
        .custom-script-khoang-mach-button:disabled {
            background-color: #7f8c8d;
            cursor: not-allowed;
            box-shadow: none;
        }
        .custom-script-settings-panel {
            background-color: #333;
            border: 1px solid #444;
            border-radius: 5px;
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .custom-script-khoang-mach-config-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .custom-script-khoang-mach-config-group label {
            font-size: 13px;
            color: #ccc;
            font-weight: bold;
        }

        .custom-script-khoang-mach-config-group select {
            padding: 8px;
        }

        .custom-script-khoang-mach-config-group.checkbox-group {
            flex-direction: row;
            align-items: center;
            gap: 6px;
        }

        .custom-script-khoang-mach-config-group.checkbox-group input[type="checkbox"] {
            width: 16px;
            height: 16px;
        }
        .custom-script-khoang-mach-config-group.number-input-group {
            flex-direction: row;
            align-items: center;
            gap: 6px;
        }




    /* Nút Tặng Hoa */
        .custom-script-tang-hoa-btn {
            // background-color: #e91e63; /* hồng */
            background-color: #CC3078;
            color: #fff;
            font-weight: bold;
        }
        .custom-script-tang-hoa-btn:hover {
            background-color: #c2185b; /* hồng đậm khi hover */
        }
        .custom-script-tang-hoa-btn:disabled {
            background-color: #7f8c8d;
            cursor: not-allowed;
            box-shadow: none;
        }

        /* Dropdown số người Tặng Hoa */
        .custom-script-tang-hoa-select {
            color: #000;
            //border: 1px solid #d81b60;
            border-radius: 5px;
            padding: 6px 10px;
            //font-weight: bold;
            cursor: pointer;
        }

    /* Nút Mua Rương Linh Bảo */
        .custom-script-mua-ruong-btn {
            background-color: #009688; /* xanh ngọc */
            color: #fff;
            font-weight: bold;
        }
        .custom-script-mua-ruong-btn:hover {
            background-color: #00796b; /* xanh ngọc đậm khi hover */
        }
        .custom-script-mua-ruong-btn:disabled {
            background-color: #7f8c8d; /* xám khi disable */
            cursor: not-allowed;
            box-shadow: none;
        }

        /* Dropdown số lượng Mua Rương */
        .custom-script-mua-ruong-select {
            color: black;
            //border: 1px solid #009688; /* viền xanh ngọc */
            border-radius: 5px;
            padding: 6px 10px;
            //font-weight: bold;
            cursor: pointer;
        }

        .custom-script-mua-ruong-select:hover {
        // color: #004d40;            /* chữ xanh đậm hơn khi hover */
            color: #000;
        }


    /* Nút KHẮC TRẬN VĂN*/
        .custom-script-khac-tran-van-btn {
            background-color: #7B68EE;
            color: #fff;
            font-weight: bold;
        }
        .custom-script-khac-tran-van-btn:hover {
            background-color: #6A5ACD;}

        .custom-script-khac-tran-van-btn:disabled {
            background-color: #7f8c8d; /* xám khi disable */
            cursor: not-allowed;
            box-shadow: none;
        }

    /* Nút KHẮC TRẬN VĂN lượt nhận vip*/
        .custom-script-khac-tran-van-vip-btn {
            // background-color: #FF8C00;
            background-color: #7B68EE;
            color: #fff;
            font-weight: bold;
        }
        .custom-script-khac-tran-van-vip-btn:hover {
            background-color: #6A5ACD;}

        .custom-script-khac-tran-van-vip-btn:disabled {
            background-color: #7f8c8d; /* xám khi disable */
            cursor: not-allowed;
            box-shadow: none;
        }

    /* Nút Cầu Nguyện tiên duyên*/
        .custom-script-cau-nguyen-btn {
            // background-color: #FF8C00;
            background-color:  #CC3078;
            color: #fff;
            font-weight: bold;
        }
        .custom-script-cau-nguyen-btn:hover {
            background-color: #c2185b;}

        .custom-script-cau-nguyen-btn:disabled {
            background-color: #7f8c8d; /* xám khi disable */
            cursor: not-allowed;
            box-shadow: none;
        }
        // .custom-script-cau-nguyen-btn.outline-state {
        // background-color: #7f8c8d; /* nền trong suốt */
        // border: 1px solid #666;        /* viền màu xám hoặc màu bạn chọn */
        // opacity: 0.8;                  /* hơi mờ để phân biệt */
        // }



    /*Mua Đan*/
    /* Container chính */
        .custom-script-mua-dan-container {
            display: flex;
            flex-direction: column;
            gap: 6px;
            width: 100%;
        }

        /* Hàng chính: Mua Đan + gear */
        .custom-script-mua-dan-button-row {
            display: flex;
            flex-direction: row;
            gap: 6px;
            width: 100%;
        }

        /* Nút chính Mua Đan */
        .custom-script-mua-dan-button {
            padding: 8px 10px;
            font-size: 13px;
            border-radius: 5px;
            background-color: #0a3d66ff;
            color: #fff;
            font-weight: bold;
            flex-grow: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease-in-out;
        }
        .custom-script-mua-dan-button:disabled {
            background-color: #7f8c8d;
            cursor: not-allowed;
        }

        /* Nút gear ⚙️ giống Khoáng Mạch */
        .custom-script-mua-dan-settings-btn {
            width: 30px;
            height: 30px;
            background-color: #555;
            color: #fff;
            border-radius: 15px;
            margin-top: 5px;
            border: none;
            font-weight: bold;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
        }
        .custom-script-mua-dan-settings-btn:hover {
            background-color: #1f6da1ff;
        }

        /* Panel xổ xuống */
        .custom-script-mua-dan-settings-panel {
            background-color: #444;
            border: 1px solid #444;
            border-radius: 5px;
            padding: 5px;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        /* Hàng trong panel */
        .custom-script-mua-dan-config-row {
            display: flex;
            align-items: center;
            gap: 5px; /* khoảng cách giữa dropdown + button*/
            //margin-bottom: 10px; //khoảng cách giữa 2 dòng trong menu
        }

        .custom-script-mua-dan-config-row:last-child {
            margin-bottom: 0; /* bỏ margin ở hàng cuối */
        }

        /* Dropdown */
        .custom-script-mua-dan-config-row select {
            padding: 4px 8px;       /* giảm padding cho gọn */
            font-size: 13px;
            background-color: #fff;
            color: #000;
            border: 1px solid #ccc;
            border-radius: 4px;
            line-height: 1.4;
            box-sizing: border-box;
            height: 30px;
            width: auto;            /* co theo nội dung */
            white-space: nowrap;    /* không cho chữ xuống hàng */
        }
        /* Nút hành động */
        .custom-script-mua-dan-action-btn {
            height: 30px;
            padding: 4px 10px;      /* giảm padding cho gọn */
            font-size: 13px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            line-height: 1.4;
            width: auto;            /* co theo nội dung */
            white-space: nowrap;    /* không cho chữ xuống hàng */
        }

        /* Màu riêng từng nút */
        .custom-script-mua-dan-tong-btn {
            background-color: #f1c40f; /* xanh ngọc */
            color: #000;
        }
        .custom-script-mua-dan-tubao-btn {
            background-color: #f1c40f; /* vàng */
            color: #000;
        }

        .custom-script-mua-dan-action-btn:disabled {
            background-color: #7f8c8d; /* màu xám */
            color: #ccc;
            cursor: not-allowed;
        }

        #checkbox-tubao {
            width:18px;          /* tăng kích thước */
            height: 18px;
            accent-color: #068202ff;
            cursor: pointer;
            margin-left: 2px;
        }

        #checkbox-tubao:hover {
            outline: 2px solid #f1c40f; /* viền vàng khi hover */
            border-radius: 4px;
        }


    /* Hiệu ứng cho nút tìm kiếm */
                @keyframes searchIconToggle {
                    0%, 49.9% {
                        content: '🔍';
                    }
                    50%, 100% {
                        content: '🔎';
                    }
                }

                .custom-script-hoang-vuc-settings-btn.searching {
                    animation: searchIconToggle 1s infinite;
                }

                .custom-script-status-icon {
                    width: 10px;
                    height: 10px;
                    margin-top: 0px;
                    margin-right: 0px;
                }

                .custom-script-item-wrapper {
                    position: relative; /* Quan trọng: Đặt vị trí tương đối để định vị icon */
                }

                /* Biểu tượng trạng thái Autorun */
                .custom-script-status-icon {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    width: 10px;
                    height: 10px;
                    background-color: transparent;
                    border-radius: 50%;
                    border: none;
                    z-index: 10;
                }

                /* Khi autorun đang chạy */
                .custom-script-status-icon.running {
                    background-color: #e74c3c; /* Màu đỏ */
                    animation: pulse 1.5s infinite; /* Hiệu ứng nhấp nháy */
                }

                /* Hiệu ứng nhấp nháy */
                @keyframes pulse {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.5);
                        opacity: 0.5;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                /* CSS cho container chứa nhiều thông báo */
                .custom-script-status-bar {
                    position: relative;
                    bottom: 0px;           /* ✅ bám đáy parent thay vì top */
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100%;
                    max-width: 250px;
                    padding: 5px;
                    display: flex;
                    flex-direction: column; /* thông báo mới nằm trên */
                    gap: 5px;
                    z-index: 1000;
                }

                /* CSS cho từng thông báo riêng lẻ */
                .custom-script-message {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 500;
                    color: #fff;
                    white-space: nowrap;
                    text-align: center;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    opacity: 0;
                    animation: fadeIn 0.3s forwards;
                    transition: opacity 0.3s ease-in-out;
                }

                /* Các loại thông báo */
                .custom-script-message.info {
                    background-color: #3498db;
                }

                .custom-script-message.success {
                    background-color: #2ecc71;
                }


                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
    }
                `;

            document.head.appendChild(style);
        }
        }

        // ===============================================
        // Class quản lý việc tạo các menu con
        // ===============================================
        class UIMenuCreator {
            constructor(parentGroup, accountId) {
                this.parentGroup = parentGroup;
                this.accountId = accountId;
                this.buttonMap = new Map();
                this.autorunIsRunning = false;
            }
            setAutorunIsRunning() {
                this.autorunIsRunning = true;
            }

            // Phương thức chung để cập nhật trạng thái của nút
            async updateButtonState(taskName) {
                const button = this.buttonMap.get(taskName);
                if (!button) return;
                const statusIcon = document.querySelector('.custom-script-status-icon');

                // Xử lý logic cập nhật trạng thái dựa trên tên nhiệm vụ (taskName)
                switch (taskName) {
                    case 'autorun':
                        if (this.autorunIsRunning) {
                            button.textContent = 'Đang chạy autorun...';
                            if (statusIcon) {
                                statusIcon.classList.add('running');
                            }
                        } else {
                            button.textContent = 'Autorun';
                            if (statusIcon) {
                                statusIcon.classList.remove('running');
                            }
                        }
                        break;
                    case 'diemdanh':
                    case 'thiluyen':
                    case 'phucloi':
                    case 'hoangvuc':
                    case 'luanvo':
                    case 'khoangmach':
                    case 'luotkhactranvip':
                            if (taskTracker.isTaskDone(this.accountId, taskName)) {
                            button.disabled = true;
                            button.textContent = `${button.textContent.replace(' ✅', '')} ✅`;
                        } else {
                            button.disabled = false;
                            button.textContent = button.textContent.replace(' ✅', '');
                        }
                        break;


                    case 'dothach':
                            const currentHour = parseInt(new Date().toLocaleString('en-US', {
                                timeZone: 'Asia/Ho_Chi_Minh',
                                hour: 'numeric',
                                hour12: false // Định dạng 24 giờ
                            }), 10);

                            const isBetTime = (currentHour >= 6 && currentHour < 13) || (currentHour >= 16 && currentHour < 21);
                            const status = taskTracker.getTaskStatus(this.accountId, 'dothach');
                            if ((status.betplaced && isBetTime) || (status.reward_claimed && !isBetTime)) {
                                button.disabled = true;
                            } else {
                                button.disabled = false;
                            }
                            break;
                    case 'bicanh':
                            const isDailyLimit = await bicanh.isDailyLimit();
                            if (isDailyLimit) {
                                button.disabled = true;
                                button.textContent = 'Bí Cảnh ✅';
                            } else {
                                button.disabled = false;
                                button.textContent = 'Bí Cảnh';
                            }
                            break;

                    case 'muaruong':
                            const isDailyLimitRuong = hvmuaruong.isDailyLimit();
                            if (isDailyLimitRuong) {
                                button.disabled = true;
                                button.textContent = 'Rương Linh Bảo ✅';
                            } else {
                                button.disabled = false;
                                button.textContent = 'Rương Linh Bảo';
                            }
                            break;

                    case 'khactranvan':
                            const isOutTurns = await khactran.checkRemainingTurns();
                            const today = new Date().toDateString();
                            const lastday = localStorage.getItem('khactranvan_lastday');

                            // console.log("[Khắc Trận Văn] 👉 Hôm nay:", today);
                                        // console.log("[Khắc Trận Văn] 👉 Ngày lưu lần trước:", lastday);
                                        // console.log("[Khắc Trận Văn] 👉 Hết lượt chưa?:", isOutTurns);

                            if (lastday !== today) {
                            // Qua ngày mới thì mở lại nút
                                console.log("[Khắc Trận Văn] 🔄 Qua ngày mới, reset nút.");
                                button.disabled = false;
                                button.textContent = 'Khắc Trận';
                            localStorage.setItem('khactranvan_lastday', today);
                            } else {
                                if (isOutTurns) {
                                    console.log("[Khắc Trận Văn] ⏹ Hết lượt trong ngày, disable nút.");
                                    button.disabled = true;
                                    button.textContent = 'Khắc Trận ✅';
                                            } else {
                                    console.log("[Khắc Trận Văn] ✅ Còn lượt, nút khả dụng.");
                                    button.disabled = false;
                                    button.textContent = 'Khắc Trận';
                                            }
                                        }
                            break;

                    case 'caunguyendaolu':
                            if (taskTracker.isTaskDone(this.accountId, taskName)) {
                                button.disabled = true;
                                button.textContent = `${button.textContent.replace(' ✅', '')} ✅`;
                                // button.textContent = `${button.textContent} 👏🏻 `;

                                //button.classList.add('outline-state');
                            } else {
                                button.disabled = false;
                            button.textContent = button.textContent.replace(' ✅', '');
                                //button.classList.remove('outline-state');
                            }
                            break;
                        }
                    }


// Phương thức tạo menu "Đổ Thạch"
            async createDiceRollMenu(parentGroup) {
                parentGroup.classList.add('custom-script-dice-roll-group');

                const select = document.createElement('select');
                select.id = 'dice-roll-select';
                select.classList.add('custom-script-dice-roll-select');

                const optionTai = document.createElement('option');
                optionTai.value = 'tai';
                optionTai.textContent = 'Tài';
                select.appendChild(optionTai);

                const optionXiu = document.createElement('option');
                optionXiu.value = 'xiu';
                optionXiu.textContent = 'Xỉu';
                select.appendChild(optionXiu);

                const savedChoice = localStorage.getItem('dice-roll-choice') ?? 'tai';
                select.value = savedChoice;

                // 🔹 Lưu lại mỗi khi thay đổi
                select.addEventListener('change', () => {
                    localStorage.setItem('dice-roll-choice', select.value);
                        });

                const rollButton = document.createElement('button');
                rollButton.textContent = 'Đổ Thạch';
                rollButton.classList.add('custom-script-menu-button', 'custom-script-dice-roll-btn');
                this.buttonMap.set('dothach', rollButton);

                rollButton.addEventListener('click', async () => {
                    const selectedChoice = select.value;
                    rollButton.textContent = 'Đang xử lý...';
                    await dothach.run(selectedChoice);
                    rollButton.textContent = 'Đổ Thạch';
                    this.updateButtonState('dothach');
                        });

                this.updateButtonState('dothach');
                parentGroup.appendChild(select);
                parentGroup.appendChild(rollButton);
                    }

// Phương thức tạo menu "Hoang Vực"
            createHoangVucMenu(parentGroup) {
                const hoangVucButton = document.createElement('button');
                hoangVucButton.textContent = 'Hoang Vực';
                hoangVucButton.classList.add('custom-script-hoang-vuc-btn');
                this.buttonMap.set('hoangvuc', hoangVucButton)

                const settingsButton = document.createElement('button');
                settingsButton.classList.add('custom-script-hoang-vuc-settings-btn');

                const updateSettingsIcon = () => {
                    const maximizeDamage = localStorage.getItem('hoangvucMaximizeDamage') === 'true';
                    if (maximizeDamage) {
                        settingsButton.textContent = '🔼';
                        settingsButton.title = 'Tối đa hoá sát thương: Bật';
                            } else {
                        settingsButton.textContent = '🔷';
                        settingsButton.title = 'Tối đa hoá sát thương: Tắt';
                            }
                        };

                hoangVucButton.addEventListener('click', async () => {
                    hoangVucButton.disabled = true;
                    hoangVucButton.textContent = 'Đang xử lý...';
                    try {
                        await hoangvuc.doHoangVuc();
                            }
                    finally {
                        hoangVucButton.textContent = 'Hoang Vực';
                        this.updateButtonState('hoangvuc');
                            }
                        });

                settingsButton.addEventListener('click', () => {
                    let maximizeDamage = localStorage.getItem('hoangvucMaximizeDamage') === 'true';
                    const newSetting = !maximizeDamage;
                    localStorage.setItem('hoangvucMaximizeDamage', newSetting);
                    const message = newSetting ? 'Đổi ngũ hành để tối đa hoá sát thương' : 'Đổi ngũ hành để không bị giảm sát thương';
                    showNotification(`[Hoang vực
                            ] ${message
                            }`, 'info');
                    updateSettingsIcon();
                        });

                parentGroup.appendChild(settingsButton);
                parentGroup.appendChild(hoangVucButton);

                this.updateButtonState('hoangvuc');
                updateSettingsIcon();
                    }

 // Phương thức tạo menu "Bí Cảnh"
    async createBiCanhMenu(parentGroup) {
        // Wrapper để ép Bí Cảnh xuống riêng một hàng
        const biCanhWrapper = document.createElement('div');
        biCanhWrapper.classList.add('bicanh-wrapper');

        // Container hàng ngang bên trong wrapper
        const rowContainer = document.createElement('div');
        rowContainer.classList.add('bicanh-row');

        // Nút Bí Cảnh (giữ class chung)
        const biCanhButton = document.createElement('button');
        this.buttonMap.set('bicanh', biCanhButton);
        biCanhButton.textContent = 'Bí Cảnh';
        biCanhButton.classList.add('custom-script-menu-button', 'custom-script-auto-btn');
        biCanhButton.addEventListener('click', async () => {
            biCanhButton.disabled = true;
            biCanhButton.textContent = 'Đang xử lý...';
            try {
                await bicanh.doBiCanh();
                            } finally {
                biCanhButton.textContent = 'Bí Cảnh';
                this.updateButtonState('bicanh');
                biCanhButton.disabled = false;
                            }
                        });
        rowContainer.appendChild(biCanhButton);

        // Ô nhập số giữ lượt (chỉ class riêng)
        const reserveInput = document.createElement('input');
        reserveInput.type = 'number';
        reserveInput.min = '0';
        reserveInput.max = '5';
        reserveInput.step = '1';
        reserveInput.title = 'Nhập số lượt muốn giữ lại, không đánh khi còn ≤ số này';
        reserveInput.classList.add('bicanh-input');

        const savedReserve = parseInt(localStorage.getItem('reserveBiCanhAttacks') || '0',
                        10);
        reserveInput.value = isNaN(savedReserve) ? 0 : savedReserve;

        reserveInput.addEventListener('input', () => {
            const val = Math.max(0, Math.min(5, parseInt(reserveInput.value || '0',
                            10)));
            localStorage.setItem('reserveBiCanhAttacks', String(val));
            showNotification(`Đã cập nhật: giữ lại ${val
                            } lượt Bí Cảnh`, 'info');
                        });
        rowContainer.appendChild(reserveInput);

        // Nút toggle socket (chỉ class riêng)
        const socketToggle = document.createElement('button');
        socketToggle.classList.add('bicanh-socket');
        socketToggle.id = 'biCanhSocketToggle';
        socketToggle.title = 'Bật/tắt theo dõi boss Bí Cảnh qua socket';
        const savedState = localStorage.getItem('biCanhSocketEnabled');
        if (savedState === '1') {
            socketToggle.dataset.enabled = '1';
            socketToggle.innerHTML = '⚡';
            bicanhhiente.startBossSocketListener();
                        } else {
            socketToggle.dataset.enabled = '0';
            socketToggle.innerHTML = '🔌';
            // bicanhhiente.stopBossSocketListener();
                        }
        socketToggle.addEventListener('click', () => {
            const enabled = socketToggle.dataset.enabled === '1';
            if (enabled) {
                socketToggle.dataset.enabled = '0';
                socketToggle.innerHTML = '🔌';
                localStorage.setItem('biCanhSocketEnabled', '0');
                bicanhhiente.stopBossSocketListener();
                            } else {
                socketToggle.dataset.enabled = '1';
                socketToggle.innerHTML = '⚡';
                localStorage.setItem('biCanhSocketEnabled', '1');
                bicanhhiente.startBossSocketListener();
                            }
                        });
        rowContainer.appendChild(socketToggle);

        // Thêm rowContainer vào wrapper, rồi wrapper vào parentGroup
        biCanhWrapper.appendChild(rowContainer);
        parentGroup.appendChild(biCanhWrapper);

        // Cập nhật trạng thái ban đầu
        this.updateButtonState('bicanh');
                    }
      // Phương thức tạo menu "Phúc lợi"
   createPhucLoiMenu(parentGroup) {
    // --- Nút Phúc Lợi chính ---
    const phucLoiButton = document.createElement("button");
    phucLoiButton.textContent = "Phúc Lợi";
    phucLoiButton.classList.add("custom-script-phuc-loi-btn");
    // phucLoiButton.classList.add('custom-script-menu-button','custom-script-auto-btn','custom-script-phuc-loi-btn');

    this.buttonMap.set("phucloi", phucLoiButton);

    phucLoiButton.addEventListener("click", async () => {
        phucLoiButton.disabled = true;
        phucLoiButton.textContent = "Đang xử lý...";
        try {
            await doPhucLoiDuong();
        } finally {
            phucLoiButton.textContent = "Phúc Lợi";
            this.updateButtonState("phucloi");
        }
    });

    // --- Nút Bonus (chỉ hiển thị icon text) ---
    const bonusButton = document.createElement("button");
    bonusButton.classList.add("custom-script-phuc-loi-icon-btn");
    bonusButton.title = "Nhận phần thưởng Bonus Phúc Lợi";

    // chỉ cần text là emoji/icon
    bonusButton.textContent = "🎁";

    this.buttonMap.set("phucloibonus", bonusButton);

    bonusButton.addEventListener("click", async () => {
        bonusButton.disabled = true;
        try {
            await phucloiclaimbonus();
        } finally {
            bonusButton.disabled = false;
            this.updateButtonState("phucloibonus");
        }
    });

    // --- Gắn cả hai nút vào cùng một group ---
    const phucLoiGroup = document.createElement("div");
    phucLoiGroup.classList.add("custom-script-phuc-loi-group");
    phucLoiGroup.appendChild(phucLoiButton);
    phucLoiGroup.appendChild(bonusButton);

    parentGroup.appendChild(phucLoiGroup);

    this.updateButtonState("phucloi");
    this.updateButtonState("phucloibonus");
}


// Phương thức tạo menu "Mua Rương Linh Bảo"
            async createMuaRuongMenu(parentGroup) {
                parentGroup.classList.add('custom-script-mua-ruong-group');

                const select = document.createElement('select');
                select.id = 'mua-ruong-select';
                select.classList.add('custom-script-mua-ruong-select');

                for (let i = 1; i <= 5; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = `Mua ${i
                            }`;
                    select.appendChild(option);
                        }

                const savedChoice = localStorage.getItem('mua-ruong-choice') ?? '5';
                select.value = savedChoice;

                select.addEventListener('change', () => {
                    localStorage.setItem('mua-ruong-choice', select.value);
                        });

                const muaRuongButton = document.createElement('button');
                muaRuongButton.textContent = 'Rương Linh Bảo';
                muaRuongButton.classList.add('custom-script-menu-button', 'custom-script-mua-ruong-btn');
                this.buttonMap.set('muaruong', muaRuongButton);

                muaRuongButton.addEventListener('click', async () => {
                    const quantity = parseInt(select.value,
                            10);
                    muaRuongButton.textContent = 'Đang xử lý...';
                    try {
                        await hvmuaruong.muaRuongLinhBao(quantity);
                            } finally {
                        await this.updateButtonState('muaruong');
                            }
                        });

                const purchased = hvmuaruong.getPurchasedToday();
                console.log(`[HH3D Hoang Vuc Shop] 📦 Hôm nay đã mua ${purchased} rương`);

                this.updateButtonState('muaruong');
                parentGroup.appendChild(select);
                parentGroup.appendChild(muaRuongButton);
                    }
    // Phương thức tạo menu "Tặng hoa"

        async createTangHoaMenu(parentGroup) {
            parentGroup.classList.add('custom-script-tang-hoa-group');

            const select = document.createElement('select');
            select.id = 'tang-hoa-select';
            select.classList.add('custom-script-tang-hoa-select');

            // Tạo option từ 1 đến 5
            for (let i = 1; i <= 5; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `${i} người`;
                select.appendChild(option);
                        }

            const savedChoice = localStorage.getItem('tang-hoa-choice') ?? '5';
            select.value = savedChoice;

            select.addEventListener('change', () => {
                localStorage.setItem('tang-hoa-choice', select.value);
                        });

            const tangHoaButton = document.createElement('button');
            tangHoaButton.textContent = 'Tặng hoa';
            tangHoaButton.classList.add('custom-script-menu-button', 'custom-script-tang-hoa-btn');
            this.buttonMap.set('tanghoa', tangHoaButton);

        tangHoaButton.addEventListener('click', async () => {
            const selectedCount = parseInt(select.value,
                            10);
            tangHoaButton.textContent = 'Đang xử lý...';
            try {
                await tanghoa.run(selectedCount);
                            } finally {
                tangHoaButton.textContent = 'Tặng hoa';
                this.updateButtonState('tanghoa');
                            }
                       });

            // Thêm nút Cầu nguyện
            const cauNguyenButton = document.createElement('button');
            cauNguyenButton.textContent = '🙏';
            cauNguyenButton.classList.add('custom-script-menu-button', 'custom-script-cau-nguyen-btn');
            cauNguyenButton.title = 'Cầu nguyện tiên duyên thụ';
            this.buttonMap.set('caunguyendaolu', cauNguyenButton);

            cauNguyenButton.addEventListener('click', async () => {
                cauNguyenButton.textContent = '...';
                try {
                    await docaunguyen(accountId);
                } finally {
                    cauNguyenButton.textContent = '🙏';
                    this.updateButtonState('caunguyendaolu');
                }
            });


        // Cập nhật trạng thái ban đầu
            this.updateButtonState('tanghoa');
            this.updateButtonState('caunguyendaolu');

        // Append cả select, nút Tặng hoa và nút Cầu nguyện vào cùng group
            parentGroup.appendChild(select);
            parentGroup.appendChild(tangHoaButton);
            parentGroup.appendChild(cauNguyenButton);

        }

///Khắc trận văn menu

        async createKhacTranVanMenu(parentGroup) {
            parentGroup.classList.add('custom-script-khac-tran-van-group');

            // 🔹 Nút nhận lượt cho acc VIP
            const KhacTranVipButton = document.createElement('button');
            KhacTranVipButton.textContent = 'Lượt khắc (VIP)';
            KhacTranVipButton.classList.add('custom-script-menu-button', 'custom-script-khac-tran-van-vip-btn');
            this.buttonMap.set('luotkhactranvip', KhacTranVipButton);

            KhacTranVipButton.addEventListener('click', async () => {
            KhacTranVipButton.textContent = 'Đang nhận lượt...';
                try {
                    await khactran.claimDailyTurns(this.accountId); // hàm xử lý nhận lượt VIP
                } finally {
                    KhacTranVipButton.textContent = 'Lượt khắc (VIP)';
                    await this.updateButtonState('luotkhactranvip');
                }
            });

            this.updateButtonState('luotkhactranvip');
            parentGroup.appendChild(KhacTranVipButton);

        //Nút Khắc trận văn
            const khacButton = document.createElement('button');
            khacButton.textContent = 'Khắc Trận';
            khacButton.classList.add('custom-script-menu-button', 'custom-script-khac-tran-van-btn');
            this.buttonMap.set('khactranvan', khacButton);

            khacButton.addEventListener('click', async () => {
                khacButton.textContent = 'Đang xử lý...';
                try {

                    await khactran.autoActivateSeal();
                        } finally {
                    khacButton.textContent = 'Khắc Trận';
                    await this.updateButtonState('khactranvan');
                        }
                    });

            this.updateButtonState('khactranvan');
            parentGroup.appendChild(khacButton);
                }

// Mua đan

        createMuaDanMenu(parentGroup) {
            const container = document.createElement("div");
            container.classList.add("custom-script-mua-dan-container");

            // Hàng chính: Mua Đan + gear
            const buttonRow = document.createElement("div");
            buttonRow.classList.add("custom-script-mua-dan-button-row");

            const muaDanButton = document.createElement("button");
            muaDanButton.textContent = "Mua Đan hàng tháng";
            muaDanButton.classList.add("custom-script-mua-dan-button");

            const gearButton = document.createElement("button");
            gearButton.textContent = "⚙️";
            gearButton.classList.add("custom-script-mua-dan-settings-btn");

            buttonRow.appendChild(muaDanButton);
            buttonRow.appendChild(gearButton);

            // Panel cài đặt
            const configDiv = document.createElement("div");
            configDiv.style.display = "none";
            configDiv.classList.add("custom-script-settings-panel",
            "custom-script-mua-dan-settings-panel");

            // --- Hàng chung: dropdown + nút Tông Môn + nút Tụ Bảo + checkbox ---
            const row = document.createElement("div");
            row.classList.add("custom-script-mua-dan-config-row");

            // Dropdown Đan Tông Môn
            const selectTM = document.createElement("select");
            [
                1,
                2,
                3,
                4,
                5
            ].forEach(n => {
                const opt = document.createElement("option");
                opt.value = n;
                opt.textContent = `${n
                } đan`;
                selectTM.appendChild(opt);
            });

        // ✅ Khôi phục lựa chọn từ localStorage, mặc định là "1"
        const savedChoiceTM = localStorage.getItem("mua-dan-choice") ?? "3";
        selectTM.value = savedChoiceTM;

        // ✅ Lưu lại khi thay đổi
        selectTM.addEventListener("change", () => {
            localStorage.setItem("mua-dan-choice", selectTM.value);
            });


            // Nút Tông Môn
            const btnTM = document.createElement("button");
            btnTM.textContent = "Tông Môn";
            btnTM.classList.add("custom-script-mua-dan-action-btn",
            "custom-script-mua-dan-tong-btn");

            // Nút Tụ Bảo Các (mặc định xám)
            const btnTBC = document.createElement("button");
            btnTBC.textContent = "Tụ Bảo Các";
            btnTBC.classList.add("custom-script-mua-dan-action-btn",
            "custom-script-mua-dan-tubao-btn");
            btnTBC.disabled = true;

            // Checkbox (không text)
            const checkboxTBC = document.createElement("input");
            checkboxTBC.type = "checkbox";
            checkboxTBC.id = "checkbox-tubao";

            // Khôi phục trạng thái từ localStorage
            const savedState = localStorage.getItem("tubaoChecked");
            if (savedState === "true") {
                checkboxTBC.checked = true;
                btnTBC.disabled = false;
            }
            // Logic bật/tắt nút theo checkbox + noti
            checkboxTBC.addEventListener("change", () => {
                localStorage.setItem("tubaoChecked", checkboxTBC.checked);
                if (checkboxTBC.checked) {
                    btnTBC.disabled = false;
                    showNotification("✅ Mua Đan Tụ Bảo: bật",
                    "success");
                } else {
                    btnTBC.disabled = true;
                    showNotification("❌ Mua Đan Tụ Bảo: tắt",
                    "warn");
                }
            });

            // Thêm vào cùng hàng
            row.appendChild(selectTM);
            row.appendChild(btnTM);
            row.appendChild(btnTBC);
            row.appendChild(checkboxTBC);

            configDiv.appendChild(row);

            // Toggle panel
            gearButton.addEventListener("click", () => {
                configDiv.style.display = (configDiv.style.display === "none") ? "block": "none";
            });

            // Logic nút chính
            muaDanButton.addEventListener("click", async () => {
                const nTM = parseInt(selectTM.value,
                10);
                const doTuBao = checkboxTBC.checked;
                muaDanButton.textContent = "Đang mua...";
                await dantong.muaTopNDanTong(nTM);
                if (doTuBao) {
                    await dantubao.autobuyTuBao();
                }
                muaDanButton.textContent = "Mua Đan hàng tháng";
            });

            // Logic riêng từng nút
            btnTM.addEventListener("click", async () => {
                const n = parseInt(selectTM.value,
                10);
                btnTM.textContent = "Đang mua...";
                await dantong.muaTopNDanTong(n);
                btnTM.textContent = "Tông Môn";
            });

            btnTBC.addEventListener("click", async () => {
                btnTBC.textContent = "Đang mua...";
                await dantubao.autobuyTuBao();
                btnTBC.textContent = "Tụ Bảo Các";
            });

            container.appendChild(buttonRow);
            container.appendChild(configDiv);
            parentGroup.appendChild(container);
        }
// Phương thức tạo menu "Luận Võ"
            createLuanVoMenu(parentGroup) {
                const luanVoButton = document.createElement('button');
                this.buttonMap.set('luanvo', luanVoButton);
                const luanVoSettingsButton = document.createElement('button');
                luanVoSettingsButton.classList.add('custom-script-hoang-vuc-settings-btn');

                if (localStorage.getItem('luanVoAutoChallenge') === null) {
                localStorage.setItem('luanVoAutoChallenge', '1');
                        }
                let autoChallengeEnabled = localStorage.getItem('luanVoAutoChallenge') === '1';

                const updateSettingButtonState = (isEnabled) => {
                    luanVoSettingsButton.textContent = isEnabled ? '✅' : '❌';
                    luanVoSettingsButton.title = isEnabled ? 'Tự động thực hiện Luận Võ: Bật' : 'Tự động thực hiện Luận Võ: Tắt';
                        };
                updateSettingButtonState(autoChallengeEnabled);
                parentGroup.appendChild(luanVoSettingsButton);

                luanVoSettingsButton.addEventListener('click', () => {
                    autoChallengeEnabled = !autoChallengeEnabled;
                    localStorage.setItem('luanVoAutoChallenge', autoChallengeEnabled ? '1' : '0');
                    updateSettingButtonState(autoChallengeEnabled);
                    const message = autoChallengeEnabled ? 'Tự động thực hiện Luận Võ đã được bật' : 'Tự động thực hiện Luận Võ đã được tắt';
                    showNotification(`[Luận Võ
                            ] ${message
                            }`, 'info');
                        });

                luanVoButton.textContent = 'Luận Võ';
                luanVoButton.classList.add('custom-script-menu-button', 'custom-script-auto-btn');
                luanVoButton.addEventListener('click', async () => {
                    luanVoButton.disabled = true;
                    luanVoButton.textContent = 'Đang xử lý...';
                    try {
                        const currentAutoChallenge = localStorage.getItem('luanVoAutoChallenge') === '1';
                        await luanvo.doLuanVo(currentAutoChallenge);
                            } finally {
                        luanVoButton.textContent = 'Luận Võ';
                        this.updateButtonState('luanvo');
                            }
                        });

                parentGroup.appendChild(luanVoButton);
                this.updateButtonState('luanvo')
                    }
// Phương thức tạo menu "Autorun"
        createAutorunMenu(parentGroup) {
            const container = document.createElement('div');
            container.classList.add('custom-script-khoang-mach-container');
            parentGroup.appendChild(container);

            const buttonRow = document.createElement('div');
            buttonRow.classList.add('custom-script-khoang-mach-button-row');
            const autorunButton = document.createElement('button');
            this.buttonMap.set('autorun', autorunButton);
            const autorunSettingsButton = document.createElement('button');
            autorunSettingsButton.classList.add('custom-script-hoang-vuc-settings-btn');

            if (localStorage.getItem('autorunEnabled') === null) {
                localStorage.setItem('autorunEnabled', '1');
                    }
            let autorunEnabled = localStorage.getItem('autorunEnabled') === '1';

            const updateSettingButtonState = (isEnabled) => {
                autorunSettingsButton.textContent = isEnabled ? '✅' : '❌';
                autorunSettingsButton.title = isEnabled ? 'Tự động chạy Autorun khi tải: Bật' : 'Tự động chạy Autorun khi tải: Tắt';
                    };
            updateSettingButtonState(autorunEnabled);


            autorunSettingsButton.addEventListener('click', () => {
                autorunEnabled = !autorunEnabled;
                localStorage.setItem('autorunEnabled', autorunEnabled ? '1' : '0');
                updateSettingButtonState(autorunEnabled);
                const message = autorunEnabled ? 'Tự động chạy Autorun khi tải đã được bật' : 'Tự động chạy Autorun khi tải đã được tắt';
                showNotification(message, 'info');
                    });

            autorunButton.textContent = 'Autorun';
            autorunButton.classList.add('custom-script-menu-button', 'custom-script-auto-btn');
            autorunButton.addEventListener('click', async () => {
                this.autorunIsRunning = !this.autorunIsRunning
                this.updateButtonState('autorun');
                if (this.autorunIsRunning) {
                    await automatic.start();
                        } else {
                    await automatic.stop();
                        }
                    });

            const autorunConfigButton = document.createElement('button');
            autorunConfigButton.classList.add('custom-script-hoang-vuc-settings-btn');
            autorunConfigButton.textContent = '⚙️';
            autorunConfigButton.title = 'Cấu hình Autorun';

            const configDiv = document.createElement('div');
            configDiv.style.display = 'none';
            configDiv.classList.add('custom-script-settings-panel');
            configDiv.innerHTML = `
            <div class="custom-script-khoang-mach-config-group checkbox-group">
                <input type="checkbox" id="autoDiemDanh" checked>
                <label for="autoDiemDanh">Điểm Danh, Tế Lễ, Vấn Đáp</label>
            </div>
            <div class="custom-script-khoang-mach-config-group checkbox-group">
                <input type="checkbox" id="autoThiLuyen" checked>
                <label for="autoThiLuyen">Thí Luyện</label>
            </div>
            <div class="custom-script-khoang-mach-config-group checkbox-group">
                <input type="checkbox" id="autoPhucLoi" checked>
                <label for="autoPhucLoi">Phúc Lợi Đường</label>
            </div>
            <div class="custom-script-khoang-mach-config-group checkbox-group">

                <input type="checkbox" id="autoHoangVuc" checked>
                <label for="autoHoangVuc">Hoang Vực</label>
            </div>
            <div class="custom-script-khoang-mach-config-group checkbox-group">
                <input type="checkbox" id="autoBiCanh" checked>
                <label for="autoBiCanh">Bí Cảnh</label>
            </div>
            <div class="custom-script-khoang-mach-config-group checkbox-group">
                <input type="checkbox" id="autoLuanVo" checked>
                <label for="autoLuanVo">Luận Võ</label>
            </div>
            <div class="custom-script-khoang-mach-config-group checkbox-group">
                <input type="checkbox" id="autoDoThach" checked>
                <label for="autoDoThach">Đổ Thạch</label>
            </div>
            <div class="custom-script-khoang-mach-config-group checkbox-group">
                <input type="checkbox" id="autoKhoangMach" checked>
                <label for="autoKhoangMach">Khoáng Mạch</label>
            </div>


            <div class="custom-script-khoang-mach-config-group checkbox-group">
                <input type="checkbox" id="autoTienDuyen" checked>
                <label for="autoTienDuyen">Tiên Duyên</label>
            </div>
            <div class="custom-script-khoang-mach-config-group checkbox-group">
                <input type="checkbox" id="autoCauNguyen" checked>
                <label for="autoCauNguyen"> Cầu Nguyện</label>
            </div>
            <div class="custom-script-khoang-mach-config-group checkbox-group">
                <input type="checkbox" id="autoKhacTranVip" checked>
                <label for="autoKhacTranVip"> Lượt Khắc Trận (VIP)</label>
            </div>


            `;


            autorunConfigButton.addEventListener('click', () => {
                if (configDiv.style.display === 'none') {
                    configDiv.style.display = 'flex';
                        } else {
                    configDiv.style.display = 'none';
                        }
                    });

            const autoDiemDanhCheckbox = configDiv.querySelector('#autoDiemDanh');
            const autoThiLuyenCheckbox = configDiv.querySelector('#autoThiLuyen');
            const autoPhucLoiCheckbox = configDiv.querySelector('#autoPhucLoi');
            const autoHoangVucCheckbox = configDiv.querySelector('#autoHoangVuc');
            const autoBiCanhCheckbox = configDiv.querySelector('#autoBiCanh');
            const autoLuanVoCheckbox = configDiv.querySelector('#autoLuanVo');
            const autoDoThachCheckbox = configDiv.querySelector('#autoDoThach');
            const autoKhoangMachCheckbox = configDiv.querySelector('#autoKhoangMach');
            const autoTienDuyenCheckbox = configDiv.querySelector('#autoTienDuyen');
            const autoCauNguyenCheckbox = configDiv.querySelector('#autoCauNguyen');
            const autoKhacTranVipCheckbox = configDiv.querySelector('#autoKhacTranVip');

            //const autoTangHoaCheckbox = configDiv.querySelector('#autoTangHoa');
            // Khôi phục trạng thái từ localStorage
            autoDiemDanhCheckbox.checked = localStorage.getItem('autoDiemDanh') !== '0';
            autoThiLuyenCheckbox.checked = localStorage.getItem('autoThiLuyen') !== '0';
            autoPhucLoiCheckbox.checked = localStorage.getItem('autoPhucLoi') !== '0';
            autoHoangVucCheckbox.checked = localStorage.getItem('autoHoangVuc') !== '0';
            autoBiCanhCheckbox.checked = localStorage.getItem('autoBiCanh') !== '0';
            autoLuanVoCheckbox.checked = localStorage.getItem('autoLuanVo') !== '0';
            autoDoThachCheckbox.checked = localStorage.getItem('autoDoThach') !== '0';
            autoKhoangMachCheckbox.checked = localStorage.getItem('autoKhoangMach') !== '0';
            autoTienDuyenCheckbox.checked = localStorage.getItem('autoTienDuyen') !== '0';
            autoCauNguyenCheckbox.checked = localStorage.getItem('autoCauNguyen') !== '0';
            autoKhacTranVipCheckbox.checked = localStorage.getItem('autoKhacTranVip') !== '0';
            //autoTangHoaCheckbox.checked = localStorage.getItem('autoTangHoa') !== '0';
            // Lưu trạng thái vào localStorage khi thay đổi
            autoDiemDanhCheckbox.addEventListener('change', () => {
                localStorage.setItem('autoDiemDanh', autoDiemDanhCheckbox.checked ? '1' : '0');
                    });
            autoThiLuyenCheckbox.addEventListener('change', () => {
                localStorage.setItem('autoThiLuyen', autoThiLuyenCheckbox.checked ? '1' : '0');
                    });
            autoPhucLoiCheckbox.addEventListener('change', () => {
                localStorage.setItem('autoPhucLoi', autoPhucLoiCheckbox.checked ? '1' : '0');
                    });
            autoHoangVucCheckbox.addEventListener('change', () => {
                localStorage.setItem('autoHoangVuc', autoHoangVucCheckbox.checked ? '1' : '0');
                    });
            autoBiCanhCheckbox.addEventListener('change', () => {
                localStorage.setItem('autoBiCanh', autoBiCanhCheckbox.checked ? '1' : '0');
                    });
            autoLuanVoCheckbox.addEventListener('change', () => {
                localStorage.setItem('autoLuanVo', autoLuanVoCheckbox.checked ? '1' : '0');
                    });
            autoDoThachCheckbox.addEventListener('change', () => {
                localStorage.setItem('autoDoThach', autoDoThachCheckbox.checked ? '1' : '0');
                    });
            autoKhoangMachCheckbox.addEventListener('change', () => {
                localStorage.setItem('autoKhoangMach', autoKhoangMachCheckbox.checked ? '1' : '0');
                    });
            autoTienDuyenCheckbox.addEventListener('change', () => {
                localStorage.setItem('autoTienDuyen', autoTienDuyenCheckbox.checked ? '1' : '0');
                    });
            autoCauNguyenCheckbox.addEventListener('change', () => {
                localStorage.setItem('autoCauNguyen', autoCauNguyenCheckbox.checked ? '1' : '0');
                    });
            // autoTangHoaCheckbox.addEventListener('change', () => {
                    //     localStorage.setItem('autoTangHoa', autoTangHoaCheckbox.checked ? '1' : '0');
                    // });
            autoKhacTranVipCheckbox.addEventListener('change', () => {
            localStorage.setItem('autoKhacTranVip', autoKhacTranVipCheckbox.checked ? '1' : '0');
                    });

            buttonRow.appendChild(autorunSettingsButton);
            buttonRow.appendChild(autorunButton);
            buttonRow.appendChild(autorunConfigButton);
            container.appendChild(buttonRow);
            container.appendChild(configDiv);
            parentGroup.appendChild(container);
            this.updateButtonState('autorun');
                }



 // Phương thức tạo menu "Khoáng Mạch"
async createKhoangMachMenu(parentGroup) {
            const { optionsHtml, minesData } = await khoangmach.getAllMines();

            const container = document.createElement('div');
            container.classList.add('custom-script-khoang-mach-container');

            const buttonRow = document.createElement('div');
            buttonRow.classList.add('custom-script-khoang-mach-button-row');

            const khoangMachButton = document.createElement('button');
            khoangMachButton.classList.add('custom-script-khoang-mach-button');
            khoangMachButton.textContent = 'Khoáng Mạch';
            this.buttonMap.set('khoangmach', khoangMachButton);

            const khoangMachSettingsButton = document.createElement('button');
            khoangMachSettingsButton.classList.add('custom-script-hoang-vuc-settings-btn');
            khoangMachSettingsButton.textContent = '⚙️';

            const khoangMachSearchConfigButton = document.createElement('button');
            khoangMachSearchConfigButton.classList.add('custom-script-hoang-vuc-settings-btn');
            khoangMachSearchConfigButton.textContent = '🔍';
            khoangMachSearchConfigButton.title = 'Cấu hình ìm kẻ địch';

            buttonRow.appendChild(khoangMachSettingsButton);
            buttonRow.appendChild(khoangMachButton);
            buttonRow.appendChild(khoangMachSearchConfigButton);

            const configDiv = document.createElement('div');
            configDiv.style.display = 'none';
            configDiv.classList.add('custom-script-settings-panel');
            configDiv.innerHTML = `
            <div class="custom-script-khoang-mach-config-group">
                <label for="specificMineSelect">Chọn Khoáng Mạch:</label>
                <select id="specificMineSelect">${optionsHtml}</select>
            </div>
            <div class="custom-script-khoang-mach-config-group">
                <label for="rewardModeSelect">Chế độ Nhận Thưởng:</label>
                <select id="rewardModeSelect">
                <option value="110">110%</option>
                <option value="100">100%</option>
                <option value="20">20%</option>
                <option value="any">Bất kỳ</option>
                </select>
            </div>
            <div class="custom-script-khoang-mach-config-group">
                <label for="rewardTimeSelect">Nhận thưởng khi thời gian đạt:</label>
                <select id="rewardTimeSelect">
                <option value="max">Đạt tối đa</option>
                <option value="20">20 phút</option>
                <option value="10">10 phút</option>
                <option value="4">4 phút</option>
                <option value="2">2 phút</option>
                </select>
            </div>
            <div class="custom-script-khoang-mach-config-group checkbox-group">
                <input type="checkbox" id="autoTakeOver">
                <label for="autoTakeOver">Tự động đoạt mỏ khi chưa buff</label>
            </div>
            <div class="custom-script-khoang-mach-config-group checkbox-group">
                <input type="checkbox" id="autoTakeOverRotation">
                <label for="autoTakeOverRotation">Tự động đoạt mỏ khi có thể (đảo key)</label>
            </div>
            <div class="custom-script-khoang-mach-config-group checkbox-group">
                <input type="checkbox" id="leaveMineToClaimReward" checked>
                <label for="leaveMineToClaimReward">Rời mỏ để nhận thưởng (cao tầng đảo key)</label>
            </div>
            <div class="custom-script-khoang-mach-config-group checkbox-group">
                <input type="checkbox" id="autoBuff">
                <label for="autoBuff">Tự động mua Linh Quang Phù</label>
            </div>
            <div class="custom-script-khoang-mach-config-group checkbox-group">
                <input type="checkbox" id="outerNotification" checked>
                <label for="outerNotification">Thông báo ngoại tông vào khoáng</label>
            </div>
            <div class="custom-script-khoang-mach-config-group checkbox-group">
                <input type="checkbox" id="fastAttack" checked>
                <label for="fastAttack">Bỏ qua thời gian chờ khi tấn công</label>
            </div>
            <div class="custom-script-khoang-mach-config-group number-input-group">
                <label for="checkInterval" align="left" title="Khoảng thời gian (phút) để kiểm tra và thực hiện các hành động liên quan đến Khoáng Mạch.">Thời gian kiểm tra khoáng (phút)</label>
                <input type="number" id="checkInterval" value="5" style="width: 50px;">
            </div>
            `;

            container.appendChild(buttonRow);
            container.appendChild(configDiv);
            parentGroup.appendChild(container);

            const searchConfigContainer = document.createElement('div');
            searchConfigContainer.style.display = 'none';
            searchConfigContainer.classList.add('custom-script-khoang-mach-container');
            const searchEnemiesInput = document.createElement('input');
            searchEnemiesInput.type = 'text';
            searchEnemiesInput.placeholder = 'Nhập ID kẻ địch, ví dụ: 12345;67890;65454';
            searchEnemiesInput.style.width = '100%';
            searchConfigContainer.appendChild(searchEnemiesInput);
            const searchTongMonRow = document.createElement('div');
            searchTongMonRow.classList.add('custom-script-khoang-mach-button-row');
            const searchTongMonInput = document.createElement('input');
            searchTongMonInput.type = 'text';
            searchTongMonInput.placeholder = 'Nhập id Tông Môn, ví dụ: 57264;57265';
            searchTongMonInput.style.width = '100%';
            const searchTongMonViewButton = document.createElement('button');
            searchTongMonViewButton.textContent = '👁';
            searchTongMonViewButton.classList.add('custom-script-khoang-mach-button');
            searchTongMonRow.appendChild(searchTongMonInput);
            searchTongMonRow.appendChild(searchTongMonViewButton);
            searchConfigContainer.appendChild(searchTongMonRow);
            container.appendChild(searchConfigContainer);

            const searchButtonRow = document.createElement('div');
            searchButtonRow.classList.add('custom-script-khoang-mach-button-row');
            searchConfigContainer.appendChild(searchButtonRow);

            const searchButton = document.createElement('button');
            searchButton.classList.add('custom-script-khoang-mach-button');
            searchButton.textContent = 'Bắt đầu tìm kiếm';
            searchButton.title = 'Bắt đầu tìm kiếm kẻ địch trong khoáng mạch';
            searchButtonRow.appendChild(searchButton);
            const tongMonContainer = document.createElement('div');
            searchConfigContainer.appendChild(tongMonContainer);
            const viewResultsButton = document.createElement('button');
            viewResultsButton.classList.add('custom-script-khoang-mach-button');
            viewResultsButton.textContent = 'Xem kết quả';
            viewResultsButton.title = 'Xem kết quả tìm kiếm kẻ địch';
            searchButtonRow.appendChild(viewResultsButton);
            const searchResultSaved = sessionStorage.getItem(`khoangmach_enemy_search_results`);
            const parsed = searchResultSaved ? JSON.parse(searchResultSaved) : null;

            // Tự động tìm mảng thật sự dù nó là kiểu cũ (Array) hay kiểu mới (Object.results)
            const realData = Array.isArray(parsed) ? parsed : (parsed?.results || []);

            // Disable nếu không có dữ liệu thật
            if (realData.length === 0) {
                viewResultsButton.disabled = true;
            }

            const specificMineSelect = configDiv.querySelector('#specificMineSelect');
            const rewardModeSelect = configDiv.querySelector('#rewardModeSelect');
            const rewardTimeSelect = configDiv.querySelector('#rewardTimeSelect');
            const autoTakeOverCheckbox = configDiv.querySelector('#autoTakeOver');
            const autoTakeOverRotationCheckbox = configDiv.querySelector('#autoTakeOverRotation');
            const leaveMineToClaimRewardCheckbox = configDiv.querySelector('#leaveMineToClaimReward');
            const autoBuffCheckbox = configDiv.querySelector('#autoBuff');
            const outerNotificationCheckbox = configDiv.querySelector('#outerNotification');
            const fastAttackCheckbox = configDiv.querySelector('#fastAttack');
            const checkIntervalInput = configDiv.querySelector('#checkInterval');

            const keyMine = `khoangmach_selected_mine_${accountId}`;
            const savedMineSetting = localStorage.getItem(keyMine);
            if (savedMineSetting) {
                try {
                    const mineInfo = JSON.parse(savedMineSetting);
                    if (mineInfo && mineInfo.id) specificMineSelect.value = mineInfo.id;
                } catch (e) {
                    localStorage.removeItem(keyMine);
                }
            }

            checkIntervalInput.value = localStorage.getItem('khoangmach_check_interval') || '5';
            rewardModeSelect.value = localStorage.getItem('khoangmach_reward_mode') || 'any';
            rewardTimeSelect.value = localStorage.getItem('khoangmach_reward_time') || 'max';
            autoTakeOverCheckbox.checked = localStorage.getItem('khoangmach_auto_takeover') === 'true';
            autoTakeOverRotationCheckbox.checked = localStorage.getItem('khoangmach_auto_takeover_rotation') === 'true';
            leaveMineToClaimRewardCheckbox.checked = localStorage.getItem(`khoangmach_leave_mine_to_claim_reward_${accountId}`) == 'true';
            autoBuffCheckbox.checked = localStorage.getItem('khoangmach_use_buff') === 'true';
            fastAttackCheckbox.checked = localStorage.getItem('khoangmach_fast_attack') === 'true';
            outerNotificationCheckbox.checked = localStorage.getItem('khoangmach_outer_notification') === 'true';

            outerNotificationCheckbox.addEventListener('change', (e) => {
                localStorage.setItem('khoangmach_outer_notification', e.target.checked);
                const status = e.target.checked ? 'Bật' : 'Tắt';
                showNotification(`Thông báo ngoại tông vào khoáng: ${status}`, 'info');
            });

            let settingsOpen = false;
            khoangMachSettingsButton.addEventListener('click', () => {
            settingsOpen = !settingsOpen;
            configDiv.style.display = settingsOpen ? 'block' : 'none';
            khoangMachSettingsButton.title = settingsOpen ? 'Đóng cài đặt Khoáng Mạch' : 'Mở cài đặt Khoáng Mạch';
            });

            specificMineSelect.addEventListener('change', (e) => {
                const selectedId = e.target.value;
                const selectedMine = minesData.find(mine => mine.id === selectedId);
                if (selectedMine && selectedMine.type) {
                    localStorage.setItem(keyMine, JSON.stringify({ id: selectedId, type: selectedMine.type}));
                    showNotification(`Đã chọn mỏ: ${e.target.options[e.target.selectedIndex].text}`, 'info');
                }
            });

            rewardModeSelect.addEventListener('change', (e) => {
            localStorage.setItem('khoangmach_reward_mode', e.target.value);
            showNotification(`Chế độ nhận thưởng: ${e.target.options[e.target.selectedIndex].text}`, 'info');
            });

            rewardTimeSelect.addEventListener('change', (e) => {
                localStorage.setItem('khoangmach_reward_time', e.target.value);
                showNotification(`Nhận thưởng khi thời gian đạt: ${e.target.options[e.target.selectedIndex].text}`, 'info');
            });

            autoTakeOverCheckbox.addEventListener('change', (e) => {
                localStorage.setItem('khoangmach_auto_takeover', e.target.checked);
                if (e.target.checked) {
                    const khoangmach_auto_takeover_rotation =
                        localStorage.getItem('khoangmach_auto_takeover_rotation') === 'true';
                    if (khoangmach_auto_takeover_rotation) {
                        // ❌ TẮT autoTakeOverRotation khi bật autoTakeover
                        autoTakeOverRotationCheckbox.checked = false;
                        localStorage.setItem('khoangmach_auto_takeover_rotation', false);
                    }
                    showNotification('Tự động đoạt mỏ khi chưa buff: Bật', 'info');
                } else {
                    const status = e.target.checked ? 'Bật' : 'Tắt';
                    showNotification(`Tự động đoạt mỏ khi chưa buff: ${status}`,'info');
                }
            });

            autoTakeOverRotationCheckbox.addEventListener('change', (e) => {
                localStorage.setItem('khoangmach_auto_takeover_rotation', e.target.checked);
                const status = e.target.checked ? 'Bật' : 'Tắt';
                showNotification(`Tự động đoạt mỏ khi có thể: ${status}`,'info');
                if (e.target.checked) {
                    // ❌ TẮT autoTakeover khi bật autoTakeoverRotation
                    autoTakeOverCheckbox.checked = false;
                    localStorage.setItem('khoangmach_auto_takeover', false);
                }
            });

            leaveMineToClaimRewardCheckbox.addEventListener('change', (e) => {
                localStorage.setItem(`khoangmach_leave_mine_to_claim_reward_${accountId}`, e.target.checked);
                const status = e.target.checked ? 'Bật' : 'Tắt';
                showNotification(`Rời mỏ để nhận thưởng: ${status}`, 'info');
            });

            autoBuffCheckbox.addEventListener('change', (e) => {
                localStorage.setItem('khoangmach_use_buff', e.target.checked);
                const status = e.target.checked ? 'Bật' : 'Tắt';
                showNotification(`Tự động mua Linh Quang Phù: ${status}`, 'info');
            });

            fastAttackCheckbox.addEventListener('change', (e) => {
                localStorage.setItem('khoangmach_fast_attack', e.target.checked);
                const status = e.target.checked ? 'Bật' : 'Tắt';
                showNotification(`Bỏ qua thời gian chờ khi tấn công: ${status}`, 'info');
            });

            checkIntervalInput.addEventListener('change', (e) => {
                let value = parseInt(e.target.value, 10);
                if (isNaN(value) || value < 0) {
                    value = 0;
                    e.target.value = '0';
                } else if (value > 30) {
                    value = 30;
                    e.target.value = '30';
                }
                localStorage.setItem('khoangmach_check_interval', value.toString());
            });

            // Xử lý sự kiện khoáng mạch
            khoangMachButton.addEventListener('click', async () => {
                khoangMachButton.disabled = true;
                khoangMachButton.textContent = 'Đang xử lý...';
                try {
                    await khoangmach.doKhoangMach();
                }
                finally {
                    khoangMachButton.textContent = 'Khoáng Mạch';
                    this.updateButtonState('khoangmach');
                }
            });

            // Xử lý sự kiện tìm kẻ địch
            khoangMachSearchConfigButton.addEventListener('click', async () => {
                if (searchConfigContainer.style.display === 'block') {
                    searchConfigContainer.style.display = 'none';
                    return;
                }
                searchConfigContainer.style.display = 'block';
            });

            searchEnemiesInput.addEventListener('input', () => {
                localStorage.setItem(`khoangmach_search_enemies_${accountId}`, searchEnemiesInput.value);
            });


            // ===== Đồng bộ danh sách Tông Môn (checkbox) <-> searchTongMonInput (gói vào 1 hàm) =====
            const setupTongMonSelectionSync = ({
                accountId,
                searchTongMonInput,
                tongMonContainer,
                viewButton,
                fetchTongMonList,
                notify
            }) => {
                const tongMonSelectionKey = `khoangmach_search_tongmon_${accountId}`;

                /**
                 * Parse chuỗi id dạng "1;2; 3" -> { list: string[], set: Set<string> }
                 */
                const parseIds = (raw) => {
                    const list = (raw || '')
                        .split(';')
                        .map(s => (s || '').trim())
                        .filter(Boolean);

                    const set = new Set();
                    const orderedUnique = [];
                    for (const id of list) {
                        if (!set.has(id)) {
                            set.add(id);
                            orderedUnique.push(id);
                        }
                    }
                    return { list: orderedUnique, set };
                };

                const normalizeValue = (ids) => (ids || []).join(';');

                let checkboxById = new Map();
                let isSyncing = false;
                let loadedOnce = false;

                // Load value từ localStorage vào input ngay khi khởi tạo
                const saved = localStorage.getItem(tongMonSelectionKey) || '';
                if (saved && !searchTongMonInput.value) {
                    searchTongMonInput.value = saved;
                }

                const syncInputValue = (nextValue) => {
                    if (searchTongMonInput.value === nextValue) return;
                    isSyncing = true;
                    try {
                        searchTongMonInput.value = nextValue;
                        localStorage.setItem(tongMonSelectionKey, nextValue);
                    } finally {
                        isSyncing = false;
                    }
                };

                const syncCheckboxesFromInput = () => {
                    if (!checkboxById || checkboxById.size === 0) return;
                    const { set } = parseIds(searchTongMonInput.value);
                    for (const [id, checkbox] of checkboxById.entries()) {
                        checkbox.checked = set.has(id);
                    }
                };

                const renderList = (tongMonList) => {
                    tongMonContainer.innerHTML = '';
                    checkboxById = new Map();

                    tongMonContainer.style.maxHeight = '240px';
                    tongMonContainer.style.overflowY = 'auto';

                    const current = parseIds(searchTongMonInput.value);
                    const currentSet = new Set(current.list);
                    //sort theo cấp giảm dần
                    tongMonList.sort((a, b) => b.level - a.level);
                    for (const tm of (tongMonList || [])) {
                        const row = document.createElement('div');
                        row.classList.add('custom-script-khoang-mach-button-row');
                        row.style.alignItems = 'center';

                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.style.marginRight = '8px';
                        checkbox.checked = currentSet.has(tm.id);
                        checkboxById.set(tm.id, checkbox);
                        //Màu khác nhau cho các cấp khác nhau
                        const label = document.createElement('span');
                        for (let i = 1; i <= 10; i++) {
                            if (tm.level === i) {
                                label.style.color = `hsl(${(i - 1) * 36}, 100%, 50%)`;
                                break;
                            }
                        }
                        label.textContent = `[Cấp ${tm.level}] ${tm.name}`;

                        checkbox.addEventListener('change', () => {
                            const { list } = parseIds(searchTongMonInput.value);
                            const set = new Set(list);

                            if (checkbox.checked) {
                                if (!set.has(tm.id)) list.push(tm.id);
                            } else {
                                const idx = list.indexOf(tm.id);
                                if (idx !== -1) list.splice(idx, 1);
                            }

                            syncInputValue(normalizeValue(list));
                        });

                        row.appendChild(checkbox);
                        row.appendChild(label);
                        tongMonContainer.appendChild(row);
                    }

                    // đảm bảo checkbox phản ánh đúng input
                    syncCheckboxesFromInput();
                };

                // Input -> Checkbox
                searchTongMonInput.addEventListener('input', () => {
                    localStorage.setItem(tongMonSelectionKey, searchTongMonInput.value);
                    if (!isSyncing) syncCheckboxesFromInput();
                });

                // Button 👁 -> load + render (toggle hiển thị cho tiện)
                viewButton.addEventListener('click', async () => {
                    // toggle nếu đã load trước đó
                    if (loadedOnce && tongMonContainer.innerHTML && tongMonContainer.style.display !== 'none') {
                        tongMonContainer.style.display = 'none';
                        return;
                    }
                    tongMonContainer.style.display = 'block';

                    tongMonContainer.innerHTML = 'Đang tải danh sách tông môn...';
                    try {
                        const list = await fetchTongMonList();
                        renderList(list);
                        loadedOnce = true;
                    } catch (e) {
                        tongMonContainer.innerHTML = '';
                        notify(`Không tải được danh sách tông môn: ${e}`, 'error');
                    }
                });
            };

            setupTongMonSelectionSync({
                accountId,
                searchTongMonInput,
                tongMonContainer,
                viewButton: searchTongMonViewButton,
                fetchTongMonList: () => khoangmach.getListTongMon(),
                notify: showNotification
            });

            searchButton.addEventListener('click', async () => {
                searchButton.disabled = true;
                searchButton.textContent = 'Đang tìm kiếm...';
                const rawEnemyIds = searchEnemiesInput.value;
                const enemyList = rawEnemyIds.split(';').map(id => id.trim()).filter(id => id);
                const rawTongMonIds = searchTongMonInput.value;
                const tongMonList = rawTongMonIds.split(';').map(id => id.trim()).filter(id => id);
                await khoangmach.searchEnemiesInMines(enemyList, tongMonList);
                searchButton.textContent = 'Bắt đầu tìm kiếm';
                searchButton.disabled = false;
            });

            viewResultsButton.addEventListener('click', () => {
                const searchResultSaved = sessionStorage.getItem('khoangmach_enemy_search_results');

                if (searchResultSaved) {
                    try {
                        const parsed = JSON.parse(searchResultSaved);

                        // Kiểm tra xem dữ liệu là định dạng MỚI (object) hay CŨ (array) để tránh lỗi
                        if (Array.isArray(parsed)) {
                            // Nếu lỡ là dữ liệu cũ (chỉ có mảng), ta fake tạm thời gian
                            khoangmach.showEnemySearchResults(parsed, Date.now(), 'Bộ nhớ tạm');
                        } else {
                            // Nếu là dữ liệu mới (có timestamp và source)
                            khoangmach.showEnemySearchResults(parsed.results, parsed.timestamp, parsed.source);
                        }
                    } catch (e) {
                        console.error('Lỗi đọc dữ liệu đã lưu:', e);
                        showNotification('Dữ liệu lưu bị lỗi.', 'error');
                    }
                } else {
                    showNotification('Chưa có kết quả tìm kiếm nào.', 'info');
                }
            });

            this.updateButtonState('khoangmach');

        }

// Phương thức chung để tạo các nút nhiệm vụ tự động
    createAutoTaskButton(link, parentGroup) {
            const button = document.createElement("button");

            const taskName = link.isDiemDanh
                ? "diemdanh"
                : link.isThiLuyen
                ? "thiluyen"
                // : link.isPhucLoi
                // ? "phucloi"
                // : link.isPhucLoiBonus
                // ? "phucloibonus"
                : null;

            if (!taskName) return;

            // Lưu nút vào Map
            this.buttonMap.set(taskName, button);

            button.textContent = link.text;
            button.classList.add("custom-script-menu-button", "custom-script-auto-btn");
            const originalColor = button.style.backgroundColor || "";
            const runningColor = "#ff0000ff";

            button.addEventListener("click", async () => {
                if (taskName === "autorun") {
                    this.autorunIsRunning = !this.autorunIsRunning;

                    if (this.autorunIsRunning) {
                        await automatic.start();
                        button.style.backgroundColor = runningColor;
                    } else {
                        automatic.stop();
                        button.style.backgroundColor = originalColor;
                    }

                    this.updateButtonState("autorun");
                } else {
                    button.disabled = true;
                    button.textContent = "Đang xử lý...";

                    try {
                        if (taskName === "diemdanh") {
                            const nonce = await getNonce();
                            if (!nonce) {
                                showNotification("Không tìm thấy nonce! Vui lòng tải lại trang.", "error");
                                return;
                            }

                            await doDailyCheckin(nonce);
                            await doClanDailyCheckin(nonce);
                            await vandap.doVanDap(nonce);

                            console.log("[HH3D Script] ✅ Điểm danh, tế lễ, vấn đáp đã hoàn thành.");
                        } else if (taskName === "thiluyen") {
                            await doThiLuyenTongMon();
                            console.log("[HH3D Script] ✅ Thí Luyện Tông Môn đã hoàn thành.");
                        } else if (taskName === "phucloi") {
                            await doPhucLoiDuong();
                            console.log("[HH3D Script] ✅ Phúc Lợi đã hoàn thành.");
                        }

                         else if (taskName === "phucloibonus") {
                                const iconSpan = document.createElement("span");
                                iconSpan.classList.add("material-icons-round1", "material-icons-menu");
                                iconSpan.textContent = "card_giftcard";
                                button.textContent = "";
                                button.appendChild(iconSpan);
                                 button.title = "Nhận phần thưởng Bonus Phúc Lợi";
                            await phucloiclaimbonus(); // gọi hàm nhận thưởng rương
                            console.log("[HH3D Script] ✅ Nhận thưởng rương Phúc Lợi Bonus đã chạy.");
                        }
                    } finally {
                        button.textContent = link.text;
                        this.updateButtonState(taskName);
                    }
                }
            });

            // Cập nhật trạng thái ban đầu của nút
            this.updateButtonState(taskName);
            parentGroup.appendChild(button);
        }

}

    // ===============================================
    // Class khởi tạo và chèn menu vào DOM
    // ===============================================
        class UIInitializer {
            constructor(selector, linkGroups, accountId) {
                this.selector = selector;
                this.linkGroups = linkGroups;
                this.accountId = accountId;

                this.retryInterval = 500;
                this.timeout = 15000;
                this.elapsedTime = 0;
                this.intervalId = null;
                this.uiMenuCreator = new UIMenuCreator(null, this.accountId);
                    }

            start() {
                console.log("[HH3D Script] ⏳ Đang tìm kiếm vị trí để chèn menu...");
                this.intervalId = setInterval(() => this.checkAndInsert(), this.retryInterval);
            }

            checkAndInsert() {
                const notificationsDiv = document.querySelector(this.selector);

                if (notificationsDiv) {
                    clearInterval(this.intervalId);
                    console.log("[HH3D Script] ✅ Đã tìm thấy vị trí. Bắt đầu chèn menu.");
                    this.createAndInjectMenu(notificationsDiv);
                } else {
                    this.elapsedTime += this.retryInterval;

                    if (this.elapsedTime >= this.timeout) {
                        clearInterval(this.intervalId);
                        console.error(
                            `[HH3D Script - Lỗi] ❌ Không tìm thấy phần tử "${this.selector}" sau ${
                                this.timeout / 1000
                            } giây.`
                        );
                    }
                }
            }


      createAndInjectMenu(notificationsDiv) {
            const parentNavItems = notificationsDiv.parentNode;

            if (parentNavItems && parentNavItems.classList.contains("nav-items")) {
                if (document.querySelector(".custom-script-item-wrapper")) {
                    console.log("[HH3D Script] ⚠️ Menu đã tồn tại. Bỏ qua việc chèn lại.");
                    return;
                }

                const customMenuWrapper = document.createElement("div");
                customMenuWrapper.classList.add("load-notification", "relative", "custom-script-item-wrapper");

                const newMenuButton = document.createElement("a");
                newMenuButton.href = "#";
                newMenuButton.setAttribute("data-view", "hide");

                // Tạo phần tử div cho biểu tượng trạng thái
                const statusIcon = document.createElement("div");
                statusIcon.classList.add("custom-script-status-icon");
                newMenuButton.appendChild(statusIcon);

                const iconDiv = document.createElement("div");
                const iconSpan = document.createElement("span");
                iconSpan.classList.add("material-icons-round1", "material-icons-menu");
                iconSpan.textContent = "task";
                iconDiv.appendChild(iconSpan);
                newMenuButton.appendChild(iconDiv);

                const dropdownMenu = document.createElement("div");
                dropdownMenu.className = "custom-script-menu hidden";



/* ===== Khởi tạo Profile UI final ===== */
const infoBox = document.createElement("div");
infoBox.id = "autoProfileInfo";
infoBox.innerHTML = `
  <div style="text-align:center; margin-bottom:6px;">
   <!-- Avatar có thể bật lại bằng cách bỏ comment -->
    <!-- <div id="profile-avatar"
         style="width:36px;height:36px;overflow:hidden;border-radius:50%;margin:0 auto;"></div> -->
  </div>
  <div id="profile-name"
       style="text-align:center;margin:4px 0; line-height:2.6em; font-weight:bold; color:#fff;">Tên NV ?</div>

  <div id="profile-tuvi"></div>
  <div id="profile-thach"></div>
  <div id="profile-ngoc"></div>

  <div id="xu-info" style="margin-top:6px;font-size:13px;line-height:1.8em;"></div>

  <div id="reward-progress-wrap" style="margin-top:6px;"></div>
`;
dropdownMenu.appendChild(infoBox);
setTimeout(loadHH3DProfile, 100);



/* ===== Profile UI Box ===== Không ghi đè outerHTML version 2 */
// const profileBox = document.createElement("div");
// profileBox.className = "hh3d-profile-box";
// profileBox.innerHTML = `
//   <div class="hh3d-profile-header"
//        style="display:flex;flex-direction:column;align-items:center;margin-bottom:6px;">
//     <div id="hh3d-avatar-wrap"
//          style="width:36px;height:36px;overflow:hidden;border-radius:50%;margin-bottom:6px;"></div>
//     <div class="hh3d-profile-name" id="hh3d-name"
//          style="margin:4px 0; line-height:2.6em; color:#fff; font-weight:bold;">---</div>
//   </div>

//   <div class="stat" style="color:#ffcc00;">✨ Tu Vi: <span id="hh3d-tuvi">---</span></div>
//   <div class="stat" style="color:#00ccff;">💎 Tinh Thạch: <span id="hh3d-tinhthach">---</span></div>
//   <div class="stat" style="color:#cc66ff;">🔮 Tiên Ngọc: <span id="hh3d-tienngoc">---</span></div>

//   <div class="stat" style="color:#ffd700;">🪙 Xu: <span id="hh3d-xu">---</span></div>
//   <div class="stat" style="color:#aaa;">🔒 Xu Khóa: <span id="hh3d-xu-locked">---</span></div>

//   <div id="hh3d-progress-wrap" style="margin-top:6px;">
//     <div style="font-size:12px;margin-bottom:4px;color:#ccc;">
//       Hoạt động <span id="hh3d-daily-percent" style="float:right;">0%</span>
//     </div>
//     <div style="width:100%;height:6px;background:#2a2a2a;border-radius:999px;overflow:hidden;">
//       <div id="hh3d-daily-bar" style="width:0%;height:100%;border-radius:999px;
//         background:linear-gradient(90deg,#ff4ecd,#b84cff);
//         box-shadow:0 0 6px rgba(255,78,205,.6);
//         transition:width .4s ease;">
//       </div>
//     </div>
//   </div>
// `;
// dropdownMenu.appendChild(profileBox);
// setTimeout(loadHH3DProfile, 200);


// /* ===== Profile UI Box ===== Bản ghi đè outerHLML version1*/
// const profileBox = document.createElement("div");
// profileBox.className = "hh3d-profile-box";
// profileBox.innerHTML = `
// <div class="hh3d-profile-header" style="text-align:center; margin-bottom:6px;">
//      <div id="hh3d-avatar-wrap"></div>
//     <div class="hh3d-profile-name" id="hh3d-name" style="margin:4px 0; line-height:2.6em;">---</div>
// </div>

// <div class="stat" id="hh3d-tuvi">✨ Tu Vi: ---</div>
// <div class="stat" id="hh3d-tinhthach">💎 Tinh Thạch: ---</div>
// <div class="stat" id="hh3d-tienngoc">🔮 Tiên Ngọc: ---</div>

//     <div id="xu-info" style="margin-top:6px;font-size:13px;line-height:1.8em;"></div>
// <div id="hh3d-progress-wrap" style="margin-top:6px;">
//     <div style="font-size:12px;margin-bottom:4px;color:#ccc;">
//     Hoạt động <span id="hh3d-daily-percent" style="float:right;">0%</span>
//     </div>
//     <div style="width:100%;height:6px;background:#2a2a2a;border-radius:999px;overflow:hidden;">
//     <div id="hh3d-daily-bar" style="width:0%;height:100%;border-radius:999px;
//         background:linear-gradient(90deg,#ff4ecd,#b84cff);
//         box-shadow:0 0 6px rgba(255,78,205,.6);
//         transition:width .4s ease;">
//     </div>
//     </div>
// </div>
// `;
// dropdownMenu.appendChild(profileBox);
// setTimeout(loadHH3DProfile, 200);




                this.linkGroups.forEach(group => {
                    const groupDiv = document.createElement("div");
                    groupDiv.className = "custom-script-menu-group";
                    dropdownMenu.appendChild(groupDiv);

                    group.links.forEach(link => {
                        if (link.isDiemDanh || link.isThiLuyen
                        //|| link.isPhucLoi || link.isPhucLoiBonus
                        ) {
                            this.uiMenuCreator.createAutoTaskButton(link, groupDiv);
                        } else if (link.isPhucLoi) {
                            this.uiMenuCreator.createPhucLoiMenu(groupDiv);
                        } else if (link.isDiceRoll) {
                            this.uiMenuCreator.createDiceRollMenu(groupDiv);
                        } else if (link.isAutorun) {
                            this.uiMenuCreator.createAutorunMenu(groupDiv);
                        } else if (link.isHoangVuc) {
                            this.uiMenuCreator.createHoangVucMenu(groupDiv);
                        } else if (link.isLuanVo) {
                            this.uiMenuCreator.createLuanVoMenu(groupDiv);
                        } else if (link.isBiCanh) {
                            this.uiMenuCreator.createBiCanhMenu(groupDiv);
                        } else if (link.isKhoangMach) {
                            this.uiMenuCreator.createKhoangMachMenu(groupDiv);
                        } else if (link.isTangHoa) {
                            this.uiMenuCreator.createTangHoaMenu(groupDiv);
                        } else if (link.isMuaRuong) {
                            this.uiMenuCreator.createMuaRuongMenu(groupDiv);
                        } else if (link.isKhacTran) {
                            this.uiMenuCreator.createKhacTranVanMenu(groupDiv);

                        // } else if (link.isKhacTranVip) {
                        //     this.uiMenuCreator.createKhacTranVipMenu(groupDiv);


                        } else if (link.isMuaDan) {
                            this.uiMenuCreator.createMuaDanMenu(groupDiv);
                        } else {
                            const menuItem = document.createElement("a");
                            menuItem.classList.add("custom-script-menu-link");
                            menuItem.href = link.url;
                            menuItem.textContent = link.text;
                            menuItem.target = "_blank";
                            groupDiv.appendChild(menuItem);
                        }
                    });
                });

                // --- Thanh trạng thái ---
                const statusBar = document.createElement("div");
                statusBar.className = "custom-script-status-bar";
                dropdownMenu.appendChild(statusBar);

                customMenuWrapper.appendChild(newMenuButton);
                customMenuWrapper.appendChild(dropdownMenu);
                parentNavItems.insertBefore(customMenuWrapper, notificationsDiv.nextSibling);

                console.log("[HH3D Script] 🎉 Chèn menu tùy chỉnh thành công!");



                newMenuButton.addEventListener("click", e => {
                    e.preventDefault();
                    dropdownMenu.classList.toggle("hidden");
                    iconSpan.textContent = dropdownMenu.classList.contains("hidden") ? "task" : "highlight_off";
                });

                document.addEventListener("click", e => {
                    if (!customMenuWrapper.contains(e.target)) {
                        dropdownMenu.classList.add("hidden");
                        iconSpan.textContent = "task";
                    }
                });
            } else {
                console.warn('[HH3D Script - Cảnh báo] ⚠️ Không tìm thấy phần tử cha ".nav-items". Không thể chèn menu.');
            }
        }

        // Hàm để cập nhật statusbar
        updateStatusBar(message, type = "info", duration = null) {
            const statusBar = document.querySelector(".custom-script-status-bar");
            if (!statusBar) return;

            const messageElement = document.createElement("div");
            messageElement.className = "custom-script-message";
            messageElement.classList.add(type);
            messageElement.textContent = message;

            // Thêm thông báo vào cuối danh sách
            statusBar.appendChild(messageElement);

            // Giới hạn 5 thông báo
            while (statusBar.children.length > 5) {
                statusBar.removeChild(statusBar.firstChild);
            }

            // Tự động xóa thông báo sau một khoảng thời gian
            if (duration !== null) {
                setTimeout(() => {
                    messageElement.style.animation = "fadeOut 0.3s forwards";
                    messageElement.addEventListener("animationend", () => {
                        if (messageElement.parentNode === statusBar) {
                            statusBar.removeChild(messageElement);
                        }
                    });
                }, duration);
            }
        }

        // Xóa tất cả thông báo
        clearStatusBar() {
            const statusBar = document.querySelector(".custom-script-status-bar");
            if (statusBar) {
                while (statusBar.firstChild) {
                    statusBar.removeChild(statusBar.firstChild);
                }
            }
        }

        // Hàm gọi phương thức updateButtonState của UIMenuCreator
        async updateButtonState(taskName) {
            await this.uiMenuCreator.updateButtonState(taskName);
        }
    }

                // ===============================================
                // Automactic
                // ===============================================
        class AutomationManager {
            constructor() {
                this.accountId = accountId;
                this.delay = 5000;

                // Các khoảng thời gian kiểm tra (ms)
                this.CHECK_INTERVAL_TIEN_DUYEN = 30 * 60 * 1000;
                this.INTERVAL_HOANG_VUC = 15 * 60 * 1000 + this.delay;
                this.INTERVAL_PHUC_LOI = 30 * 60 * 1000 + this.delay;
                this.INTERVAL_THI_LUYEN = 30 * 60 * 1000 + this.delay;
                this.INTERVAL_BI_CANH = 7 * 60 * 1000 + this.delay;
                this.INTERVAL_KHOANG_MACH = localStorage.getItem('khoangmach_check_interval') ? parseInt(localStorage.getItem('khoangmach_check_interval'))*60*1000 + this.delay : 5*60*1000 + this.delay;
                this.INTERVAL_HOAT_DONG_NGAY = 10 * 60 * 1000 + this.delay;

                this.timeoutIds = {};
                this.isRunning = false;
            }


            async start() {
                console.log(`[Auto] Bắt đầu quá trình tự động cho tài khoản: ${this.accountId}`);
                this.isRunning = true;
                // Thực hiện các tác vụ ban đầu

                const autoDiemDanh = localStorage.getItem('autoDiemDanh') !== '0';
                //const autoTangHoa = localStorage.getItem('autoTangHoa') !== '0';

                const autoKhacTranVip = localStorage.getItem('autoKhacTranVip') !== '0';
                const autoCauNguyen = localStorage.getItem('autoCaunguyen') !== '0';
                const autoTienDuyen = localStorage.getItem('autoTienDuyen') !== '0';
                const autoThiLuyen = localStorage.getItem('autoThiLuyen') !== '0';
                const autoPhucLoi = localStorage.getItem('autoPhucLoi') !== '0';
                const autoHoangVuc = localStorage.getItem('autoHoangVuc') !== '0';
                const autoBiCanh = localStorage.getItem('autoBiCanh') !== '0';
                const autoLuanVo = localStorage.getItem('autoLuanVo') !== '0';
                const autoDoThach = localStorage.getItem('autoDoThach') !== '0';
                const autoKhoangMach = localStorage.getItem('autoKhoangMach') !== '0';

                if (autoDiemDanh) {
                await this.doInitialTasks();
                        }
                        // Bắt đầu chu kỳ hẹn giờ cho Tiên Duyên
                if (autoTienDuyen) {
                    await this.scheduleTienDuyenCheck()
                        }
                        // Đổ thạch
                if (autoDoThach) {
                    await this.scheduleDoThach()
                        }
                        // Lên lịch các tác vụ định kỳ
                if (autoHoangVuc) {
                    await new Promise(resolve => setTimeout(resolve,
                            1000));
                    this.scheduleTask('hoangvuc', () => hoangvuc.doHoangVuc(), this.INTERVAL_HOANG_VUC);
                        }
                if (autoThiLuyen) {
                    await new Promise(resolve => setTimeout(resolve,
                            1000));
                    this.scheduleTask('thiluyen', () => doThiLuyenTongMon(), this.INTERVAL_THI_LUYEN);
                        }
                if (autoPhucLoi) {
                    await new Promise(resolve => setTimeout(resolve,
                            1000));
                    await this.scheduleTask('phucloi', () => doPhucLoiDuong(), this.INTERVAL_PHUC_LOI);
                        }
                if (autoKhoangMach) {
                    await new Promise(resolve => setTimeout(resolve,
                            1000));
                    this.INTERVAL_KHOANG_MACH = localStorage.getItem('khoangmach_check_interval') ? parseInt(localStorage.getItem('khoangmach_check_interval'))*60*1000 + this.delay : 5*60*1000 + this.delay;
                    await this.scheduleTask('khoangmach', () => khoangmach.doKhoangMach(), this.INTERVAL_KHOANG_MACH);
                        }

                if (autoBiCanh) {
                    await new Promise(resolve => setTimeout(resolve,
                                        1000));
                    await this.scheduleTask("bicanh", async () => {
                    // Đọc giữ lượt
                    const reserve = Number(localStorage.getItem("reserveBiCanhAttacks") || "0");
                    console.log("Giá trị reserveBiCanhAttacks trong autobicanh:", reserve);
                        await bicanh.doBiCanh();
                                        }, this.INTERVAL_BI_CANH);
            }


            if (autoKhacTranVip)
            { await this.luotkhactranvip()}

            if (autoCauNguyen)
            { await this.caunguyentienduyen()}


            if (autoLuanVo) {
                await new Promise(resolve => setTimeout(resolve,
                        1000));
                await this.scheduleLuanVo();
                    }

                await new Promise(resolve => setTimeout(resolve,
                        1000));
                this.scheduleHoatDongNgay();
                this.selfSchedule();
                this.applyPromoCode();
                    }
        async eventSchedule() {
            const now = Date.now();
            const nextEventTime = taskTracker.getNextTime(accountId, 'event');

            // Logic tính thời gian chờ mặc định
            // Nếu chưa có lịch hoặc tính ra số âm (quá khứ) thì đợi 1s rồi check lại, ngược lại đợi đúng thời gian
            let waitTime = 1000;

            if (nextEventTime && now >= nextEventTime) {
                console.log("[Auto] ⏰ Đã đến giờ sự kiện. Đang thực hiện...");
                try {
                    // Thực hiện nhiệm vụ
                    await doDuaTopTongMon();

                    // QUAN TRỌNG: Hàm doDuaTopTongMon phải có lệnh cập nhật lại nextEventTime (taskTracker.adjustTaskTime)
                    // Nếu không cập nhật thời gian, nó sẽ lặp vô tận liên tục gây treo trình duyệt.
                } catch (error) {
                    console.error("[Auto] ❌ Lỗi khi thực hiện sự kiện:", error);
                }

                // Sau khi chạy xong (dù lỗi hay không), đợi 5 giây rồi check lại lịch mới
                waitTime = 5000;
            } else {
                // Chưa đến giờ, tính thời gian chờ
                if (nextEventTime) {
                    waitTime = nextEventTime - now;
                    // Đảm bảo không chờ số âm (nếu máy tính bị lag)
                    if (waitTime < 0) waitTime = 1000;
                } else {
                    // Nếu không tìm thấy lịch (null), mặc định check lại sau 5 phút
                    waitTime = 5 * 60 * 1000;
                }

            }
            // Gọi đệ quy để duy trì vòng lặp vĩnh viễn
            setTimeout(() => {
                this.eventSchedule();
            }, waitTime + (this.delay || 0));
        }


 // Tự nhập mã thưởng
        async applyPromoCode() {

            const promoCodeSaved = localStorage.getItem(`promo_code_${accountId}`) || "";
            const PromoCodefileName = "/PromoCode.json";
            const PromoCodeUrl = baseUrl + repoPath + branch + PromoCodefileName;


            const fetchPromoCode = async () => {
                try {
                    const response = await fetch(
                        PromoCodeUrl
                    );
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const text = await response.text();
                    return text.trim();
                } catch (error) {
                    console.error("[Auto] Lỗi khi lấy mã thưởng:", error);
                    return null;
                }
            };

            const promoCodeFetched = await fetchPromoCode();
            if (!promoCodeFetched || promoCodeSaved === promoCodeFetched) {
                console.log("[Auto] Mã thưởng không thay đổi hoặc không lấy được");
                return;
            }

            try {
                // Lấy nonce từ trang linh thạch
                const nonce = await getSecurityNonce(
                    weburl + "linh-thach?t",
                    /['"]action['"]\s*:\s*['"]redeem_linh_thach['"][\s\S]*?['"]nonce['"]\s*:\s*['"]([a-f0-9]+)['"]/i
                );

                if (!nonce) {
                    console.error("[Auto] Không thể lấy nonce cho việc nhập mã thưởng");
                    return;
                }

                console.log(`[Auto] Đang nhập mã thưởng: ${promoCodeFetched}`);

                const response = await fetch(ajaxUrl, {
                    credentials: "include",
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0",
                        "Accept": "*/*",
                        "Accept-Language": "vi,en-US;q=0.5",
                        "Content-Type": "application/x-www-form-urlencoded",
                        "X-Requested-With": "XMLHttpRequest",
                        "Sec-Fetch-Dest": "empty",
                        "Sec-Fetch-Mode": "cors",
                        "Sec-Fetch-Site": "same-origin",
                        Priority: "u=0"
                    },
                    body: `action=redeem_linh_thach&code=${encodeURIComponent(promoCodeFetched)}&nonce=${nonce}&hold_timestamp=${Math.floor(
                        Date.now() / 1000
                    )}`,
                    method: "POST",
                    mode: "cors"
                });

                const data = await response.json();

                if (data.success) {
                    showNotification(data.data.message, "success");
                    localStorage.setItem(`promo_code_${accountId}`, promoCodeFetched);
                } else if (data.data.message === "⚠️ Đạo hữu đã hấp thụ linh thạch này rồi!") {
                    localStorage.setItem(`promo_code_${accountId}`, promoCodeFetched);
                } else {
                    showNotification(`❌ Lỗi nhập mã thưởng: ${data.message || "Không xác định"}`, "error");
                }
            } catch (error) {
                console.error("[Auto] Lỗi khi nhập mã thưởng:", error);
                showNotification(`❌ Lỗi khi nhập mã thưởng: ${error.message}`, "error");
            }
        }

                    /**Lên lịch tự chạy lại vào lúc 1 giờ */
    async selfSchedule() {
        if (!this.isRunning) return;
        const now = Date.now();
        const timeToRerun = new Date();
        timeToRerun.setHours(1, 0, 0, 0);
        if (timeToRerun.getTime() <= now) {
            timeToRerun.setDate(timeToRerun.getDate() + 1);
        }
        const delay = timeToRerun.getTime() - now;
        console.log(`[Auto] Lên lịch tự chạy lại vào lúc 1 giờ sáng. Thời gian chờ: ${delay}ms.`);
        setTimeout(() => {
            this.stop();
        }, delay);
        setTimeout(() => {
            this.start();
        }, delay+1000);

    }

    async doInitialTasks() {
        if (!taskTracker.isTaskDone(this.accountId, 'diemdanh')) {
            try {
                const nonce = await getNonce()
                if (!nonce) return
                await doDailyCheckin(nonce);
                await doClanDailyCheckin(nonce);
                await vandap.doVanDap(nonce);
                createUI.updateButtonState('diemdanh')
            } catch (e) {
                console.error("[Auto] Lỗi khi thực hiện Điểm danh, tế lễ, vấn đáp:", e);
            }
        } else {
            createUI.updateButtonState('diemdanh')
        }
    }


    async luotkhactranvip() {
        if (!taskTracker.isTaskDone(this.accountId, 'luotkhactranvip')) {
            try {
                const nonce = await getNonce()
                if (!nonce) return
                // await khactran.claimDailyTurns();
                const result = await khactran.claimDailyTurns(this.accountId);
                console.log("Kết quả claimDailyTurns:", result);
                createUI.updateButtonState('luotkhactranvip')
            } catch (e) {
                console.error("[Auto] lỗi nhận lượt khắc trận vip:", e);
            }
        } else {
            createUI.updateButtonState('luotkhactranvip')
        }
    }

    async caunguyentienduyen() {
        if (!taskTracker.isTaskDone(this.accountId, 'caunguyendaolu')) {
            try {
                const nonce = await getNonce()
                if (!nonce) return
                const result = await docaunguyen(this.accountId);
                console.log("Kết quả cầu nguyện:", result);
                createUI.updateButtonState('caunguyendaolu')
            } catch (e) {
                console.error("[Cầu nguyện Tiên duyên]:", e);
            }
        } else {
            createUI.updateButtonState('caunguyendaolu')
        }
    }


    async scheduleTienDuyenCheck() {
        const now = Date.now();
        const lastCheckTienDuyen = taskTracker.getLastCheckTienDuyen(this.accountId);
        let timeToNextCheck;

        if (lastCheckTienDuyen === null || now - lastCheckTienDuyen >= this.CHECK_INTERVAL_TIEN_DUYEN) {
            console.log("[Auto] Đã đến giờ làm Tiên Duyên. Đang thực hiện...");
            try {
                await tienduyen.doTienDuyen();
            } catch (error) {
                console.error("[Auto] Lỗi khi thực hiện Tiên Duyên:", error);
            }
            timeToNextCheck = this.CHECK_INTERVAL_TIEN_DUYEN;
        } else {
            timeToNextCheck = this.CHECK_INTERVAL_TIEN_DUYEN - (now - lastCheckTienDuyen);
            console.log(`[Auto] Chưa đến giờ tiên duyên. Sẽ chờ ${timeToNextCheck}ms.`);
        }

        // Hẹn giờ gọi lại chính nó sau khoảng thời gian đã tính
        if (this.tienduyenTimeout) clearTimeout(this.tienduyenTimeout);
        this.tienduyenTimeout = setTimeout(() => this.scheduleTienDuyenCheck(), timeToNextCheck);
    }


                /**
                * Tạo lịch trình cho một nhiệm vụ cụ thể.
                - Ví dụ: scheduleTask('thiluyen', () => thiluyen.doThiLuyen(), this.INTERVAL_THI_LUYEN, 'thiluyenTimeout')
                * @param {string} taskName Tên của nhiệm vụ, dùng để truy vấn trạng thái (ví dụ: 'thiluyen').
                * @param {Function} taskAction Hàm bất đồng bộ thực thi nhiệm vụ (ví dụ: `hoangvuc.doHoangVuc`).
                * @param {number} interval Chu kỳ lặp lại của nhiệm vụ tính bằng mili giây.
                */
                async scheduleTask(taskName, taskAction, interval) {
                    if (this.timeoutIds[taskName]) clearTimeout(this.timeoutIds[taskName]);
                    let isTaskDone;
                    if (taskName === 'bicanh' && await bicanh.isDailyLimit()) {
                        isTaskDone = true;
                    } else {
                        isTaskDone = taskTracker.isTaskDone(this.accountId, taskName);
                    }
                    // Kiểm tra và dừng lịch trình nếu nhiệm vụ đã hoàn thành
                    if (isTaskDone) {
                        createUI.updateButtonState(taskName);
                        return;
                    }

                    const now = Date.now();
                    const nextTime = taskTracker.getNextTime(this.accountId, taskName);
                    let timeToNextCheck;

                    if (nextTime === null || now >= nextTime) {
                        console.log(`[Auto] Đã đến giờ làm nhiệm vụ: ${taskName}. Đang thực hiện...`);
                        try {
                            await taskAction(); // Thực thi hàm nhiệm vụ
                            timeToNextCheck = interval;
                            createUI.updateButtonState(taskName);
                        } catch (error) {
                            console.error(`[Auto] Lỗi khi thực hiện nhiệm vụ ${taskName}:`, error);
                            // Có thể đặt thời gian chờ ngắn hơn khi có lỗi để thử lại
                            timeToNextCheck = 3*60 * 1000; // Thử lại sau 3 phút
                        }
                    } else {
                        createUI.updateButtonState(taskName);
                        timeToNextCheck = Math.max(nextTime - now, 0);
                        console.log(`[Auto] Nhiệm vụ ${taskName} chưa đến giờ, sẽ chờ ${timeToNextCheck}ms.`);
                    }

                    // Hẹn giờ cho lần chạy tiếp theo
                    if (this.timeoutIds[taskName]) clearTimeout(this.timeoutIds[taskName]);
                    if (!taskTracker.isTaskDone(accountId,taskName)) {
                        const taskFullName = {
                            hoangvuc: "Hoang Vực",
                            phucloi: "Phúc Lợi",
                            thiluyen: "Thí Luyện",
                            bicanh: "Bí Cảnh",
                            khoangmach: "Khoáng Mạch"
                        }[taskName];
                        //showNotification(
                            if (taskName === 'bicanh') {
                                const isReserveHold = await bicanh.isReserveHold();
                                if (isReserveHold) {
                                    //createUI.updateStatusBar(`🛑 ${taskFullName}: đang giữ lượt, không hẹn giờ`, 'info', 0);
                                    return; // dừng hẳn, không hẹn giờ
                                }
                            }
                        createUI.updateStatusBar(
                            `🕐 ${taskFullName}: ${new Date(Date.now() + timeToNextCheck).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`,
                            'info',
                            timeToNextCheck
                        );
                        this.timeoutIds[taskName] = setTimeout(() => this.scheduleTask(taskName, taskAction, interval), timeToNextCheck);
                    }
                }


                async scheduleLuanVo() {
                    const isDone = taskTracker.isTaskDone(this.accountId, 'luanvo');
                    if (isDone) {
                        if (this.luanvoTimeout) clearTimeout(this.luanvoTimeout);
                        return;
                    }
                    await luanvo.startLuanVo();
                    let timeTo21h = new Date();
                    timeTo21h.setHours(21, 1, 0, 0);
                    const delay = timeTo21h.getTime() - Date.now();
                    console.log(`[Auto] Lên lịch Luận Võ vào lúc 00:01. Thời gian chờ: ${delay}ms.`);
                    if (this.luanvoTimeout) clearTimeout(this.luanvoTimeout);
                    if (delay < 0) {
                        await luanvo.thueTieuViem();
                        await luanvo.doLuanVo(true);
                    } else {
                        this.luanvoTimeout = setTimeout(() => this.scheduleLuanVo(), delay);
                    }
                }


                async scheduleDoThach() {
                    const status = taskTracker.getTaskStatus(accountId, 'dothach');
                        const isBetPlaced = status.betplaced;
                        const isRewardClaimed = status.reward_claimed;

                        const currentHour = parseInt(
                            new Date().toLocaleString('en-US', {
                                timeZone: 'Asia/Ho_Chi_Minh',
                                hour: 'numeric',
                                hour12: false
                            }),
                            10
                        );

                        let nextActionTime; // Giờ hành động tiếp theo (ví dụ: 13, 16, 21, 6)
                        let timeToNextCheck; // Thời gian chờ (mili giây)

                        const calculateTimeToNextHour = (targetHour) => {
                            const now = new Date();
                            const nextTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, 0, 0, 0);
                            if (now.getHours() >= targetHour) {
                                nextTime.setDate(nextTime.getDate() + 1); // Nếu giờ mục tiêu đã qua, chuyển sang ngày mai
                            }
                            return nextTime.getTime() - now.getTime();
                        };

                        if (isBetPlaced) {
                            // Đã đặt cược, chờ đến giờ nhận thưởng
                            if (currentHour >= 6 && currentHour < 13) {
                                nextActionTime = 13; // Chờ đến 13h để nhận thưởng lần 1
                            } else if (currentHour >= 16 && currentHour < 21) {
                                nextActionTime = 21; // Chờ đến 21h để nhận thưởng lần 2
                            } else {
                                console.log('[Đổ Thạch] Đã đặt cược nhưng không trong khung giờ cược, chờ khung giờ nhận thưởng tiếp theo.');
                                if (currentHour < 13) {
                                    nextActionTime = 13;
                                } else if (currentHour < 21) {
                                    nextActionTime = 21;
                                } else {
                                    nextActionTime = 6; // Chờ đến 6h sáng mai
                                }
                            }
                        } else if (isRewardClaimed) {
                            // Đã nhận thưởng, chờ đến giờ đặt cược tiếp theo
                            if (currentHour >= 13 && currentHour < 16) {
                                nextActionTime = 16; // Chờ đến 16h để đặt cược lần 2
                            } else {
                                nextActionTime = 6; // Chờ đến 6h sáng hôm sau
                            }
                        } else {
                            const stoneType = localStorage.getItem('dice-roll-choice') ?? 'tai';
                            // Chưa đặt cược hoặc chưa nhận thưởng. Cần kiểm tra khung giờ hiện tại
                            if (currentHour >= 6 && currentHour < 13) {
                                console.log('[Đổ Thạch] Đang trong khung giờ 6h-13h. Đang đặt cược...');
                                await dothach.run(stoneType); // Thực hiện đặt cược
                                createUI.uiMenuCreator.updateButtonState('dothach');
                                nextActionTime = 13; // Sau khi cược, chờ đến 13h để kiểm tra thưởng
                            } else if (currentHour >= 16 && currentHour < 21) {
                                console.log('[Đổ Thạch] Đang trong khung giờ 16h-21h. Đang đặt cược...');
                                await dothach.run(stoneType); // Thực hiện đặt cược
                                createUI.uiMenuCreator.updateButtonState('dothach');
                                nextActionTime = 21; // Sau khi cược, chờ đến 21h để kiểm tra thưởng
                            } else {
                                // Không trong khung giờ nào, chờ đến khung giờ đặt cược tiếp theo
                                console.log('[Đổ Thạch] Không trong khung giờ cược. Chờ...');
                                if (currentHour < 6) {
                                    nextActionTime = 6;
                                } else if (currentHour < 16) {
                                    nextActionTime = 16;
                                } else {
                                    nextActionTime = 6; // Chờ đến 6h sáng mai
                                }
                            }
                        }

                        timeToNextCheck = calculateTimeToNextHour(nextActionTime);

                        // Hủy timeout cũ nếu có và thiết lập timeout mới
                        if (this.dothachTimeout) clearTimeout(this.dothachTimeout);
                        this.dothachTimeout = setTimeout(() => this.scheduleDoThach(), timeToNextCheck);

                        console.log(`[Đổ Thạch] Lần kiểm tra tiếp theo lúc: ${new Date(Date.now() + timeToNextCheck).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`);
                    }

                async scheduleHoatDongNgay() {
                    const isDone = taskTracker.isTaskDone(this.accountId, 'hoatdongngay');
                    if (isDone) {
                        if (this.hoatdongngayTimeout) clearTimeout(this.hoatdongngayTimeout);
                        return;
                    }
                    const isHoangVucDone = taskTracker.isTaskDone(this.accountId, 'hoangvuc');
                    const isPhucLoiDone = taskTracker.isTaskDone(this.accountId, 'phucloi');
                    const isDiemDanhDone = taskTracker.isTaskDone(this.accountId, 'diemdanh');
                    const isLuanVoDone = taskTracker.isTaskDone(this.accountId, 'luanvo');
                    if (isHoangVucDone && isPhucLoiDone && isDiemDanhDone && isLuanVoDone) {
                        try {
                            await hoatdongngay.doHoatDongNgay();
                            if (this.hoatdongngayTimeout) clearTimeout(this.hoatdongngayTimeout);
                            if (taskTracker.isTaskDone(this.accountId, 'hoatdongngay') && this.hoatdongngayTimeout) {
                                return;
                            } else {
                                this.hoatdongngayTimeout = setTimeout(() => this.scheduleHoatDongNgay(), 5*60*1000);
                            }
                        }
                        catch (e) {
                            console.error("[Auto] Lỗi khi thực hiện Hoạt Động Ngày:", e);
                        }
                    } else {
                        if (this.hoatdongngayTimeout) clearTimeout(this.hoatdongngayTimeout);
                        this.hoatdongngayTimeout = setTimeout(() => this.scheduleHoatDongNgay(), this.INTERVAL_HOAT_DONG_NGAY);
                    }
                }

                stop() {
                    if (!this.isRunning) return;
                    for (const taskName in this.timeoutIds) {
                        if (this.timeoutIds[taskName]) {
                            clearTimeout(this.timeoutIds[taskName]);
                            this.timeoutIds[taskName] = null; // Đặt lại giá trị để tránh rò rỉ bộ nhớ
                            console.log(`[Auto] Đã hủy hẹn giờ cho nhiệm vụ: ${taskName}`);
                        }
                    }
                    if (this.tienduyenTimeout) {
                        clearTimeout(this.tienduyenTimeout);
                        console.log(`Đã dừng quá trình tự động tiên duyên`);
                    }
                    if (this.dothachTimeout) {
                        clearTimeout(this.dothachTimeout);
                        console.log(`Đã dừng quá trình tự động đổ thạch`);
                    }
                    if (this.hoatdongngayTimeout) {
                        clearTimeout(this.hoatdongngayTimeout);
                        console.log(`Đã dừng quá trình tự động hoạt động ngày`);
                    }
                    createUI.clearStatusBar();
                }

                checkAndStart() {
                    if (localStorage.getItem('autorunEnabled') === null) {
                        localStorage.setItem('autorunEnabled', '0');
                    }

                    let autorunEnabled = localStorage.getItem('autorunEnabled') === '1';

                    if (autorunEnabled) {
                        console.log('[Automation] Tự động khởi động Autorun...');

                        // Tạo một hàm chờ để đảm bảo UI đã sẵn sàng
                        const checkStatusIcon = () => {
                            const statusIcon = document.querySelector('.custom-script-status-icon');
                            if (statusIcon) {
                                // Nếu icon đã tồn tại, cập nhật trạng thái và bắt đầu tác vụ
                                createUI.uiMenuCreator.setAutorunIsRunning();
                                createUI.uiMenuCreator.updateButtonState('autorun');
                                this.start();
                            } else {
                                // Nếu icon chưa tồn tại, chờ 100ms và thử lại
                                setTimeout(checkStatusIcon, 100);
                            }
                        };

                        // Bắt đầu quá trình kiểm tra
                        checkStatusIcon();
                    }
                }
            }
                // ===============================================
                // HIỆN TU VI KHOÁNG MẠCH
                // ===============================================
   class hienTuviKhoangMach {
        constructor() {
            this.selfTuViCache = null;
            this.mineImageSelector = '.mine-image';
            this.attackButtonSelector = '.attack-btn';
            this.currentMineUsers = []; // Sẽ lưu dữ liệu người dùng tại đây
            this.tempObserver = null; // Biến để lưu MutationObserver tạm thời
            this.nonceGetUserInMine = null;
            this.nonce = null;
            this.headers = {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest'
            };
            this.currentMineId = null;
            this.tempObserverRearrange = null; // Biến để lưu MutationObserver tạm thời khi sắp xếp

        }

        async waitForElement(selector, timeout = 15000) {
            const found = document.querySelector(selector);
            if (found) return Promise.resolve(found);
            return new Promise((resolve) => {
                const obs = new MutationObserver(() => {
                    const el = document.querySelector(selector);
                    if (el) {
                        obs.disconnect();
                        clearTimeout(timer);
                        resolve(el);
                    }
                });
                obs.observe(document.documentElement || document.body, { childList: true, subtree: true });
                const timer = setTimeout(() => {
                    obs.disconnect();
                    resolve(null);
                }, timeout);
            });
        }
        async getNonceGetUserInMine() {
            const htmlSource = document.documentElement.innerHTML;
            const regex = /action:\s*'get_users_in_mine',[\s\S]*?security:\s*'([a-f0-9]+)'/;
            const match = htmlSource.match(regex);
            return match ? match[1] : null;
        }

        async getNonce() {
            if (typeof customRestNonce !== 'undefined' && customRestNonce) {
                return customRestNonce;
            }
            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
                const match = script.innerHTML.match(/customRestNonce\s*=\s*'([a-f0-9]+)'/);
                if (match) return match[1];
            }
            try {
                const html = await fetch(weburl + '?t').then(r => r.text());
                return html.match(/customRestNonce\s*=\s*'([a-f0-9]+)'/)?.[1] ?? null;
            } catch { return null; }
        }

        async getSelfTuVi(forceRefresh = false) {
            if (!forceRefresh && this.selfTuViCache !== null) {
                return this.selfTuViCache;
            }
            // ưu tiên header hiện tu vi
            const el = document.querySelector('#head_manage_acc');
            const text = (el?.textContent || '').trim();
            let num = text.match(/\d+/);
            if (num) {
                this.selfTuViCache = parseInt(num[0]);
                return this.selfTuViCache;
            }
            // fallback: quét body (trường hợp UI đổi)
            const bodyText = (document.body?.innerText || '').slice(0, 5000);
            num = bodyText.match(/Tu\s*Vi\s*[:：]?\s*(\d+)/i) || bodyText.match(/(\d{6,})/);
            if (num) {
                this.selfTuViCache = parseInt(num[1] || num[0]);
                return this.selfTuViCache;
            }
            return null;
        }

        async getProfileTier(userId) {
            if (!userId) return null;
            try {
                const res = await fetch(`${weburl}profile/${userId}/`);
                if (!res.ok) return null;

                const text = await res.text(); // phải await
                const doc = new DOMParser().parseFromString(text, 'text/html');

                const h4 = doc.querySelector('h4');
                if (!h4) return null;

                // lấy text từ <b> nếu có, nếu không fallback div/h4
                const raw = h4.querySelector('b')?.textContent
                        || h4.querySelector('div')?.textContent
                        || h4.textContent
                        || "";

                return raw.trim();
            } catch (e) {
                console.error(`${this.logPrefix} ❌ Lỗi mạng (lấy cảnh giới):`, e);
                return null;
            }
        }

        winRate(selfTuVi, opponentTuVi) {
            if (!selfTuVi || !opponentTuVi) return -1;
            if (typeof selfTuVi !== 'number' || typeof opponentTuVi !== 'number') return -1;
            if (selfTuVi <= 0 || opponentTuVi <= 0) return -1;
            if (selfTuVi >= 10 * opponentTuVi) return 100;
            if (opponentTuVi >= 10 * selfTuVi) return 0;
            let winChance = 50;
            const diff = selfTuVi - opponentTuVi;
            const ratio = diff > 0 ? selfTuVi / opponentTuVi : opponentTuVi / selfTuVi;
            const factor = ratio >= 8 ? 1 : ratio >= 7 ? 0.9 : ratio >= 6 ? 0.8 :
                ratio >= 5 ? 0.7 : ratio >= 4 ? 0.6 : ratio >= 3 ? 0.5 :
                ratio >= 2 ? 0.4 : 0.3;
            winChance += (diff / 1000) * factor;
            return Math.max(0, Math.min(100, winChance));
        }

        async upsertTuViInfo(btn, userId, opponentTuVi, myTuVi) {
            const cls = 'hh3d-tuvi-info';
            const next = btn.nextElementSibling;
            const opponentTuViText = typeof opponentTuVi === 'number' ? opponentTuVi : 'Unknown';

            // Tạo nội dung HTML một lần duy nhất
            const rate = this.winRate(myTuVi, opponentTuVi).toFixed(2);
            const rateNumber = parseFloat(rate);
            let rateColor;
            if (rateNumber === -1) {
                rateColor = '#808080'; // Grey
            }
                else if (rateNumber < 25) {
                rateColor = '#ff5f5f'; // Red
            } else if (rateNumber > 75) {
                rateColor = '#00ff00'; // Green
            } else {
                rateColor = '#ffff00ff'; // White
            }

            let displayRate = rate;
            if (rateNumber === 0.00) {
                displayRate = '0';
            } else if (rateNumber === 100.00) {
                displayRate = '100';
            } else if (rateNumber === -1) {
                displayRate = 'Không rõ';
            }
            let innerHTMLContent = '';
            if (myTuVi <= 10 * opponentTuVi) {
            innerHTMLContent = `
                <p><strong>Tu Vi:</strong> <span style="font-weight: bold; color: #ffff00ff;">${opponentTuViText}</span></p>
                <p><strong>Tỷ Lệ Thắng:</strong> <span style="font-weight: bold; color: ${rateColor};">${displayRate}%</span></p>
            `;
            } else {
            innerHTMLContent = `
                <p><strong>Tu Vi:</strong> <span style="font-weight: bold; color: #ffff00ff;">${opponentTuViText}</span></p>
                <p><span style="font-weight: bold; color: #00ff00ff;">Không tốn lượt</span></p>
            `;
            }

            if (next && next.classList.contains(cls) && next.dataset.userId === String(userId)) {
                next.innerHTML = innerHTMLContent;
                return;
            }

            document.querySelectorAll(`.${cls}[data-user-id="${userId}"]`).forEach(el => {
                if (el !== next) el.remove();
            });

            const info = document.createElement('div');
            info.className = cls;
            info.dataset.userId = String(userId);
            info.style.fontSize = '12px';
            info.style.color = '#fff';
            info.style.marginTop = '3px';
            info.style.backgroundColor = 'none';
            info.style.padding = '0px 0px';
            info.style.border = 'none';

            // Sử dụng biến đã tạo ở trên
            info.innerHTML = innerHTMLContent;

            btn.insertAdjacentElement('afterend', info);
        }

        async upsertTierInfo(btn, userId) {
            const cls = 'hh3d-tuvi-info';
            const next = btn.nextElementSibling;
            const tierText = await this.getProfileTier(userId);
            console.log(`UserID: ${userId}, Tier: ${tierText}`);
            if (!tierText) return;
            if (next && next.classList.contains(cls) && next.dataset.userId === String(userId)) {
                next.innerHTML = `<p><strong>Cảnh giới:</strong> <span style="font-weight: bold; color: #ffff00ff;">${tierText}</span></p>`;
                return;
            }

            document.querySelectorAll(`.${cls}[data-user-id="${userId}"]`).forEach(el => {
                if (el !== next) el.remove();
            });
            const info = document.createElement('div');
            info.className = cls;
            info.dataset.userId = String(userId);
            info.style.fontSize = '12px';
            info.style.color = '#fff';
            info.style.marginTop = '3px';
            info.style.backgroundColor = 'none';
            info.style.padding = '0px 0px';
            info.style.border = 'none';
            info.innerHTML = `<p><strong>Cảnh giới:</strong> <span style="font-weight: bold; color: #ffff00ff;">${tierText}</span></p>`;
            btn.insertAdjacentElement('afterend', info);
        }

        async getUsersInMine(mineId) {
            let securityToken = null;

            // Cách 1: Lấy từ unsafeWindow (Biến thật của trang web)
            if (typeof unsafeWindow !== 'undefined' && unsafeWindow.hh3dData && unsafeWindow.hh3dData.securityToken) {
                securityToken = unsafeWindow.hh3dData.securityToken;
            }
            // Cách 2: Lấy từ window thường
            else if (typeof hh3dData !== 'undefined' && hh3dData.securityToken) {
                securityToken = hh3dData.securityToken;
            }

            // Cách 3: Nếu vẫn null -> Gọi hàm quét (Fallback cuối cùng)
            if (!securityToken) {
                console.log(`${this.logPrefix} ⚠️ Token biến global bị thiếu, đang fetch lại...`);
                // Gọi hàm getSecurityToken chúng ta đã viết ở trên
                securityToken = await getSecurityToken(this.khoangMachUrl || window.location.href);
            }
            if (!this.nonceGetUserInMine || !securityToken) {
                let errorMsg = 'Lỗi (get_users):';
                if (!this.nonceGetUserInMine) errorMsg += " Nonce (security) chưa được cung cấp.";
                if (!securityToken) errorMsg += " Không tìm thấy 'security_token' (hh3dData).";

                showNotification(errorMsg, 'error');
                return null;
            }

            const payload = new URLSearchParams({
                action: 'get_users_in_mine',
                mine_id: mineId,
                security_token: securityToken,
                security: this.nonceGetUserInMine
            });

            try {
                const r = await fetch(ajaxUrl, {
                    method: 'POST',
                    headers: this.headers,
                    body: payload,
                    credentials: 'include'
                });
                const d = await r.json();

                return d.success ? d.data : (showNotification(d.message || 'Lỗi lấy thông tin người chơi.', 'error'), null);

            } catch (e) {
                console.error(`${this.logPrefix} ❌ Lỗi mạng (lấy user):`, e);
                return null;
            }
        }

        async getTuVi(userId) {
            // 0. Chuẩn bị Nonce & Headers
            if (!this.nonce) {
                this.nonce = await this.getNonce();
            }
            const nonce = this.nonce;
            if (!nonce) return null;

            const headers = {
                "Content-Type": "application/json",
                "X-WP-Nonce": nonce
            };
            const targetId = String(userId);

            // ============================================================
            // 🟢 CÁCH 1: LOGIC CŨ (GIỮ NGUYÊN BẢN GỐC)
            // ============================================================
            try {
                const res = await fetch(`${weburl}/wp-json/luan-vo/v1/search-users`, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify({ query: targetId, page: 1 }),
                    credentials: "include",
                    mode: "cors"
                });

                // Logic gốc: Lấy user đầu tiên trong danh sách (users[0])
                const points = res.ok ? (await res.json())?.data?.users?.[0]?.points ?? null : null;

                // Nếu tìm thấy điểm -> Trả về luôn
                if (points !== null && points !== undefined) {
                    return points;
                }
            } catch (e) {
                // Lỗi ở cách 1 -> Bỏ qua để chạy xuống cách 2
            }

            // ============================================================
            // 🔴 CÁCH 2: FALLBACK (FOLLOW -> SCAN -> UNFOLLOW)
            // Chỉ chạy khi Cách 1 trả về null hoặc lỗi
            // ============================================================
            // console.log(`[GetTuVi] Cách 1 thất bại, đang dùng Fallback cho ID ${targetId}...`);

            let tuVi = null;

            try {
                // B2.1: Follow
                await fetch(`${weburl}/wp-json/luan-vo/v1/follow`, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify({ followed_user_id: targetId }),
                    credentials: "include",
                    mode: "cors"
                });

                // B2.2: Lấy danh sách Following
                const resList = await fetch(`${weburl}/wp-json/luan-vo/v1/get-following-users`, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify({ page: 1 }),
                    credentials: "include",
                    mode: "cors"
                });

                if (resList.ok) {
                    const jsonList = await resList.json();
                    if (jsonList.success && jsonList.data && Array.isArray(jsonList.data.users)) {
                        // Ở danh sách follow thì phải tìm chính xác ID kẻo lấy nhầm người khác
                        const targetUser = jsonList.data.users.find(u => String(u.id) === targetId);
                        if (targetUser) {
                            tuVi = targetUser.points;
                        }
                    }
                }

            } catch (e) {
                console.error(`[GetTuVi] Fallback lỗi:`, e);
            } finally {
                // B2.3: Unfollow (Luôn chạy để dọn rác)
                try {
                    await fetch(`${weburl}/wp-json/luan-vo/v1/unfollow`, {
                        method: "POST",
                        headers: headers,
                        body: JSON.stringify({ unfollow_user_id: targetId }),
                        credentials: "include",
                        mode: "cors"
                    });
                } catch (ignore) {}
            }

            return tuVi;
        }

        async showTotalEnemies(mineId) {
            const data = await this.getUsersInMine(mineId);
            const currentMineUsers = data && data.users ? data.users : [];
            let totalEnemies = 0;
            let totalLienMinh = 0;
            let totalDongMon = 0;
            const myTuVi = await this.getSelfTuVi();
            let isInMine = currentMineUsers.some(user => user.id.toString() === accountId.toString());
            for (let user of currentMineUsers) {
                if (user.dong_mon) {
                    totalDongMon++;
                } else if (user.lien_minh) {
                    totalLienMinh++;
                } else {
                        totalEnemies++;
                }
            }


            const bonus_display = document.querySelector('#bonus-display');
            const batquai_section = document.querySelector('#batquai-section');
            const pagination = document.querySelector('.pagination');
            const page_indicator = document.querySelector('#page-indicator');
            if (bonus_display) {
                let existingInfo = document.querySelector('.hh3d-mine-info');
                if (!existingInfo) {
                    existingInfo = document.createElement('div');
                    existingInfo.className = 'hh3d-mine-info';
                    //existingInfo.style.right = '5px';
                    existingInfo.style.fontSize = '11px';
                    existingInfo.style.color = '#fff';
                    existingInfo.style.marginLeft = '-1px';
                    existingInfo.style.backgroundColor = 'none';
                    existingInfo.style.padding = '0px 0px';
                    existingInfo.style.border = 'none';
                    existingInfo.style.textAlign = 'left';
                    existingInfo.style.fontFamily = 'Font Awesome 5 Free';
                    bonus_display.prepend(existingInfo);
                    bonus_display.style.display = 'block';
                    batquai_section.style.display = 'block';
                    const observer = new MutationObserver(() => {
                        bonus_display.style.display = 'block';
                        batquai_section.style.display = 'block';
                        pagination.style.display = 'block';
                        page_indicator.style.display = 'block';
                        });
                    observer.observe(bonus_display, { attributes: true, attributeFilter: ['style'] });
                    observer.observe(batquai_section, { attributes: true, attributeFilter: ['style'] });
                    observer.observe(pagination, { attributes: true, attributeFilter: ['style'] });
                    observer.observe(page_indicator, { attributes: true, attributeFilter: ['style'] });
                }

                existingInfo.innerHTML = `
                    <h style="color: #ff5f5f;">🩸Kẻ địch: <b>${totalEnemies}</b></h><br>
                    <h style="color: #ffff00;">🤝Liên Minh: <b>${totalLienMinh}</b></h><br>
                    <h style="color: #9c59bdff;">☯️Đồng Môn: <b>${totalDongMon}</b></h>
                `;
            }
        }

        async addEventListenersToReloadBtn(mineId) {
            const reloadBtn = document.querySelector('#reload-btn');
            if (reloadBtn && !reloadBtn.dataset.listenerAdded) {
                reloadBtn.addEventListener('click', async () => {
                    this.showTotalEnemies(mineId);
                });
                reloadBtn.dataset.listenerAdded = 'true';
            }
        }

        async addEventListenersToMines() {
            const mineImages = document.querySelectorAll(this.mineImageSelector);
            mineImages.forEach(image => {
                if (!image.dataset.listenerAdded) {
                    image.addEventListener('click', async (event) => {
                        const mineId = event.currentTarget.getAttribute('data-mine-id');
                        if (mineId) {
                            this.showTotalEnemies(mineId);
                            this.addEventListenersToReloadBtn(mineId);
                        }
                    });
                    image.dataset.listenerAdded = 'true';
                }
            });
        }

        async showTuVi(myTuVi) {
            if (!myTuVi) return;

            const buttons = document.querySelectorAll('.attack-btn');
            for (const btn of buttons) {
                if (btn.dataset.tuviAttached === '1') continue;
                btn.dataset.tuviAttached = '1';

                const userId = btn.getAttribute('data-user-id');
                if (!userId) continue;

                try {
                    const opponentTuVi = await this.getTuVi(userId);
                    if (opponentTuVi) {
                        const rate = this.winRate(myTuVi, opponentTuVi).toFixed(2);
                        this.upsertTuViInfo(btn, userId, opponentTuVi, myTuVi);
                    } else {
                        await new Promise(r => setTimeout(r, 500))
                        this.upsertTierInfo(btn, userId);
                    }
                } catch (e) {
                    console.error('getTuVi error', e);
                }

                const mineId = btn.getAttribute('data-mine-id');
                if (mineId && mineId !== this.currentMineId) {
                    this.currentMineId = mineId;
                    this.showTotalEnemies(mineId);
                    this.addEventListenersToReloadBtn(mineId);
                }
                // nghỉ 1s tránh spam
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        async startUp() {
            if (document.readyState === 'loading') {
                await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
            }
            this.nonceGetUserInMine = await this.getNonceGetUserInMine();
            this.nonce = await this.getNonce();
            await this.waitForElement('#head_manage_acc', 15000);

            const getMyTuVi = async () => {
                const v = await this.getSelfTuVi(true);
                return v;
            };

            const firstTuVi = await getMyTuVi();
            if (firstTuVi) {
                await this.showTuVi(firstTuVi);
            }

            // quan sát DOM để cập nhật khi các nút attack xuất hiện hoặc nội dung thay đổi
            let __timeout = null;
            const observer = new MutationObserver(() => {
                clearTimeout(__timeout);
                __timeout = setTimeout(async () => {
                    const latest = await getMyTuVi();
                    await this.showTuVi(latest);
                }, 200);
            });
            observer.observe(document.body, { childList: true, subtree: true });

            this.addEventListenersToMines();
            // MutationObserver chính để thêm listener cho các mỏ mới
            const mainObserver = new MutationObserver(() => {
                this.addEventListenersToMines();
            });

            mainObserver.observe(document.body, { childList: true, subtree: true });
        }
    }

                // ===============================================
                // KHỞI TẠO SCRIPT
                // ===============================================
        const taskTracker = new TaskTracker();
        const accountId = await getAccountId();
        if (accountId) {
            let accountData = taskTracker.getAccountData(accountId);
            console.log(`[HH3D] ✅ Account ID: ${accountId}`);
            console.log(`[HH3D] ✅ Đã lấy dữ liệu tài khoản: ${JSON.stringify(accountData)}`);
        } else {
            console.warn("[HH3D] ⚠️ Không thể lấy ID tài khoản.");
        }

        const securityToken = await getSecurityToken();
        if (!securityToken) {
            showNotification("[HH3D] ⚠️ Không thể lấy security token.", "error");
        }

        // Khởi tạo các class
        const vandap = new VanDap();
        const dothach = new DoThach();
        const hoangvuc = new HoangVuc();
        const luanvo = new LuanVo();
        const bicanh = new BiCanh();
        const bicanhhiente = new BiCanhHienTe();
        const khoangmach = new KhoangMach();
        const hoatdongngay = new HoatDongNgay();
        const tanghoa = new TangHoa();
        // await tanghoa.init();

        const hvmuaruong = new HoangVucShop();
        const khactran = new KhacTranVan();
        const dantong = new DanTongShop();
        const dantubao = new DanTuBaoShop();

        // Khởi tạo và chạy UI
        const uiStyles = new UIMenuStyles();
        uiStyles.addStyles();

        const createUI = new UIInitializer(".load-notification.relative", LINK_GROUPS, accountId);
        createUI.start();

        const tienduyen = new TienDuyen();
        //await tienduyen.init();

        const automatic = new AutomationManager();

        // Đợi 2 giây để UI ổn định
        await new Promise(resolve => setTimeout(resolve, 2000));

        automatic.checkAndStart();

        if (location.pathname.includes("khoang-mach") || location.href.includes("khoang-mach")) {
            const hienTuviKM = new hienTuviKhoangMach();
            hienTuviKM.startUp();

                }
            })();
